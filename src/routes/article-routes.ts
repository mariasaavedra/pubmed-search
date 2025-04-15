import { Router } from 'express';
import ArticleController from '../controllers/article-controller';

const router = Router();
const controller = new ArticleController();

/**
 * @route POST /api/articles
 * @description Get articles based on a clinical blueprint
 */
router.post('/articles', (req, res) => controller.GetArticles(req, res));

/**
 * @route GET /api/specialties
 * @description Get all available specialties
 */
router.get('/specialties', (req, res) => controller.GetSpecialties(req, res));

/**
 * @route GET /api/specialties/:specialty/topics
 * @description Get suggested topics for a specialty
 */
router.get('/specialties/:specialty/topics', (req, res) => controller.GetSuggestedTopics(req, res));

export default router;
