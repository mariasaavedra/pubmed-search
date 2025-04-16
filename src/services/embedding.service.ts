import { OpenAI } from 'openai';
import { Article } from '../types';
import { Logger } from '../utils/logger';

/**
 * Service for generating embeddings and ranking articles by semantic relevance
 */
class EmbeddingService {
  private openai: OpenAI;
  
  constructor() {
    // Use the OpenAI API key from environment variables
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    Logger.debug("EmbeddingService", "Initialized with OpenAI API");
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
      
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Get article embeddings (one API call with batching)
      const articleContents = articles.map(article => 
        `${article.title}. ${article.abstract}`
      );
      
      const articleEmbeddings = await this.getEmbeddings(articleContents);
      
      // Calculate similarities between query and each article
      const scoredArticles = articles.map((article, index) => {
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
