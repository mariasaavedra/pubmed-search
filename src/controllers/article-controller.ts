import { Request, Response } from "express";
import ArticleService from "../services/article-service";
import { Logger } from "../utils/logger";

/**
 * Controller for handling article requests
 */
class ArticleController {
  private article_service: ArticleService;

  constructor() {
    this.article_service = new ArticleService();
  }

  /**
   * Handle article retrieval based on clinical blueprint
   * @param req Express request
   * @param res Express response
   */
  public async getArticles(req: Request, res: Response): Promise<void> {
    try {
      Logger.debug(
        "ArticleController",
        "Received article request",
        req.body
      );

      const result = await this.article_service.getArticles(req.body);
      res.json(result);
    } catch (error) {
      Logger.error("ArticleController", "Error retrieving articles", error);
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
  public getSuggestedTopics(req: Request, res: Response): void {
    try {
      const { specialty } = req.params;
      Logger.debug(
        "ArticleController",
        `Getting suggested topics for specialty: ${specialty}`
      );

      const result = this.article_service.getSuggestedTopics(specialty);
      res.json(result);
    } catch (error) {
      Logger.error(
        "ArticleController",
        "Error getting suggested topics",
        error
      );
      res.status(error instanceof Error && error.message === "Specialty parameter is required" ? 400 : 500)
        .json({
          error: "An error occurred while retrieving suggested topics",
          message: error instanceof Error ? error.message : "Unknown error",
        });
    }
  }

  /**
   * Get all available specialties
   * @param _req Express request
   * @param res Express response
   */
  public getSpecialties(_req: Request, res: Response): void {
    try {
      Logger.debug("ArticleController", "Getting all available specialties");
      const result = this.article_service.getSpecialties();
      res.json(result);
    } catch (error) {
      Logger.error("ArticleController", "Error getting specialties", error);
      res.status(500).json({
        error: "An error occurred while retrieving specialties",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default ArticleController;
