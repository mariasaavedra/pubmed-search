import { Router } from 'express';
import ArticleController from '../controllers/article-controller';

const router = Router();
const controller = new ArticleController();

/**
 * @route POST /api/articles/specialty
 * @description Get articles based on specialty only
 */
router.post('/api/articles/specialty', (req, res) => {
  console.log('Received specialty request:', req.body);
  return controller.getArticlesBySpecialty(req, res);
});

/**
 * @route POST /api/articles
 * @description Get articles based on a clinical blueprint
 */
router.post('/api/articles', (req, res) => controller.getArticles(req, res));

/**
 * @route GET /api/specialties/:specialty/topics
 * @description Get suggested topics for a specialty
 */
router.get('/api/specialties/:specialty/topics', (req, res) => controller.getSuggestedTopics(req, res));

/**
 * @route GET /api/specialties
 * @description Get all available specialties
 */
router.get('/api/specialties', (req, res) => controller.getSpecialties(req, res));

/**
 * @route GET /api/article-types
 * @description Get all available article types for filtering
 */
router.get('/api/article-types', (req, res) => controller.getArticleTypes(req, res));

/**
 * @route GET /api/specialty-filters
 * @description Get all available specialty filters for content filtering
 */
router.get('/api/specialty-filters', (req, res) => controller.getSpecialtyFilters(req, res));

export default router;
