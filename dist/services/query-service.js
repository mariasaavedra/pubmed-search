"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubmed_config_1 = require("../config/pubmed-config");
const logger_1 = require("../utils/logger");
/**
 * Service for constructing optimized PubMed search queries
 * Simplified to create direct search term + clinical filter queries
 */
class QueryService {
    /**
     * Build a complete PubMed search query based on a processed blueprint
     * @param blueprint The processed blueprint
     * @returns PubMed search query string
     */
    buildSearchQuery(blueprint) {
        // Create basic search term from specialty and topics
        const searchTerm = this.createSearchTerm(blueprint);
        // Combine all clinical queries with OR, using narrow filters
        const clinicalQueryFilter = this.getCombinedClinicalQueryFilter(blueprint.filters.clinical_queries);
        // Add date range
        const dateFilter = `"last ${blueprint.filters.year_range || 2} years"[PDat]`;
        // Always add the Core Clinical Journals filter
        const journalFilter = pubmed_config_1.CORE_CLINICAL_JOURNALS_FILTER;
        // Combine all parts with proper parentheses
        const query = `(${searchTerm}) AND (${clinicalQueryFilter}) AND (${dateFilter}) AND (${journalFilter})`;
        logger_1.Logger.debug("QueryService", `Built search query with Core Clinical Journals filter: ${query}`);
        console.log("QUERY BEING SENT TO PUBMED:", query);
        return query;
    }
    /**
     * Create a search term by properly formatting specialty and topics for PubMed
     * @param blueprint Processed blueprint
     * @returns Formatted search term string
     */
    createSearchTerm(blueprint) {
        // Create an array of terms
        const terms = [blueprint.specialty, ...blueprint.topics].filter(Boolean);
        if (terms.length === 0) {
            throw new Error("At least one search term (specialty or topic) is required");
        }
        // Format each term properly for PubMed with field tags
        const formattedTerms = terms.map((term) => {
            // Wrap multi-word terms in quotes to treat them as phrases
            const phrase = term.includes(" ") ? `"${term}"` : term;
            // Add field tags to search in both title/abstract and all fields
            return `(${phrase})`;
        });
        // Join with OR to find articles matching any of the terms
        return formattedTerms.join(" OR ");
    }
    /**
     * Get a combined filter from all clinical queries
     * @param clinicalQueries Array of clinical query types
     * @returns Combined clinical query filter string
     */
    getCombinedClinicalQueryFilter(clinicalQueries) {
        if (!clinicalQueries || clinicalQueries.length === 0) {
            // Default to some common clinical queries if none specified
            clinicalQueries = ["Therapy", "Diagnosis"];
            logger_1.Logger.debug("QueryService", "No clinical queries specified, using defaults");
        }
        // Get the NARROW filter for each clinical query
        const queryFilters = clinicalQueries
            .filter((type) => pubmed_config_1.FILTER_MAP[type])
            .map((type) => pubmed_config_1.FILTER_MAP[type].narrow);
        // Create a combined array of filters (without pushing directly to avoid type issues)
        const allFilters = [...queryFilters];
        // Always include the default filter
        const defaultFilter = pubmed_config_1.DEFAULT_FILTER.narrow;
        logger_1.Logger.debug("QueryService", `Using ${queryFilters.length + 1} clinical query filters (including default filter)`);
        // Join everything with OR
        if (queryFilters.length > 0) {
            return `(${queryFilters.join(" OR ")} AND ${defaultFilter})`;
        }
        else {
            return `(${defaultFilter})`; // Fallback to just the default filter
        }
    }
    /**
     * Validate a constructed query
     * @param query The query to validate
     * @returns True if the query is valid
     */
    validateQuery(query) {
        // Check minimum query length
        if (query.length < 10) {
            logger_1.Logger.warn("QueryService", "Query validation failed: Too short");
            return false;
        }
        // Check for balanced parentheses using a stack
        const stack = [];
        for (const char of query) {
            if (char === "(") {
                stack.push(char);
            }
            else if (char === ")") {
                if (stack.length === 0) {
                    logger_1.Logger.warn("QueryService", "Query validation failed: Unmatched closing parenthesis");
                    return false;
                }
                stack.pop();
            }
        }
        if (stack.length !== 0) {
            logger_1.Logger.warn("QueryService", `Query validation failed: ${stack.length} unclosed parentheses`);
            return false;
        }
        // Check basic query structure
        if (!query.includes("AND")) {
            logger_1.Logger.warn("QueryService", "Query validation failed: Missing AND operator");
            return false;
        }
        // Print the final query for inspection
        logger_1.Logger.debug("QueryService", "Validated query:", query);
        return true;
    }
    /**
     * Add pagination parameters to a query
     * @param query Base query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Query with pagination parameters
     */
    addPagination(query, page = 1, limit = 10) {
        const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
        const retstart = (Math.max(1, page) - 1) * retmax;
        return `${query}&retmax=${retmax}&retstart=${retstart}`;
    }
}
exports.default = QueryService;
//# sourceMappingURL=query-service.js.map