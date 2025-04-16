"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_controller_1 = __importDefault(require("../controllers/article-controller"));
const router = (0, express_1.Router)();
const controller = new article_controller_1.default();
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
exports.default = router;
//# sourceMappingURL=article-routes.js.map