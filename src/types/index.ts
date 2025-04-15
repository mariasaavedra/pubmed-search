// Type definitions for the PubMed Search API

// Request type definitions
export interface ArticleRequest {
  specialty: string;
  topics: string[];
  filters?: {
    study_types?: string[];
    age_group?: string;
    year_range?: number;
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
  };
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

export interface PubmedFetchResponse {
  PubmedArticleSet: {
    PubmedArticle: Array<{
      MedlineCitation: {
        PMID: string;
        Article: {
          ArticleTitle: string;
          Abstract: {
            AbstractText: string | Array<{
              _: string;
              Label: string;
              NlmCategory: string;
            }>;
          };
          AuthorList?: {
            Author: Array<{
              LastName?: string;
              ForeName?: string;
              Initials?: string;
              AffiliationInfo?: Array<{
                Affiliation: string;
              }>;
            }>;
          };
          Journal: {
            Title: string;
            JournalIssue: {
              Volume?: string;
              Issue?: string;
              PubDate: {
                Year?: string;
                Month?: string;
                Day?: string;
                MedlineDate?: string;
              };
            };
          };
        };
      };
    }>;
  };
}

// Internal processing types
export interface ProcessedBlueprint {
  specialty: string;
  topics: string[];
  filters: {
    study_types: string[];
    age_group?: string;
    year_range: number;
  };
}

export interface JournalMetrics {
  title: string;
  impact_factor?: number;
  h_index?: number;
  sjr_score?: number;
}

export interface ParsedArticleData {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_date: string;
  abstract: string;
  url: string;
}

export interface RankedArticleData extends ParsedArticleData {
  scores: {
    relevance: number;
    journal_impact: number;
  };
}

export interface QueryFilters {
  study_types: string[];
  age_group?: string;
  year_range: number;
}
