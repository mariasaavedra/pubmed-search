import MeshMapper from '../utils/mesh-mapper';
import BlueprintService from './blueprint-service';
import { ProcessedBlueprint, QueryFilters } from '../types';
import { FILTER_MAP, AGE_MAP, DEFAULT_FILTER } from '../config/pubmed-config';

/**
 * Service for constructing optimized PubMed search queries
 */
class QueryService {
  private blueprint_service: BlueprintService;
  
  constructor() {
    this.blueprint_service = new BlueprintService();
  }
  /**
   * Build a complete PubMed search query based on a processed blueprint
   * @param blueprint The processed blueprint
   * @returns PubMed search query string
   */
  public buildSearchQuery(blueprint: ProcessedBlueprint): string {
    // Create the core topic query
    const topic_query = this.buildTopicQuery(blueprint.topics);
    
    // Add specialty MeSH terms if available from BlueprintService
    const specialty_mesh_terms = this.blueprint_service.getSpecialtyMeshTerms(blueprint.specialty);
    const specialty_query = this.buildSpecialtyQuery(specialty_mesh_terms);
    
    // Add filters
    const filter_query = this.applyFilters(blueprint.filters);
    
    // Combine all query parts
    // This ensures articles match the specialty, at least one of the topics, and the filters
    if (specialty_query) {
      return `(${specialty_query}) AND (${topic_query}) AND (${filter_query})`;
    } else {
      return `(${topic_query}) AND (${filter_query})`;
    }
  }

  /**
   * Build a query string for specialty MeSH terms
   * @param meshTerms Array of specialty MeSH terms
   * @returns Specialty query string or empty string if no terms
   */
  private buildSpecialtyQuery(meshTerms: string[]): string {
    if (!meshTerms || meshTerms.length === 0) {
      return '';
    }

    // Format each MeSH term
    const meshQueries = meshTerms.map(term => 
      `"${term}"[MeSH Terms]`
    );
    
    // Join terms with OR (we want articles matching any relevant specialty term)
    return meshQueries.length > 1
      ? `(${meshQueries.join(' OR ')})`
      : meshQueries[0];
  }

  /**
   * Build a query string for the topics
   * @param topics Array of topics
   * @returns Topic query string
   */
  public buildTopicQuery(topics: string[]): string {
    if (topics.length === 0) {
      throw new Error('At least one topic is required');
    }

    // Map each topic to MeSH terms and format for search
    const topic_queries = topics.map(topic => {
      const mesh_terms = MeshMapper.mapTerm(topic);
      
      if (mesh_terms.length === 0) {
        // If no MeSH terms, use the original topic with various fields
        return `("${topic}"[Title/Abstract] OR "${topic}"[All Fields])`;
      }
      
      // Build better queries using both MeSH terms and text searches
      const mesh_query_parts = [];
      
      // Add proper MeSH term queries
      mesh_terms.forEach(term => {
        mesh_query_parts.push(`"${term}"[MeSH Terms]`);
        mesh_query_parts.push(`"${term}"[Title/Abstract]`);
      });
      
      // Always include the original term as a text search
      mesh_query_parts.push(`"${topic}"[Title/Abstract]`);
      mesh_query_parts.push(`"${topic}"[All Fields]`);
      
      return `(${mesh_query_parts.join(' OR ')})`;
    });

    // Join topics with OR (since we want articles that mention any of the topics)
    return topics.length > 1 
      ? `(${topic_queries.join(' OR ')})` 
      : topic_queries[0];
  }

  /**
   * Apply filters to the query
   * @param filters Query filters
   * @param filterScope Whether to use 'broad' or 'narrow' filter scope (defaults to 'narrow' for better results)
   * @returns Filter query string
   */
  public applyFilters(filters: QueryFilters, filterScope: 'broad' | 'narrow' = 'narrow'): string {
    const filter_parts: string[] = [];

    // PubMed best practices: always add English language filter and publication types
    filter_parts.push(DEFAULT_FILTER.narrow);

    // Apply clinical query filters (therapy, diagnosis, etc.)
    if (filters.clinical_queries && filters.clinical_queries.length > 0) {
      // Get valid filters
      const validFilters = filters.clinical_queries
        .filter(type => FILTER_MAP[type as keyof typeof FILTER_MAP]);
      
      if (validFilters.length > 0) {
        // Apply each filter individually with the specified scope
        const clinical_filter_parts = validFilters.map(type => 
          FILTER_MAP[type as keyof typeof FILTER_MAP][filterScope]
        );
        
        // Join clinical filters with OR for better results (articles matching ANY filter)
        if (clinical_filter_parts.length > 0) {
          filter_parts.push(`(${clinical_filter_parts.join(' OR ')})`);
        }
      }
    }

    // Apply age group filter if specified
    if (filters.age_group && AGE_MAP[filters.age_group as keyof typeof AGE_MAP]) {
      filter_parts.push(AGE_MAP[filters.age_group as keyof typeof AGE_MAP]);
    }

    // Apply date range filter
    const year_range = filters.year_range || 2;
    filter_parts.push(`"last ${year_range} years"[PDat]`);

    // Log the constructed filter query for debugging
    console.log('Constructed filter query:', filter_parts.join(' AND '));

    // Join all filter parts with AND
    return filter_parts.join(' AND ');
  }

  /**
   * Validate a constructed query
   * @param query The query to validate
   * @returns True if the query is valid
   */
  public validateQuery(query: string): boolean {
    // Check minimum query length
    if (query.length < 10) {
      console.log('Query validation failed: Too short');
      return false;
    }

    // Check for balanced parentheses using a stack
    const stack: string[] = [];
    for (const char of query) {
      if (char === '(') {
        stack.push(char);
      } else if (char === ')') {
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
  public addPagination(query: string, page: number = 1, limit: number = 10): string {
    const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
    const retstart = (Math.max(1, page) - 1) * retmax;
    
    return `${query}&retmax=${retmax}&retstart=${retstart}`;
  }
}

export default QueryService;
