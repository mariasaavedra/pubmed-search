"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const pubmed_config_1 = require("../config/pubmed-config");
const logger_1 = require("../utils/logger");
const e_utilities_service_1 = __importDefault(require("./e-utilities.service"));
// Load environment variables
dotenv_1.default.config();
/**
 * Service for interacting with the PubMed API
 * Uses the strongly-typed E-utilities service for API calls
 */
class PubmedService {
    constructor() {
        // Using a default contact email, can be overridden in .env
        this.contactEmail = process.env.CONTACT_EMAIL || 'pubmed-search@example.com';
        this.eutils = new e_utilities_service_1.default(this.contactEmail);
        logger_1.Logger.debug("PubmedService", "Initialized E-utilities service");
    }
    /**
     * Search for articles using a PubMed query
     * @param query PubMed search query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Search results with PMIDs
     */
    async searchArticles(query, page = 1, limit = pubmed_config_1.PUBMED_CONFIG.page_size) {
        logger_1.Logger.debug("PubmedService", `Searching articles with query, page=${page}, limit=${limit}`);
        try {
            // Calculate pagination parameters
            const retmax = Math.min(Math.max(1, limit), 100); // Between 1-100
            const retstart = (Math.max(1, page) - 1) * retmax;
            // Use ESearch to find articles
            const searchResults = await this.eutils.esearch({
                term: query,
                retmode: "json",
                retmax,
                retstart
            });
            // Check if we have valid results
            if (!searchResults.esearchresult || !searchResults.esearchresult.idlist) {
                logger_1.Logger.warn("PubmedService", "No results found in search response");
                return [];
            }
            const ids = searchResults.esearchresult.idlist;
            logger_1.Logger.debug("PubmedService", `Found ${ids.length} article IDs`);
            return ids;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error searching PubMed", error);
            throw new Error("Failed to search articles on PubMed");
        }
    }
    /**
     * Extract article metadata from a PubMed XML document
     * @param xmlDoc The XML Document containing article data
     * @returns Extracted Article object
     */
    extractArticleFromXML(xmlDoc) {
        try {
            const articles = [];
            const articleNodes = xmlDoc.getElementsByTagName('PubmedArticle');
            logger_1.Logger.debug("PubmedService", `Extracting data from ${articleNodes.length} article nodes`);
            for (let i = 0; i < articleNodes.length; i++) {
                const articleNode = articleNodes.item(i);
                if (!articleNode)
                    continue;
                // Extract PMID
                const pmidNode = articleNode.getElementsByTagName('PMID').item(0);
                const pmid = pmidNode?.textContent || '';
                // Extract article title
                const titleNode = articleNode.getElementsByTagName('ArticleTitle').item(0);
                const title = titleNode?.textContent || '';
                // Extract journal info
                const journalNode = articleNode.getElementsByTagName('Journal').item(0);
                const journalTitleNode = journalNode?.getElementsByTagName('Title').item(0);
                const journal = journalTitleNode?.textContent || '';
                // Extract publication date
                const pubDateNode = articleNode.getElementsByTagName('PubDate').item(0);
                let pubDate = '';
                if (pubDateNode) {
                    const year = pubDateNode.getElementsByTagName('Year').item(0)?.textContent || '';
                    const month = pubDateNode.getElementsByTagName('Month').item(0)?.textContent || '';
                    const day = pubDateNode.getElementsByTagName('Day').item(0)?.textContent || '';
                    pubDate = [year, month, day].filter(Boolean).join('-');
                }
                // Extract authors
                const authorNames = [];
                const authorListNode = articleNode.getElementsByTagName('AuthorList').item(0);
                if (authorListNode) {
                    const authorNodes = authorListNode.getElementsByTagName('Author');
                    for (let j = 0; j < authorNodes.length; j++) {
                        const authorNode = authorNodes.item(j);
                        if (!authorNode)
                            continue;
                        const lastName = authorNode.getElementsByTagName('LastName').item(0)?.textContent || '';
                        const foreName = authorNode.getElementsByTagName('ForeName').item(0)?.textContent || '';
                        const initials = authorNode.getElementsByTagName('Initials').item(0)?.textContent || '';
                        if (lastName && (foreName || initials)) {
                            authorNames.push(`${lastName} ${foreName || initials}`);
                        }
                        else if (lastName) {
                            authorNames.push(lastName);
                        }
                    }
                }
                // Extract abstract
                const abstractNode = articleNode.getElementsByTagName('AbstractText').item(0);
                const abstract = abstractNode?.textContent || '';
                // Build article URL
                const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
                // Create article object
                articles.push({
                    pmid,
                    title,
                    authors: authorNames,
                    journal,
                    pub_date: pubDate,
                    abstract,
                    url,
                    scores: {
                        relevance: 0, // To be calculated later
                        journal_impact: 0, // To be calculated later
                    }
                });
            }
            return articles;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error extracting article data from XML", error);
            throw new Error("Failed to extract article data from PubMed XML");
        }
    }
    /**
     * Fetch article details by PMID
     * @param pmids Array of PubMed IDs
     * @returns Array of article details
     */
    async fetchArticleDetails(pmids) {
        if (pmids.length === 0) {
            logger_1.Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
            return [];
        }
        logger_1.Logger.debug("PubmedService", `Fetching details for ${pmids.length} articles`);
        try {
            // Use EFetch to get articles in XML format
            const xmlDoc = await this.eutils.efetchXML({
                id: pmids.join(","),
                retmode: "xml"
            });
            // Extract article data from XML
            const articles = this.extractArticleFromXML(xmlDoc);
            logger_1.Logger.debug("PubmedService", `Successfully extracted ${articles.length} article details`);
            return articles;
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error fetching article details", error);
            throw new Error("Failed to fetch article details from PubMed");
        }
    }
    /**
     * Get the count of articles matching a query
     * @param query PubMed search query
     * @returns Count of matching articles
     */
    async getArticleCount(query) {
        logger_1.Logger.debug("PubmedService", "Getting article count for query");
        try {
            // Use ESearch to get the count
            const searchResults = await this.eutils.esearch({
                term: query,
                retmode: "json",
                retmax: 0
            });
            if (searchResults.esearchresult && searchResults.esearchresult.count) {
                const count = parseInt(searchResults.esearchresult.count, 10);
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
    /**
     * Get spelling suggestions for search terms
     * @param query The search query to check
     * @returns Corrected query if available, original query otherwise
     */
    async getSpellingSuggestions(query) {
        try {
            const spellResults = await this.eutils.espell({
                term: query
            });
            if (spellResults.eSpellResult &&
                spellResults.eSpellResult.CorrectedQuery &&
                spellResults.eSpellResult.CorrectedQuery !== query) {
                return spellResults.eSpellResult.CorrectedQuery;
            }
            return query;
        }
        catch (error) {
            logger_1.Logger.warn("PubmedService", "Error getting spelling suggestions", error);
            return query; // Return original query on error
        }
    }
    /**
     * Find related articles for a given PMID
     * @param pmid PubMed ID to find related articles for
     * @param limit Maximum number of related articles to return
     * @returns Array of related PMIDs
     */
    async findRelatedArticles(pmid, limit = 5) {
        try {
            const linkResults = await this.eutils.elink({
                dbfrom: 'pubmed',
                id: pmid,
                cmd: 'neighbor'
            });
            if (linkResults.linksets &&
                linkResults.linksets[0] &&
                linkResults.linksets[0].linksetdbs) {
                for (const linksetdb of linkResults.linksets[0].linksetdbs) {
                    if (linksetdb.linkname === 'pubmed_pubmed' && linksetdb.links) {
                        return linksetdb.links.slice(0, limit);
                    }
                }
            }
            return [];
        }
        catch (error) {
            logger_1.Logger.error("PubmedService", "Error finding related articles", error);
            return [];
        }
    }
}
exports.default = PubmedService;
//# sourceMappingURL=pubmed-service.js.map