"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const article_routes_1 = __importDefault(require("./routes/article-routes"));
const pubmed_config_1 = require("./config/pubmed-config");
const logger_1 = require("./utils/logger");
const request_logger_1 = require("./middlewares/request-logger");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Request logging middleware
app.use(request_logger_1.requestLogger);
// Routes
app.use("/api", article_routes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
// Root endpoint with API information
app.get("/", (req, res) => {
    res.json({
        name: "PubMed Clinical Article Retriever API",
        version: "0.1.0",
        description: "A service for retrieving high-quality medical literature from PubMed based on clinical blueprints",
        endpoints: {
            articles: "POST /api/articles",
            specialties: "GET /api/specialties",
            topics: "GET /api/specialties/{specialty}/topics",
        },
        config: {
            rate_limit: {
                requests_per_second: 1000 / pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
                max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
            },
            page_size: pubmed_config_1.PUBMED_CONFIG.page_size,
            page_limit: pubmed_config_1.PUBMED_CONFIG.page_limit,
        },
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.Logger.error("Server", `Unhandled error: ${err.message}`, err);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message,
    });
});
// Start the server
app.listen(port, "0.0.0.0", () => {
    logger_1.Logger.success("Server", `PubMed Clinical Article Retriever API running on port ${port}`);
    logger_1.Logger.info("Server", `Health check: http://${host}:${port}/health`);
    logger_1.Logger.info("Server", `API documentation: http://${host}:${port}/`);
    // Log environment details
    logger_1.Logger.debug("Config", "Environment configuration loaded", {
        env: process.env.NODE_ENV || "development",
        rate_limits: {
            requests_per_second: 1000 / pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
            max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
        },
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map