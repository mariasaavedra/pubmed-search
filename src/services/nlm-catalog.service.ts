import { Logger } from '../utils/logger';
import EUtilitiesService from './e-utilities.service';
import { Document as XMLDocument } from '@xmldom/xmldom';
import { Journal } from '../types/journal.types';

/**
 * Service for interacting with the NLM Catalog via E-utilities API
 * Provides methods to search and retrieve journal information
 */
class NLMCatalogService {
  private eutils: EUtilitiesService;
  
  constructor() {
    this.eutils = new EUtilitiesService(process.env.CONTACT_EMAIL || 'pubmed-search@example.com');
    Logger.debug("NLMCatalogService", "Initialized NLM Catalog service");
  }
  
  /**
   * Search for journals in the NLM Catalog
   * @param query Search query for journals
   * @param filters Additional filters like publication type
   * @returns Array of matching journal information
   */
  public async searchJournals(
    query: string,
    filters: Partial<{
      currentlyIndexed: boolean;
      medline: boolean;
      pubmedCentral: boolean;
    }> = { currentlyIndexed: true }
  ): Promise<Journal[]> {
    try {
      // Construct query with filters, using simpler format
      let fullQuery = query;
      
      // Only add [All Fields] if the query doesn't already have a field tag
      if (!query.includes('[')) {
        fullQuery = `${query}[All Fields]`;
      }
      
      // Add filters with simpler syntax
      const filterParts = [];
      
      if (filters.currentlyIndexed) {
        filterParts.push('currentlyindexed');
      }
      
      if (filters.medline) {
        filterParts.push('medline[subset]');
      }
      
      if (filters.pubmedCentral) {
        filterParts.push('pubmed pmc[subset]');
      }
      
      // Add journal type
      filterParts.push('journal[publication type]');
      
      // Combine all parts with AND
      if (filterParts.length > 0) {
        fullQuery = `(${fullQuery}) AND ${filterParts.join(' AND ')}`;
      }
      
      Logger.debug("NLMCatalogService", `Searching journals with query: ${fullQuery}`);
      
      // Search the NLM Catalog database
      const searchResults = await this.eutils.esearch({
        db: 'nlmcatalog',
        term: fullQuery,
        retmax: 1000,
        retmode: 'json'
      });
      
      if (!searchResults.esearchresult || !searchResults.esearchresult.idlist) {
        Logger.warn("NLMCatalogService", "No journals found");
        return [];
      }
      
      const nlmIds = searchResults.esearchresult.idlist;
      Logger.debug("NLMCatalogService", `Found ${nlmIds.length} journal IDs`);
      
      // Fetch complete journal records
      return this.fetchJournalDetails(nlmIds);
    } catch (error) {
      Logger.error("NLMCatalogService", "Error searching NLM Catalog", error);
      throw new Error("Failed to search NLM Catalog");
    }
  }
  
  /**
   * Fetch detailed journal information by NLM IDs
   * @param nlmIds Array of NLM Catalog IDs
   * @returns Array of journal details
   */
  public async fetchJournalDetails(nlmIds: string[]): Promise<Journal[]> {
    if (nlmIds.length === 0) {
      return [];
    }
    
    try {
      // Use EFetch to get records in XML format
      const xmlDoc = await this.eutils.efetchXML({
        db: 'nlmcatalog',
        id: nlmIds.join(","),
        retmode: 'xml'
      });
      
      // Extract journal data from XML
      return this.extractJournalsFromXML(xmlDoc);
    } catch (error) {
      Logger.error("NLMCatalogService", "Error fetching journal details", error);
      throw new Error("Failed to fetch journal details from NLM Catalog");
    }
  }
  
  /**
   * Extract journal information from NLM Catalog XML
   * @param xmlDoc XML document containing journal data
   * @returns Array of journals with complete metadata
   */
  private extractJournalsFromXML(xmlDoc: XMLDocument): Journal[] {
    try {
      const journals: Journal[] = [];
      const journalNodes = xmlDoc.getElementsByTagName('NCBICatalogRecord');
      
      Logger.debug("NLMCatalogService", `Extracting data from ${journalNodes.length} journal nodes`);
      
      for (let i = 0; i < journalNodes.length; i++) {
        const journalNode = journalNodes.item(i);
        if (!journalNode) continue;
        
        // Extract NLM ID
        const nlmIdNode = journalNode.getElementsByTagName('NlmId').item(0);
        const nlmId = nlmIdNode?.textContent || '';
        
        // Extract journal title
        const titleNode = journalNode.getElementsByTagName('Title').item(0);
        const title = titleNode?.textContent || '';
        
        // Extract ISSNs
        const issnNodes = journalNode.getElementsByTagName('ISSN');
        const issns: string[] = [];
        const issnTypes: Array<{ type: string, value: string }> = [];
        
        for (let j = 0; j < issnNodes.length; j++) {
          const issnNode = issnNodes.item(j);
          if (!issnNode) continue;
          
          const issn = issnNode.textContent || '';
          const issnType = issnNode.getAttribute('IssnType') || 'Print';
          
          if (issn) {
            issns.push(issn);
            issnTypes.push({ type: issnType, value: issn });
          }
        }
        
        // Extract MedlineTA (abbreviated title used in MEDLINE/PubMed)
        const medlineTaNode = journalNode.getElementsByTagName('MedlineTA').item(0);
        const medlineAbbr = medlineTaNode?.textContent || '';
        
        // Extract alternative titles
        const altTitleNodes = journalNode.getElementsByTagName('OtherTitle');
        const altTitles: string[] = [];
        
        for (let j = 0; j < altTitleNodes.length; j++) {
          const altTitleNode = altTitleNodes.item(j);
          if (altTitleNode?.textContent) {
            altTitles.push(altTitleNode.textContent);
          }
        }
        
        // Extract publisher information
        const publisherNode = journalNode.getElementsByTagName('Publisher').item(0);
        const publisherNameNode = publisherNode?.getElementsByTagName('PublisherName').item(0);
        const publisher = publisherNameNode?.textContent || '';
        
        // Extract indexing status
        const currentlyIndexedNode = journalNode.getElementsByTagName('CurrentlyIndexed').item(0);
        const currentlyIndexed = currentlyIndexedNode?.textContent === 'Y';
        
        // Extract coverage information
        const coverage: {
          medline?: boolean;
          pubmedCentral?: boolean;
          index_medicus?: boolean;
        } = {};
        
        const coverageNodes = journalNode.getElementsByTagName('Coverage');
        for (let j = 0; j < coverageNodes.length; j++) {
          const coverageNode = coverageNodes.item(j);
          if (!coverageNode) continue;
          
          const medlineCoverageNode = coverageNode.getElementsByTagName('MedlineCoverage').item(0);
          coverage.medline = !!medlineCoverageNode && medlineCoverageNode.textContent !== '';
          
          const pmcCoverageNode = coverageNode.getElementsByTagName('PMCCoverage').item(0);
          coverage.pubmedCentral = !!pmcCoverageNode && pmcCoverageNode.textContent !== '';
          
          const indexMedicusCoverageNode = coverageNode.getElementsByTagName('IndexingHistoryList')?.item(0);
          coverage.index_medicus = !!indexMedicusCoverageNode;
        }
        
        // Build journal object
        journals.push({
          nlm_id: nlmId,
          title,
          medline_abbr: medlineAbbr,
          issns,
          issn_types: issnTypes,
          alternative_titles: altTitles.length > 0 ? altTitles : undefined,
          publisher,
          currently_indexed: currentlyIndexed,
          coverage
        });
      }
      
      return journals;
    } catch (error) {
      Logger.error("NLMCatalogService", "Error extracting journal data from XML", error);
      throw new Error("Failed to extract journal data from NLM Catalog XML");
    }
  }
  
  /**
   * Get journal information by ISSN
   * @param issn ISSN of the journal to look up
   * @returns Journal information if found, null otherwise
   */
  public async getJournalByISSN(issn: string): Promise<Journal | null> {
    if (!issn || !/^\d{4}-\d{3}[\dX]$/.test(issn)) {
      throw new Error("Invalid ISSN format");
    }
    
    try {
      const journals = await this.searchJournals(`${issn}[ISSN]`);
      return journals.length > 0 ? journals[0] : null;
    } catch (error) {
      Logger.error("NLMCatalogService", `Error finding journal with ISSN ${issn}`, error);
      return null;
    }
  }
  
  /**
   * Get journal information by NLM ID
   * @param nlmId NLM ID of the journal to look up
   * @returns Journal information if found, null otherwise
   */
  public async getJournalByNLMID(nlmId: string): Promise<Journal | null> {
    try {
      const journals = await this.fetchJournalDetails([nlmId]);
      return journals.length > 0 ? journals[0] : null;
    } catch (error) {
      Logger.error("NLMCatalogService", `Error finding journal with NLM ID ${nlmId}`, error);
      return null;
    }
  }
  
  /**
   * Search journal by exact title
   * @param title Exact journal title
   * @returns Journal information if found, null otherwise
   */
  public async getJournalByExactTitle(title: string): Promise<Journal | null> {
    try {
      // Use a simpler query format that's more likely to find matches
      // The [Title] field tag is causing issues, so we'll use a more general search
      const journals = await this.searchJournals(`"${title}"`);
      
      // Filter results to find exact match
      const exactMatch = journals.find(journal => 
        journal.title.toLowerCase() === title.toLowerCase()
      );
      
      return exactMatch || (journals.length > 0 ? journals[0] : null);
    } catch (error) {
      Logger.error("NLMCatalogService", `Error finding journal with title "${title}"`, error);
      return null;
    }
  }
}

export default NLMCatalogService;
