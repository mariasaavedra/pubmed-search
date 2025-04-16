import { ParsedArticleData } from "../types";
/**
 * Service for interacting with the PubMed API
 */
declare class PubmedService {
    private base_url;
    private api_key;
    private rate_limiter;
    private content_service;
    constructor();
    /**
     * Search for articles using a PubMed query
     * @param query PubMed search query
     * @param page Page number (1-based)
     * @param limit Results per page
     * @returns Search results with PMIDs
     */
    SearchArticles(query: string, page?: number, limit?: number): Promise<string[]>;
    /**
     * Fetch article details by PMID
     * @param pmids Array of PubMed IDs
     * @returns Array of article details
     */
    FetchArticleDetails(pmids: string[]): Promise<ParsedArticleData[]>;
    /**
     * Parse XML response from PubMed
     * @param xml XML string
     * @returns Parsed XML object
     */
    private ParseXml;
    /**
     * Extract article data from PubMed response
     * @param data PubMed response data
     * @returns Array of parsed article data
     */
    private ExtractArticleData;
    /**
     * Get the count of articles matching a query
     * @param query PubMed search query
     * @returns Count of matching articles
     */
    GetArticleCount(query: string): Promise<number>;
}
export default PubmedService;
