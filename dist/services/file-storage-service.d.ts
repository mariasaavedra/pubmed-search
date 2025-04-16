import { ProcessedBlueprint, Article } from "../types";
declare class FileStorageService {
    private outputDir;
    constructor();
    /**
     * Save search results to a JSON file
     * @param articles The articles to save
     * @param blueprint The processed blueprint
     * @param query The search query used
     * @param pmids Array of PMIDs
     * @param totalCount Total number of articles found
     */
    saveSearchResult(articles: Article[], blueprint: ProcessedBlueprint, query: string, pmids: string[], totalCount: number): Promise<string>;
    /**
     * Create a log-friendly preview of article content
     * @param result The saved search result
     * @returns Object with previews of important fields
     */
    private createContentPreview;
    /**
     * Generate MeSH terms for an article using the MeshMapper utility
     * @param article The article to generate terms for
     * @returns Array of MeSH terms
     */
    private generateMeshTerms;
    /**
     * Generate a filename for the search results
     * @param blueprint The processed blueprint
     * @returns The generated filename
     */
    private generateFilename;
}
export default FileStorageService;
