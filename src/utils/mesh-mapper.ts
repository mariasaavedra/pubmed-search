/**
 * Utility class for mapping terms to MeSH (Medical Subject Headings) terms
 */
class MeshMapper {
  // A simple mapping cache to avoid redundant lookups
  private static term_mapping_cache: Record<string, string[]> = {};

  /**
   * Map a term to MeSH terms
   * @param term The term to map
   * @returns Array of MeSH terms
   */
  static MapTerm(term: string): string[] {
    // Check if we already have a cached mapping
    if (this.term_mapping_cache[term.toLowerCase()]) {
      return this.term_mapping_cache[term.toLowerCase()];
    }

    // In a production environment, this would call the PubMed API
    // to get the proper MeSH term mappings. For now, we'll use a simplified approach.
    const mapped_terms = this.SimpleMeshMapping(term);
    
    // Cache the result
    this.term_mapping_cache[term.toLowerCase()] = mapped_terms;
    
    return mapped_terms;
  }

  /**
   * Simplified MeSH term mapping (without API calls)
   * @param term The term to map
   * @returns Array of mapped MeSH terms
   */
  private static SimpleMeshMapping(term: string): string[] {
    // This is a simplified mapping - in production, this would use PubMed's
    // term mapping API or a more comprehensive database
    const normalized_term = term.toLowerCase();
    
    // Some common mappings for demonstration
    const mappings: Record<string, string[]> = {
      "heart failure": ["Heart Failure", "Cardiac Failure"],
      "hypertension": ["Hypertension", "High Blood Pressure"],
      "diabetes": ["Diabetes Mellitus"],
      "cancer": ["Neoplasms", "Tumors"],
      "stroke": ["Stroke", "Cerebrovascular Accident"],
      "asthma": ["Asthma", "Bronchial Asthma"],
      "alzheimer": ["Alzheimer Disease", "Dementia"],
      "parkinson": ["Parkinson Disease"],
      "depression": ["Depression", "Depressive Disorder"],
      "arthritis": ["Arthritis", "Joint Diseases"],
      "copd": ["Pulmonary Disease, Chronic Obstructive", "COPD"],
      "kidney disease": ["Kidney Diseases", "Renal Insufficiency"],
      "liver disease": ["Liver Diseases", "Hepatic Diseases"],
      "obesity": ["Obesity", "Overweight"],
      "pneumonia": ["Pneumonia", "Lung Inflammation"],
      "hiv": ["HIV", "AIDS", "HIV Infections"],
      "tuberculosis": ["Tuberculosis", "TB"],
      "malaria": ["Malaria"],
      "covid": ["COVID-19", "SARS-CoV-2", "Coronavirus"]
    };

    // Check if we have an exact match
    for (const key in mappings) {
      if (normalized_term.includes(key)) {
        return mappings[key];
      }
    }

    // If no match, return the original term formatted for PubMed search
    return [`"${term}"[All Fields]`];
  }

  /**
   * Validate if a term is a valid MeSH term
   * @param term The term to validate
   * @returns True if the term is a valid MeSH term
   */
  static ValidateMeshTerm(term: string): boolean {
    // This is a simplified validation - in production, this would
    // validate against the actual MeSH database
    const mapped_terms = this.MapTerm(term);
    return mapped_terms.length > 0 && mapped_terms[0] !== `"${term}"[All Fields]`;
  }

  /**
   * Get the preferred MeSH term from a list of alternatives
   * @param alternatives Array of alternative terms
   * @returns The preferred MeSH term
   */
  static GetPreferredTerm(alternatives: string[]): string {
    if (alternatives.length === 0) {
      return "";
    }

    // In a real implementation, this would have logic to determine the most
    // specific or relevant MeSH term from the alternatives.
    // For simplicity, we'll just return the first term that ends with [MeSH Terms]
    // or the first term if none match
    const mesh_term = alternatives.find(term => term.endsWith("[MeSH Terms]"));
    return mesh_term || alternatives[0];
  }
}

export default MeshMapper;
