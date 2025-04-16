import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';
import { Logger } from '../utils/logger';
import RateLimiter from '../utils/rate-limiter';

/**
 * Interface for content extraction results
 */
interface ContentExtractionResult {
  full_text: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures: string[];
  tables: string[];
  supplementary_material: string[];
}

/**
 * Service for extracting and normalizing article content
 */
class ArticleContentService {
  private rate_limiter: RateLimiter;

  constructor() {
    // Initialize rate limiter - conservative limits to avoid blocking
    this.rate_limiter = new RateLimiter(2, 1000); // 2 concurrent, 1 second between requests
    Logger.debug('ArticleContentService', 'Initialized with rate limiting');
  }

  /**
   * Extract content from a DOI URL
   * @param doi DOI of the article
   * @returns Normalized content
   */
  public async extractContentFromDOI(doi: string): Promise<ContentExtractionResult> {
    try {
      await this.rate_limiter.WaitForSlot();
      Logger.debug('ArticleContentService', `Extracting content for DOI: ${doi}`);

      // Convert DOI to URL
      const url = `https://doi.org/${doi}`;
      
      // Use puppeteer for initial page load (handles JavaScript)
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        const content = await page.content();
        
        // Parse with jsdom
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        // Extract content
        const result = this.normalizeContent(document);
        
        Logger.debug('ArticleContentService', `Successfully extracted content for DOI: ${doi}`);
        return result;
      } finally {
        await browser.close();
      }
    } catch (error) {
      Logger.error('ArticleContentService', `Error extracting content for DOI: ${doi}`, error);
      throw new Error(`Failed to extract content for DOI: ${doi}`);
    }
  }

  /**
   * Extract content from PubMed article page
   * @param pmid PubMed ID
   * @returns Normalized content
   */
  public async extractContentFromPubMed(pmid: string): Promise<ContentExtractionResult> {
    try {
      await this.rate_limiter.WaitForSlot();
      Logger.debug('ArticleContentService', `Extracting content for PMID: ${pmid}`);

      const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
      
      // Use puppeteer for initial page load
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        const content = await page.content();
        
        // Parse with jsdom
        const dom = new JSDOM(content);
        const document = dom.window.document;
        
        // Extract content
        const result = this.normalizeContent(document);
        
        Logger.debug('ArticleContentService', `Successfully extracted content for PMID: ${pmid}`);
        return result;
      } finally {
        await browser.close();
      }
    } catch (error) {
      Logger.error('ArticleContentService', `Error extracting content for PMID: ${pmid}`, error);
      throw new Error(`Failed to extract content for PMID: ${pmid}`);
    }
  }

  /**
   * Normalize content from DOM
   * @param document DOM document
   * @returns Normalized content
   */
  private normalizeContent(document: Document): ContentExtractionResult {
    const result: ContentExtractionResult = {
      full_text: '',
      figures: [],
      tables: [],
      supplementary_material: []
    };

    try {
      // Extract full text
      const articleText = document.querySelector('article');
      if (articleText) {
        result.full_text = this.cleanText(articleText.textContent || '');
      }

      // Extract sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          const headingText = heading.textContent?.toLowerCase() || '';
          const content = this.cleanText(section.textContent || '');

          if (headingText.includes('method')) {
            result.methods = content;
          } else if (headingText.includes('result')) {
            result.results = content;
          } else if (headingText.includes('discussion')) {
            result.discussion = content;
          } else if (headingText.includes('conclusion')) {
            result.conclusion = content;
          }
        }
      });

      // Extract figures
      const figures = document.querySelectorAll('figure');
      figures.forEach(figure => {
        const img = figure.querySelector('img');
        if (img && img.src) {
          result.figures.push(img.src);
        }
      });

      // Extract tables
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        result.tables.push(this.cleanText(table.outerHTML));
      });

      // Extract supplementary materials
      const supplements = document.querySelectorAll('a[href*="supplementary"], a[href*="supporting"]');
      supplements.forEach(supp => {
        const href = (supp as HTMLAnchorElement).href;
        if (href) {
          result.supplementary_material.push(href);
        }
      });

      return result;
    } catch (error) {
      Logger.error('ArticleContentService', 'Error normalizing content', error);
      throw new Error('Failed to normalize content');
    }
  }

  /**
   * Clean extracted text
   * @param text Raw text
   * @returns Cleaned text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, '\n') // Normalize line breaks
      .trim();
  }
}

export default ArticleContentService;
