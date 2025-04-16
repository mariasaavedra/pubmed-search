/**
 * Strong TypeScript definitions for PubMed E-Utilities API
 * Based on https://www.ncbi.nlm.nih.gov/books/NBK25497/
 */

// Common API parameters used across all E-Utilities
export interface BaseEUtilsParams {
  /** Application name (required) */
  tool: string;
  /** Contact email (required) */
  email: string;
  /** API key for higher rate limits */
  api_key?: string;
}

// Common database parameter used in most requests
export interface DbParam {
  /** NCBI database name */
  db: string;
}

// History server parameters
export interface HistoryParams {
  /** Uses NCBI history server - returns WebEnv value */
  usehistory?: 'y' | 'n';
  /** WebEnv value returned from a previous ESearch, EPost or ELink */
  WebEnv?: string;
  /** Query key returned from a previous ESearch, EPost or ELink */
  query_key?: string;
}

// Response mode and type parameters
export interface FormatParams {
  /** Return mode - JSON or XML */
  retmode?: 'json' | 'xml' | 'text';
  /** Return type - varies by database */
  rettype?: string;
}

// Pagination parameters
export interface PaginationParams {
  /** Maximum number of results to return */
  retmax?: number;
  /** Number of IDs to skip (for pagination) */
  retstart?: number;
}

// ====== EInfo API ======

export interface EInfoParams extends BaseEUtilsParams, Partial<DbParam> {
  /** API version */
  version?: '1.0' | '2.0';
}

// EInfo response types depend on whether db is specified and version
export interface EInfoDatabaseList {
  einforesult: {
    dblist: string[];
  };
}

export interface EInfoDatabaseInfo {
  einforesult: {
    dbinfo: {
      dbname: string;
      menuname: string;
      description: string;
      dbbuild: string;
      count: string;
      lastupdate: string;
      fieldlist: Array<{
        name: string;
        fullname: string;
        description: string;
        termcount: string;
        isdate: string;
        isnumerical: string;
        singletoken: string;
        hierarchy: string;
        ishidden: string;
      }>;
      linklist?: Array<{
        name: string;
        menu: string;
        description: string;
        dbto: string;
      }>;
    };
  };
}

// ====== ESearch API ======

export interface ESearchParams extends 
  BaseEUtilsParams, 
  DbParam, 
  PaginationParams, 
  HistoryParams,
  FormatParams 
{
  /** Search term */
  term: string;
  /** Sort results */
  sort?: string;
  /** Field to restrict search */
  field?: string;
  /** Date range restriction (YYYY/MM/DD format) */
  datetype?: string;
  /** Start date for date range */
  reldate?: number;
  /** Minimum date */
  mindate?: string;
  /** Maximum date */
  maxdate?: string;
}

export interface ESearchResponse {
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
    translationstack?: Array<string | { term: string; field: string; count: string; explode: string }>;
    querytranslation: string;
    errorlist?: {
      phrasesnotfound: string[];
      fieldsnotfound: string[];
    };
    warninglist?: {
      phrasesignored: string[];
      quotedphrasesnotfound: string[];
      outputmessage: string[];
    };
  };
}

// ====== ESummary API ======

export interface ESummaryParams extends 
  BaseEUtilsParams, 
  DbParam, 
  HistoryParams, 
  FormatParams 
{
  /** Comma-separated list of UIDs */
  id?: string;
  /** Date to sort results by */
  sort?: string;
}

// ESummary has different response structures based on the database
// This is a generic type, specific databases would extend this
export interface ESummaryResponse {
  header?: {
    type: string;
    version: string;
  };
  result: {
    [uid: string]: {
      uid: string;
      [key: string]: any;
    };
  } & {
    uids: string[];
  };
}

// PubMed specific ESummary response
export interface PubmedESummaryResponse extends ESummaryResponse {
  result: {
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate?: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      lastauthor: string;
      title: string;
      sortfirstauthor: string;
      volume?: string;
      issue?: string;
      pages?: string;
      lang: string[];
      nlmuniqueid: string;
      issn?: string;
      essn?: string;
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
  } & {
    uids: string[];
  };
}

// ====== EFetch API ======

export interface EFetchParams extends 
  BaseEUtilsParams, 
  DbParam, 
  HistoryParams, 
  FormatParams 
{
  /** Comma-separated list of UIDs */
  id?: string;
  /** Number of items to retrieve */
  retmax?: number;
  /** Offset of first item to retrieve */
  retstart?: number;
  /** Sequence range to retrieve */
  seq_start?: number;
  /** End of sequence range */
  seq_stop?: number;
  /** Mode for strand selector */
  strand?: number;
  /** Enable complexity filtering */
  complexity?: number;
}

// EFetch response types depend on the database and retmode/rettype
// Raw XML or text is often returned

// ====== EPost API ======

export interface EPostParams extends BaseEUtilsParams, DbParam {
  /** Comma-separated list of UIDs */
  id: string;
}

export interface EPostResponse {
  header?: {
    type: string;
    version: string;
  };
  epostresult: {
    querykey: string;
    webenv: string;
  };
}

// ====== ELink API ======

export interface ELinkParams extends BaseEUtilsParams, HistoryParams, FormatParams {
  /** Database to link from */
  dbfrom: string;
  /** Database to link to */
  db?: string;
  /** Comma-separated list of UIDs */
  id?: string;
  /** Link name - use to limit results to a specific link type */
  linkname?: string;
  /** Link command - cmd=neighbor, cmd=acheck, etc. */
  cmd?: 'neighbor' | 'neighbor_score' | 'neighbor_history' | 'acheck' | 'ncheck' | 'llinks' | 'lcheck' | 'prlinks';
  /** Date range to limit results */
  term?: string;
  /** Hold UIDs in history server */
  holding?: string;
  /** Date/time range */
  datetype?: string;
  /** Relative date range */
  reldate?: number;
  /** Minimum date */
  mindate?: string;
  /** Maximum date */
  maxdate?: string;
}

// ELink response types depend on the cmd parameter
export interface ELinkNeighborResponse {
  header?: {
    type: string;
    version: string;
  };
  linksets: Array<{
    dbfrom: string;
    ids: string[];
    linksetdbs?: Array<{
      dbto: string;
      linkname: string;
      links: string[];
    }>;
    ERROR?: string;
  }>;
}

// ====== EGQuery API ======

export interface EGQueryParams extends BaseEUtilsParams {
  /** Search term */
  term: string;
}

export interface EGQueryResponse {
  header?: {
    type: string;
    version: string;
  };
  eGQueryResult: {
    resultItem: Array<{
      DbName: string;
      MenuName: string;
      Count: string;
      Status: string;
    }>;
  };
}

// ====== ESpell API ======

export interface ESpellParams extends BaseEUtilsParams {
  /** Database to check spelling */
  db: string;
  /** Search term to check spelling */
  term: string;
}

export interface ESpellResponse {
  header?: {
    type: string;
    version: string;
  };
  eSpellResult: {
    Database: string;
    Query: string;
    CorrectedQuery: string;
    SpelledQuery: string;
    ERROR?: string;
  };
}

// ====== ECitMatch API ======

export interface ECitMatchParams extends BaseEUtilsParams {
  /** Database */
  db: string;
  /** Journal abbreviation */
  bdata: string;
  /**
   * Citation string(s)
   * Format: journal|year|volume|first page|author|your_key
   * Multiple citations can be separated by a pipe
   */
  citation: string;
}

export interface ECitMatchResponse {
  // Response is tab-delimited text
  // We'll need to parse it manually
  raw: string;
}
