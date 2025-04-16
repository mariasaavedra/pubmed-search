import { Request, Response } from 'express';
import BlueprintService from '../services/blueprint-service';
import QueryService from '../services/query-service';
import PubmedService from '../services/pubmed-service';
import RankingService from '../services/ranking-service';
import FileStorageService from '../services/file-storage-service';
import { ArticleRequest } from '../types';
import { Logger } from '../utils/logger';

/**
 * Controller for handling article requests
 */
class ArticleController {
  private blueprint_service: BlueprintService;
  private query_service: QueryService;
  private pubmed_service: PubmedService;
  private ranking_service: RankingService;

  private file_storage_service: FileStorageService;

  constructor() {
    this.blueprint_service = new BlueprintService();
    this.query_service = new QueryService();
    this.pubmed_service = new PubmedService();
    this.ranking_service = new RankingService();
    this.file_storage_service = new FileStorageService();
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
      Logger.debug('ArticleController', 'Received article request', article_request);

      // Process the blueprint
      const blueprint = this.blueprint_service.ProcessBlueprint(article_request);
      Logger.debug('ArticleController', 'Processed blueprint', blueprint);
      
      // Build search query
      const query = this.query_service.BuildSearchQuery(blueprint);
      Logger.debug('ArticleController', 'Constructed query', query);
      
      // Validate query
      if (!this.query_service.ValidateQuery(query)) {
        res.status(400).json({
          error: 'Invalid query construction'
        });
        return;
      }
      
      // Get total count (for pagination info)
      const total_count = await this.pubmed_service.GetArticleCount(query);
      Logger.debug('ArticleController', `Found ${total_count} total matching articles`);
      
      // Search articles
      const pmids = await this.pubmed_service.SearchArticles(
        query,
        article_request.page || 1,
        article_request.limit || 10
      );
      
      if (pmids.length === 0) {
        Logger.info('ArticleController', 'No articles found for query');
        const duration = Date.now() - start_time;
        const saved_filename = await this.file_storage_service.saveSearchResult(
          [],
          blueprint,
          query,
          [],
          0
        );
        Logger.info('ArticleController', `Empty search results saved to ${saved_filename}`);
        
        res.json({
          articles: [],
          meta: {
            total: 0,
            processing_time: duration,
            saved_filename
          }
        });
        return;
      }
      
      Logger.debug('ArticleController', `Retrieved ${pmids.length} article IDs`, { pmids });
      
      // Fetch article details
      const articles = await this.pubmed_service.FetchArticleDetails(pmids);
      Logger.debug('ArticleController', `Fetched details for ${articles.length} articles`);
      
      // Rank articles
      const ranked_articles = this.ranking_service.RankArticles(articles, blueprint.topics);
      Logger.debug('ArticleController', 'Articles ranked successfully');
      
      const duration = Date.now() - start_time;
      
      // Save search results
      const saved_filename = await this.file_storage_service.saveSearchResult(
        ranked_articles,
        blueprint,
        query + '-ranked',
        pmids,
        total_count
      );
      Logger.info('ArticleController', `Search results saved to ${saved_filename}`);

      // Return results
      Logger.success('ArticleController', `Request completed in ${duration}ms, returning ${ranked_articles.length} articles`);
      res.json({
        articles: ranked_articles,
        meta: {
          total: total_count,
          processing_time: duration,
          saved_filename,
          encoding: {
            tables: 'base64',
            original_xml: 'base64',
            sanitized_html: 'base64'
          }
        }
      });
    } catch (error) {
      Logger.error('ArticleController', 'Error retrieving articles', error);
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
      Logger.debug('ArticleController', `Getting suggested topics for specialty: ${specialty}`);
      
      if (!specialty) {
        Logger.warn('ArticleController', 'Specialty parameter is missing');
        res.status(400).json({
          error: 'Specialty parameter is required'
        });
        return;
      }
      
      const topics = this.blueprint_service.GetSuggestedTopics(specialty);
      Logger.debug('ArticleController', `Found ${topics.length} topics for ${specialty}`);
      
      res.json({
        specialty,
        topics
      });
    } catch (error) {
      Logger.error('ArticleController', 'Error getting suggested topics', error);
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
      Logger.debug('ArticleController', 'Getting all available specialties');
      const specialties = this.blueprint_service.GetSpecialties();
      const specialty_list = Object.keys(specialties);
      
      Logger.debug('ArticleController', `Found ${specialty_list.length} specialties`);
      
      res.json({
        specialties: specialty_list
      });
    } catch (error) {
      Logger.error('ArticleController', 'Error getting specialties', error);
      res.status(500).json({
        error: 'An error occurred while retrieving specialties'
      });
    }
  }
}

export default ArticleController;
