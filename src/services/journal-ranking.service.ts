import { Logger } from '../utils/logger';
import { CLINICALLY_USEFUL_JOURNALS } from '../data/journals';

/**
 * Service for ranking journals based on presence in clinically useful journals list
 */
class JournalRankingService {
  private usefulJournals: Set<string>;
  private normalizedJournalMap: Map<string, string> = new Map();
  
  constructor() {
    this.usefulJournals = new Set(CLINICALLY_USEFUL_JOURNALS);
    
    // Create normalized name lookup for fuzzy matching
    CLINICALLY_USEFUL_JOURNALS.forEach(journal => {
      this.normalizedJournalMap.set(
        this.normalizeJournalName(journal), 
        journal
      );
    });
    
    Logger.debug('JournalRankingService', `Loaded ${this.usefulJournals.size} clinically useful journals`);
  }
  
  /**
   * Normalize a journal name for fuzzy matching
   */
  private normalizeJournalName(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/the\s+/i, '')
      .replace(/journal\s+of\s+/i, 'j ')
      .replace(/&/g, 'and')
      .replace(/[^\w\s]/g, '')
      .trim();
  }
  
  /**
   * Check if a journal is in the clinically useful journals list
   * @param journalName Name of the journal
   * @returns True if the journal is clinically useful
   */
  public isUsefulJournal(journalName: string): boolean {
    // Direct lookup
    if (this.usefulJournals.has(journalName)) {
      return true;
    }
    
    // Try normalized lookup
    const normalized = this.normalizeJournalName(journalName);
    return this.normalizedJournalMap.has(normalized);
  }
  
  /**
   * Get a numeric journal quality score for ranking
   * @param journalName Name of the journal
   * @returns Numeric score between 0 and 1
   */
  public getJournalScore(journalName: string): number {
    // Higher weight for clinically useful journals, lower for others
    return this.isUsefulJournal(journalName) ? 1.0 : 0.1;
  }
  
  /**
   * Get journal tier for logging purposes (deprecated but maintained for API compatibility)
   * @param journalName Name of the journal
   * @returns Simple tier classification
   */
  public getJournalTier(journalName: string): string {
    return this.isUsefulJournal(journalName) ? 'Useful' : 'Standard';
  }
}

export default JournalRankingService;
