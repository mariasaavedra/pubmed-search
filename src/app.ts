import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import articleRoutes from "./routes/article-routes";
import { PUBMED_CONFIG } from "./config/pubmed-config";
import { Logger } from "./utils/logger";
import { requestLogger } from "./middlewares/request-logger";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0'

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Request logging middleware
app.use(requestLogger);

// Routes
app.use("/api", articleRoutes);

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
    },
    config: {
      rate_limit: {
        requests_per_second: 1000 / PUBMED_CONFIG.rate_limit.min_time,
        max_concurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
      },
      page_size: PUBMED_CONFIG.page_size,
      page_limit: PUBMED_CONFIG.page_limit,
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
  Logger.debug("Config", "Environment configuration loaded", {
    env: process.env.NODE_ENV || "development",
    rate_limits: {
      requests_per_second: 1000 / PUBMED_CONFIG.rate_limit.min_time,
      max_concurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
    },
  });
});

export default app;
