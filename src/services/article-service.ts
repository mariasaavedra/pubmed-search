import BlueprintService from "./blueprint-service";
import QueryService from "./query-service";
import PubmedService from "./pubmed-service";
import { ArticleRequest, ArticleResponse } from "../types";
import { Logger } from "../utils/logger";

/**
 * Service for handling article-related business logic
 */
class ArticleService {
  private blueprint_service: BlueprintService;
  private query_service: QueryService;
  private pubmed_service: PubmedService;

  constructor() {
    this.blueprint_service = new BlueprintService();
    this.query_service = new QueryService();
    this.pubmed_service = new PubmedService();
  }

  /**
   * Get articles based on clinical blueprint
   */
  public async getArticles(article_request: ArticleRequest): Promise<ArticleResponse> {
    const start_time = Date.now();

    // Process the blueprint
    const blueprint = this.blueprint_service.processBlueprint(article_request);
    Logger.debug("ArticleService", "Processed blueprint", blueprint);

    // Build search query
    const query = this.query_service.buildSearchQuery(blueprint);

    // Validate query
    if (!this.query_service.validateQuery(query)) {
      throw new Error("Invalid query construction");
    }

    // Get total count (for pagination info)
    const total_count = await this.pubmed_service.getArticleCount(query);
    Logger.debug("ArticleService", `Found ${total_count} total matching articles`);

    // Search articles
    const pmids = await this.pubmed_service.searchArticles(
      query,
      article_request.page || 1,
      article_request.limit || 10
    );

    if (pmids.length === 0) {
      Logger.info("ArticleService", "No articles found for query");
      const duration = Date.now() - start_time;

      return {
        articles: [],
        meta: {
          total: 0,
          processing_time: duration,
          saved_filename: "",
        },
      };
    }

    Logger.debug("ArticleService", `Retrieved ${pmids.length} article IDs`, { pmids });

    // Fetch article details
    const articles = await this.pubmed_service.fetchArticleDetails(pmids);
    const duration = Date.now() - start_time;

    Logger.success("ArticleService", `Request completed in ${duration}ms, returning ${articles.length} articles`);

    return {
      articles: articles,
      meta: {
        total: total_count,
        processing_time: duration,
        saved_filename: "", // This would be set if saving to file is implemented
        encoding: {
          tables: "base64",
          original_xml: "base64",
          sanitized_html: "base64",
        },
      },
    };
  }

  /**
   * Get suggested topics for a specialty
   */
  public getSuggestedTopics(specialty: string): { specialty: string; topics: string[] } {
    if (!specialty) {
      throw new Error("Specialty parameter is required");
    }

    Logger.debug("ArticleService", `Getting suggested topics for specialty: ${specialty}`);
    const topics = this.blueprint_service.getSuggestedTopics(specialty);
    Logger.debug("ArticleService", `Found ${topics.length} topics for ${specialty}`);

    return {
      specialty,
      topics,
    };
  }

  /**
   * Get all available specialties
   */
  public getSpecialties(): { specialties: string[] } {
    Logger.debug("ArticleService", "Getting all available specialties");
    const specialties = this.blueprint_service.getSpecialties();
    const specialty_list = Object.keys(specialties);

    Logger.debug("ArticleService", `Found ${specialty_list.length} specialties`);

    return {
      specialties: specialty_list,
    };
  }
}

export default ArticleService;
