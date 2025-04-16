import { Document as XMLDocument } from '@xmldom/xmldom';

/**
 * Journal information from NLM Catalog
 */
export interface Journal {
  nlm_id: string;                      // NLM Catalog ID
  title: string;                       // Full journal title
  medline_abbr?: string;               // Medline abbreviation (used in PubMed)
  issns: string[];                     // Array of ISSNs
  issn_types?: Array<{                 // ISSNs with their types
    type: string;                      // e.g., 'Print', 'Electronic'
    value: string;                     // ISSN value
  }>;
  alternative_titles?: string[];       // Alternative journal titles
  publisher?: string;                  // Publisher name
  currently_indexed: boolean;          // Whether journal is currently indexed
  coverage?: {                         // Coverage information
    medline?: boolean;                 // Indexed in MEDLINE
    pubmedCentral?: boolean;           // Available in PubMed Central
    index_medicus?: boolean;           // In Index Medicus
  };
}

/**
 * Parameters for searching journals
 */
export interface JournalSearchParams {
  title?: string;                      // Search by title (partial match)
  specialty?: string;                  // Filter by specialty
  issn?: string;                       // Search by ISSN (partial match)
  currentlyIndexed?: boolean;          // Filter by indexing status
  medlineCoverage?: boolean;           // Filter by MEDLINE coverage
  pmcCoverage?: boolean;               // Filter by PubMed Central coverage
}

/**
 * Mapping of specialties to journals
 */
export interface JournalsBySpecialty {
  [specialty: string]: Journal[];      // Map of specialty name to journals
}

/**
 * Journal database response format
 */
export interface JournalResponse {
  updated_at: string;                  // Timestamp of last update
  journals: Journal[];                 // Array of journals
}

/**
 * Specialties response format
 */
export interface SpecialtiesResponse {
  updated_at: string;                  // Timestamp of last update
  specialties: {                       // Map of specialty name to journals
    [specialty: string]: Journal[];
  };
}

/**
 * Parameters for NLM Catalog search
 */
export interface NLMCatalogSearchParams {
  query: string;                       // Main search query
  currentlyIndexed?: boolean;          // Filter by current indexing status
  medline?: boolean;                   // Filter by MEDLINE coverage
  pubmedCentral?: boolean;             // Filter by PubMed Central coverage
}

/**
 * Response from journals controller endpoints
 */
export interface JournalControllerResponse {
  count: number;                       // Number of journals in the response
  journals: Journal[];                 // Array of journal objects
  specialty?: string;                  // Optional specialty name (for specialty endpoints)
  query?: string;                      // Original query (for search endpoints)
  message?: string;                    // Success or error message
}

/**
 * Parameters for mapping journals to specialties
 */
export interface JournalSpecialtyMappingRequest {
  specialty: string;                   // Specialty name
  query: string;                       // Query to find journals for the specialty
}
