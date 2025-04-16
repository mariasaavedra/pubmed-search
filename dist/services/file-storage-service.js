"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const content_processor_1 = require("../utils/content-processor");
class FileStorageService {
    constructor() {
        this.outputDir = path_1.default.join(process.cwd(), "data", "output");
    }
    /**
     * Save search results to a JSON file
     * @param articles The articles to save
     * @param blueprint The processed blueprint
     * @param query The search query used
     * @param pmids Array of PMIDs
     * @param totalCount Total number of articles found
     */
    async saveSearchResult(articles, blueprint, query, pmids, totalCount) {
        try {
            // Ensure output directory exists
            await promises_1.default.mkdir(this.outputDir, { recursive: true });
            const result = {
                clinical_category: blueprint.filters.clinical_queries[0], // Will be validated by type
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
                    mesh_terms: [], // To be populated if/when MeSH terms are available
                    full_text: article.full_text,
                    methods: article.methods,
                    results: article.results,
                    discussion: article.discussion,
                    conclusion: article.conclusion,
                    figures: article.figures,
                    tables: article.tables ? content_processor_1.ContentProcessor.encodeArray(article.tables) : undefined,
                    supplementary_material: article.supplementary_material,
                    original_xml: content_processor_1.ContentProcessor.encodeContent(article.original_xml),
                    sanitized_html: content_processor_1.ContentProcessor.encodeContent(article.sanitized_html)
                })),
                encoding_metadata: {
                    tables: 'base64',
                    original_xml: 'base64',
                    sanitized_html: 'base64'
                }
            };
            const filename = this.generateFilename(blueprint);
            const filepath = path_1.default.join(this.outputDir, filename);
            await promises_1.default.writeFile(filepath, JSON.stringify(result, null, 2));
            logger_1.Logger.info("FileStorageService", `Saved search results to ${filename}`);
            return filename;
        }
        catch (error) {
            logger_1.Logger.error("FileStorageService", "Error saving search results", error);
            throw error;
        }
    }
    /**
     * Generate a filename for the search results
     * @param blueprint The processed blueprint
     * @returns The generated filename
     */
    generateFilename(blueprint) {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, "")
            .replace(/[T]/g, "-")
            .replace(/[Z]/g, "");
        const sanitize = (str) => str.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const components = [
            sanitize(blueprint.topics[0]),
            sanitize(blueprint.specialty),
            sanitize(blueprint.filters.clinical_queries[0]),
            "narrow",
            timestamp
        ];
        return `${components.join("-")}.json`;
    }
}
exports.default = FileStorageService;
//# sourceMappingURL=file-storage-service.js.map