import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DOMParser as XMLDOMParser, Document as XMLDocument } from '@xmldom/xmldom';
import { JSDOM } from 'jsdom';
import { Logger } from '../utils/logger';
import { PUBMED_CONFIG } from '../config/pubmed-config';
import RateLimiter from '../utils/rate-limiter';

import {
  BaseEUtilsParams,
  EInfoParams,
  EInfoDatabaseList,
  EInfoDatabaseInfo,
  ESearchParams,
  ESearchResponse,
  ESummaryParams,
  ESummaryResponse,
  PubmedESummaryResponse,
  EFetchParams,
  EPostParams,
  EPostResponse,
  ELinkParams,
  ELinkNeighborResponse,
  EGQueryParams,
  EGQueryResponse,
  ESpellParams,
  ESpellResponse,
  ECitMatchParams,
  ECitMatchResponse
} from '../types/e-utilities.types';

/**
 * Strongly-typed wrapper for NCBI E-utilities API
 * Provides 1:1 mapping to the E-utilities endpoints
 */
export class EUtilitiesService {
  private baseUrl: string;
  private apiKey: string | undefined;
  private rateLimiter: RateLimiter;
  private appName: string = 'PubmedSearchApp';
  private contactEmail: string;
  private xmlParser: XMLDOMParser;

  constructor(contactEmail: string) {
    this.baseUrl = PUBMED_CONFIG.base_url;
    this.apiKey = process.env.PUBMED_API_KEY;
    this.contactEmail = contactEmail;
    this.xmlParser = new XMLDOMParser();

    // Initialize rate limiter based on config
    this.rateLimiter = new RateLimiter(
      PUBMED_CONFIG.rate_limit.max_concurrent,
      PUBMED_CONFIG.rate_limit.min_time
    );

    Logger.debug('EUtilitiesService', 'Initialized with configuration', {
      baseUrl: this.baseUrl,
      apiKeyPresent: !!this.apiKey,
      contactEmail: this.contactEmail,
      rateLimit: {
        maxConcurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
        minTime: PUBMED_CONFIG.rate_limit.min_time,
      },
    });
  }

  /**
   * Add common API parameters to requests
   */
  private addCommonParams<T extends BaseEUtilsParams>(params: Partial<T>): T {
    return {
      ...params,
      tool: this.appName,
      email: this.contactEmail,
      api_key: this.apiKey,
    } as T;
  }

  /**
   * Execute API request with rate limiting
   */
  private async executeRequest<T>(
    endpoint: string, 
    params: Record<string, any>, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();
    Logger.debug('EUtilitiesService', `Rate limit slot acquired for ${endpoint}`);

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      Logger.debug('EUtilitiesService', `Making request to ${url}`, { params });
      
      const startTime = Date.now();
      const response = await axios.get<T>(url, {
        params,
        ...config
      });
      const duration = Date.now() - startTime;
      
      Logger.debug('EUtilitiesService', `Request to ${endpoint} completed in ${duration}ms`);
      
      return response.data;
    } catch (error) {
      Logger.error('EUtilitiesService', `Error in ${endpoint} request`, error);
      throw new Error(`E-utilities ${endpoint} request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse XML response to Document
   */
  public parseXML(xmlString: string): XMLDocument {
    return this.xmlParser.parseFromString(xmlString, 'text/xml');
  }

  /**
   * Create a JSDOM instance from HTML/XML
   */
  public createDOM(content: string): JSDOM {
    return new JSDOM(content);
  }

  /**
   * EInfo: Get information about NCBI databases
   * @param params EInfo parameters
   * @returns Database information
   */
  public async einfo(params: Partial<EInfoParams> = {}): Promise<EInfoDatabaseList | EInfoDatabaseInfo> {
    const fullParams = this.addCommonParams<EInfoParams>(params);
    return this.executeRequest<EInfoDatabaseList | EInfoDatabaseInfo>(
      PUBMED_CONFIG.esearch, 
      fullParams
    );
  }

  /**
   * ESearch: Search Entrez databases
   * @param params ESearch parameters
   * @returns Search results
   */
  public async esearch(params: Partial<ESearchParams>): Promise<ESearchResponse> {
    const fullParams = this.addCommonParams<ESearchParams>({
      db: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<ESearchResponse>(
      PUBMED_CONFIG.esearch, 
      fullParams
    );
  }

  /**
   * ESummary: Retrieve document summaries
   * @param params ESummary parameters
   * @returns Document summaries
   */
  public async esummary<T extends ESummaryResponse = ESummaryResponse>(
    params: Partial<ESummaryParams>
  ): Promise<T> {
    const fullParams = this.addCommonParams<ESummaryParams>({
      db: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<T>(
      PUBMED_CONFIG.esummary, 
      fullParams
    );
  }

  /**
   * EFetch: Retrieve formatted data records
   * @param params EFetch parameters
   * @returns Raw formatted data (XML, text, etc.)
   */
  public async efetch(params: Partial<EFetchParams>): Promise<string> {
    const fullParams = this.addCommonParams<EFetchParams>({
      db: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<string>(
      PUBMED_CONFIG.efetch, 
      fullParams,
      { responseType: 'text' }
    );
  }

  /**
   * EFetch with XML parsing: Retrieve and parse XML records
   * @param params EFetch parameters
   * @returns Parsed XML Document
   */
  public async efetchXML(params: Partial<EFetchParams>): Promise<XMLDocument> {
    const xml = await this.efetch({
      ...params,
      retmode: 'xml'
    });
    
    return this.parseXML(xml);
  }

  /**
   * EPost: Upload UIDs to server
   * @param params EPost parameters
   * @returns EPost response with WebEnv and query_key
   */
  public async epost(params: Partial<EPostParams>): Promise<EPostResponse> {
    const fullParams = this.addCommonParams<EPostParams>({
      db: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<EPostResponse>(
      '/epost.fcgi', 
      fullParams
    );
  }

  /**
   * ELink: Find related records
   * @param params ELink parameters
   * @returns ELink response
   */
  public async elink(params: Partial<ELinkParams>): Promise<ELinkNeighborResponse> {
    const fullParams = this.addCommonParams<ELinkParams>({
      dbfrom: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<ELinkNeighborResponse>(
      '/elink.fcgi', 
      fullParams
    );
  }

  /**
   * EGQuery: Global query across databases
   * @param params EGQuery parameters
   * @returns EGQuery response
   */
  public async egquery(params: Partial<EGQueryParams>): Promise<EGQueryResponse> {
    const fullParams = this.addCommonParams<EGQueryParams>(params);
    
    return this.executeRequest<EGQueryResponse>(
      '/egquery.fcgi', 
      fullParams
    );
  }

  /**
   * ESpell: Get spelling suggestions
   * @param params ESpell parameters
   * @returns ESpell response
   */
  public async espell(params: Partial<ESpellParams>): Promise<ESpellResponse> {
    const fullParams = this.addCommonParams<ESpellParams>({
      db: 'pubmed',
      ...params,
    });
    
    return this.executeRequest<ESpellResponse>(
      '/espell.fcgi', 
      fullParams
    );
  }

  /**
   * ECitMatch: Match citation strings
   * @param params ECitMatch parameters
   * @returns Raw text response
   */
  public async ecitmatch(params: Partial<ECitMatchParams>): Promise<ECitMatchResponse> {
    const fullParams = this.addCommonParams<ECitMatchParams>({
      db: 'pubmed',
      ...params,
    });
    
    const rawText = await this.executeRequest<string>(
      '/ecitmatch.cgi', 
      fullParams,
      { responseType: 'text' }
    );
    
    return { raw: rawText };
  }
}

export default EUtilitiesService;
