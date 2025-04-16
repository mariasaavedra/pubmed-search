"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_reader_1 = __importDefault(require("../utils/file-reader"));
const logger_1 = require("../utils/logger");
/**
 * Service for processing clinical blueprints
 */
class BlueprintService {
    constructor() {
        this.specialties = file_reader_1.default.getSpecialties();
        logger_1.Logger.debug('BlueprintService', `Initialized with ${Object.keys(this.specialties).length} specialties`);
    }
    /**
     * Process a blueprint request into a standardized format
     * @param request The blueprint request
     * @returns Processed blueprint
     */
    processBlueprint(request) {
        logger_1.Logger.debug('BlueprintService', `Processing blueprint request`, request);
        // Normalize and validate inputs
        const normalized_specialty = this.normalizeSpecialty(request.specialty);
        logger_1.Logger.debug('BlueprintService', `Normalized specialty: ${request.specialty} -> ${normalized_specialty}`);
        const normalized_topics = this.normalizeTopics(request.topics || []);
        logger_1.Logger.debug('BlueprintService', `Normalized ${request?.topics?.length || 0} topics -> ${normalized_topics.length} unique topics`);
        // Verify specialty exists
        if (!this.validateSpecialty(normalized_specialty)) {
            logger_1.Logger.error('BlueprintService', `Invalid specialty: ${normalized_specialty}`);
            throw new Error(`Invalid specialty: ${normalized_specialty}`);
        }
        // Set default filters if not provided, or use the provided ones
        const clinical_queries = request.filters?.clinical_queries ||
            this.specialties[normalized_specialty].default_filters;
        const blueprint = {
            specialty: normalized_specialty,
            topics: normalized_topics,
            filters: {
                clinical_queries,
                age_group: request.filters?.age_group,
                year_range: request.filters?.year_range || 3 // Default to last 3 years
            }
        };
        logger_1.Logger.debug('BlueprintService', `Blueprint processed successfully`, blueprint);
        return blueprint;
    }
    /**
     * Normalize specialty name (lowercase, trim, handle aliases)
     * @param specialty Specialty name
     * @returns Normalized specialty name
     */
    normalizeSpecialty(specialty) {
        const normalized = specialty.toLowerCase().trim();
        // Handle common aliases
        const aliases = {
            'cardio': 'cardiology',
            'neuro': 'neurology',
            'endo': 'endocrinology',
            'gastro': 'gastroenterology',
            'psych': 'psychiatry',
            'rheum': 'rheumatology',
            'id': 'infectious_diseases',
            'infectious disease': 'infectious_diseases',
            'infectious diseases': 'infectious_diseases'
        };
        return aliases[normalized] || normalized;
    }
    /**
     * Validate if a specialty exists in our database
     * @param specialty Specialty to validate
     * @returns True if the specialty is valid
     */
    validateSpecialty(specialty) {
        return !!this.specialties[specialty];
    }
    /**
     * Get suggested topics for a specialty
     * @param specialty The specialty
     * @returns Array of common topics for the specialty
     */
    getSuggestedTopics(specialty) {
        const normalized_specialty = this.normalizeSpecialty(specialty);
        if (!this.validateSpecialty(normalized_specialty)) {
            return [];
        }
        return this.specialties[normalized_specialty].common_topics;
    }
    /**
     * Normalize topics (lowercase, trim, deduplicate)
     * @param topics Array of topics
     * @returns Normalized topics
     */
    normalizeTopics(topics) {
        // Process each topic and remove duplicates
        const normalized = topics
            .map(topic => topic.toLowerCase().trim())
            .filter(topic => topic.length > 0);
        // Remove duplicates
        return [...new Set(normalized)];
    }
    /**
     * Get MeSH terms for a specialty
     * @param specialty The specialty
     * @returns Array of MeSH terms for the specialty
     */
    getSpecialtyMeshTerms(specialty) {
        const normalized_specialty = this.normalizeSpecialty(specialty);
        if (!this.validateSpecialty(normalized_specialty)) {
            return [];
        }
        return this.specialties[normalized_specialty].mesh_terms;
    }
    /**
     * Get all specialties
     * @returns All specialties data
     */
    getSpecialties() {
        return this.specialties;
    }
}
exports.default = BlueprintService;
//# sourceMappingURL=blueprint-service.js.map