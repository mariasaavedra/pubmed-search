import { JournalMetrics } from '../types';
/**
 * Utility class for reading JSON data files
 */
declare class FileReader {
    /**
     * Read and parse a JSON file
     * @param filePath Path to the JSON file
     * @returns Parsed JSON data
     */
    static ReadJsonFile<T>(filePath: string): T;
    /**
     * Get specialty data from the specialties.json file
     * @returns Specialty data
     */
    static GetSpecialties(): Record<string, {
        common_topics: string[];
        mesh_terms: string[];
        default_filters: string[];
    }>;
    /**
     * Get journal metrics data from the journal-metrics.json file
     * @returns Journal metrics data
     */
    static GetJournalMetrics(): Record<string, JournalMetrics>;
}
export default FileReader;
