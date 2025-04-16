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
  public async getArticles(
    req: Request,
    res: Response
  ): Promise<void | Response> {
    try {
      Logger.debug("ArticleController", "Received article request", req.body);

      // Validate request body
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Request body must be a valid JSON object",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Handle pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const requestData = {
        ...req.body,
        page,
        limit,
      };

      const result = await this.article_service.getArticles(requestData);
      res.json(result);
    } catch (error) {
      Logger.error("ArticleController", "Error retrieving articles", error);
      res
        .status(
          error instanceof Error &&
            error.message === "Invalid query construction"
            ? 400
            : 500
        )
        .json({
          error: "An error occurred while processing your request",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          path: req.path,
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
      res
        .status(
          error instanceof Error &&
            error.message === "Specialty parameter is required"
            ? 400
            : 500
        )
        .json({
          error: "An error occurred while retrieving suggested topics",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
    }
  }

  /**
   * Handle article retrieval based on specialty only
   * @param req Express request
   * @param res Express response
   */
  public async getArticlesBySpecialty(
    req: Request,
    res: Response
  ): Promise<void | Response> {
    try {
      Logger.debug(
        "ArticleController",
        "Received specialty-only article request",
        req.body
      );

      // Validate request body
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Request body must be a valid JSON object",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      if (!req.body.specialty || typeof req.body.specialty !== "string") {
        return res.status(400).json({
          error: "Bad Request",
          message: "specialty must be a non-empty string",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Handle pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get suggested topics for the specialty but limit them to avoid URL too long errors
      const { topics: allTopics } = this.article_service.getSuggestedTopics(
        req.body.specialty
      );

      // Only use the random 5 topics to keep the query manageable
      const topics = this.getRandomItems(allTopics, 5) as string[]; // Log the selected topics
      Logger.debug(
        "ArticleController",
        `Randomly selected topics: ${topics.join(", ")}`
      );

      const result = await this.article_service.getArticles({
        specialty: req.body.specialty,
        topics,
        filters: {
          clinical_queries: ["Therapy", "Diagnosis"],
          year_range: 2,
        },
        page,
        limit,
      });
      res.json({
        ...result,
        metadata: {
          specialty: req.body.specialty,
          topics,
          filters: {
            clinical_queries: ["Therapy", "Diagnosis"],
            year_range: 2,
          },
          page,
          limit,
        },
      });
    } catch (error) {
      Logger.error(
        "ArticleController",
        "Error retrieving articles by specialty",
        error
      );
      res
        .status(
          error instanceof Error &&
            error.message === "Invalid query construction"
            ? 400
            : 500
        )
        .json({
          error: "An error occurred while processing your request",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
          path: req.path,
        });
    }
  }

  public getRandomItems<T>(arr: T[], count: number): T[] {
    if (count > arr.length) {
      throw new Error("Count cannot be greater than the array length.");
    }

    const shuffled = [...arr];
    const randomIndices = new Uint32Array(count);
    crypto.getRandomValues(randomIndices);

    for (let i = 0; i < count; i++) {
      const randomIndex = randomIndices[i] % shuffled.length;
      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }
    return shuffled.slice(0, count);
  }

  public getSpecialties(req: Request, res: Response): void {
    try {
      Logger.debug("ArticleController", "Getting all available specialties");
      const result = this.article_service.getSpecialties();
      res.json(result);
    } catch (error) {
      Logger.error("ArticleController", "Error getting specialties", error);
      res.status(500).json({
        error: "An error occurred while retrieving specialties",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
}

export default ArticleController;
