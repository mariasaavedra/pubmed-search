import fs from "fs/promises";
import path from "path";
import { SavedSearchResult, ProcessedBlueprint, Article } from "../types";
import { Logger } from "../utils/logger";

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
        clinical_category: blueprint.filters.study_types[0] as any, // Will be validated by type
        clinical_scope: "narrow", // Using narrow scope as default per config
        esearch_query: query,
        article_count: totalCount,
        clinical_specialty: blueprint.specialty,
        pmids: pmids,
        articles: articles.map(article => ({
          pmid: article.pmid,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          journal: article.journal,
          year: new Date(article.pub_date).getFullYear(),
          mesh_terms: [] // To be populated if/when MeSH terms are available
        }))
      };

      const filename = this.generateFilename(blueprint);
      const filepath = path.join(this.outputDir, filename);

      await fs.writeFile(filepath, JSON.stringify(result, null, 2));
      Logger.info("FileStorageService", `Saved search results to ${filename}`);

      return filename;
    } catch (error) {
      Logger.error("FileStorageService", "Error saving search results", error);
      throw error;
    }
  }

  /**
   * Generate a filename for the search results
   * @param blueprint The processed blueprint
   * @returns The generated filename
   */
  private generateFilename(blueprint: ProcessedBlueprint): string {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, "")
      .replace(/[T]/g, "-")
      .replace(/[Z]/g, "");

    const sanitize = (str: string): string =>
      str.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const components = [
      sanitize(blueprint.topics[0]),
      sanitize(blueprint.specialty),
      sanitize(blueprint.filters.study_types[0]),
      "narrow",
      timestamp
    ];

    return `${components.join("-")}.json`;
  }
}

export default FileStorageService;
