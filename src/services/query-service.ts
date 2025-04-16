import { ProcessedBlueprint, QueryFilters } from "../types";
import {
  DEFAULT_FILTER,
  CORE_CLINICAL_JOURNALS_FILTER,
  CARDIOLOGY_JOURNALS_FILTER
} from "../config/pubmed-config";
import { Logger } from "../utils/logger";

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
  public buildSearchQuery(blueprint: ProcessedBlueprint): string {
    try {
      // Create basic search term from specialty and topics (limited to avoid complexity)
      const searchTerm = this.createBasicSearchTerm(blueprint);
      
      // Add date range
      const dateFilter = `"last ${
        blueprint.filters.year_range || 2
      } years"[PDat]`;

      // Determine the appropriate journal filter based on specialty
      let journalFilter = CORE_CLINICAL_JOURNALS_FILTER;

      // For now, we just implement a cardiology-specific filter as an example
      // This could be expanded to look up specialty-specific filters from a config file
      if (blueprint.specialty && blueprint.specialty.toLowerCase() === 'cardiology') {
        journalFilter = CARDIOLOGY_JOURNALS_FILTER;
      }

      // Combine the parts - always wrap components in parentheses for safety
      const query = `(${searchTerm}) AND (${DEFAULT_FILTER.narrow}) AND (${dateFilter}) AND (${journalFilter})`;

      Logger.debug(
        "QueryService",
        `Built simplified search query: ${query}`
      );
      console.log("QUERY BEING SENT TO PUBMED:", query);

      if (!this.validateQuery(query)) {
        Logger.warn("QueryService", "Query validation failed");
        // Return a basic valid query instead
        return `${blueprint.specialty || blueprint.topics[0]} AND "last 2 years"[PDat] AND English[Language]`;
      }

      return query;
    } catch (error) {
      Logger.error("QueryService", `Error building query: ${error}`);
      return `medicine AND "last 2 years"[PDat] AND English[Language]`;
    }
  }

  /**
   * Create a basic search term by handling specialty and topics simply
   * Leverages PubMed's Automatic Term Mapping for better recall
   * @param blueprint Processed blueprint
   * @returns Formatted search term string
   */
  private createBasicSearchTerm(blueprint: ProcessedBlueprint): string {
    // Create an array of terms
    let terms = [blueprint.specialty, ...blueprint.topics].filter(Boolean);

    if (terms.length === 0) {
      throw new Error(
        "At least one search term (specialty or topic) is required"
      );
    }

    // Limit to 2 terms maximum to prevent overly complex queries
    if (terms.length > 2) {
      terms = terms.slice(0, 2);
      Logger.debug(
        "QueryService",
        `Limited to first 2 terms to reduce query complexity`
      );
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
  public validateQuery(query: string): boolean {
    // Check minimum query length
    if (query.length < 10) {
      Logger.warn("QueryService", "Query validation failed: Too short");
      return false;
    }

    // Check for balanced parentheses
    const stack: string[] = [];
    for (const char of query) {
      if (char === "(") {
        stack.push(char);
      } else if (char === ")") {
        if (stack.length === 0) {
          Logger.warn(
            "QueryService",
            "Query validation failed: Unmatched closing parenthesis"
          );
          return false;
        }
        stack.pop();
      }
    }
    
    if (stack.length !== 0) {
      Logger.warn(
        "QueryService",
        `Query validation failed: ${stack.length} unclosed parentheses`
      );
      return false;
    }

    // Check if query isn't too long (PubMed has limits)
    if (query.length > 800) {
      Logger.warn(
        "QueryService",
        "Query validation failed: Query too long"
      );
      return false;
    }

    Logger.debug("QueryService", "Validated query:", query);
    return true;
  }

  /**
   * Add pagination parameters to a query
   * @param query Base query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Query with pagination parameters
   */
  public addPagination(
    query: string,
    page: number = 1,
    limit: number = 10
  ): string {
    const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
    const retstart = (Math.max(1, page) - 1) * retmax;

    return `${query}&retmode=json&retmax=${retmax}&retstart=${retstart}`;
  }
}

export default QueryService;
