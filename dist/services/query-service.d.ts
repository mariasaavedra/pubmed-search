import { ProcessedBlueprint } from "../types";
/**
 * Service for constructing optimized PubMed search queries
 * Simplified to create direct search term + clinical filter queries
 */
declare class QueryService {
    /**
     * Build a complete PubMed search query based on a processed blueprint
     * @param blueprint The processed blueprint
     * @returns PubMed search query string
     */
    buildSearchQuery(blueprint: ProcessedBlueprint): string;
    /**
     * Create a search term by properly formatting specialty and topics for PubMed
     * @param blueprint Processed blueprint
     * @returns Formatted search term string
     */
    private createSearchTerm;
    /**
     * Get a combined filter from all clinical queries
     * @param clinicalQueries Array of clinical query types
     * @returns Combined clinical query filter string
     */
    private getCombinedClinicalQueryFilter;
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
