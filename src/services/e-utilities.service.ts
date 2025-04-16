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

    // Determine rate limit parameters based on API key presence
    const hasApiKey = !!this.apiKey;
    const rateConfig = hasApiKey 
      ? {
          maxConcurrent: PUBMED_CONFIG.rate_limit.with_api_key.max_concurrent,
          minTime: PUBMED_CONFIG.rate_limit.min_time_with_key
        }
      : {
          maxConcurrent: PUBMED_CONFIG.rate_limit.without_api_key.max_concurrent,
          minTime: PUBMED_CONFIG.rate_limit.min_time_without_key
        };

    // Initialize rate limiter based on config
    this.rateLimiter = new RateLimiter(
      rateConfig.maxConcurrent,
      rateConfig.minTime
    );

    Logger.debug('EUtilitiesService', 'Initialized with configuration', {
      baseUrl: this.baseUrl,
      apiKeyPresent: hasApiKey,
      contactEmail: this.contactEmail,
      rateLimit: {
        maxConcurrent: rateConfig.maxConcurrent,
        minTime: rateConfig.minTime,
        requestsPerSecond: hasApiKey 
          ? PUBMED_CONFIG.rate_limit.with_api_key.requests_per_second
          : PUBMED_CONFIG.rate_limit.without_api_key.requests_per_second
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
    // Max retries for rate limit errors
    const MAX_RETRIES = 3;
    let retries = 0;
    
    while (true) {
      try {
        await this.rateLimiter.waitForSlot();
        Logger.debug('EUtilitiesService', `Rate limit slot acquired for ${endpoint}`);

        const url = `${this.baseUrl}${endpoint}`;
        
        // Log request including presence of API key (not the actual key)
        Logger.debug('EUtilitiesService', `Making request to ${url}`, { 
          hasApiKey: !!params.api_key,
          endpoint, 
          ...Object.fromEntries(
            Object.entries(params)
              .filter(([key]) => key !== 'api_key')
          ) 
        });
        
        const startTime = Date.now();
        const response = await axios.get<T>(url, {
          params,
          ...config,
          // Add timeout to prevent hanging requests
          timeout: 30000 // 30 seconds
        });
        const duration = Date.now() - startTime;
        
        Logger.debug('EUtilitiesService', `Request to ${endpoint} completed in ${duration}ms`);
        
        return response.data;
      } catch (error) {
        const axiosError = error as any;
        
        // Handle rate limiting errors specifically
        if (axiosError.response && axiosError.response.status === 429) {
          retries++;
          if (retries <= MAX_RETRIES) {
            const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
            Logger.warn('EUtilitiesService', `Rate limit exceeded (429). Retry ${retries}/${MAX_RETRIES} after ${waitTime}ms`);
            
            // Wait for exponential backoff time
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry the request
          }
        }
        
        // Check for other status codes that might indicate rate limiting
        if (axiosError.response && (axiosError.response.status === 503 || axiosError.response.status === 504)) {
          retries++;
          if (retries <= MAX_RETRIES) {
            const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
            Logger.warn('EUtilitiesService', `Server error (${axiosError.response.status}). Retry ${retries}/${MAX_RETRIES} after ${waitTime}ms`);
            
            // Wait for exponential backoff time
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry the request
          }
        }

        // Log detailed error information
        Logger.error('EUtilitiesService', `Error in ${endpoint} request`, {
          message: axiosError.message,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          hasApiKey: !!params.api_key,
          rateLimit: this.rateLimiter.getStatus()
        });
        
        // Throw a more detailed error
        if (axiosError.response) {
          throw new Error(`E-utilities ${endpoint} request failed: HTTP ${axiosError.response.status} - ${axiosError.response.statusText || 'Unknown error'}`);
        } else if (axiosError.request) {
          throw new Error(`E-utilities ${endpoint} request failed: No response received (timeout or network error)`);
        } else {
          throw new Error(`E-utilities ${endpoint} request failed: ${axiosError.message || 'Unknown error'}`);
        }
      }
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
      '/einfo.fcgi', 
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
