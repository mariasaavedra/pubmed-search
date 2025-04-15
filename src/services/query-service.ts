import MeshMapper from '../utils/mesh-mapper';
import { ProcessedBlueprint, QueryFilters } from '../types';
import { FILTER_MAP, AGE_MAP, DEFAULT_FILTER } from '../config/pubmed-config';

/**
 * Service for constructing optimized PubMed search queries
 */
class QueryService {
  /**
   * Build a complete PubMed search query based on a processed blueprint
   * @param blueprint The processed blueprint
   * @returns PubMed search query string
   */
  public BuildSearchQuery(blueprint: ProcessedBlueprint): string {
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
  public BuildTopicQuery(topics: string[]): string {
    if (topics.length === 0) {
      throw new Error('At least one topic is required');
    }

    // Map each topic to MeSH terms and format for search
    const topic_queries = topics.map(topic => {
      const mesh_terms = MeshMapper.MapTerm(topic);
      
      if (mesh_terms.length === 0) {
        // If no MeSH terms, use the original topic with various fields
        return `("${topic}"[Title/Abstract] OR "${topic}"[All Fields])`;
      }
      
      // If we have MeSH terms, create a more precise query
      const mesh_query = mesh_terms.map(term => 
        `"${term}"[MeSH Terms] OR "${term}"[Title/Abstract]`
      ).join(' OR ');
      
      return `(${mesh_query})`;
    });

    // Join topics with OR if multiple topics
    return topics.length > 1 
      ? topic_queries.map(q => `(${q})`).join(' AND ') 
      : topic_queries[0];
  }

  /**
   * Apply filters to the query
   * @param filters Query filters
   * @returns Filter query string
   */
  public ApplyFilters(filters: QueryFilters): string {
    const filter_parts: string[] = [];

    // Apply study type filters
    if (filters.study_types && filters.study_types.length > 0) {
      const study_filters = filters.study_types
        .filter(type => FILTER_MAP[type as keyof typeof FILTER_MAP])
        .map(type => FILTER_MAP[type as keyof typeof FILTER_MAP].broad);
      
      if (study_filters.length > 0) {
        filter_parts.push(`(${study_filters.join(' OR ')})`);
      }
    } else {
      // Use default filter if no specific filters provided
      filter_parts.push(DEFAULT_FILTER.narrow);
    }

    // Apply age group filter if specified
    if (filters.age_group && AGE_MAP[filters.age_group as keyof typeof AGE_MAP]) {
      filter_parts.push(AGE_MAP[filters.age_group as keyof typeof AGE_MAP]);
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
  public ValidateQuery(query: string): boolean {
    // Basic validation - check for balanced parentheses and minimum length
    if (query.length < 10) {
      return false;
    }
    
    const open_count = (query.match(/\(/g) || []).length;
    const close_count = (query.match(/\)/g) || []).length;
    
    return open_count === close_count;
  }

  /**
   * Add pagination parameters to a query
   * @param query Base query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Query with pagination parameters
   */
  public AddPagination(query: string, page: number = 1, limit: number = 10): string {
    const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
    const retstart = (Math.max(1, page) - 1) * retmax;
    
    return `${query}&retmax=${retmax}&retstart=${retstart}`;
  }
}

export default QueryService;
