import { Request, Response } from "express";
/**
 * Controller for handling article requests
 */
declare class ArticleController {
    private article_service;
    constructor();
    /**
     * Handle article retrieval based on clinical blueprint
     * @param req Express request
     * @param res Express response
     */
    getArticles(req: Request, res: Response): Promise<void | Response>;
    /**
     * Get suggested topics for a specialty
     * @param req Express request
     * @param res Express response
     */
    getSuggestedTopics(req: Request, res: Response): void;
    /**
     * Handle article retrieval based on specialty only
     * @param req Express request
     * @param res Express response
     */
    getArticlesBySpecialty(req: Request, res: Response): Promise<void | Response>;
    getRandomItems<T>(arr: T[], count: number): T[];
    getSpecialties(req: Request, res: Response): void;
}
export default ArticleController;
