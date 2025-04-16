import { ArticleRequest, ProcessedBlueprint } from '../types';
/**
 * Service for processing clinical blueprints
 */
declare class BlueprintService {
    private specialties;
    constructor();
    /**
     * Process a blueprint request into a standardized format
     * @param request The blueprint request
     * @returns Processed blueprint
     */
    processBlueprint(request: ArticleRequest): ProcessedBlueprint;
    /**
     * Normalize specialty name (lowercase, trim, handle aliases)
     * @param specialty Specialty name
     * @returns Normalized specialty name
     */
    normalizeSpecialty(specialty: string): string;
    /**
     * Validate if a specialty exists in our database
     * @param specialty Specialty to validate
     * @returns True if the specialty is valid
     */
    validateSpecialty(specialty: string): boolean;
    /**
     * Get suggested topics for a specialty
     * @param specialty The specialty
     * @returns Array of common topics for the specialty
     */
    getSuggestedTopics(specialty: string): string[];
    /**
     * Normalize topics (lowercase, trim, deduplicate)
     * @param topics Array of topics
     * @returns Normalized topics
     */
    normalizeTopics(topics: string[]): string[];
    /**
     * Get MeSH terms for a specialty
     * @param specialty The specialty
     * @returns Array of MeSH terms for the specialty
     */
    getSpecialtyMeshTerms(specialty: string): string[];
    /**
     * Get all specialties
     * @returns All specialties data
     */
    getSpecialties(): Record<string, {
        common_topics: string[];
        mesh_terms: string[];
        default_filters: string[];
    }>;
}
export default BlueprintService;
