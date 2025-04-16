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
    ProcessBlueprint(request: ArticleRequest): ProcessedBlueprint;
    /**
     * Normalize specialty name (lowercase, trim, handle aliases)
     * @param specialty Specialty name
     * @returns Normalized specialty name
     */
    NormalizeSpecialty(specialty: string): string;
    /**
     * Validate if a specialty exists in our database
     * @param specialty Specialty to validate
     * @returns True if the specialty is valid
     */
    ValidateSpecialty(specialty: string): boolean;
    /**
     * Get suggested topics for a specialty
     * @param specialty The specialty
     * @returns Array of common topics for the specialty
     */
    GetSuggestedTopics(specialty: string): string[];
    /**
     * Normalize topics (lowercase, trim, deduplicate)
     * @param topics Array of topics
     * @returns Normalized topics
     */
    NormalizeTopics(topics: string[]): string[];
    /**
     * Get MeSH terms for a specialty
     * @param specialty The specialty
     * @returns Array of MeSH terms for the specialty
     */
    GetSpecialtyMeshTerms(specialty: string): string[];
    /**
     * Get all specialties
     * @returns All specialties data
     */
    GetSpecialties(): Record<string, {
        common_topics: string[];
        mesh_terms: string[];
        default_filters: string[];
    }>;
}
export default BlueprintService;
