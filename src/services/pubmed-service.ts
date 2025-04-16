import axios, { AxiosResponse } from "axios";
import { parseStringPromise } from "xml2js";
import dotenv from "dotenv";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import RateLimiter from "../utils/rate-limiter";
import ArticleContentService from "./article-content-service";
import {
  Article,
  PubmedSearchResponse,
} from "../types";
import { Logger } from "../utils/logger";

// Load environment variables
dotenv.config();

/**
 * Service for interacting with the PubMed API
 */
class PubmedService {
  private base_url: string;
  private api_key: string | undefined;
  private rate_limiter: RateLimiter;
  private content_service: ArticleContentService;

  constructor() {
    this.base_url = PUBMED_CONFIG.base_url;
    this.api_key = process.env.PUBMED_API_KEY;

    // Initialize rate limiter based on config
    this.rate_limiter = new RateLimiter(
      PUBMED_CONFIG.rate_limit.max_concurrent,
      PUBMED_CONFIG.rate_limit.min_time
    );

    // Initialize content service
    this.content_service = new ArticleContentService();

    Logger.debug("PubmedService", "Initialized with configuration", {
      base_url: this.base_url,
      api_key_present: !!this.api_key,
      rate_limit: {
        max_concurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
        min_time: PUBMED_CONFIG.rate_limit.min_time,
      },
    });
  }

  /**
   * Search for articles using a PubMed query
   * @param query PubMed search query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Search results with PMIDs
   */
  public async searchArticles(
    query: string,
    page: number = 1,
    limit: number = PUBMED_CONFIG.page_size
  ): Promise<string[]> {
    Logger.debug(
      "PubmedService",
      `Searching articles with query, page=${page}, limit=${limit}`
    );

    // Wait for rate limiting slot
    await this.rate_limiter.waitForSlot();
    Logger.debug("PubmedService", "Rate limit slot acquired");

    try {
      // Construct search URL
      const search_url = `${this.base_url}${PUBMED_CONFIG.esearch}`;
      const retmax = Math.min(Math.max(1, limit), 100); // Between 1-100
      const retstart = (Math.max(1, page) - 1) * retmax;

      Logger.debug("PubmedService", `Making API request to ${search_url}`, {
        parameters: {
          db: "pubmed",
          term: query,
          retmode: "json",
          retmax,
          retstart,
          api_key_present: !!this.api_key,
        },
      });

      // Make the API request
      const start_time = Date.now();
      const response = await axios.get(search_url, {
        params: {
          db: "pubmed",
          term: query,
          retmode: "json",
          retmax: retmax,
          retstart: retstart,
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;

      Logger.debug("PubmedService", `API request completed in ${duration}ms`);

      // Parse the response
      const search_results: PubmedSearchResponse = response.data;

      // Check if we have valid results
      if (
        !search_results.esearchresult ||
        !search_results.esearchresult.idlist
      ) {
        Logger.warn("PubmedService", "No results found in search response");
        return [];
      }

      const ids = search_results.esearchresult.idlist;
      Logger.debug("PubmedService", `Found ${ids.length} article IDs`);

      return ids;
    } catch (error) {
      Logger.error("PubmedService", "Error searching PubMed", error);
      throw new Error("Failed to search articles on PubMed");
    }
  }

  /**
   * Fetch article details by PMID
   * @param pmids Array of PubMed IDs
   * @returns Array of article details
   */
  public async fetchArticleDetails(
    pmids: string[]
  ): Promise<Article[]> {
    if (pmids.length === 0) {
      Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
      return [];
    }

    Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles`
    );

    // Wait for rate limiting slot
    await this.rate_limiter.waitForSlot();
    Logger.debug("PubmedService", "Rate limit slot acquired for fetch details");

    try {
      // Construct fetch URL
      const fetch_url = `${this.base_url}${PUBMED_CONFIG.efetch}`;

      Logger.debug("PubmedService", `Making API request to ${fetch_url}`, {
        parameters: {
          db: "pubmed",
          id_count: pmids.length,
          retmode: "xml",
          api_key_present: !!this.api_key,
        },
      });

      // Make the API request
      const start_time = Date.now();
      const response = await axios.get(fetch_url, {
        params: {
          db: "pubmed",
          id: pmids.join(","),
          retmode: "xml",
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;
      const articles = response.data;
      Logger.debug(
        "PubmedService",
        `API request for article details completed in ${duration}ms`
      );

      Logger.debug(
        "PubmedService",
        `Successfully extracted ${articles.length} article details`
      );

      return articles;
    } catch (error) {
      Logger.error("PubmedService", "Error fetching article details", error);
      throw new Error("Failed to fetch article details from PubMed");
    }
  }

  /**
   * Get the count of articles matching a query
   * @param query PubMed search query
   * @returns Count of matching articles
   */
  public async getArticleCount(query: string): Promise<number> {
    Logger.debug("PubmedService", "Getting article count for query");

    // Wait for rate limiting slot
    await this.rate_limiter.waitForSlot();
    Logger.debug("PubmedService", "Rate limit slot acquired for article count");

    try {
      // Construct search URL
      const search_url = `${this.base_url}${PUBMED_CONFIG.esearch}`;

      Logger.debug("PubmedService", `Making count request to ${search_url}`);

      // Make the API request
      const start_time = Date.now();
      const response = await axios.get(search_url, {
        params: {
          db: "pubmed",
          term: query,
          retmode: "json",
          retmax: 0,
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;

      Logger.debug("PubmedService", `Count request completed in ${duration}ms`);

      // Parse the response
      const search_results: PubmedSearchResponse = response.data;

      if (search_results.esearchresult && search_results.esearchresult.count) {
        const count = parseInt(search_results.esearchresult.count, 10);
        Logger.debug("PubmedService", `Found ${count} total matching articles`);
        return count;
      }

      Logger.warn("PubmedService", "No count information in search response");
      return 0;
    } catch (error) {
      Logger.error("PubmedService", "Error getting article count", error);
      throw new Error("Failed to get article count from PubMed");
    }
  }
}

export default PubmedService;
