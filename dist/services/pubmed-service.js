"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const dotenv_1 = __importDefault(require("dotenv"));
const pubmed_config_1 = require("../config/pubmed-config");
const rate_limiter_1 = __importDefault(require("../utils/rate-limiter"));
const article_content_service_1 = __importDefault(require("./article-content-service"));
const logger_1 = require("../utils/logger");
// Load environment variables
dotenv_1.default.config();
/**
 * Service for interacting with the PubMed API
 */
class PubmedService {
    constructor() {
        this.base_url = pubmed_config_1.PUBMED_CONFIG.base_url;
        this.api_key = process.env.PUBMED_API_KEY;
        // Initialize rate limiter based on config
        this.rate_limiter = new rate_limiter_1.default(pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent, pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time);
        // Initialize content service
        this.content_service = new article_content_service_1.default();
        logger_1.Logger.debug("PubmedService", "Initialized with configuration", {
            base_url: this.base_url,
            api_key_present: !!this.api_key,
            rate_limit: {
                max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
                min_time: pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
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
    async SearchArticles(query, page = 1, limit = pubmed_config_1.PUBMED_CONFIG.page_size) {
        logger_1.Logger.debug("PubmedService", `Searching articles with query, page=${page}, limit=${limit}`);
        // Wait for rate limiting slot
        await this.rate_limiter.WaitForSlot();
        logger_1.Logger.debug("PubmedService", "Rate limit slot acquired");
        try {
            // Construct search URL
            const search_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.esearch}`;
            const retmax = Math.min(Math.max(1, limit), 100); // Between 1-100
            const retstart = (Math.max(1, page) - 1) * retmax;
            logger_1.Logger.debug("PubmedService", `Making API request to ${search_url}`, {
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
            const response = await axios_1.default.get(search_url, {
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
            logger_1.Logger.debug("PubmedService", `API request completed in ${duration}ms`);
            // Parse the response
            const search_results = response.data;
            // Check if we have valid results
            if (!search_results.esearchresult ||
                !search_results.esearchresult.idlist) {
                logger_1.Logger.warn("PubmedService", "No results found in search response");
                return [];
            }
            const ids = search_results.esearchresult.idlist;
            logger_1.Logger.debug("PubmedService", `Found ${ids.length} article IDs`);
            return ids;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error searching PubMed", error);
            throw new Error("Failed to search articles on PubMed");
        }
    }
    /**
     * Fetch article details by PMID
     * @param pmids Array of PubMed IDs
     * @returns Array of article details
     */
    async FetchArticleDetails(pmids) {
        if (pmids.length === 0) {
            logger_1.Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
            return [];
        }
        logger_1.Logger.debug("PubmedService", `Fetching details for ${pmids.length} articles`);
        // Wait for rate limiting slot
        await this.rate_limiter.WaitForSlot();
        logger_1.Logger.debug("PubmedService", "Rate limit slot acquired for fetch details");
        try {
            // Construct fetch URL
            const fetch_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.efetch}`;
            logger_1.Logger.debug("PubmedService", `Making API request to ${fetch_url}`, {
                parameters: {
                    db: "pubmed",
                    id_count: pmids.length,
                    retmode: "xml",
                    api_key_present: !!this.api_key,
                },
            });
            // Make the API request
            const start_time = Date.now();
            const response = await axios_1.default.get(fetch_url, {
                params: {
                    db: "pubmed",
                    id: pmids.join(","),
                    retmode: "xml",
                    api_key: this.api_key,
                },
            });
            const duration = Date.now() - start_time;
            logger_1.Logger.debug("PubmedService", `API request for article details completed in ${duration}ms`);
            // Store original XML
            const original_xml = response.data;
            // Parse XML response
            const xml_data = await this.ParseXml(original_xml);
            // Extract article data
            const articles = await this.ExtractArticleData(xml_data, original_xml);
            logger_1.Logger.debug("PubmedService", `Successfully extracted ${articles.length} article details`);
            return articles;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error fetching article details", error);
            throw new Error("Failed to fetch article details from PubMed");
        }
    }
    /**
     * Parse XML response from PubMed
     * @param xml XML string
     * @returns Parsed XML object
     */
    async ParseXml(xml) {
        logger_1.Logger.debug("PubmedService", "Parsing XML response");
        const start_time = Date.now();
        try {
            const result = await (0, xml2js_1.parseStringPromise)(xml, {
                explicitArray: false,
                ignoreAttrs: true,
            });
            const duration = Date.now() - start_time;
            logger_1.Logger.debug("PubmedService", `XML parsing completed in ${duration}ms`);
            return result;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error parsing XML", error);
            throw new Error("Failed to parse PubMed response");
        }
    }
    /**
     * Extract article data from PubMed response
     * @param data PubMed response data
     * @returns Array of parsed article data
     */
    async ExtractArticleData(data, original_xml) {
        if (!data.PubmedArticleSet || !data.PubmedArticleSet.PubmedArticle) {
            return [];
        }
        // Ensure articles is always an array
        const articles = Array.isArray(data.PubmedArticleSet.PubmedArticle)
            ? data.PubmedArticleSet.PubmedArticle
            : [data.PubmedArticleSet.PubmedArticle];
        return Promise.all(articles.map(async (article) => {
            const citation = article.MedlineCitation;
            const article_data = citation.Article;
            const pmid = citation.PMID;
            // Extract abstract
            let abstract = "";
            if (article_data.Abstract && article_data.Abstract.AbstractText) {
                if (typeof article_data.Abstract.AbstractText === "string") {
                    abstract = article_data.Abstract.AbstractText;
                }
                else if (Array.isArray(article_data.Abstract.AbstractText)) {
                    abstract = article_data.Abstract.AbstractText.map((section) => section._ || section).join(" ");
                }
                else if (typeof article_data.Abstract.AbstractText === "object") {
                    abstract = article_data.Abstract.AbstractText._ || "";
                }
            }
            // Extract authors
            let authors = [];
            if (article_data.AuthorList && article_data.AuthorList.Author) {
                const author_list = Array.isArray(article_data.AuthorList.Author)
                    ? article_data.AuthorList.Author
                    : [article_data.AuthorList.Author];
                authors = author_list
                    .map((author) => {
                    if (author.LastName && author.Initials) {
                        return `${author.LastName} ${author.Initials}`;
                    }
                    if (author.LastName) {
                        return author.LastName;
                    }
                    if (author.CollectiveName) {
                        return author.CollectiveName;
                    }
                    return "";
                })
                    .filter((a) => a);
            }
            // Extract publication date
            let pub_date = "";
            if (article_data.Journal &&
                article_data.Journal.JournalIssue &&
                article_data.Journal.JournalIssue.PubDate) {
                const date = article_data.Journal.JournalIssue.PubDate;
                if (date.Year) {
                    pub_date =
                        date.Month && date.Day
                            ? `${date.Year}-${date.Month}-${date.Day}`
                            : date.Month
                                ? `${date.Year}-${date.Month}`
                                : date.Year;
                }
                else if (date.MedlineDate) {
                    pub_date = date.MedlineDate;
                }
            }
            const baseArticle = {
                pmid,
                title: article_data.ArticleTitle || "",
                authors,
                journal: article_data.Journal?.Title || "",
                pub_date,
                abstract,
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            };
            try {
                // Extract full content with original XML
                const content = await this.content_service.extractContentFromPubMed(pmid, original_xml);
                const details = {
                    ...baseArticle,
                    full_text: content.full_text,
                    methods: content.methods,
                    results: content.results,
                    discussion: content.discussion,
                    conclusion: content.conclusion,
                    figures: content.figures,
                    tables: content.tables,
                    supplementary_material: content.supplementary_material,
                    original_xml: content.original_xml,
                    sanitized_html: content.sanitized_html,
                };
                logger_1.Logger.debug("PubmedService", `Successfully extracted content for PMID ${pmid}`, {
                    details,
                });
                return details;
            }
            catch (error) {
                logger_1.Logger.warn("PubmedService", `Failed to extract full content for PMID ${pmid}, returning basic metadata only`, error);
                return baseArticle;
            }
        }));
    }
    /**
     * Get the count of articles matching a query
     * @param query PubMed search query
     * @returns Count of matching articles
     */
    async GetArticleCount(query) {
        logger_1.Logger.debug("PubmedService", "Getting article count for query");
        // Wait for rate limiting slot
        await this.rate_limiter.WaitForSlot();
        logger_1.Logger.debug("PubmedService", "Rate limit slot acquired for article count");
        try {
            // Construct search URL
            const search_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.esearch}`;
            logger_1.Logger.debug("PubmedService", `Making count request to ${search_url}`);
            // Make the API request
            const start_time = Date.now();
            const response = await axios_1.default.get(search_url, {
                params: {
                    db: "pubmed",
                    term: query,
                    retmode: "json",
                    retmax: 0,
                    api_key: this.api_key,
                },
            });
            const duration = Date.now() - start_time;
            logger_1.Logger.debug("PubmedService", `Count request completed in ${duration}ms`);
            // Parse the response
            const search_results = response.data;
            if (search_results.esearchresult && search_results.esearchresult.count) {
                const count = parseInt(search_results.esearchresult.count, 10);
                logger_1.Logger.debug("PubmedService", `Found ${count} total matching articles`);
                return count;
            }
            logger_1.Logger.warn("PubmedService", "No count information in search response");
            return 0;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error getting article count", error);
            throw new Error("Failed to get article count from PubMed");
        }
    }
}
exports.default = PubmedService;
//# sourceMappingURL=pubmed-service.js.map