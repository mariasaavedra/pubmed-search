import { Article } from "../types";
/**
 * Service for interacting with the PubMed API
 * Uses the strongly-typed E-utilities service for API calls
 */
declare class PubmedService {
    private eutils;
    private contactEmail;
    constructor();
    /**
     * Search for articles using a PubMed query
     * @param query PubMed search query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Search results with PMIDs
     */
    searchArticles(query: string, page?: number, limit?: number): Promise<string[]>;
    /**
     * Extract article metadata from a PubMed XML document
     * @param xmlDoc The XML Document containing article data
     * @returns Extracted Article object
     */
    private extractArticleFromXML;
    /**
     * Fetch article details by PMID
     * @param pmids Array of PubMed IDs
     * @returns Array of article details
     */
    fetchArticleDetails(pmids: string[]): Promise<Article[]>;
    /**
     * Get the count of articles matching a query
     * @param query PubMed search query
     * @returns Count of matching articles
     */
    getArticleCount(query: string): Promise<number>;
    /**
     * Get spelling suggestions for search terms
     * @param query The search query to check
     * @returns Corrected query if available, original query otherwise
     */
    getSpellingSuggestions(query: string): Promise<string>;
    /**
     * Find related articles for a given PMID
     * @param pmid PubMed ID to find related articles for
     * @param limit Maximum number of related articles to return
     * @returns Array of related PMIDs
     */
    findRelatedArticles(pmid: string, limit?: number): Promise<string[]>;
}
export default PubmedService;
