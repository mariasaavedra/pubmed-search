import { Request, Response } from 'express';
import BlueprintService from '../services/blueprint-service';
import QueryService from '../services/query-service';
import PubmedService from '../services/pubmed-service';
import RankingService from '../services/ranking-service';
import { ArticleRequest } from '../types';

/**
 * Controller for handling article requests
 */
class ArticleController {
  private blueprint_service: BlueprintService;
  private query_service: QueryService;
  private pubmed_service: PubmedService;
  private ranking_service: RankingService;

  constructor() {
    this.blueprint_service = new BlueprintService();
    this.query_service = new QueryService();
    this.pubmed_service = new PubmedService();
    this.ranking_service = new RankingService();
  }

  /**
   * Handle article retrieval based on clinical blueprint
   * @param req Express request
   * @param res Express response
   */
  public async GetArticles(req: Request, res: Response): Promise<void> {
    const start_time = Date.now();
    
    try {
      // Validate request body
      const article_request = req.body as ArticleRequest;
      
      if (!article_request.specialty || !article_request.topics || !Array.isArray(article_request.topics)) {
        res.status(400).json({
          error: 'Invalid request: specialty and topics array are required'
        });
        return;
      }

      // Process the blueprint
      const blueprint = this.blueprint_service.ProcessBlueprint(article_request);
      
      // Build search query
      const query = this.query_service.BuildSearchQuery(blueprint);
      
      // Validate query
      if (!this.query_service.ValidateQuery(query)) {
        res.status(400).json({
          error: 'Invalid query construction'
        });
        return;
      }
      
      // Get total count (for pagination info)
      const total_count = await this.pubmed_service.GetArticleCount(query);
      
      // Search articles
      const pmids = await this.pubmed_service.SearchArticles(
        query,
        article_request.page || 1,
        article_request.limit || 10
      );
      
      if (pmids.length === 0) {
        res.json({
          articles: [],
          meta: {
            total: 0,
            processing_time: Date.now() - start_time
          }
        });
        return;
      }
      
      // Fetch article details
      const articles = await this.pubmed_service.FetchArticleDetails(pmids);
      
      // Rank articles
      const ranked_articles = this.ranking_service.RankArticles(articles, blueprint.topics);
      
      // Return results
      res.json({
        articles: ranked_articles,
        meta: {
          total: total_count,
          processing_time: Date.now() - start_time
        }
      });
    } catch (error) {
      console.error('Error retrieving articles:', error);
      res.status(500).json({
        error: 'An error occurred while processing your request',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get suggested topics for a specialty
   * @param req Express request
   * @param res Express response
   */
  public GetSuggestedTopics(req: Request, res: Response): void {
    try {
      const { specialty } = req.params;
      
      if (!specialty) {
        res.status(400).json({
          error: 'Specialty parameter is required'
        });
        return;
      }
      
      const topics = this.blueprint_service.GetSuggestedTopics(specialty);
      
      res.json({
        specialty,
        topics
      });
    } catch (error) {
      console.error('Error getting suggested topics:', error);
      res.status(500).json({
        error: 'An error occurred while retrieving suggested topics'
      });
    }
  }

  /**
   * Get all available specialties
   * @param _req Express request
   * @param res Express response
   */
  public GetSpecialties(_req: Request, res: Response): void {
    try {
      const specialties = this.blueprint_service.GetSpecialties();
      
      res.json({
        specialties: Object.keys(specialties)
      });
    } catch (error) {
      console.error('Error getting specialties:', error);
      res.status(500).json({
        error: 'An error occurred while retrieving specialties'
      });
    }
  }
}

export default ArticleController;
