/**
 * Utility class for mapping terms to MeSH (Medical Subject Headings) terms
 */
declare class MeshMapper {
    private static term_mapping_cache;
    /**
     * Map a term to MeSH terms
     * @param term The term to map
     * @returns Array of MeSH terms
     */
    static MapTerm(term: string): string[];
    /**
     * Simplified MeSH term mapping (without API calls)
     * @param term The term to map
     * @returns Array of mapped MeSH terms
     */
    private static SimpleMeshMapping;
    /**
     * Validate if a term is a valid MeSH term
     * @param term The term to validate
     * @returns True if the term is a valid MeSH term
     */
    static ValidateMeshTerm(term: string): boolean;
    /**
     * Get the preferred MeSH term from a list of alternatives
     * @param alternatives Array of alternative terms
     * @returns The preferred MeSH term
     */
    static GetPreferredTerm(alternatives: string[]): string;
}
export default MeshMapper;
