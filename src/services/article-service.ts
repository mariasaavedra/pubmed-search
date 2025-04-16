import BlueprintService from "./blueprint-service";
import QueryService from "./query-service";
import PubmedService from "./pubmed-service";
import EmbeddingService from "./embedding.service";
import JournalRankingService from "./journal-ranking.service";
import { ArticleRequest, ArticleResponse, Article } from "../types";
import { Logger } from "../utils/logger";

/**
 * Service for handling article-related business logic
 */
class ArticleService {
  private blueprint_service: BlueprintService;
  private query_service: QueryService;
  private pubmed_service: PubmedService;
  private embedding_service: EmbeddingService;
  private journal_ranking: JournalRankingService;

  constructor() {
    this.blueprint_service = new BlueprintService();
    this.query_service = new QueryService();
    this.pubmed_service = new PubmedService();
    this.embedding_service = new EmbeddingService();
    this.journal_ranking = new JournalRankingService();
    
    Logger.debug("ArticleService", "Initialized with relevance ranking and journal quality scoring");
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
    
    // Filter out articles with no abstract
    const articlesWithAbstracts = articles.filter(article => 
      article.abstract && article.abstract.trim().length > 0
    );
    
    if (articlesWithAbstracts.length === 0) {
      Logger.info("ArticleService", "No articles with abstracts found");
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
    
    Logger.debug("ArticleService", `Filtered to ${articlesWithAbstracts.length} articles with abstracts`);
    
    // Add journal quality scores
    Logger.debug("ArticleService", "Adding journal quality scores");
    const articlesWithJournalScores = articlesWithAbstracts.map(article => ({
      ...article,
      scores: {
        ...article.scores,
        journal_impact: this.journal_ranking.getJournalScore(article.journal)
      }
    }));
    
    // Rank articles by relevance using embeddings
    Logger.debug("ArticleService", "Ranking articles by relevance using embeddings");
    const searchQuery = article_request.specialty + (article_request.topics ? " " + article_request.topics.join(" ") : "");
    const articlesWithRelevance = await this.embedding_service.rankArticlesByRelevance(
      searchQuery,
      articlesWithJournalScores
    );
    
    // Sort first by journal weight, then by relevance
    const rankedArticles = articlesWithRelevance.sort((a, b) => {
      // First sort by journal weight (higher first)
      if (b.scores.journal_impact !== a.scores.journal_impact) {
        return b.scores.journal_impact - a.scores.journal_impact;
      }
      // Then by relevance score
      return b.scores.relevance - a.scores.relevance;
    });
    
    // Log journal information for debugging
    rankedArticles.forEach(article => {
      const tierName = this.journal_ranking.getJournalTier(article.journal);
      Logger.debug("ArticleService", `Journal: "${article.journal}" -> Type: ${tierName}, Score: ${article.scores.journal_impact.toFixed(2)}`);
    });
    
    const duration = Date.now() - start_time;

    Logger.success("ArticleService", `Request completed in ${duration}ms, returning ${rankedArticles.length} articles`);

    return {
      articles: rankedArticles,
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
  public getSpecialties(): { specialties: string[], raw: Record<string, any> } {
    Logger.debug("ArticleService", "Getting all available specialties");
    const specialties = this.blueprint_service.getSpecialties();
    const specialty_list = Object.keys(specialties);

    Logger.debug("ArticleService", `Found ${specialty_list.length} specialties`);

    return {
      specialties: specialty_list,
      raw: specialties,
    };
  }
}

export default ArticleService;
