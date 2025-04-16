import { Document as XMLDocument } from '@xmldom/xmldom';
import dotenv from "dotenv";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import { Article, PubmedSearchResponse } from "../types";
import { Logger } from "../utils/logger";
import EUtilitiesService from './e-utilities.service';

// Load environment variables
dotenv.config();

/**
 * Service for interacting with the PubMed API
 * Uses the strongly-typed E-utilities service for API calls
 */
class PubmedService {
  private eutils: EUtilitiesService;
  private contactEmail: string;

  constructor() {
    // Using a default contact email, can be overridden in .env
    this.contactEmail = process.env.CONTACT_EMAIL || 'pubmed-search@example.com';
    this.eutils = new EUtilitiesService(this.contactEmail);

    Logger.debug("PubmedService", "Initialized E-utilities service");
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
        Logger.warn("PubmedService", "No results found in search response");
        return [];
      }

      const ids = searchResults.esearchresult.idlist;
      Logger.debug("PubmedService", `Found ${ids.length} article IDs`);

      return ids;
    } catch (error) {
      Logger.error("PubmedService", "Error searching PubMed", error);
      throw new Error("Failed to search articles on PubMed");
    }
  }

  /**
   * Extract article metadata from a PubMed XML document
   * @param xmlDoc The XML Document containing article data
   * @returns Extracted Article object
   */
  private extractArticleFromXML(xmlDoc: XMLDocument): Article[] {
    try {
      const articles: Article[] = [];
      const articleNodes = xmlDoc.getElementsByTagName('PubmedArticle');
      
      Logger.debug("PubmedService", `Extracting data from ${articleNodes.length} article nodes`);
      
      for (let i = 0; i < articleNodes.length; i++) {
        const articleNode = articleNodes.item(i);
        if (!articleNode) continue;
        
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
        const authorNames: string[] = [];
        const authorListNode = articleNode.getElementsByTagName('AuthorList').item(0);
        if (authorListNode) {
          const authorNodes = authorListNode.getElementsByTagName('Author');
          for (let j = 0; j < authorNodes.length; j++) {
            const authorNode = authorNodes.item(j);
            if (!authorNode) continue;
            
            const lastName = authorNode.getElementsByTagName('LastName').item(0)?.textContent || '';
            const foreName = authorNode.getElementsByTagName('ForeName').item(0)?.textContent || '';
            const initials = authorNode.getElementsByTagName('Initials').item(0)?.textContent || '';
            
            if (lastName && (foreName || initials)) {
              authorNames.push(`${lastName} ${foreName || initials}`);
            } else if (lastName) {
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
    } catch (error) {
      Logger.error("PubmedService", "Error extracting article data from XML", error);
      throw new Error("Failed to extract article data from PubMed XML");
    }
  }

  /**
   * Fetch article details by PMID
   * @param pmids Array of PubMed IDs
   * @returns Array of article details
   */
  public async fetchArticleDetails(pmids: string[]): Promise<Article[]> {
    if (pmids.length === 0) {
      Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
      return [];
    }

    Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles`
    );

    try {
      // Use EFetch to get articles in XML format
      const xmlDoc = await this.eutils.efetchXML({
        id: pmids.join(","),
        retmode: "xml"
      });
      
      // Extract article data from XML
      const articles = this.extractArticleFromXML(xmlDoc);
      
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

    try {
      // Use ESearch to get the count
      const searchResults = await this.eutils.esearch({
        term: query,
        retmode: "json",
        retmax: 0
      });

      if (searchResults.esearchresult && searchResults.esearchresult.count) {
        const count = parseInt(searchResults.esearchresult.count, 10);
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
  
  /**
   * Get spelling suggestions for search terms
   * @param query The search query to check
   * @returns Corrected query if available, original query otherwise
   */
  public async getSpellingSuggestions(query: string): Promise<string> {
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
    } catch (error) {
      Logger.warn("PubmedService", "Error getting spelling suggestions", error);
      return query; // Return original query on error
    }
  }
  
  /**
   * Find related articles for a given PMID
   * @param pmid PubMed ID to find related articles for
   * @param limit Maximum number of related articles to return
   * @returns Array of related PMIDs
   */
  public async findRelatedArticles(pmid: string, limit: number = 5): Promise<string[]> {
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
          if (linksetdb.linkname === 'pubmed_pubmed') {
            return linksetdb.links.slice(0, limit);
          }
        }
      }
      
      return [];
    } catch (error) {
      Logger.error("PubmedService", "Error finding related articles", error);
      return [];
    }
  }
}

export default PubmedService;
