"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Utility class for reading JSON data files
 */
class FileReader {
    /**
     * Read and parse a JSON file
     * @param filePath Path to the JSON file
     * @returns Parsed JSON data
     */
    static ReadJsonFile(filePath) {
        try {
            const absolutePath = path_1.default.resolve(filePath);
            const fileContent = fs_1.default.readFileSync(absolutePath, 'utf8');
            return JSON.parse(fileContent);
        }
        catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            throw new Error(`Failed to read file: ${filePath}`);
        }
    }
    /**
     * Get specialty data from the specialties.json file
     * @returns Specialty data
     */
    static GetSpecialties() {
        return this.ReadJsonFile('data/specialties.json');
    }
    /**
     * Get journal metrics data from the journal-metrics.json file
     * @returns Journal metrics data
     */
    static GetJournalMetrics() {
        return this.ReadJsonFile('data/journal-metrics.json');
    }
}
exports.default = FileReader;
//# sourceMappingURL=file-reader.js.map