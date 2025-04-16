import { ProcessedBlueprint, QueryFilters } from '../types';
/**
 * Service for constructing optimized PubMed search queries
 */
declare class QueryService {
    /**
     * Build a complete PubMed search query based on a processed blueprint
     * @param blueprint The processed blueprint
     * @returns PubMed search query string
     */
    buildSearchQuery(blueprint: ProcessedBlueprint): string;
    /**
     * Build a query string for the topics
     * @param topics Array of topics
     * @returns Topic query string
     */
    buildTopicQuery(topics: string[]): string;
    /**
     * Apply filters to the query
     * @param filters Query filters
     * @returns Filter query string
     */
    applyFilters(filters: QueryFilters): string;
    /**
     * Validate a constructed query
     * @param query The query to validate
     * @returns True if the query is valid
     */
    validateQuery(query: string): boolean;
    /**
     * Add pagination parameters to a query
     * @param query Base query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Query with pagination parameters
     */
    addPagination(query: string, page?: number, limit?: number): string;
}
export default QueryService;
