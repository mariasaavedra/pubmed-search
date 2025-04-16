import { Logger } from '../utils/logger';
import FileReader from '../utils/file-reader';

export type JournalTier = 'Leading' | 'Established' | 'Recognized' | 'Unrated';

/**
 * Service for ranking journals based on quality metrics
 */
class JournalRankingService {
  private journalMetrics: Record<string, any> = {};
  private normalizedJournalMap: Map<string, string> = new Map();
  
  constructor() {
    this.loadJournalMetrics();
  }
  
  /**
   * Load journal metrics from file
   */
  private loadJournalMetrics(): void {
    try {
      this.journalMetrics = FileReader.getJournalMetrics();
      
      // Create normalized name lookup for fuzzy matching
      Object.keys(this.journalMetrics).forEach(journal => {
        this.normalizedJournalMap.set(
          this.normalizeJournalName(journal), 
          journal
        );
      });
      
      Logger.debug('JournalRankingService', `Loaded ${Object.keys(this.journalMetrics).length} journal metrics`);
    } catch (error) {
      Logger.error('JournalRankingService', 'Failed to load journal metrics', error);
      this.journalMetrics = {};
    }
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
   * Get journal tier based on quality metrics
   * @param journalName Name of the journal
   * @returns Journal tier classification
   */
  public getJournalTier(journalName: string): JournalTier {
    // Direct lookup
    const metrics = this.journalMetrics[journalName];
    
    // Try normalized lookup if direct lookup fails
    if (!metrics) {
      const normalized = this.normalizeJournalName(journalName);
      const originalName = this.normalizedJournalMap.get(normalized);
      if (originalName) {
        return this.calculateTier(this.journalMetrics[originalName]);
      }
      return 'Unrated';
    }
    
    return this.calculateTier(metrics);
  }
  
  /**
   * Get a numeric journal quality score for ranking
   * @param journalName Name of the journal
   * @returns Numeric score between 0 and 1
   */
  public getJournalScore(journalName: string): number {
    const tier = this.getJournalTier(journalName);
    
    // Convert tier to numeric score for sorting/ranking
    switch (tier) {
      case 'Leading': return 1.0;
      case 'Established': return 0.7;
      case 'Recognized': return 0.4;
      case 'Unrated': 
      default: return 0.1;
    }
  }
  
  /**
   * Calculate journal tier based on metrics
   * @param metrics Journal metrics
   * @returns Journal tier
   */
  private calculateTier(metrics: any): JournalTier {
    if (!metrics) return 'Unrated';
    
    const { impact_factor = 0, h_index = 0, sjr_score = 0 } = metrics;
    
    if (impact_factor > 20 || h_index > 400 || sjr_score > 10) return 'Leading';
    if (impact_factor > 10 || h_index > 200 || sjr_score > 5) return 'Established';
    if (impact_factor > 5 || h_index > 100 || sjr_score > 2) return 'Recognized';
    return 'Unrated';
  }
}

export default JournalRankingService;
