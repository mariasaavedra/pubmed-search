import { OpenAI } from 'openai';
import { Article } from '../types';
import { Logger } from '../utils/logger';
import FullTextFetcherService from './full-text-fetcher.service';

/**
 * Service for generating embeddings and ranking articles by semantic relevance
 */
class EmbeddingService {
  private openai: OpenAI;
  private fullTextFetcher: FullTextFetcherService;
  
  constructor() {
    // Use the OpenAI API key from environment variables
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.fullTextFetcher = new FullTextFetcherService();
    
    Logger.debug("EmbeddingService", "Initialized with OpenAI API and full text fetching capability");
  }
  
  /**
   * Fetch full text content for articles when possible
   * @param articles Array of articles to enhance
   * @returns Articles with full text content where available
   */
  private async enhanceArticlesWithFullText(articles: Article[]): Promise<Article[]> {
    Logger.debug('EmbeddingService', `Attempting to enhance ${articles.length} articles with full text`);
    
    const enhancedArticles = [...articles];
    
    for (let i = 0; i < enhancedArticles.length; i++) {
      const article = enhancedArticles[i];
      
      try {
        // First, try to get a clean abstract from E-utilities
        Logger.debug('EmbeddingService', `Fetching clean abstract for article with PMID: ${article.pmid}`);
        const cleanAbstract = await this.fullTextFetcher.fetchAbstractByEutils(article.pmid);
        
        if (cleanAbstract && cleanAbstract.length > 100) {
          // If we get a good abstract from E-utilities, use it to replace the current abstract
          Logger.debug('EmbeddingService', `Using clean abstract from E-utilities for PMID: ${article.pmid}`);
          article.abstract = cleanAbstract;
        }
        
        // Next, try to get full text content if possible
        // Check if article has DOI
        const doiMatch = article.url.match(/doi\.org\/([^\/]+)/);
        const doi = doiMatch ? doiMatch[1] : null;
        
        if (doi) {
          Logger.debug('EmbeddingService', `Fetching full text for article with DOI: ${doi}`);
          const fullText = await this.fullTextFetcher.fetchArticleByDoi(doi);
          
          if (fullText && fullText.length > article.abstract.length * 2) {
            article.full_text = fullText;
            Logger.debug('EmbeddingService', `Successfully fetched full text for article with DOI: ${doi}`);
          }
        } else {
          // No DOI, try using PMID for full text
          Logger.debug('EmbeddingService', `Fetching full text for article with PMID: ${article.pmid}`);
          const fullText = await this.fullTextFetcher.fetchArticleByPmid(article.pmid);
          
          if (fullText && fullText.length > article.abstract.length * 2) {
            article.full_text = fullText;
            Logger.debug('EmbeddingService', `Successfully fetched full text for article with PMID: ${article.pmid}`);
          }
        }
      } catch (error) {
        Logger.error('EmbeddingService', `Error fetching full text for article ${article.pmid}:`, error);
      }
    }
    
    const enhancedCount = enhancedArticles.filter(a => a.full_text).length;
    Logger.debug('EmbeddingService', `Enhanced ${enhancedCount}/${articles.length} articles with full text`);
    
    return enhancedArticles;
  }

  /**
   * Rank articles by semantic similarity to the query
   * @param query The search query
   * @param articles Array of articles to rank
   * @returns Ranked articles with relevance scores
   */
  public async rankArticlesByRelevance(
    query: string, 
    articles: Article[]
  ): Promise<Article[]> {
    try {
      Logger.debug('EmbeddingService', `Ranking ${articles.length} articles for query: "${query}"`);
      
      if (articles.length === 0) {
        return [];
      }
      
      // Enhance articles with full text when available
      const enhancedArticles = await this.enhanceArticlesWithFullText(articles);
      
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Get article embeddings (one API call with batching)
      const articleContents = enhancedArticles.map(article => {
        // Use full text if available, otherwise use title + abstract
        if (article.full_text) {
          // Limit to first 5000 characters to avoid token limits
          return article.full_text.substring(0, 5000);
        } else {
          return `${article.title}. ${article.abstract}`;
        }
      });
      
      const articleEmbeddings = await this.getEmbeddings(articleContents);
      
      // Calculate similarities between query and each article
      const scoredArticles = enhancedArticles.map((article, index) => {
        const similarity = this.cosineSimilarity(
          queryEmbedding, 
          articleEmbeddings[index]
        );
        
        return {
          ...article,
          scores: {
            ...article.scores,
            relevance: similarity
          }
        };
      });
      
      // Sort by relevance score (highest first)
      return scoredArticles.sort((a, b) => 
        b.scores.relevance - a.scores.relevance
      );
    } catch (error) {
      Logger.error('EmbeddingService', 'Error ranking articles by relevance', error);
      // Fallback: return original articles without ranking
      return articles;
    }
  }
  
  /**
   * Get embedding for a single string
   * @param text Text to embed
   * @returns Vector embedding
   */
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1536 // Default dimension for the model
      });
      
      return response.data[0].embedding;
    } catch (error) {
      Logger.error('EmbeddingService', 'Error getting embedding', error);
      throw error;
    }
  }
  
  /**
   * Get embeddings for multiple strings in one API call
   * Handles batching if there are too many texts
   * @param texts Array of texts to embed
   * @returns Array of vector embeddings
   */
  private async getEmbeddings(texts: string[]): Promise<number[][]> {
    // Handle the case where there are too many texts for one API call
    if (texts.length > 20) {
      // Process in batches of 20
      const results: number[][] = [];
      for (let i = 0; i < texts.length; i += 20) {
        const batch = texts.slice(i, i + 20);
        const batchResults = await this.getEmbeddings(batch);
        results.push(...batchResults);
      }
      return results;
    }
    
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
        dimensions: 1536 // Default dimension for the model
      });
      
      return response.data.map(item => item.embedding);
    } catch (error) {
      Logger.error('EmbeddingService', 'Error getting batch embeddings', error);
      throw error;
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Similarity score between 0 and 1
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    // Avoid division by zero
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default EmbeddingService;
