import { Document as XMLDocument, Element as XMLElement } from '@xmldom/xmldom';
import dotenv from "dotenv";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import { Article, MeshQualifier, PubmedSearchResponse } from "../types";
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
        
        // Extract all abstract sections
        const abstractNodes = articleNode.getElementsByTagName('AbstractText');
        let abstractParts: string[] = [];
        
        // Collect all abstract sections
        for (let j = 0; j < abstractNodes.length; j++) {
          const node = abstractNodes.item(j);
          if (node) {
            const label = node.getAttribute('Label') || node.getAttribute('NlmCategory');
            const sectionText = node.textContent || '';
            
            if (label) {
              abstractParts.push(`${label}: ${sectionText}`);
            } else {
              abstractParts.push(sectionText);
            }
          }
        }
        
        const abstract = abstractParts.join(' ');
        
        // Extract MeSH Terms and Qualifiers
        const meshTerms: string[] = [];
        const meshQualifiers: MeshQualifier[] = [];
        const meshHeadingNodes = articleNode.getElementsByTagName('MeshHeading');
        
        for (let j = 0; j < meshHeadingNodes.length; j++) {
          const meshNode = meshHeadingNodes.item(j);
          if (!meshNode) continue;
          
          // Process mesh qualifiers (structured format)
          const meshQualifier = this.extractMeshQualifier(meshNode);
          if (meshQualifier.descriptor) {
            meshQualifiers.push(meshQualifier);
            meshTerms.push(meshQualifier.descriptor);
          }
        }
        
        // Extract publication types
        const publicationTypes: string[] = [];
        const pubTypeNodes = articleNode.getElementsByTagName('PublicationType');
        
        for (let j = 0; j < pubTypeNodes.length; j++) {
          const pubTypeNode = pubTypeNodes.item(j);
          if (pubTypeNode?.textContent) {
            publicationTypes.push(pubTypeNode.textContent);
          }
        }
        
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
          mesh_terms: meshTerms.length > 0 ? meshTerms : undefined,
          mesh_qualifiers: meshQualifiers.length > 0 ? meshQualifiers : undefined,
          publication_type: publicationTypes.length > 0 ? publicationTypes : undefined,
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
   * Process in batches to handle large requests more efficiently
   * @param pmids Array of PubMed IDs
   * @param batchSize Maximum number of articles to fetch in a single API call
   * @returns Array of article details
   */
  public async fetchArticleDetails(pmids: string[], batchSize: number = 20): Promise<Article[]> {
    if (pmids.length === 0) {
      Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
      return [];
    }

    Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles with batch size ${batchSize}`
    );

    try {
      // If the number of PMIDs is within the batch size, process directly
      if (pmids.length <= batchSize) {
        return this.fetchArticleBatch(pmids);
      }
      
      // Otherwise, process in batches
      Logger.debug("PubmedService", `Splitting request into ${Math.ceil(pmids.length / batchSize)} batches`);
      
      const allArticles: Article[] = [];
      
      // Process batches sequentially to avoid overwhelming the API
      for (let i = 0; i < pmids.length; i += batchSize) {
        const batchPmids = pmids.slice(i, i + batchSize);
        Logger.debug("PubmedService", `Processing batch ${Math.floor(i / batchSize) + 1} with ${batchPmids.length} PMIDs`);
        
        const batchArticles = await this.fetchArticleBatch(batchPmids);
        allArticles.push(...batchArticles);
        
        // Add a small delay between batches to avoid rate limiting
        if (i + batchSize < pmids.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      Logger.debug(
        "PubmedService",
        `Successfully extracted ${allArticles.length} article details across all batches`
      );
      
      return allArticles;
    } catch (error) {
      Logger.error("PubmedService", "Error fetching article details", error);
      throw new Error("Failed to fetch article details from PubMed");
    }
  }
  
  /**
   * Fetch a single batch of article details
   * @param pmids Array of PubMed IDs for a single batch
   * @returns Array of article details for the batch
   * @private
   */
  private async fetchArticleBatch(pmids: string[]): Promise<Article[]> {
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
        `Successfully extracted ${articles.length} article details for batch`
      );

      return articles;
    } catch (error) {
      Logger.error("PubmedService", "Error fetching batch article details", error);
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
   * Extract MeSH qualifiers from a MeSH heading node
   * @param meshNode The XML node containing MeSH heading data
   * @returns MeshQualifier object with descriptor, qualifiers, and major topic flag
   */
  private extractMeshQualifier(meshNode: XMLElement): MeshQualifier {
    const descriptorNode = meshNode.getElementsByTagName('DescriptorName').item(0);
    const descriptor = descriptorNode?.textContent || '';
    const majorTopic = descriptorNode?.getAttribute('MajorTopicYN') === 'Y';
    
    const qualifiers: string[] = [];
    const qualifierNodes = meshNode.getElementsByTagName('QualifierName');
    
    for (let i = 0; i < qualifierNodes.length; i++) {
      const qualifierNode = qualifierNodes.item(i);
      if (qualifierNode?.textContent) {
        qualifiers.push(qualifierNode.textContent);
      }
    }
    
    return {
      descriptor,
      qualifiers,
      major_topic: majorTopic
    };
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
          if (linksetdb.linkname === 'pubmed_pubmed' && linksetdb.links) {
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
