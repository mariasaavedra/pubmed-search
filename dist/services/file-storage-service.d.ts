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
     * Generate a filename for the search results
     * @param blueprint The processed blueprint
     * @returns The generated filename
     */
    private generateFilename;
}
export default FileStorageService;
