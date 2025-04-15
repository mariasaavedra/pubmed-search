import FileReader from '../utils/file-reader';
import { ArticleRequest, ProcessedBlueprint } from '../types';
import { Logger } from '../utils/logger';

/**
 * Service for processing clinical blueprints
 */
class BlueprintService {
  private specialties: Record<string, {
    common_topics: string[];
    mesh_terms: string[];
    default_filters: string[];
  }>;

  constructor() {
    this.specialties = FileReader.GetSpecialties();
    Logger.debug('BlueprintService', `Initialized with ${Object.keys(this.specialties).length} specialties`);
  }

  /**
   * Process a blueprint request into a standardized format
   * @param request The blueprint request
   * @returns Processed blueprint
   */
  public ProcessBlueprint(request: ArticleRequest): ProcessedBlueprint {
    Logger.debug('BlueprintService', `Processing blueprint request`, request);
    
    // Normalize and validate inputs
    const normalized_specialty = this.NormalizeSpecialty(request.specialty);
    Logger.debug('BlueprintService', `Normalized specialty: ${request.specialty} -> ${normalized_specialty}`);
    
    const normalized_topics = this.NormalizeTopics(request.topics);
    Logger.debug('BlueprintService', `Normalized ${request.topics.length} topics -> ${normalized_topics.length} unique topics`);
    
    // Verify specialty exists
    if (!this.ValidateSpecialty(normalized_specialty)) {
      Logger.error('BlueprintService', `Invalid specialty: ${normalized_specialty}`);
      throw new Error(`Invalid specialty: ${normalized_specialty}`);
    }

    // Set default filters if not provided, or use the provided ones
    const study_types = request.filters?.study_types || 
      this.specialties[normalized_specialty].default_filters;
    
    const blueprint: ProcessedBlueprint = {
      specialty: normalized_specialty,
      topics: normalized_topics,
      filters: {
        study_types,
        age_group: request.filters?.age_group,
        year_range: request.filters?.year_range || 3 // Default to last 3 years
      }
    };
    
    Logger.debug('BlueprintService', `Blueprint processed successfully`, blueprint);
    return blueprint;
  }

  /**
   * Normalize specialty name (lowercase, trim, handle aliases)
   * @param specialty Specialty name
   * @returns Normalized specialty name
   */
  public NormalizeSpecialty(specialty: string): string {
    const normalized = specialty.toLowerCase().trim();
    
    // Handle common aliases
    const aliases: Record<string, string> = {
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
  public ValidateSpecialty(specialty: string): boolean {
    return !!this.specialties[specialty];
  }

  /**
   * Get suggested topics for a specialty
   * @param specialty The specialty
   * @returns Array of common topics for the specialty
   */
  public GetSuggestedTopics(specialty: string): string[] {
    const normalized_specialty = this.NormalizeSpecialty(specialty);
    
    if (!this.ValidateSpecialty(normalized_specialty)) {
      return [];
    }
    
    return this.specialties[normalized_specialty].common_topics;
  }

  /**
   * Normalize topics (lowercase, trim, deduplicate)
   * @param topics Array of topics
   * @returns Normalized topics
   */
  public NormalizeTopics(topics: string[]): string[] {
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
  public GetSpecialtyMeshTerms(specialty: string): string[] {
    const normalized_specialty = this.NormalizeSpecialty(specialty);
    
    if (!this.ValidateSpecialty(normalized_specialty)) {
      return [];
    }
    
    return this.specialties[normalized_specialty].mesh_terms;
  }

  /**
   * Get all specialties
   * @returns All specialties data
   */
  public GetSpecialties(): Record<string, {
    common_topics: string[];
    mesh_terms: string[];
    default_filters: string[];
  }> {
    return this.specialties;
  }
}

export default BlueprintService;
