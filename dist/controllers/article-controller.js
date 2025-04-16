"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const article_service_1 = __importDefault(require("../services/article-service"));
const logger_1 = require("../utils/logger");
/**
 * Controller for handling article requests
 */
class ArticleController {
    constructor() {
        this.article_service = new article_service_1.default();
    }
    /**
     * Handle article retrieval based on clinical blueprint
     * @param req Express request
     * @param res Express response
     */
    async getArticles(req, res) {
        try {
            logger_1.Logger.debug("ArticleController", "Received article request", req.body);
            const result = await this.article_service.getArticles(req.body);
            res.json(result);
        }
        catch (error) {
            logger_1.Logger.error("ArticleController", "Error retrieving articles", error);
            res.status(error instanceof Error && error.message === "Invalid query construction" ? 400 : 500)
                .json({
                error: "An error occurred while processing your request",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * Get suggested topics for a specialty
     * @param req Express request
     * @param res Express response
     */
    getSuggestedTopics(req, res) {
        try {
            const { specialty } = req.params;
            logger_1.Logger.debug("ArticleController", `Getting suggested topics for specialty: ${specialty}`);
            const result = this.article_service.getSuggestedTopics(specialty);
            res.json(result);
        }
        catch (error) {
            logger_1.Logger.error("ArticleController", "Error getting suggested topics", error);
            res.status(error instanceof Error && error.message === "Specialty parameter is required" ? 400 : 500)
                .json({
                error: "An error occurred while retrieving suggested topics",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    /**
     * Handle article retrieval based on specialty only
     * @param req Express request
     * @param res Express response
     */
    async getArticlesBySpecialty(req, res) {
        try {
            logger_1.Logger.debug("ArticleController", "Received specialty-only article request", req.body);
            const result = await this.article_service.getArticles({ specialty: req.body.specialty });
            res.json(result);
        }
        catch (error) {
            logger_1.Logger.error("ArticleController", "Error retrieving articles by specialty", error);
            res.status(error instanceof Error && error.message === "Invalid query construction" ? 400 : 500)
                .json({
                error: "An error occurred while processing your request",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    getSpecialties(_req, res) {
        try {
            logger_1.Logger.debug("ArticleController", "Getting all available specialties");
            const result = this.article_service.getSpecialties();
            res.json(result);
        }
        catch (error) {
            logger_1.Logger.error("ArticleController", "Error getting specialties", error);
            res.status(500).json({
                error: "An error occurred while retrieving specialties",
                message: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
exports.default = ArticleController;
//# sourceMappingURL=article-controller.js.map