"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubmed_config_1 = require("../config/pubmed-config");
const logger_1 = require("../utils/logger");
/**
 * Service for constructing optimized PubMed search queries
 * Simplified to create more reliable and effective queries
 */
class QueryService {
    /**
     * Build a complete PubMed search query based on a processed blueprint
     * @param blueprint The processed blueprint
     * @returns PubMed search query string
     */
    buildSearchQuery(blueprint) {
        try {
            // Create basic search term from specialty and topics (limited to avoid complexity)
            const searchTerm = this.createBasicSearchTerm(blueprint);
            // Add date range
            const dateFilter = `"last ${blueprint.filters.year_range || 2} years"[PDat]`;
            // Determine the appropriate journal filter based on specialty
            let journalFilter = pubmed_config_1.CORE_CLINICAL_JOURNALS_FILTER;
            // For now, we just implement a cardiology-specific filter as an example
            // This could be expanded to look up specialty-specific filters from a config file
            if (blueprint.specialty && blueprint.specialty.toLowerCase() === 'cardiology') {
                journalFilter = pubmed_config_1.CARDIOLOGY_JOURNALS_FILTER;
            }
            // Combine the parts - always wrap components in parentheses for safety
            const query = `(${searchTerm}) AND (${pubmed_config_1.DEFAULT_FILTER.narrow}) AND (${dateFilter}) AND (${journalFilter})`;
            logger_1.Logger.debug("QueryService", `Built simplified search query: ${query}`);
            console.log("QUERY BEING SENT TO PUBMED:", query);
            if (!this.validateQuery(query)) {
                logger_1.Logger.warn("QueryService", "Query validation failed");
                // Return a basic valid query instead
                return `${blueprint.specialty || blueprint.topics[0]} AND "last 2 years"[PDat] AND English[Language]`;
            }
            return query;
        }
        catch (error) {
            logger_1.Logger.error("QueryService", `Error building query: ${error}`);
            return `medicine AND "last 2 years"[PDat] AND English[Language]`;
        }
    }
    /**
     * Create a basic search term by handling specialty and topics simply
     * Leverages PubMed's Automatic Term Mapping for better recall
     * @param blueprint Processed blueprint
     * @returns Formatted search term string
     */
    createBasicSearchTerm(blueprint) {
        // Create an array of terms
        let terms = [blueprint.specialty, ...blueprint.topics].filter(Boolean);
        if (terms.length === 0) {
            throw new Error("At least one search term (specialty or topic) is required");
        }
        // Limit to 2 terms maximum to prevent overly complex queries
        if (terms.length > 2) {
            terms = terms.slice(0, 2);
            logger_1.Logger.debug("QueryService", `Limited to first 2 terms to reduce query complexity`);
        }
        // Join terms with OR, allowing PubMed's Automatic Term Mapping to expand them
        // This provides better recall by mapping to MeSH terms and their hierarchies
        return terms.join(" OR ");
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
        // Check for balanced parentheses
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
        // Check if query isn't too long (PubMed has limits)
        if (query.length > 800) {
            logger_1.Logger.warn("QueryService", "Query validation failed: Query too long");
            return false;
        }
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
        return `${query}&retmode=json&retmax=${retmax}&retstart=${retstart}`;
    }
}
exports.default = QueryService;
//# sourceMappingURL=query-service.js.map