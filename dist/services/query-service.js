"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mesh_mapper_1 = __importDefault(require("../utils/mesh-mapper"));
const pubmed_config_1 = require("../config/pubmed-config");
/**
 * Service for constructing optimized PubMed search queries
 */
class QueryService {
    /**
     * Build a complete PubMed search query based on a processed blueprint
     * @param blueprint The processed blueprint
     * @returns PubMed search query string
     */
    BuildSearchQuery(blueprint) {
        // Create the core topic query
        const topic_query = this.BuildTopicQuery(blueprint.topics);
        // Add filters
        const filter_query = this.ApplyFilters(blueprint.filters);
        // Combine all query parts
        return `(${topic_query}) AND (${filter_query})`;
    }
    /**
     * Build a query string for the topics
     * @param topics Array of topics
     * @returns Topic query string
     */
    BuildTopicQuery(topics) {
        if (topics.length === 0) {
            throw new Error('At least one topic is required');
        }
        // Map each topic to MeSH terms and format for search
        const topic_queries = topics.map(topic => {
            const mesh_terms = mesh_mapper_1.default.MapTerm(topic);
            if (mesh_terms.length === 0) {
                // If no MeSH terms, use the original topic with various fields
                return `("${topic}"[Title/Abstract] OR "${topic}"[All Fields])`;
            }
            // If we have MeSH terms, create a more precise query
            const mesh_query = mesh_terms.map(term => `"${term}"[MeSH Terms] OR "${term}"[Title/Abstract]`).join(' OR ');
            return `(${mesh_query})`;
        });
        // Join topics with AND (since we want articles that mention both topics)
        return topics.length > 1
            ? `(${topic_queries.join(' AND ')})`
            : topic_queries[0];
    }
    /**
     * Apply filters to the query
     * @param filters Query filters
     * @returns Filter query string
     */
    ApplyFilters(filters) {
        const filter_parts = [];
        // Apply study type filters
        if (filters.clinical_queries && filters.clinical_queries.length > 0) {
            const study_filters = filters.clinical_queries
                .filter(type => pubmed_config_1.FILTER_MAP[type])
                .map(type => pubmed_config_1.FILTER_MAP[type].broad);
            if (study_filters.length > 0) {
                // Each filter is already wrapped in parentheses from the config
                // Just join them with OR and wrap the whole thing
                filter_parts.push(`(${study_filters.join(' OR ')})`);
            }
        }
        else {
            // Use default filter if no specific filters provided
            filter_parts.push(pubmed_config_1.DEFAULT_FILTER.narrow);
        }
        // Apply age group filter if specified
        if (filters.age_group && pubmed_config_1.AGE_MAP[filters.age_group]) {
            filter_parts.push(pubmed_config_1.AGE_MAP[filters.age_group]);
        }
        // Apply date range filter
        const year_range = filters.year_range || 3;
        filter_parts.push(`"last ${year_range} years"[PDat]`);
        // Join all filter parts with AND
        return filter_parts.join(' AND ');
    }
    /**
     * Validate a constructed query
     * @param query The query to validate
     * @returns True if the query is valid
     */
    ValidateQuery(query) {
        // Check minimum query length
        if (query.length < 10) {
            console.log('Query validation failed: Too short');
            return false;
        }
        // Check for balanced parentheses using a stack
        const stack = [];
        for (const char of query) {
            if (char === '(') {
                stack.push(char);
            }
            else if (char === ')') {
                if (stack.length === 0) {
                    console.log('Query validation failed: Unmatched closing parenthesis');
                    return false;
                }
                stack.pop();
            }
        }
        if (stack.length !== 0) {
            console.log(`Query validation failed: ${stack.length} unclosed parentheses`);
            return false;
        }
        // Validate PubMed field tags
        const validTags = [
            'MeSH Terms', 'Title/Abstract', 'All Fields', 'Publication Type',
            'Text Word', 'Language', 'mh', 'pt', 'PDat', 'MeSH Subheading',
            'MeSH:noexp', 'noexp'
        ];
        const tagPattern = /\[(.*?)\]/g;
        const matches = query.match(tagPattern);
        if (matches) {
            for (const match of matches) {
                const tag = match.slice(1, -1); // Remove brackets
                if (!validTags.some(validTag => tag.includes(validTag))) {
                    console.log(`Query validation failed: Invalid field tag "${tag}"`);
                    return false;
                }
            }
        }
        // Check basic query structure
        if (!query.includes('AND') && !query.includes('OR')) {
            console.log('Query validation failed: Missing boolean operators');
            return false;
        }
        // Ensure query doesn't end with operators
        if (/AND\s*$/.test(query) || /OR\s*$/.test(query)) {
            console.log('Query validation failed: Query ends with an operator');
            return false;
        }
        // Print the final query for inspection
        console.log('Validated query:', query);
        return true;
    }
    /**
     * Add pagination parameters to a query
     * @param query Base query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Query with pagination parameters
     */
    AddPagination(query, page = 1, limit = 10) {
        const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
        const retstart = (Math.max(1, page) - 1) * retmax;
        return `${query}&retmax=${retmax}&retstart=${retstart}`;
    }
}
exports.default = QueryService;
//# sourceMappingURL=query-service.js.map