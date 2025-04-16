import fs from "fs/promises";
import path from "path";
import { SavedSearchResult, ProcessedBlueprint, Article } from "../types";
import { Logger } from "../utils/logger";
import { ContentProcessor } from "../utils/content-processor";
import MeshMapper from "../utils/mesh-mapper";
import { randomBytes } from "crypto";

class FileStorageService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), "data", "output");
  }

  /**
   * Save search results to a JSON file
   * @param articles The articles to save
   * @param blueprint The processed blueprint
   * @param query The search query used
   * @param pmids Array of PMIDs
   * @param totalCount Total number of articles found
   */
  public async saveSearchResult(
    articles: Article[],
    blueprint: ProcessedBlueprint,
    query: string,
    pmids: string[],
    totalCount: number
  ): Promise<string> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      const result: SavedSearchResult = {
        clinical_category: blueprint.filters.clinical_queries[0] as any, // Will be validated by type
        clinical_scope: "narrow", // Using narrow scope as default per config
        esearch_query: query,
        article_count: totalCount,
        clinical_specialty: blueprint.specialty,
        pmids: pmids,
        articles: articles.map((article) => ({
          // Include all required Article properties
          pmid: article.pmid,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          journal: article.journal,
          pub_date: article.pub_date,
          url: article.url,
          scores: article.scores,
          
          // Include our custom properties
          year: new Date(article.pub_date).getFullYear(),
          mesh_terms: (article as any).mesh_terms || this.generateMeshTerms(article),
          
          // Include optional properties
          full_text: article.full_text,
          methods: article.methods,
          results: article.results,
          discussion: article.discussion,
          conclusion: article.conclusion,
          figures: article.figures,
          tables: article.tables
            ? ContentProcessor.encodeArray(article.tables)
            : undefined,
          supplementary_material: article.supplementary_material,
          original_xml: ContentProcessor.encodeContent(article.original_xml),
          sanitized_html: ContentProcessor.encodeContent(
            article.sanitized_html
          ),
        })),
        encoding_metadata: {
          tables: "base64",
          original_xml: "base64",
          sanitized_html: "base64",
        },
      };

      const filename = this.generateFilename(blueprint);
      const filepath = path.join(this.outputDir, filename);
      Logger.info(
        "FileStorageService",
        `The complete data will be saved at ${filepath} which contains the search results`,
        this.createContentPreview(result)
      );

      await fs.writeFile(filepath, JSON.stringify(result, null, 2));

      // return filename;
      Logger.info(
        "FileStorageService",
        `The complete data will be saved at ${this.outputDir} which contains the search results`
      );
      return '';
    } catch (error) {
      Logger.error("FileStorageService", "Error saving search results", error);
      throw error;
    }
  }

  /**
   * Create a log-friendly preview of article content
   * @param result The saved search result
   * @returns Object with previews of important fields
   */
  private createContentPreview(result: SavedSearchResult): any {
    // Extract first article for preview (or return empty if no articles)
    if (result.articles.length === 0) {
      return { articles: [] };
    }

    const firstArticle = result.articles[0];
    
    // Helper to create truncated preview
    const preview = (content: string | undefined, maxLength = 100): string => {
      if (!content) return "[empty]";
      return content.length > maxLength 
        ? `${content.substring(0, maxLength)}... (${content.length} chars)`
        : content;
    };
    
    // For encoded content, show both raw (encoded) preview and decoded preview
    const encodedPreview = (content: string | undefined, maxLength = 50): string => {
      if (!content) return "[empty]";
      const decoded = ContentProcessor.decodeContent(content);
      return `[Encoded: ${preview(content, maxLength)}] [Decoded: ${preview(decoded, maxLength)}]`;
    };

    return {
      article_count: result.article_count,
      articles_preview: {
        count: result.articles.length,
        first_article: {
          pmid: firstArticle.pmid,
          title: firstArticle.title,
          full_text: preview(firstArticle.full_text, 150),
          methods: preview(firstArticle.methods, 150),
          results: preview(firstArticle.results, 150),
          discussion: preview(firstArticle.discussion, 150),
          conclusion: preview(firstArticle.conclusion, 150),
          original_xml: encodedPreview(firstArticle.original_xml),
          sanitized_html: encodedPreview(firstArticle.sanitized_html),
          tables: Array.isArray(firstArticle.tables) 
            ? `[${firstArticle.tables.length} tables, first: ${encodedPreview(firstArticle.tables[0])}]`
            : "[no tables]"
        }
      }
    };
  }

  /**
   * Generate MeSH terms for an article using the MeshMapper utility
   * @param article The article to generate terms for
   * @returns Array of MeSH terms
   */
  private generateMeshTerms(article: Article): string[] {
    const terms: string[] = [];
    
    // Add terms from the title
    if (article.title) {
      const titleTerms = MeshMapper.mapTerm(article.title);
      terms.push(...titleTerms);
    }
    
    // Add terms from the abstract (if needed)
    if (article.abstract && terms.length < 3) {
      // Extract key phrases from abstract (simplified approach)
      const keyPhrases = article.abstract
        .split(/[.,;:]/)
        .map(phrase => phrase.trim())
        .filter(phrase => phrase.length > 10 && phrase.length < 60)
        .slice(0, 2); // Take up to 2 phrases
      
      // Generate terms from key phrases
      keyPhrases.forEach(phrase => {
        const phraseTerms = MeshMapper.mapTerm(phrase);
        terms.push(...phraseTerms);
      });
    }
    
    // Deduplicate terms
    const uniqueTerms = [...new Set(terms)];
    
    // Ensure we have at least some terms
    if (uniqueTerms.length === 0) {
      // If no terms were mapped, use a generic clinical term
      return ["Medical Subject Headings"];
    }
    
    return uniqueTerms;
  }
  
  /**
   * Generate a filename for the search results
   * @param blueprint The processed blueprint
   * @returns The generated filename
   */
  private generateFilename(blueprint: ProcessedBlueprint): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "")
      .replace(/[T]/g, "-")
      .replace(/[Z]/g, "");

    const sanitize = (str: string): string =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const components = [
      sanitize(blueprint.topics[0]),
      sanitize(blueprint.specialty),
      sanitize(blueprint.filters.clinical_queries[0]),
      "narrow",
      timestamp,
      randomBytes(4).toString("hex"),
    ];

    return `${components.join("-")}.json`;
  }
}

export default FileStorageService;
