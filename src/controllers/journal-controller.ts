import { Request, Response } from 'express';
import { Logger } from '../utils/logger';
import JournalDatabaseService from '../services/journal-database.service';
import NLMCatalogService from '../services/nlm-catalog.service';
import { Journal, JournalSpecialtyMappingRequest } from '../types/journal.types';

/**
 * Controller for journal database management endpoints
 */
class JournalController {
  private static journalDbService = new JournalDatabaseService();
  private static nlmCatalogService = new NLMCatalogService();
  
  /**
   * Initialize the services
   */
  public static async initialize(): Promise<void> {
    await this.journalDbService.initialize();
    Logger.info("JournalController", "Journal services initialized");
  }
  
  /**
   * Get all journals in the database
   * @param req Express request
   * @param res Express response
   */
  public static async getAllJournals(req: Request, res: Response): Promise<void> {
    try {
      const journals = this.journalDbService.getAllJournals();
      
      res.json({
        count: journals.length,
        journals
      });
    } catch (error) {
      Logger.error("JournalController", "Error getting all journals", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve journals"
      });
    }
  }
  
  /**
   * Search journals in the database
   * @param req Express request
   * @param res Express response
   */
  public static async searchJournals(req: Request, res: Response): Promise<void> {
    try {
      const params = req.query;
      
      const journals = this.journalDbService.searchJournals({
        title: params.title as string,
        specialty: params.specialty as string,
        issn: params.issn as string,
        currentlyIndexed: params.currentlyIndexed === 'true',
        medlineCoverage: params.medlineCoverage === 'true',
        pmcCoverage: params.pmcCoverage === 'true'
      });
      
      res.json({
        count: journals.length,
        journals
      });
    } catch (error) {
      Logger.error("JournalController", "Error searching journals", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to search journals"
      });
    }
  }
  
  /**
   * Get journals for a specific specialty
   * @param req Express request
   * @param res Express response
   */
  public static async getJournalsBySpecialty(req: Request, res: Response): Promise<void> {
    try {
      const specialty = req.params.specialty;
      
      if (!specialty) {
        res.status(400).json({
          error: "Bad Request",
          message: "Specialty is required"
        });
        return;
      }
      
      const journals = this.journalDbService.getJournalsBySpecialty(specialty);
      
      res.json({
        specialty,
        count: journals.length,
        journals
      });
    } catch (error) {
      Logger.error("JournalController", "Error getting journals by specialty", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve journals for specialty"
      });
    }
  }
  
  /**
   * Get all available specialties
   * @param req Express request
   * @param res Express response
   */
  public static async getSpecialties(req: Request, res: Response): Promise<void> {
    try {
      const specialties = this.journalDbService.getAvailableSpecialties();
      
      const result = specialties.map(specialty => {
        const journals = this.journalDbService.getJournalsBySpecialty(specialty);
        return {
          name: specialty,
          journal_count: journals.length
        };
      });
      
      res.json({
        count: specialties.length,
        specialties: result
      });
    } catch (error) {
      Logger.error("JournalController", "Error getting specialties", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve specialties"
      });
    }
  }
  
  /**
   * Search journals in the NLM Catalog
   * @param req Express request
   * @param res Express response
   */
  public static async searchNLMCatalog(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string;
      
      if (!query) {
        res.status(400).json({
          error: "Bad Request",
          message: "Query is required"
        });
        return;
      }
      
      const journals = await this.nlmCatalogService.searchJournals(query, {
        currentlyIndexed: req.query.currentlyIndexed === 'true',
        medline: req.query.medline === 'true',
        pubmedCentral: req.query.pmc === 'true'
      });
      
      res.json({
        query,
        count: journals.length,
        journals
      });
    } catch (error) {
      Logger.error("JournalController", "Error searching NLM Catalog", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to search NLM Catalog"
      });
    }
  }
  
  /**
   * Find a journal by ISSN
   * @param req Express request
   * @param res Express response
   */
  public static async findJournalByISSN(req: Request, res: Response): Promise<void> {
    try {
      const issn = req.params.issn;
      
      if (!issn) {
        res.status(400).json({
          error: "Bad Request",
          message: "ISSN is required"
        });
        return;
      }
      
      // Try to find in local database first
      let journal = this.journalDbService.findJournalByISSN(issn);
      
      // If not found, try to find in NLM Catalog
      if (!journal) {
        journal = await this.nlmCatalogService.getJournalByISSN(issn);
      }
      
      if (!journal) {
        res.status(404).json({
          error: "Not Found",
          message: `Journal with ISSN ${issn} not found`
        });
        return;
      }
      
      res.json(journal);
    } catch (error) {
      Logger.error("JournalController", "Error finding journal by ISSN", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to find journal by ISSN"
      });
    }
  }
  
  /**
   * Update the journal database from NLM Catalog
   * @param req Express request
   * @param res Express response
   */
  public static async updateJournalDatabase(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.query as string || '';
      
      const count = await this.journalDbService.updateJournalDatabase(query);
      
      res.json({
        message: `Updated ${count} journals in the database`,
        count
      });
    } catch (error) {
      Logger.error("JournalController", "Error updating journal database", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update journal database"
      });
    }
  }
  
  /**
   * Map journals to a specialty
   * @param req Express request
   * @param res Express response
   */
  public static async mapJournalsToSpecialty(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as JournalSpecialtyMappingRequest;
      const { specialty, query } = body;
      
      if (!specialty || !query) {
        res.status(400).json({
          error: "Bad Request",
          message: "Specialty and query are required"
        });
        return;
      }
      
      const journals = await this.nlmCatalogService.searchJournals(query);
      const count = await this.journalDbService.updateSpecialtyJournals(specialty, journals);
      
      res.json({
        message: `Mapped ${count} journals to specialty "${specialty}"`,
        specialty,
        count
      });
    } catch (error) {
      Logger.error("JournalController", "Error mapping journals to specialty", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to map journals to specialty"
      });
    }
  }
  
  /**
   * Update the PubMed query with journal filter
   * @param req Express request
   * @param res Express response
   */
  public static async getJournalFilter(req: Request, res: Response): Promise<void> {
    try {
      const specialty = req.params.specialty;
      
      if (!specialty) {
        res.status(400).json({
          error: "Bad Request",
          message: "Specialty is required"
        });
        return;
      }
      
      const journals = this.journalDbService.getJournalsBySpecialty(specialty);
      
      if (journals.length === 0) {
        res.json({
          specialty,
          filter: '',
          journals: []
        });
        return;
      }
      
      const filter = this.journalDbService.createPubMedJournalFilter(journals);
      
      res.json({
        specialty,
        filter,
        journal_count: journals.length
      });
    } catch (error) {
      Logger.error("JournalController", "Error getting journal filter", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create journal filter"
      });
    }
  }
}

export default JournalController;
