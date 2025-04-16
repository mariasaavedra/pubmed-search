import { Request, Response } from 'express';
/**
 * Controller for handling article requests
 */
declare class ArticleController {
    private blueprint_service;
    private query_service;
    private pubmed_service;
    private ranking_service;
    private file_storage_service;
    constructor();
    /**
     * Handle article retrieval based on clinical blueprint
     * @param req Express request
     * @param res Express response
     */
    GetArticles(req: Request, res: Response): Promise<void>;
    /**
     * Get suggested topics for a specialty
     * @param req Express request
     * @param res Express response
     */
    GetSuggestedTopics(req: Request, res: Response): void;
    /**
     * Get all available specialties
     * @param _req Express request
     * @param res Express response
     */
    GetSpecialties(_req: Request, res: Response): void;
}
export default ArticleController;
