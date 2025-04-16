import fs from 'fs';
import path from 'path';

/**
 * Utility class for reading JSON data files
 */
class FileReader {
  /**
   * Read and parse a JSON file
   * @param filePath Path to the JSON file
   * @returns Parsed JSON data
   */
  static readJsonFile<T>(filePath: string): T {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      return JSON.parse(fileContent) as T;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * Get specialty data from the specialties.json file
   * @returns Specialty data
   */
  static getSpecialties(): Record<string, {
    common_topics: string[];
    mesh_terms: string[];
    default_filters: string[];
  }> {
    return this.readJsonFile<Record<string, {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }>>('data/specialties.json');
  }
}

export default FileReader;
