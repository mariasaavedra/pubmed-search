import { Article } from '../types';
import { Logger } from '../utils/logger';

/**
 * Service for generating article selection explanations and converting relevance scores
 */
class ExplanationService {
  constructor() {
    Logger.debug("ExplanationService", "Initialized for generating article explanations and relevance scoring");
  }

  /**
   * Generate an explanation for why an article was selected
   * @param article The article to explain
   * @param query The search query that found the article
   * @param specialty The clinical specialty context
   * @returns A human-readable explanation string
   */
  public generateArticleExplanation(
    article: Article,
    query: string,
    specialty: string
  ): string {
    const factors: string[] = [];
    const relevanceScore = article.scores.relevance;
    const journalScore = article.scores.journal_impact;
    
    // Content relevance factor
    if (relevanceScore > 0.8) {
      factors.push("highly relevant content to your search terms");
    } else if (relevanceScore > 0.6) {
      factors.push("relevant content to your search terms");
    } else if (relevanceScore > 0.4) {
      factors.push("somewhat relevant content");
    } else {
      factors.push("contains some related content");
    }
    
    // Journal quality factor
    if (journalScore > 0.9) {
      factors.push("published in a high-impact clinical journal");
    } else if (journalScore > 0.5) {
      factors.push("published in a reputable journal");
    }
    
    // Publication recency factor (if available)
    if (article.pub_date) {
      const pubYear = new Date(article.pub_date).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - pubYear <= 1) {
        factors.push("very recent publication");
      } else if (currentYear - pubYear <= 3) {
        factors.push("recent publication");
      }
    }
    
    // Article type factor (if available)
    if (article.article_type) {
      if (['Guideline', 'Practice Guideline', 'Review'].includes(article.article_type)) {
        factors.push(`article type (${article.article_type})`);
      }
    }
    
    // Specialty match factor
    if (article.specialty_tags && article.specialty_tags.includes(specialty)) {
      factors.push(`specific to ${specialty}`);
    }
    
    // MeSH terms factor
    if (article.mesh_terms && article.mesh_terms.length > 0) {
      // Extract MeSH terms from the query (simplified approach)
      const queryKeywords = query.toLowerCase().split(/\s+/);
      const matchingMeshTerms = article.mesh_terms.filter(term => 
        queryKeywords.some(keyword => 
          term.toLowerCase().includes(keyword) && keyword.length > 3
        )
      );
      
      if (matchingMeshTerms.length > 0) {
        factors.push("indexed with relevant medical subject headings");
      }
    }
    
    // Build the explanation
    let explanation = "This article was selected because it ";
    
    if (factors.length === 0) {
      explanation += "matched your search criteria.";
    } else if (factors.length === 1) {
      explanation += `has ${factors[0]}.`;
    } else {
      const lastFactor = factors.pop();
      explanation += `has ${factors.join(", ")} and ${lastFactor}.`;
    }
    
    return explanation;
  }
  
  /**
   * Convert raw relevance score (0-1) to user-friendly 1-5 scale
   * @param relevanceScore Raw relevance score (0-1 cosine similarity)
   * @returns Scaled relevance score (1-5)
   */
  public convertRelevanceToScale(relevanceScore: number): number {
    // Convert 0-1 score to 1-5 scale
    // Using a non-linear mapping to better distribute scores
    if (relevanceScore >= 0.85) return 5;
    if (relevanceScore >= 0.7) return 4;
    if (relevanceScore >= 0.5) return 3;
    if (relevanceScore >= 0.3) return 2;
    return 1;
  }
}

export default ExplanationService;
