/**
 * Utility class for reading JSON data files
 */
declare class FileReader {
    /**
     * Read and parse a JSON file
     * @param filePath Path to the JSON file
     * @returns Parsed JSON data
     */
    static readJsonFile<T>(filePath: string): T;
    /**
     * Get specialty data from the specialties.json file
     * @returns Specialty data
     */
    static getSpecialties(): Record<string, {
        common_topics: string[];
        mesh_terms: string[];
        default_filters: string[];
    }>;
}
export default FileReader;
