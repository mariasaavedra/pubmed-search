import axios, { AxiosResponse } from "axios";
import { parseStringPromise } from "xml2js";
import dotenv from "dotenv";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import RateLimiter from "../utils/rate-limiter";
import ArticleContentService from "./article-content-service";
import {
  PubmedSearchResponse,
  PubmedSummaryResponse,
  PubmedFetchResponse,
  ParsedArticleData,
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
  public async SearchArticles(
    query: string,
    page: number = 1,
    limit: number = PUBMED_CONFIG.page_size
  ): Promise<string[]> {
    Logger.debug(
      "PubmedService",
      `Searching articles with query, page=${page}, limit=${limit}`
    );

    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
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
  public async FetchArticleDetails(
    pmids: string[]
  ): Promise<ParsedArticleData[]> {
    if (pmids.length === 0) {
      Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
      return [];
    }

    Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles`
    );

    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
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

      Logger.debug(
        "PubmedService",
        `API request for article details completed in ${duration}ms`
      );

      // Store original XML
      const original_xml = response.data;
      // Parse XML response
      const xml_data = await this.ParseXml(original_xml);

      // Extract article data
      const articles = await this.ExtractArticleData(xml_data, original_xml);
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
   * Parse XML response from PubMed
   * @param xml XML string
   * @returns Parsed XML object
   */
  private async ParseXml(xml: string): Promise<PubmedFetchResponse> {
    Logger.debug("PubmedService", "Parsing XML response");
    const start_time = Date.now();

    try {
      // Use enhanced XML parsing options to preserve structure and attributes
      const result = await parseStringPromise(xml, {
        explicitArray: true,     // Ensure all elements are arrays for consistency
        mergeAttrs: false,       // Keep attributes separate
        explicitRoot: true,      // Keep the root element
        normalizeTags: false,    // Don't normalize tag names
        attrkey: '@',            // Prefix attributes with @
        charkey: '_',            // Use _ for element content
        trim: true               // Trim whitespace
      });

      const duration = Date.now() - start_time;
      Logger.debug("PubmedService", `XML parsing completed in ${duration}ms`);

      return result;
    } catch (error) {
      Logger.error("PubmedService", "Error parsing XML", error);
      throw new Error("Failed to parse PubMed response");
    }
  }

  /**
   * Extract article data from PubMed response
   * @param data PubMed response data
   * @param original_xml Original XML response for preservation
   * @returns Array of parsed article data
   */
  private async ExtractArticleData(
    data: PubmedFetchResponse,
    original_xml: string
  ): Promise<ParsedArticleData[]> {
    try {
      if (!data.PubmedArticleSet || !data.PubmedArticleSet.PubmedArticle || !data.PubmedArticleSet.PubmedArticle.length) {
        Logger.warn("PubmedService", "No articles found in PubMed response");
        return [];
      }
      
      Logger.debug("PubmedService", `${data.PubmedArticleSet.PubmedArticle.length} articles found in XML data`);
      const articles = data.PubmedArticleSet.PubmedArticle;
      
      return Promise.all(articles.map(async (pubmedArticle: any) => {
        try {
          // Extract basic citation data
          const citation = pubmedArticle.MedlineCitation?.[0] || {};
          const pmid = this.extractTextFromElement(citation.PMID);
          
          Logger.debug("PubmedService", `Processing article with PMID ${pmid}`);
          
          // Extract article data - handle safely with optional chaining
          const articleData = citation.Article?.[0] || {};
          
          // Extract title
          const title = this.extractTextFromElement(articleData.ArticleTitle);
          
          // Extract journal info
          const journalData = articleData.Journal?.[0] || {};
          const journal = this.extractTextFromElement(journalData.Title);
          
          // Extract publication date
          let pubDate = "";
          const journalIssue = journalData.JournalIssue?.[0] || {};
          const pubDateData = journalIssue.PubDate?.[0] || {};
          
          const year = this.extractTextFromElement(pubDateData.Year);
          const month = this.extractTextFromElement(pubDateData.Month);
          const day = this.extractTextFromElement(pubDateData.Day);
          const medlineDate = this.extractTextFromElement(pubDateData.MedlineDate);
          
          if (year) {
            pubDate = month && day 
              ? `${year}-${month}-${day}` 
              : month 
                ? `${year}-${month}` 
                : year;
          } else if (medlineDate) {
            pubDate = medlineDate;
          }
          
          // Extract abstract and section-specific content
          const abstractData = articleData.Abstract?.[0] || {};
          const abstractTextElements = abstractData.AbstractText || [];
          
          let fullAbstract = "";
          let methodsText = "";
          let resultsText = "";
          let discussionText = "";
          let conclusionText = "";
          
          // Process abstract sections
          if (abstractTextElements.length > 0) {
            // Multiple abstract sections with labels
            abstractTextElements.forEach((section: any) => {
              const sectionText = this.extractTextFromElement(section);
              
              if (!sectionText) return;
              
              // Add to full abstract
              fullAbstract += sectionText + " ";
              
              // Check for section labels
              const nlmCategory = section['@'] ? 
                (section['@'].NlmCategory || section['@'].Label || "").toLowerCase() : "";
              
              if (nlmCategory.includes("methods") || nlmCategory.includes("materials")) {
                methodsText = sectionText;
              } else if (nlmCategory.includes("results") || nlmCategory.includes("findings")) {
                resultsText = sectionText;
              } else if (nlmCategory.includes("discussion") || nlmCategory.includes("interpretation")) {
                discussionText = sectionText;
              } else if (nlmCategory.includes("conclusion") || nlmCategory.includes("summary")) {
                conclusionText = sectionText;
              }
            });
          } else if (typeof abstractData.AbstractText === 'string') {
            // Simple string abstract
            fullAbstract = abstractData.AbstractText;
          }
          
          // Extract author list
          const authors: string[] = [];
          const authorListData = articleData.AuthorList?.[0] || {};
          const authorElements = authorListData.Author || [];
          
          authorElements.forEach((author: any) => {
            const lastName = this.extractTextFromElement(author.LastName);
            const initials = this.extractTextFromElement(author.Initials);
            const collectiveName = this.extractTextFromElement(author.CollectiveName);
            
            if (lastName && initials) {
              authors.push(`${lastName} ${initials}`);
            } else if (lastName) {
              authors.push(lastName);
            } else if (collectiveName) {
              authors.push(collectiveName);
            }
          });
          
          // Extract MeSH terms
          const meshTerms: string[] = [];
          const meshHeadingList = citation.MeshHeadingList?.[0] || {};
          const meshHeadings = meshHeadingList.MeshHeading || [];
          
          meshHeadings.forEach((mesh: any) => {
            // Extract descriptor name
            const descriptorElement = mesh.DescriptorName?.[0];
            if (descriptorElement) {
              const term = this.extractTextFromElement(descriptorElement);
              if (term) {
                meshTerms.push(term);
              }
            }
            
            // Extract qualifier names
            const qualifierElements = mesh.QualifierName || [];
            qualifierElements.forEach((qualifier: any) => {
              const term = this.extractTextFromElement(qualifier);
              if (term) {
                meshTerms.push(term);
              }
            });
          });
          
          Logger.debug("PubmedService", `Extracted ${meshTerms.length} MeSH terms for PMID ${pmid}`);
          
          // Initial article data from XML
          const baseArticle = {
            pmid,
            title,
            abstract: fullAbstract.trim(),
            authors,
            journal,
            pub_date: pubDate,
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            methods: methodsText,
            results: resultsText,
            discussion: discussionText,
            conclusion: conclusionText,
            figures: [],
            tables: [],
            supplementary_material: [],
            original_xml: original_xml,
            mesh_terms: meshTerms,
          };
          
          try {
            // Try to enhance with web scraping content
            Logger.debug("PubmedService", `Attempting to enhance content for PMID ${pmid} with web scraping`);
            const content = await this.content_service.extractContentFromPubMed(pmid, original_xml);
            
            // Merge with preference for scraped content
            const details: ParsedArticleData = {
              ...baseArticle,
              full_text: content.full_text || fullAbstract.trim(),
              methods: content.methods || baseArticle.methods,
              results: content.results || baseArticle.results,
              discussion: content.discussion || baseArticle.discussion,
              conclusion: content.conclusion || baseArticle.conclusion,
              figures: content.figures,
              tables: content.tables,
              supplementary_material: content.supplementary_material,
              sanitized_html: content.sanitized_html
            };
            
            Logger.debug("PubmedService", `Successfully enhanced content for PMID ${pmid}`);
            return details;
          } catch (error) {
            // Web scraping failed - use basic XML data
            Logger.warn(
              "PubmedService", 
              `Web scraping failed for PMID ${pmid}, using XML extraction only`,
              error
            );
            
            return {
              ...baseArticle,
              full_text: fullAbstract.trim() || "No content available"
            };
          }
        } catch (articleError) {
          // Handle errors for individual articles
          const pmid = pubmedArticle.MedlineCitation?.[0]?.PMID?.[0]?._ || "Unknown";
          Logger.error("PubmedService", `Error processing article with PMID ${pmid}`, articleError);
          
          // Return minimal article data to prevent complete failure
          return {
            pmid,
            title: pubmedArticle.MedlineCitation?.[0]?.Article?.[0]?.ArticleTitle?.[0]?._ || "Untitled Article",
            abstract: "Error processing article content",
            authors: [],
            journal: "",
            pub_date: "",
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            full_text: "Error processing article content",
            mesh_terms: [],
            figures: [],
            tables: [],
            supplementary_material: []
          };
        }
      }));
    } catch (error) {
      Logger.error("PubmedService", "Critical error extracting article data", error);
      throw new Error("Failed to extract article data from PubMed response");
    }
  }
  
  /**
   * Helper method to safely extract text from XML elements
   * @param element XML element that might be string, object with _ property, or array of such objects
   * @returns Extracted text or empty string
   */
  private extractTextFromElement(element: any): string {
    if (!element) {
      return '';
    }
    
    // Handle array
    if (Array.isArray(element)) {
      if (element.length === 0) return '';
      element = element[0];
    }
    
    // Handle object with text content
    if (typeof element === 'object') {
      return element._ || '';
    }
    
    // Handle string
    if (typeof element === 'string') {
      return element;
    }
    
    return '';
  }

  /**
   * Get the count of articles matching a query
   * @param query PubMed search query
   * @returns Count of matching articles
   */
  public async GetArticleCount(query: string): Promise<number> {
    Logger.debug("PubmedService", "Getting article count for query");

    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
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
