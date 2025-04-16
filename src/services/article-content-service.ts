import { JSDOM, VirtualConsole } from "jsdom";
import puppeteer from "puppeteer";
import { Logger } from "../utils/logger";
import RateLimiter from "../utils/rate-limiter";
import { ContentExtractionResult } from "../types";

/**
 * Service for extracting and normalizing article content
 */
class ArticleContentService {
  private rate_limiter: RateLimiter;

  constructor() {
    // Initialize rate limiter - conservative limits to avoid blocking
    this.rate_limiter = new RateLimiter(2, 1000); // 2 concurrent, 1 second between requests
    Logger.debug("ArticleContentService", "Initialized with rate limiting");
  }

  /**
   * Extract content from PubMed article page
   * @param pmid PubMed ID
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content
   */
  public async extractContentFromPubMed(
    pmid: string,
    original_xml?: string
  ): Promise<ContentExtractionResult> {
    try {
      await this.rate_limiter.WaitForSlot();
      Logger.debug(
        "ArticleContentService",
        `Extracting content for PMID: ${pmid}`
      );

      const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

      // Create virtual console to suppress JSDOM warnings
      const virtualConsole = new VirtualConsole();
      virtualConsole.on("error", () => {});
      virtualConsole.on("warn", () => {});

      // Use puppeteer for initial page load
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      try {
        Logger.debug("ArticleContentService", `Navigating to URL: ${url}`);
        // Set a page timeout
        await page.setDefaultNavigationTimeout(30000);
        await page.goto(url, { waitUntil: "networkidle0" });
        const content = await page.content();
        Logger.debug("ArticleContentService", `Page loaded successfully`);
        // Parse with enhanced JSDOM configuration
        const dom = new JSDOM(content, {
          runScripts: "outside-only",
          resources: "usable",
          virtualConsole,
        });
        Logger.debug("ArticleContentService", `JSDOM initialized successfully`);
        const document = dom.window.document;

        // Remove non-content elements
        document
          .querySelectorAll(
            "script, style, nav, header, footer, .aside-section, .author-section, iframe"
          )
          .forEach((el) => el.remove());

        // Extract content
        const result = this.normalizeContent(document, original_xml);
        Logger.debug(
          "ArticleContentService",
          `Content extraction completed for PMID: ${pmid}`
        );
        Logger.debug(
          "ArticleContentService",
          `Successfully extracted content for PMID: ${pmid}`,
          {
            has_full_text: !!result.full_text,
            has_methods: !!result.methods,
            has_results: !!result.results,
            has_discussion: !!result.discussion,
            has_conclusion: !!result.conclusion,
            has_sanitized_html: !!result.sanitized_html,
            has_original_xml: !!result.original_xml,
            figure_count: result.figures.length,
            table_count: result.tables.length,
            supplementary_count: result.supplementary_material.length,
          }
        );
        return result;
      } finally {
        await browser.close();
      }
    } catch (error) {
      Logger.error(
        "ArticleContentService",
        `Error extracting content for PMID: ${pmid}`,
        error
      );
      throw new Error(`Failed to extract content for PMID: ${pmid}`);
    }
  }

  /**
   * Normalize content from DOM with enhanced HTML preservation
   * @param document DOM document
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content with HTML
   */
  private normalizeContent(
    document: Document,
    original_xml?: string
  ): ContentExtractionResult {
    const result: ContentExtractionResult = {
      full_text: "",
      figures: [],
      tables: [],
      supplementary_material: [],
      original_xml: original_xml,
    };

    try {
      // Extract main content area
      const mainContent =
        document.querySelector("#article-details") ||
        document.querySelector("main") ||
        document.querySelector("article") ||
        document.querySelector(".article-body") ||
        document.body;

      if (mainContent) {
        // Sanitize HTML and store it
        const sanitizedHtml = this.sanitizeHtml(mainContent.outerHTML);
        result.sanitized_html = sanitizedHtml;

        // Extract full text
        result.full_text = this.extractTextContent(mainContent);

        // Extract sections using both attribute and heading detection
        this.extractSections(mainContent, result);

        // Extract figures
        const figures = document.querySelectorAll(
          'figure, .figure, div[class*="figure"]'
        );
        figures.forEach((figure) => {
          const img = figure.querySelector("img");
          if (img && img.src) {
            result.figures.push(img.src);
          }
        });

        // Extract tables
        const tables = document.querySelectorAll(
          'table, .table, div[class*="table"]'
        );
        tables.forEach((table) => {
          result.tables.push(this.sanitizeHtml(table.outerHTML));
        });

        // Extract supplementary materials
        const supplements = document.querySelectorAll(
          'a[href*="supplementary"], a[href*="supporting"], a[href*="supplement"], a[href*="appendix"]'
        );
        supplements.forEach((supp) => {
          const href = (supp as HTMLAnchorElement).href;
          if (href) {
            result.supplementary_material.push(href);
          }
        });
      }

      // Validate content quality
      if (!this.isQualityContent(result.full_text)) {
        Logger.warn("ArticleContentService", "Low-quality content detection");
      }

      return result;
    } catch (error) {
      Logger.error("ArticleContentService", "Error normalizing content", error);
      throw new Error("Failed to normalize content");
    }
  }

  /**
   * Extract text content from an element
   * @param element DOM element
   * @returns Cleaned text content
   */
  private extractTextContent(element: Element): string {
    // Target content-rich elements
    const contentElements = element.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, td, blockquote"
    );

    // If no rich elements are found, fall back to all text
    if (contentElements.length === 0) {
      return this.cleanText(element.textContent || "");
    }

    // Extract and join content from rich elements
    return Array.from(contentElements)
      .map((el) => this.cleanText(el.textContent || ""))
      .filter((text) => text.length > 0)
      .join("\n\n");
  }

  /**
   * Extract section content based on heading text or section attributes
   * @param mainContent Main content element
   * @param result Result object to populate
   */
  private extractSections(
    mainContent: Element,
    result: ContentExtractionResult
  ): void {
    // Try section-based extraction first
    const sections = mainContent.querySelectorAll(
      'section, div[role="region"]'
    );
    let sectionsFound = false;

    sections.forEach((section) => {
      const heading = section.querySelector("h1, h2, h3, h4, h5, h6");
      const sectionId = section.id || "";
      const sectionClass = section.className || "";
      const headingText = heading
        ? (heading.textContent || "").toLowerCase()
        : "";

      // Match by heading text, id, or class
      if (
        headingText.includes("method") ||
        sectionId.includes("method") ||
        sectionClass.includes("method")
      ) {
        result.methods = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("result") ||
        sectionId.includes("result") ||
        sectionClass.includes("result")
      ) {
        result.results = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("discussion") ||
        sectionId.includes("discussion") ||
        sectionClass.includes("discussion")
      ) {
        result.discussion = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("conclusion") ||
        sectionId.includes("conclusion") ||
        sectionClass.includes("conclusion")
      ) {
        result.conclusion = this.extractTextContent(section);
        sectionsFound = true;
      }
    });

    // If no sections found, try heading-based extraction
    if (!sectionsFound) {
      const headings = mainContent.querySelectorAll("h1, h2, h3, h4, h5, h6");

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const headingText = (heading.textContent || "").toLowerCase();
        let content = "";

        // Collect content until the next heading
        let nextElement = heading.nextElementSibling;
        while (nextElement && !nextElement.matches("h1, h2, h3, h4, h5, h6")) {
          content += this.cleanText(nextElement.textContent || "") + "\n\n";
          nextElement = nextElement.nextElementSibling;
        }

        // Assign to the appropriate section
        if (headingText.includes("method")) {
          result.methods = content;
        } else if (headingText.includes("result")) {
          result.results = content;
        } else if (headingText.includes("discussion")) {
          result.discussion = content;
        } else if (headingText.includes("conclusion")) {
          result.conclusion = content;
        }
      }
    }
  }

  /**
   * Sanitize HTML to remove scripts and unsafe elements
   * @param html Raw HTML
   * @returns Sanitized HTML
   */
  private sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "safe-data:")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<link\b[^<]*(?:(?!>)<[^<]*)*>/gi, "")
      .replace(/<meta\b[^<]*(?:(?!>)<[^<]*)*>/gi, "");
  }

  /**
   * Clean extracted text
   * @param text Raw text
   * @returns Cleaned text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n+/g, "\n") // Normalize line breaks
      .trim();
  }

  /**
   * Check if content meets quality standards
   * @param text Content to check
   * @returns True if quality content
   */
  private isQualityContent(text: string): boolean {
    if (!text) return false;

    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;

    return (
      words > 100 &&
      sentences > 5 &&
      avgWordsPerSentence > 5 &&
      avgWordsPerSentence < 30 &&
      !text.includes("Access denied") &&
      !text.includes("Subscription required")
    );
  }
}

export default ArticleContentService;
