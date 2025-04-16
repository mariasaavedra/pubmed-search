// Type definitions for the PubMed Search API
import { FILTER_MAP } from "../config/pubmed-config";

/**
 * Metadata about field encoding
 */
export interface EncodingMetadata {
  field_name: string;
  encoding: "base64" | "none";
}

// Utility types for configuration
export type ClinicalCategory = keyof typeof FILTER_MAP;
export type ClinicalScope = keyof (typeof FILTER_MAP)[ClinicalCategory];

// Search result storage types
export interface SavedSearchResult {
  clinical_category: ClinicalCategory;
  clinical_scope: ClinicalScope;
  esearch_query: string;
  article_count: number;
  clinical_specialty: string;
  pmids: string[];
  articles: Article[];
  encoding_metadata?: {
    tables: "base64";
    original_xml: "base64";
    sanitized_html: "base64";
  };
}

// Request type definitions
export interface ArticleRequest {
  specialty: string;
  topics?: string[];
  filters?: {
    clinical_queries?: string[];
    age_group?: string;
    year_range?: number;
    specialty?: string;     // Specialty ID for filtering
    article_types?: string[]; // Article types to filter by
  };
  page?: number;
  limit?: number;
}

// Response type definitions
export interface ArticleResponse {
  articles: Article[];
  meta: {
    total: number;
    processing_time: number;
    saved_filename: string;
    encoding?: {
      tables: "base64";
      original_xml: "base64";
      sanitized_html: "base64";
    };
  };
}

export interface MeshQualifier {
  descriptor: string;                     // Main MeSH heading/descriptor
  qualifiers: string[];                   // Qualifier terms like "therapy", "diagnosis", etc.
  major_topic: boolean;                   // Whether this is marked as a major topic
}

export interface Article {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_date: string;
  abstract: string;
  url: string;
  scores: {
    relevance: number;
    journal_impact: number;
  };
  mesh_terms?: string[];                  // MeSH terms associated with the article
  mesh_qualifiers?: MeshQualifier[];      // Array of MeSH qualifiers with their descriptors
  publication_type?: string[];            // PubMed publication types array
  article_type?: string;                  // e.g., "Review", "Clinical Trial", "Guideline", "Case Report"
  primary_category?: string;              // Primary category derived from MeSH terms
  secondary_categories?: string[];        // Secondary categories
  specialty_tags?: string[];              // Derived specialty tags
  full_text?: string;                     // Full text content fetched from DOI or PubMed
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures?: string[];
  tables?: string[];
  supplementary_material?: string[];
  original_xml?: string;
  sanitized_html?: string;
}

// PubMed API response types
export interface PubmedSearchResponse {
  header: {
    type: string;
    version: string;
  };
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    translationset: Array<{
      from: string;
      to: string;
    }>;
    querytranslation: string;
  };
}

export interface PubmedSummaryResponse {
  result: {
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      lastauthor: string;
      title: string;
      sortfirstauthor: string;
      volume: string;
      issue: string;
      pages: string;
      lang: string[];
      nlmuniqueid: string;
      issn: string;
      essn: string;
      pubtype: string[];
      recordstatus: string;
      pubstatus: string;
      articleids: Array<{
        idtype: string;
        idtypen: number;
        value: string;
      }>;
      fulljournalname: string;
      sortpubdate: string;
      sortdate: string;
    };
  };
}

// Category mapping types
export interface CategoryMapping {
  id: string;                             // Category identifier
  name: string;                           // Display name
  description: string;                    // Short description of the category
  color: string;                          // Hex color code for later UI integration
  mesh_descriptors: string[];             // MeSH descriptors that map to this category
  mesh_qualifiers?: string[];             // MeSH qualifiers that map to this category
  publication_types?: string[];           // Publication types that map to this category
  priority: number;                       // Sorting priority (lower numbers appear first)
}

export interface ArticleTypeDefinition {
  id: string;                             // Type identifier
  name: string;                           // Display name
  description: string;                    // Short description
  color: string;                          // Hex color code for later UI integration
  pubmed_types: string[];                 // PubMed publication types that match this definition
  priority: number;                       // Sorting priority
}

export interface SpecialtyFilter {
  id: string;
  name: string;
  description: string;
  mesh_terms: string[];
  sub_specialties?: SpecialtyFilter[];
}

// Internal processing types
export interface ProcessedBlueprint {
  specialty: string;
  topics: string[];
  filters: {
    clinical_queries: string[];
    age_group?: string;
    year_range: number;
    article_types?: string[];            // Filter by article types
  };
}

export interface JournalMetrics {
  title: string;
  impact_factor?: number;
  h_index?: number;
  sjr_score?: number;
}

export interface RankedArticleData extends Article {
  scores: {
    relevance: number;
    journal_impact: number;
  };
}

export interface QueryFilters {
  clinical_queries: string[];
  age_group?: string;
  year_range: number;
}

/**
 * Content extraction result from article processing
 */
export interface ContentExtractionResult {
  full_text: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures: string[];
  tables: string[];
  supplementary_material: string[];
  original_xml?: string;
  sanitized_html?: string;
}
