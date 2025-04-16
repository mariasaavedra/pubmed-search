import fs from 'fs/promises';
import path from 'path';
import NLMCatalogService from './nlm-catalog.service';
import { Logger } from '../utils/logger';
import { Journal, JournalSearchParams, JournalsBySpecialty } from '../types/journal.types';

/**
 * Service for managing the journal database
 * Provides methods to load, search, and update journal information
 */
class JournalDatabaseService {
  private nlmCatalogService: NLMCatalogService;
  private journals: Journal[] = [];
  private journalsBySpecialty: JournalsBySpecialty = {};
  private journalsPath: string;
  private journalsBySpecialtyPath: string;
  
  constructor() {
    this.nlmCatalogService = new NLMCatalogService();
    this.journalsPath = path.join(__dirname, '../../data/journals/journals-database.json');
    this.journalsBySpecialtyPath = path.join(__dirname, '../../data/journals/journals-by-specialty.json');
    
    Logger.debug("JournalDatabaseService", "Initialized Journal Database service");
  }
  
  /**
   * Initialize the journal database from stored files
   */
  public async initialize(): Promise<void> {
    try {
      // Try to load existing database
      await this.loadJournalDatabase();
      Logger.info("JournalDatabaseService", `Loaded ${this.journals.length} journals from database`);
      
      // Load specialty journal mappings
      await this.loadJournalsBySpecialty();
      Logger.info("JournalDatabaseService", `Loaded journals for ${Object.keys(this.journalsBySpecialty).length} specialties`);
    } catch (error) {
      Logger.warn("JournalDatabaseService", "Error loading journal database, initializing empty database", error);
      this.journals = [];
      this.journalsBySpecialty = {};
    }
  }
  
  /**
   * Load journal database from file
   */
  private async loadJournalDatabase(): Promise<void> {
    try {
      const data = await fs.readFile(this.journalsPath, 'utf8');
      const parsed = JSON.parse(data);
      this.journals = parsed.journals || [];
      
      if (this.journals.length === 0) {
        Logger.warn("JournalDatabaseService", "Journal database is empty");
      }
    } catch (error) {
      Logger.error("JournalDatabaseService", "Error loading journal database", error);
      throw error;
    }
  }
  
  /**
   * Load journals by specialty from file
   */
  private async loadJournalsBySpecialty(): Promise<void> {
    try {
      const data = await fs.readFile(this.journalsBySpecialtyPath, 'utf8');
      const parsed = JSON.parse(data);
      this.journalsBySpecialty = parsed.specialties || {};
      
      if (Object.keys(this.journalsBySpecialty).length === 0) {
        Logger.warn("JournalDatabaseService", "Specialty journal mappings are empty");
      }
    } catch (error) {
      Logger.error("JournalDatabaseService", "Error loading journals by specialty", error);
      throw error;
    }
  }
  
  /**
   * Save journal database to file
   */
  private async saveJournalDatabase(): Promise<void> {
    try {
      await fs.writeFile(
        this.journalsPath, 
        JSON.stringify({ updated_at: new Date().toISOString(), journals: this.journals }, null, 2)
      );
    } catch (error) {
      Logger.error("JournalDatabaseService", "Error saving journal database", error);
      throw error;
    }
  }
  
  /**
   * Save journals by specialty to file
   */
  private async saveJournalsBySpecialty(): Promise<void> {
    try {
      await fs.writeFile(
        this.journalsBySpecialtyPath, 
        JSON.stringify({ updated_at: new Date().toISOString(), specialties: this.journalsBySpecialty }, null, 2)
      );
    } catch (error) {
      Logger.error("JournalDatabaseService", "Error saving journals by specialty", error);
      throw error;
    }
  }
  
  /**
   * Get all journals in the database
   * @returns Array of all journals
   */
  public getAllJournals(): Journal[] {
    return this.journals;
  }
  
  /**
   * Search journals in the database
   * @param params Search parameters
   * @returns Array of matching journals
   */
  public searchJournals(params: JournalSearchParams): Journal[] {
    let results = this.journals;
    
    // Filter by title
    if (params.title) {
      const titleLower = params.title.toLowerCase();
      results = results.filter(journal => 
        journal.title.toLowerCase().includes(titleLower) ||
        journal.medline_abbr?.toLowerCase().includes(titleLower) ||
        journal.alternative_titles?.some(alt => alt.toLowerCase().includes(titleLower))
      );
    }
    
    // Filter by specialty
    if (params.specialty) {
      const specialtyJournals = this.journalsBySpecialty[params.specialty] || [];
      const specialtyNlmIds = new Set(specialtyJournals.map(j => j.nlm_id));
      results = results.filter(journal => specialtyNlmIds.has(journal.nlm_id));
    }
    
    // Filter by ISSN
    if (params.issn) {
      results = results.filter(journal => 
        journal.issns?.some(issn => issn.includes(params.issn!))
      );
    }
    
    // Filter by indexing status
    if (params.currentlyIndexed !== undefined) {
      results = results.filter(journal => 
        journal.currently_indexed === params.currentlyIndexed
      );
    }
    
    // Filter by coverage
    if (params.medlineCoverage) {
      results = results.filter(journal => journal.coverage?.medline === true);
    }
    
    if (params.pmcCoverage) {
      results = results.filter(journal => journal.coverage?.pubmedCentral === true);
    }
    
    return results;
  }
  
  /**
   * Get journals for a specific specialty
   * @param specialty Specialty name
   * @returns Array of journals for the specialty
   */
  public getJournalsBySpecialty(specialty: string): Journal[] {
    return this.journalsBySpecialty[specialty] || [];
  }
  
  /**
   * Get a list of all available specialties
   * @returns Array of specialty names
   */
  public getAvailableSpecialties(): string[] {
    return Object.keys(this.journalsBySpecialty);
  }
  
  /**
   * Update the journal database from NLM Catalog
   * @param query Optional search query to limit journals to update
   * @returns Number of journals updated
   */
  public async updateJournalDatabase(query: string = ''): Promise<number> {
    try {
      Logger.info("JournalDatabaseService", `Updating journal database with query: ${query || 'all journals'}`);
      
      // If no specific query, update journals we already have
      if (!query && this.journals.length > 0) {
        const nlmIds = this.journals.map(journal => journal.nlm_id);
        const updatedJournals = await this.nlmCatalogService.fetchJournalDetails(nlmIds);
        
        // Create a map for fast lookup
        const journalMap = new Map<string, Journal>();
        updatedJournals.forEach(journal => {
          journalMap.set(journal.nlm_id, journal);
        });
        
        // Update existing journals
        this.journals = this.journals.map(journal => {
          return journalMap.get(journal.nlm_id) || journal;
        });
        
        await this.saveJournalDatabase();
        return updatedJournals.length;
      }
      
      // Otherwise search for journals with the given query
      const newJournals = await this.nlmCatalogService.searchJournals(query);
      
      // Create a Set of existing NLM IDs for fast lookup
      const existingNlmIds = new Set(this.journals.map(journal => journal.nlm_id));
      
      // Add only new journals
      let newCount = 0;
      newJournals.forEach(journal => {
        if (!existingNlmIds.has(journal.nlm_id)) {
          this.journals.push(journal);
          newCount++;
        }
      });
      
      await this.saveJournalDatabase();
      return newCount;
    } catch (error) {
      Logger.error("JournalDatabaseService", "Error updating journal database", error);
      throw new Error("Failed to update journal database");
    }
  }
  
  /**
   * Import journals from a static JSON file
   * @param filePath Path to the JSON file
   * @returns Number of journals added
   */
  public async importJournalsFromFile(filePath: string): Promise<number> {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const importedData = JSON.parse(data);
      
      // Check if the file has a journals array
      const journalNames = importedData.journals || [];
      if (!Array.isArray(journalNames)) {
        throw new Error("Invalid journal file format");
      }
      
      Logger.info("JournalDatabaseService", `Importing ${journalNames.length} journals from ${filePath}`);
      
      // Create a Set of existing NLM IDs for fast lookup
      const existingNlmIds = new Set(this.journals.map(journal => journal.nlm_id));
      
      // Process each journal name
      let addedCount = 0;
      for (const journalName of journalNames) {
        try {
          // Try to find journal by exact name
          const journal = await this.nlmCatalogService.getJournalByExactTitle(journalName);
          
          if (journal && !existingNlmIds.has(journal.nlm_id)) {
            this.journals.push(journal);
            existingNlmIds.add(journal.nlm_id);
            addedCount++;
          }
        } catch (error) {
          Logger.warn("JournalDatabaseService", `Error importing journal "${journalName}"`, error);
          continue;
        }
      }
      
      await this.saveJournalDatabase();
      return addedCount;
    } catch (error) {
      Logger.error("JournalDatabaseService", `Error importing journals from ${filePath}`, error);
      throw new Error(`Failed to import journals from ${filePath}`);
    }
  }
  
  /**
   * Update specialty journals mapping
   * @param specialty Specialty name
   * @param journals Array of journals for the specialty
   * @returns Number of journals mapped to the specialty
   */
  public async updateSpecialtyJournals(specialty: string, journals: Journal[]): Promise<number> {
    try {
      this.journalsBySpecialty[specialty] = journals;
      await this.saveJournalsBySpecialty();
      return journals.length;
    } catch (error) {
      Logger.error("JournalDatabaseService", `Error updating journals for specialty ${specialty}`, error);
      throw new Error(`Failed to update journals for specialty ${specialty}`);
    }
  }
  
  /**
   * Create a PubMed filter string from journals
   * Uses both journal titles and ISSNs for more accurate filtering
   * @param journals Array of journals to include in the filter
   * @returns Formatted filter string for use in PubMed queries
   */
  public createPubMedJournalFilter(journals: Journal[]): string {
    // Use both journal titles (with Medline abbreviations) and ISSNs
    const filterParts: string[] = [];
    
    // Add journal titles with MedlineTA as it's used by PubMed
    journals.forEach(journal => {
      if (journal.medline_abbr) {
        filterParts.push(`"${journal.medline_abbr}"[jo]`);
      } else {
        filterParts.push(`"${journal.title}"[jo]`);
      }
      
      // Add ISSNs for even more accurate matching
      journal.issns?.forEach(issn => {
        filterParts.push(`${issn}[ISSN]`);
      });
    });
    
    // Combine with OR operators
    return filterParts.length > 0 ? `(${filterParts.join(' OR ')})` : '';
  }
  
  /**
   * Find matching journals in the database by name
   * @param name Journal name to search for
   * @returns Array of matching journals
   */
  public findJournalsByName(name: string): Journal[] {
    const nameLower = name.toLowerCase();
    return this.journals.filter(journal => 
      journal.title.toLowerCase().includes(nameLower) ||
      journal.medline_abbr?.toLowerCase().includes(nameLower) ||
      journal.alternative_titles?.some(alt => alt.toLowerCase().includes(nameLower))
    );
  }
  
  /**
   * Find a journal by ISSN
   * @param issn ISSN to search for
   * @returns Journal if found, null otherwise
   */
  public findJournalByISSN(issn: string): Journal | null {
    const journal = this.journals.find(journal => 
      journal.issns.some(journalIssn => journalIssn === issn)
    );
    return journal || null;
  }
  
  /**
   * Find a journal by NLM ID
   * @param nlmId NLM ID to search for
   * @returns Journal if found, null otherwise
   */
  public findJournalByNLMID(nlmId: string): Journal | null {
    const journal = this.journals.find(journal => journal.nlm_id === nlmId);
    return journal || null;
  }
}

export default JournalDatabaseService;
