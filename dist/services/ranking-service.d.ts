import { ParsedArticleData, RankedArticleData } from '../types';
/**
 * Service for scoring and ranking retrieved articles
 */
declare class RankingService {
    private journal_metrics;
    private impact_factor_threshold;
    private h_index_threshold;
    private sjr_threshold;
    constructor();
    /**
     * Score and rank articles
     * @param articles Array of parsed articles
     * @param topics Array of search topics
     * @returns Ranked articles
     */
    RankArticles(articles: ParsedArticleData[], topics: string[]): RankedArticleData[];
    /**
     * Calculate relevance score based on article content and search topics
     * @param article Article data
     * @param topics Search topics
     * @returns Relevance score (0-10)
     */
    CalculateRelevanceScore(article: ParsedArticleData, topics: string[]): number;
    /**
     * Calculate journal impact score based on metrics
     * @param journal_name Journal name
     * @returns Journal impact score (0-10)
     */
    CalculateJournalScore(journal_name: string): number;
    /**
     * Filter articles by minimum score
     * @param articles Ranked articles
     * @param min_score Minimum score threshold
     * @returns Filtered articles
     */
    FilterArticlesByScore(articles: RankedArticleData[], min_score?: number): RankedArticleData[];
}
export default RankingService;
