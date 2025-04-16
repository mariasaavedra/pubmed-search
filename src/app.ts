import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import articleRoutes from "./routes/article-routes";
import ArticleController from "./controllers/article-controller";
import { PUBMED_CONFIG } from "./config/pubmed-config";
import { Logger } from "./utils/logger";
import { requestLogger } from "./middlewares/request-logger";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0'

// Basic middleware
app.use(cors());

// Serve static files from public directory
app.use(express.static('public'));

// Body parsing middleware - MUST BE BEFORE ROUTES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(requestLogger);

// Debug middleware to inspect requests
app.use((req, res, next) => {
  console.log(`[DEBUG] Received ${req.method} ${req.url}`);
  console.log('[DEBUG] Request Body:', req.body);
  next();
});

// Mount routes
app.use(articleRoutes);

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
    description:
      "A service for retrieving high-quality medical literature from PubMed based on clinical blueprints",
    endpoints: {
      articles: "POST /api/articles",
      specialties: "GET /api/specialties",
      topics: "GET /api/specialties/{specialty}/topics",
      "articles/specialty": "POST /api/articles/specialty",
    },
    config: {
      rate_limit: {
        with_api_key: {
          requests_per_second: PUBMED_CONFIG.rate_limit.with_api_key.requests_per_second,
          max_concurrent: PUBMED_CONFIG.rate_limit.with_api_key.max_concurrent,
        },
        without_api_key: {
          requests_per_second: PUBMED_CONFIG.rate_limit.without_api_key.requests_per_second,
          max_concurrent: PUBMED_CONFIG.rate_limit.without_api_key.max_concurrent,
        },
        current: process.env.PUBMED_API_KEY 
          ? {
              requests_per_second: PUBMED_CONFIG.rate_limit.with_api_key.requests_per_second,
              max_concurrent: PUBMED_CONFIG.rate_limit.with_api_key.max_concurrent,
            } 
          : {
              requests_per_second: PUBMED_CONFIG.rate_limit.without_api_key.requests_per_second,
              max_concurrent: PUBMED_CONFIG.rate_limit.without_api_key.max_concurrent,
            }
      },
      page_size: PUBMED_CONFIG.page_size,
      page_limit: PUBMED_CONFIG.page_limit,
      api_key_present: !!process.env.PUBMED_API_KEY,
    },
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error("Server", `Unhandled error: ${err.message}`, err);

    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    });
  }
);

// Start the server
app.listen(port as number, "0.0.0.0", () => {
  Logger.success(
    "Server",
    `PubMed Clinical Article Retriever API running on port ${port}`
  );
  Logger.info("Server", `Health check: http://${host}:${port}/health`);
  Logger.info("Server", `API documentation: http://${host}:${port}/`);

  // Log environment details
  const hasApiKey = !!process.env.PUBMED_API_KEY;
  Logger.debug("Config", "Environment configuration loaded", {
    env: process.env.NODE_ENV || "development",
    rate_limits: hasApiKey 
      ? {
          requests_per_second: PUBMED_CONFIG.rate_limit.with_api_key.requests_per_second,
          max_concurrent: PUBMED_CONFIG.rate_limit.with_api_key.max_concurrent,
          interval_ms: PUBMED_CONFIG.rate_limit.min_time_with_key
        }
      : {
          requests_per_second: PUBMED_CONFIG.rate_limit.without_api_key.requests_per_second,
          max_concurrent: PUBMED_CONFIG.rate_limit.without_api_key.max_concurrent,
          interval_ms: PUBMED_CONFIG.rate_limit.min_time_without_key
        },
    api_key_configured: hasApiKey
  });
});

export default app;
