"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blueprint_service_1 = __importDefault(require("../services/blueprint-service"));
const query_service_1 = __importDefault(require("../services/query-service"));
const pubmed_service_1 = __importDefault(require("../services/pubmed-service"));
const ranking_service_1 = __importDefault(require("../services/ranking-service"));
const file_storage_service_1 = __importDefault(require("../services/file-storage-service"));
const logger_1 = require("../utils/logger");
/**
 * Controller for handling article requests
 */
class ArticleController {
    constructor() {
        this.blueprint_service = new blueprint_service_1.default();
        this.query_service = new query_service_1.default();
        this.pubmed_service = new pubmed_service_1.default();
        this.ranking_service = new ranking_service_1.default();
        this.file_storage_service = new file_storage_service_1.default();
    }
    /**
     * Handle article retrieval based on clinical blueprint
     * @param req Express request
     * @param res Express response
     */
    async GetArticles(req, res) {
        const start_time = Date.now();
        try {
            // Validate request body
            const article_request = req.body;
            logger_1.Logger.debug('ArticleController', 'Received article request', article_request);
            // Process the blueprint
            const blueprint = this.blueprint_service.ProcessBlueprint(article_request);
            logger_1.Logger.debug('ArticleController', 'Processed blueprint', blueprint);
            // Build search query
            const query = this.query_service.BuildSearchQuery(blueprint);
            logger_1.Logger.debug('ArticleController', 'Constructed query', query);
            // Validate query
            if (!this.query_service.ValidateQuery(query)) {
                res.status(400).json({
                    error: 'Invalid query construction'
                });
                return;
            }
            // Get total count (for pagination info)
            const total_count = await this.pubmed_service.GetArticleCount(query);
            logger_1.Logger.debug('ArticleController', `Found ${total_count} total matching articles`);
            // Search articles
            const pmids = await this.pubmed_service.SearchArticles(query, article_request.page || 1, article_request.limit || 10);
            if (pmids.length === 0) {
                logger_1.Logger.info('ArticleController', 'No articles found for query');
                const duration = Date.now() - start_time;
                const saved_filename = await this.file_storage_service.saveSearchResult([], blueprint, query, [], 0);
                logger_1.Logger.info('ArticleController', `Empty search results saved to ${saved_filename}`);
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
            logger_1.Logger.debug('ArticleController', `Retrieved ${pmids.length} article IDs`, { pmids });
            // Fetch article details
            const articles = await this.pubmed_service.FetchArticleDetails(pmids);
            logger_1.Logger.debug('ArticleController', `Fetched details for ${articles.length} articles`);
            // Rank articles
            const ranked_articles = this.ranking_service.RankArticles(articles, blueprint.topics);
            logger_1.Logger.debug('ArticleController', 'Articles ranked successfully');
            const duration = Date.now() - start_time;
            // Save search results
            const saved_filename = await this.file_storage_service.saveSearchResult(ranked_articles, blueprint, query, pmids, total_count);
            logger_1.Logger.info('ArticleController', `Search results saved to ${saved_filename}`);
            // Return results
            logger_1.Logger.success('ArticleController', `Request completed in ${duration}ms, returning ${ranked_articles.length} articles`);
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
        }
        catch (error) {
            logger_1.Logger.error('ArticleController', 'Error retrieving articles', error);
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
    GetSuggestedTopics(req, res) {
        try {
            const { specialty } = req.params;
            logger_1.Logger.debug('ArticleController', `Getting suggested topics for specialty: ${specialty}`);
            if (!specialty) {
                logger_1.Logger.warn('ArticleController', 'Specialty parameter is missing');
                res.status(400).json({
                    error: 'Specialty parameter is required'
                });
                return;
            }
            const topics = this.blueprint_service.GetSuggestedTopics(specialty);
            logger_1.Logger.debug('ArticleController', `Found ${topics.length} topics for ${specialty}`);
            res.json({
                specialty,
                topics
            });
        }
        catch (error) {
            logger_1.Logger.error('ArticleController', 'Error getting suggested topics', error);
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
    GetSpecialties(_req, res) {
        try {
            logger_1.Logger.debug('ArticleController', 'Getting all available specialties');
            const specialties = this.blueprint_service.GetSpecialties();
            const specialty_list = Object.keys(specialties);
            logger_1.Logger.debug('ArticleController', `Found ${specialty_list.length} specialties`);
            res.json({
                specialties: specialty_list
            });
        }
        catch (error) {
            logger_1.Logger.error('ArticleController', 'Error getting specialties', error);
            res.status(500).json({
                error: 'An error occurred while retrieving specialties'
            });
        }
    }
}
exports.default = ArticleController;
//# sourceMappingURL=article-controller.js.map