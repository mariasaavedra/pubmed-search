import { Article, SpecialtyFilter } from '../types';
import { SPECIALTY_FILTERS } from '../config/category-config';
import { Logger } from '../utils/logger';

/**
 * Service for filtering articles by specialty based on MeSH terms
 */
export class SpecialtyFilterService {
  /**
   * Filter articles by specialty
   * @param articles Array of articles to filter
   * @param specialtyId ID of the specialty to filter by
   * @returns Filtered array of articles
   */
  public filterBySpecialty(articles: Article[], specialtyId: string): Article[] {
    const specialty = this.findSpecialtyById(specialtyId);
    if (!specialty) {
      Logger.warn('SpecialtyFilterService', `Specialty with ID "${specialtyId}" not found`);
      return articles;
    }
    
    return articles.filter(article => 
      this.articleMatchesSpecialty(article, specialty)
    );
  }
  
  /**
   * Check if an article matches a specialty based on MeSH terms
   * @param article Article to check
   * @param specialty Specialty to check against
   * @returns True if the article matches the specialty
   */
  private articleMatchesSpecialty(article: Article, specialty: SpecialtyFilter): boolean {
    // First check mesh_terms (string array)
    if (article.mesh_terms && article.mesh_terms.length > 0) {
      const matchesMeshTerms = article.mesh_terms.some(meshTerm => 
        specialty.mesh_terms.some(specialtyMesh => 
          meshTerm.toLowerCase().includes(specialtyMesh.toLowerCase())
        )
      );
      
      if (matchesMeshTerms) {
        return true;
      }
    }
    
    // Then check mesh_qualifiers (more structured)
    if (article.mesh_qualifiers && article.mesh_qualifiers.length > 0) {
      const matchesQualifiers = article.mesh_qualifiers.some(qualifier => 
        specialty.mesh_terms.some(specialtyMesh => 
          qualifier.descriptor.toLowerCase().includes(specialtyMesh.toLowerCase())
        )
      );
      
      if (matchesQualifiers) {
        return true;
      }
    }
    
    // Check if already has matching specialty_tags
    if (article.specialty_tags && article.specialty_tags.length > 0) {
      if (article.specialty_tags.includes(specialty.name)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Find a specialty by ID, including sub-specialties
   * @param specialtyId ID of the specialty to find
   * @returns The specialty if found, undefined otherwise
   */
  private findSpecialtyById(specialtyId: string): SpecialtyFilter | undefined {
    // Look for direct match
    const directMatch = SPECIALTY_FILTERS.find(s => s.id === specialtyId);
    if (directMatch) {
      return directMatch;
    }
    
    // Look in sub-specialties
    for (const specialty of SPECIALTY_FILTERS) {
      if (specialty.sub_specialties) {
        const subSpecialty = specialty.sub_specialties.find(
          sub => sub.id === specialtyId
        );
        if (subSpecialty) {
          return subSpecialty;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Get all available specialties (flattened)
   * @returns Array of all specialties and sub-specialties
   */
  public getAllSpecialties(): SpecialtyFilter[] {
    const result: SpecialtyFilter[] = [];
    
    for (const specialty of SPECIALTY_FILTERS) {
      result.push(specialty);
      
      if (specialty.sub_specialties) {
        result.push(...specialty.sub_specialties);
      }
    }
    
    return result;
  }
  
  /**
   * Get a list of specialty IDs and names for display
   * @returns Array of objects with id and name properties
   */
  public getSpecialtyOptions(): Array<{id: string, name: string}> {
    const specialties = this.getAllSpecialties();
    return specialties.map(specialty => ({
      id: specialty.id,
      name: specialty.name
    }));
  }
}

export default SpecialtyFilterService;
