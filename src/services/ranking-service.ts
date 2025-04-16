import FileReader from '../utils/file-reader';
import { ParsedArticleData, RankedArticleData, JournalMetrics } from '../types';
import { PUBMED_CONFIG } from '../config/pubmed-config';

/**
 * Service for scoring and ranking retrieved articles
 */
class RankingService {
  private journal_metrics: Record<string, JournalMetrics>;
  private impact_factor_threshold: number;
  private h_index_threshold: number;
  private sjr_threshold: number;

  constructor() {
    this.journal_metrics = FileReader.getJournalMetrics();
    
    // Load thresholds from config
    this.impact_factor_threshold = PUBMED_CONFIG.journal_quality.impact_factor_threshold;
    this.h_index_threshold = PUBMED_CONFIG.journal_quality.h_index_threshold;
    this.sjr_threshold = PUBMED_CONFIG.journal_quality.sjr;
  }

  /**
   * Score and rank articles
   * @param articles Array of parsed articles
   * @param topics Array of search topics
   * @returns Ranked articles
   */
  public rankArticles(articles: ParsedArticleData[], topics: string[]): RankedArticleData[] {
    // Score each article
    const scored_articles = articles.map(article => {
      const relevance_score = this.calculateRelevanceScore(article, topics);
      const journal_score = this.calculateJournalScore(article.journal);

      return {
        ...article,
        scores: {
          relevance: relevance_score,
          journal_impact: journal_score
        }
      };
    });

    // Sort by combined score (relevance + journal impact)
    return scored_articles.sort((a, b) => {
      const combined_a = a.scores.relevance + a.scores.journal_impact;
      const combined_b = b.scores.relevance + b.scores.journal_impact;
      return combined_b - combined_a; // Descending order
    });
  }

  /**
   * Calculate relevance score based on article content and search topics
   * @param article Article data
   * @param topics Search topics
   * @returns Relevance score (0-10)
   */
  public calculateRelevanceScore(article: ParsedArticleData, topics: string[]): number {
    if (!article || !topics || topics.length === 0) {
      return 0;
    }

    let score = 0;
    const normalized_topics = topics.map(topic => topic.toLowerCase());
    
    // Score based on title (higher weight)
    const title_lower = article.title.toLowerCase();
    normalized_topics.forEach(topic => {
      if (title_lower.includes(topic)) {
        score += 3; // Higher weight for title matches
      }
    });

    // Score based on abstract
    if (article.abstract) {
      const abstract_lower = article.abstract.toLowerCase();
      normalized_topics.forEach(topic => {
        if (abstract_lower.includes(topic)) {
          score += 1; // Lower weight for abstract matches
        }
        
        // Bonus points for more prominent topic placement
        const first_100_chars = abstract_lower.substring(0, 100);
        if (first_100_chars.includes(topic)) {
          score += 0.5; // Bonus for topics in opening sentences
        }
      });
    }

    // Cap at 10
    return Math.min(10, score);
  }

  /**
   * Calculate journal impact score based on metrics
   * @param journal_name Journal name
   * @returns Journal impact score (0-10)
   */
  public calculateJournalScore(journal_name: string): number {
    if (!journal_name) {
      return 0;
    }

    // Try to find an exact match
    let journal_metrics = this.journal_metrics[journal_name];
    
    // If no exact match, try to find a partial match
    if (!journal_metrics) {
      const journal_key = Object.keys(this.journal_metrics).find(key => 
        journal_name.includes(key) || key.includes(journal_name)
      );
      
      if (journal_key) {
        journal_metrics = this.journal_metrics[journal_key];
      }
    }

    // If no match found, return a default low score
    if (!journal_metrics) {
      return 2; // Default score for unknown journals
    }

    // Calculate score based on metrics
    let score = 0;
    
    // Impact factor score (up to 5 points)
    if (journal_metrics.impact_factor) {
      score += Math.min(5, (journal_metrics.impact_factor / this.impact_factor_threshold) * 5);
    }
    
    // H-index score (up to 3 points)
    if (journal_metrics.h_index) {
      score += Math.min(3, (journal_metrics.h_index / this.h_index_threshold) * 3);
    }
    
    // SJR score (up to 2 points)
    if (journal_metrics.sjr_score) {
      score += Math.min(2, (journal_metrics.sjr_score / this.sjr_threshold) * 2);
    }
    
    // Normalize to 0-10 scale
    return Math.min(10, score);
  }

  /**
   * Filter articles by minimum score
   * @param articles Ranked articles
   * @param min_score Minimum score threshold
   * @returns Filtered articles
   */
  public filterArticlesByScore(
    articles: RankedArticleData[], 
    min_score: number = 5
  ): RankedArticleData[] {
    return articles.filter(article => {
      const combined_score = article.scores.relevance + article.scores.journal_impact;
      return combined_score >= min_score;
    });
  }
}

export default RankingService;
