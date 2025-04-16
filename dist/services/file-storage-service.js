"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const content_processor_1 = require("../utils/content-processor");
const mesh_mapper_1 = __importDefault(require("../utils/mesh-mapper"));
const crypto_1 = require("crypto");
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
                articles: articles.map((article) => ({
                    pmid: article.pmid,
                    title: article.title,
                    abstract: article.abstract,
                    authors: article.authors,
                    journal: article.journal,
                    year: new Date(article.pub_date).getFullYear(),
                    // Use extracted MeSH terms if available, otherwise generate them
                    mesh_terms: article.mesh_terms || this.generateMeshTerms(article),
                    full_text: article.full_text,
                    methods: article.methods,
                    results: article.results,
                    discussion: article.discussion,
                    conclusion: article.conclusion,
                    figures: article.figures,
                    tables: article.tables
                        ? content_processor_1.ContentProcessor.encodeArray(article.tables)
                        : undefined,
                    supplementary_material: article.supplementary_material,
                    original_xml: content_processor_1.ContentProcessor.encodeContent(article.original_xml),
                    sanitized_html: content_processor_1.ContentProcessor.encodeContent(article.sanitized_html),
                })),
                encoding_metadata: {
                    tables: "base64",
                    original_xml: "base64",
                    sanitized_html: "base64",
                },
            };
            const filename = this.generateFilename(blueprint);
            const filepath = path_1.default.join(this.outputDir, filename);
            logger_1.Logger.info("FileStorageService", `The complete data will be saved at ${filepath} which contains the search results`, this.createContentPreview(result));
            await promises_1.default.writeFile(filepath, JSON.stringify(result, null, 2));
            return filename;
        }
        catch (error) {
            logger_1.Logger.error("FileStorageService", "Error saving search results", error);
            throw error;
        }
    }
    /**
     * Create a log-friendly preview of article content
     * @param result The saved search result
     * @returns Object with previews of important fields
     */
    createContentPreview(result) {
        // Extract first article for preview (or return empty if no articles)
        if (result.articles.length === 0) {
            return { articles: [] };
        }
        const firstArticle = result.articles[0];
        // Helper to create truncated preview
        const preview = (content, maxLength = 100) => {
            if (!content)
                return "[empty]";
            return content.length > maxLength
                ? `${content.substring(0, maxLength)}... (${content.length} chars)`
                : content;
        };
        // For encoded content, show both raw (encoded) preview and decoded preview
        const encodedPreview = (content, maxLength = 50) => {
            if (!content)
                return "[empty]";
            const decoded = content_processor_1.ContentProcessor.decodeContent(content);
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
    generateMeshTerms(article) {
        const terms = [];
        // Add terms from the title
        if (article.title) {
            const titleTerms = mesh_mapper_1.default.MapTerm(article.title);
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
                const phraseTerms = mesh_mapper_1.default.MapTerm(phrase);
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
    generateFilename(blueprint) {
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "")
            .replace(/[T]/g, "-")
            .replace(/[Z]/g, "");
        const sanitize = (str) => str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const components = [
            sanitize(blueprint.topics[0]),
            sanitize(blueprint.specialty),
            sanitize(blueprint.filters.clinical_queries[0]),
            "narrow",
            timestamp,
            (0, crypto_1.randomBytes)(4).toString("hex"),
        ];
        return `${components.join("-")}.json`;
    }
}
exports.default = FileStorageService;
//# sourceMappingURL=file-storage-service.js.map