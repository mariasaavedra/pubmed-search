import https from 'https';
import http from 'http';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Logger } from '../utils/logger';
import EUtilitiesService from './e-utilities.service';

/**
 * Service for fetching and extracting full text content from scientific articles
 * using DOI links or PubMed pages
 */
class FullTextFetcherService {
  private readonly FETCH_TIMEOUT = 20000; // 20 seconds timeout
  private readonly USER_AGENT = 'Mozilla/5.0 (compatible; PubMedSearchBot/1.0)';
  private eutils: EUtilitiesService;
  
  constructor() {
    // Initialize the E-utilities service
    this.eutils = new EUtilitiesService('msaav3@gmail.com');
  }
  
  /**
   * Fetch full text content from a DOI URL
   * @param doi DOI identifier (e.g., "10.1186/s12889-018-5861-3")
   * @returns Extracted article content or null if not accessible
   */
  public async fetchArticleByDoi(doi: string): Promise<string | null> {
    try {
      // Format DOI URL
      const doiUrl = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
      Logger.debug('FullTextFetcherService', `Fetching article from DOI: ${doiUrl}`);
      
      // Fetch HTML content
      const html = await this.fetchHtmlWithTimeout(doiUrl);
      if (!html || html.includes('Error fetching content:')) {
        Logger.warn('FullTextFetcherService', `Failed to fetch DOI content: ${doiUrl}`);
        return null;
      }
      
      // Extract article content
      return this.extractArticleContent(html);
    } catch (error) {
      Logger.error('FullTextFetcherService', `Error fetching DOI ${doi}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch article abstract directly from PubMed API using E-utilities
   * This provides cleaner, more structured abstract text
   * @param pmid PubMed ID
   * @returns Clean abstract text or null if not available
   */
  public async fetchAbstractByEutils(pmid: string): Promise<string | null> {
    try {
      Logger.debug('FullTextFetcherService', `Fetching abstract via E-utilities for PMID: ${pmid}`);
      
      // Use efetch with text mode and abstract type
      const abstractText = await this.eutils.efetch({
        id: pmid,
        retmode: 'text',
        rettype: 'abstract'
      });
      
      if (!abstractText || abstractText.trim().length === 0) {
        Logger.warn('FullTextFetcherService', `No abstract content found via E-utilities for PMID: ${pmid}`);
        return null;
      }
      
      Logger.debug('FullTextFetcherService', `Successfully fetched abstract via E-utilities for PMID: ${pmid}`);
      return abstractText.trim();
    } catch (error) {
      Logger.error('FullTextFetcherService', `Error fetching abstract via E-utilities for PMID ${pmid}:`, error);
      return null;
    }
  }
  
  /**
   * Fetch full text content from PubMed using PMID
   * @param pmid PubMed ID
   * @returns Extracted article content or null if not accessible
   */
  public async fetchArticleByPmid(pmid: string): Promise<string | null> {
    try {
      // Format PubMed URL
      const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
      Logger.debug('FullTextFetcherService', `Fetching article from PubMed: ${pubmedUrl}`);
      
      // Fetch HTML content
      const html = await this.fetchHtmlWithTimeout(pubmedUrl);
      if (!html || html.includes('Error fetching content:')) {
        Logger.warn('FullTextFetcherService', `Failed to fetch PubMed content: ${pubmedUrl}`);
        return null;
      }
      
      // Extract article content from PubMed page
      return this.extractPubmedArticleContent(html);
    } catch (error) {
      Logger.error('FullTextFetcherService', `Error fetching PMID ${pmid}:`, error);
      return null;
    }
  }
  
  /**
   * Extract article content from HTML using JSDOM
   * @param html HTML content of the article page
   * @returns Extracted article text
   */
  private extractArticleContent(html: string): string {
    try {
      // Create virtual console to suppress JSDOM warnings
      const virtualConsole = new VirtualConsole();
      virtualConsole.on('error', () => {});
      virtualConsole.on('warn', () => {});
      
      // Parse HTML with JSDOM
      const dom = new JSDOM(html, { 
        runScripts: 'outside-only',
        resources: 'usable',
        virtualConsole
      });
      
      const document = dom.window.document;
      
      // Remove non-content elements
      document.querySelectorAll(
        'script, style, nav, header, footer, aside, .sidebar, .advertisement, .ad, [role="banner"], [role="navigation"]'
      ).forEach(el => el.remove());
      
      // Find main content element
      const mainContent = 
        document.querySelector('main') || 
        document.querySelector('article') || 
        document.querySelector('.article') || 
        document.querySelector('.content') || 
        document.querySelector('#content') || 
        document.body;
      
      if (!mainContent) {
        Logger.warn('FullTextFetcherService', 'Could not identify main content element');
        return '';
      }
      
      // Extract metadata
      const title = document.querySelector('h1, .article-title')?.textContent?.trim() || '';
      const abstract = document.querySelector('.abstract, #abstract')?.textContent?.trim() || '';
      
      // Extract main content elements
      const contentElements = mainContent.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, li, blockquote, .section, .body, .article-section'
      );
      
      let contentText = Array.from(contentElements)
        .map(el => el.textContent?.trim())
        .filter(Boolean)
        .join('\n\n');
      
      // Build full text with structure
      let fullText = title ? `${title}\n\n` : '';
      fullText += abstract ? `Abstract:\n${abstract}\n\n` : '';
      fullText += contentText;

      Logger.info('FullTextFetcherService', `Extracted content length: ${JSON.stringify(fullText)}`);
      
      return fullText;
    } catch (error) {
      Logger.error('FullTextFetcherService', 'Error extracting article content:', error);
      return '';
    }
  }
  
  /**
   * Extract article content specifically from PubMed pages
   * @param html HTML content of the PubMed page
   * @returns Extracted article text
   */
  private extractPubmedArticleContent(html: string): string {
    try {
      // Create virtual console to suppress JSDOM warnings
      const virtualConsole = new VirtualConsole();
      virtualConsole.on('error', () => {});
      virtualConsole.on('warn', () => {});
      
      // Parse HTML with JSDOM
      const dom = new JSDOM(html, { 
        runScripts: 'outside-only',
        resources: 'usable',
        virtualConsole
      });
      
      const document = dom.window.document;
      
      // Extract PubMed specific content
      const title = document.querySelector('.heading-title')?.textContent?.trim() || '';
      const authors = document.querySelector('.authors-list')?.textContent?.trim() || '';
      const journal = document.querySelector('.journal-citation')?.textContent?.trim() || '';
      
      // Get abstract sections
      const abstractSections = document.querySelectorAll('.abstract-section');
      let abstract = '';
      
      if (abstractSections.length > 0) {
        abstract = Array.from(abstractSections)
          .map(section => {
            const label = section.querySelector('.abstract-label')?.textContent?.trim() || '';
            const text = section.querySelector('.abstract-content')?.textContent?.trim() || '';
            return label ? `${label}: ${text}` : text;
          })
          .filter(Boolean)
          .join('\n\n');
      } else {
        // Fallback to general abstract
        abstract = document.querySelector('.abstract, .abstract-content')?.textContent?.trim() || '';
      }
      
      // Check for full text links
      const fullTextLinks = document.querySelectorAll('.full-text-links-list a');
      const links = Array.from(fullTextLinks)
        .map(link => link.getAttribute('href'))
        .filter(Boolean)
        .join('\n');
      
      // Build full text
      let fullText = title ? `${title}\n\n` : '';
      fullText += authors ? `Authors: ${authors}\n\n` : '';
      fullText += journal ? `Journal: ${journal}\n\n` : '';
      fullText += abstract ? `Abstract:\n${abstract}\n\n` : '';
      
      if (links) {
        fullText += `Full Text Links:\n${links}\n\n`;
      }
      
      return fullText;
    } catch (error) {
      Logger.error('FullTextFetcherService', 'Error extracting PubMed content:', error);
      return '';
    }
  }
  
  /**
   * Helper method to fetch HTML with timeout
   * @param url URL to fetch
   * @returns HTML content as string
   */
  private fetchHtmlWithTimeout(url: string): Promise<string> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        Logger.warn('FullTextFetcherService', `Request timed out for ${url}`);
        resolve('');
      }, this.FETCH_TIMEOUT);
      
      this.fetchHtml(url)
        .then(html => {
          clearTimeout(timeoutId);
          resolve(html);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          Logger.error('FullTextFetcherService', `Error fetching ${url}:`, error);
          resolve('');
        });
    });
  }
  
  /**
   * Fetch HTML content from a URL
   * @param url URL to fetch
   * @returns HTML content as string
   */
  private fetchHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      
      const options = {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: this.FETCH_TIMEOUT
      };
      
      const request = protocol.get(url, options, response => {
        // Handle redirects
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const redirectUrl = new URL(response.headers.location, url).toString();
          this.fetchHtml(redirectUrl)
            .then(resolve)
            .catch(reject);
          return;
        }
        
        // Collect response data
        let data = '';
        response.on('data', chunk => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve(data);
        });
      });
      
      request.on('error', error => {
        reject(error);
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timed out for ${url}`));
      });
    });
  }
}

export default FullTextFetcherService;
