import { Document as XMLDocument } from '@xmldom/xmldom';
import { JSDOM } from 'jsdom';
import { Logger } from './logger';
import { ContentExtractionResult } from '../types';

/**
 * Utility class for extracting structured content from PubMed article XML
 * Uses both @xmldom/xmldom for XML parsing and JSDOM for HTML manipulation
 */
export class ArticleContentExtractor {
  /**
   * Extract structured content from article XML
   * @param xmlDoc XML document containing article data
   * @param pmid PubMed ID for reference
   * @returns Structured content extraction result
   */
  public static extractContent(xmlDoc: XMLDocument, pmid: string): ContentExtractionResult {
    try {
      // Initialize result object
      const result: ContentExtractionResult = {
        full_text: '',
        methods: '',
        results: '',
        discussion: '',
        conclusion: '',
        figures: [],
        tables: [],
        supplementary_material: [],
      };

      // Store original XML for reference
      const serializer = new XMLSerializer();
      result.original_xml = serializer.serializeToString(xmlDoc as unknown as Node);

      // Extract full text by combining sections
      const articleNode = xmlDoc.getElementsByTagName('PubmedArticle').item(0);
      if (!articleNode) {
        Logger.warn('ArticleContentExtractor', `No article found for PMID ${pmid}`);
        return result;
      }

      // Extract article title
      const titleNode = articleNode.getElementsByTagName('ArticleTitle').item(0);
      const title = titleNode?.textContent || '';

      // Extract abstract text
      let abstractText = '';
      const abstractNodes = articleNode.getElementsByTagName('AbstractText');
      
      // Check if we have labeled sections in the abstract
      const hasLabeledSections = Array.from(abstractNodes).some(
        node => node.hasAttribute('Label')
      );
      
      if (hasLabeledSections) {
        // Process labeled abstract sections
        for (let i = 0; i < abstractNodes.length; i++) {
          const abstractNode = abstractNodes.item(i);
          if (!abstractNode) continue;
          
          const label = abstractNode.getAttribute('Label') || '';
          const text = abstractNode.textContent || '';
          
          if (label && text) {
            abstractText += `${label}: ${text}\n\n`;
            
            // Extract specific sections
            const lowerLabel = label.toLowerCase();
            if (lowerLabel.includes('method')) {
              result.methods += text + '\n';
            } else if (lowerLabel.includes('result')) {
              result.results += text + '\n';
            } else if (lowerLabel.includes('discussion')) {
              result.discussion += text + '\n';
            } else if (lowerLabel.includes('conclusion')) {
              result.conclusion += text + '\n';
            }
          } else {
            abstractText += text + '\n\n';
          }
        }
      } else {
        // Process undivided abstract
        for (let i = 0; i < abstractNodes.length; i++) {
          const abstractNode = abstractNodes.item(i);
          if (!abstractNode) continue;
          abstractText += abstractNode.textContent + '\n';
        }
      }

      // Combine title and abstract for full text
      result.full_text = `${title}\n\n${abstractText}`;

      // Extract figures, tables, and supplementary materials if available
      this.extractFiguresAndTables(xmlDoc, result);

      // Generate sanitized HTML representation for display
      result.sanitized_html = this.generateSanitizedHTML(title, abstractText, result);

      return result;
    } catch (error) {
      Logger.error('ArticleContentExtractor', `Error extracting content for PMID ${pmid}`, error);
      return {
        full_text: '',
        figures: [],
        tables: [],
        supplementary_material: []
      };
    }
  }

  /**
   * Extract figures and tables from article XML
   * @param xmlDoc XML document
   * @param result Content extraction result to update
   */
  private static extractFiguresAndTables(xmlDoc: XMLDocument, result: ContentExtractionResult): void {
    try {
      // Extract tables
      const tableNodes = xmlDoc.getElementsByTagName('Table');
      for (let i = 0; i < tableNodes.length; i++) {
        const tableNode = tableNodes.item(i);
        if (!tableNode) continue;
        
        const tableWrap = tableNode.parentNode as unknown as Element;
        const labelNode = tableWrap?.getElementsByTagName?.('Label')?.item(0);
        const captionNode = tableWrap?.getElementsByTagName?.('Caption')?.item(0);
        
        const label = labelNode?.textContent || '';
        const caption = captionNode?.textContent || '';
        
        // Extract table content
        let tableContent = '';
        const tableXML = new XMLSerializer().serializeToString(tableNode as unknown as Node);
        
        // Format as string representation
        tableContent = `${label}\n${caption}\n\n${tableXML}`;
        result.tables.push(tableContent);
      }

      // Extract figures
      const figureNodes = xmlDoc.getElementsByTagName('Figure');
      for (let i = 0; i < figureNodes.length; i++) {
        const figureNode = figureNodes.item(i);
        if (!figureNode) continue;
        
        const labelNode = figureNode.getElementsByTagName('Label').item(0);
        const captionNode = figureNode.getElementsByTagName('Caption').item(0);
        
        const label = labelNode?.textContent || '';
        const caption = captionNode?.textContent || '';
        
        // Format as string representation
        const figureText = `${label}\n${caption}`;
        result.figures.push(figureText);
      }

      // Extract supplementary materials
      const suppNodes = xmlDoc.getElementsByTagName('SupplementaryMaterial');
      for (let i = 0; i < suppNodes.length; i++) {
        const suppNode = suppNodes.item(i);
        if (!suppNode) continue;
        
        const captionNode = suppNode.getElementsByTagName('Caption').item(0);
        const caption = captionNode?.textContent || '';
        
        // Look for media or links
        const mediaNodes = suppNode.getElementsByTagName('Media');
        const extLinkNodes = suppNode.getElementsByTagName('ExtLink');
        
        let suppInfo = caption + '\n';
        
        // Add media info
        if (mediaNodes.length > 0) {
          for (let j = 0; j < mediaNodes.length; j++) {
            const mediaNode = mediaNodes.item(j);
            if (!mediaNode) continue;
            
            const mimeType = mediaNode.getAttribute('mime-subtype') || '';
            const fileName = mediaNode.getAttribute('xlink:href') || '';
            suppInfo += `[${mimeType}] ${fileName}\n`;
          }
        }
        
        // Add external links
        if (extLinkNodes.length > 0) {
          for (let j = 0; j < extLinkNodes.length; j++) {
            const linkNode = extLinkNodes.item(j);
            if (!linkNode) continue;
            
            const url = linkNode.getAttribute('xlink:href') || '';
            const text = linkNode.textContent || '';
            suppInfo += `[${text}] ${url}\n`;
          }
        }
        
        result.supplementary_material.push(suppInfo.trim());
      }
    } catch (error) {
      Logger.error('ArticleContentExtractor', 'Error extracting figures and tables', error);
    }
  }

  /**
   * Generate sanitized HTML representation of the article
   * @param title Article title
   * @param abstractText Abstract text
   * @param result Content extraction result
   * @returns Sanitized HTML string
   */
  private static generateSanitizedHTML(
    title: string,
    abstractText: string,
    result: ContentExtractionResult
  ): string {
    try {
      // Create a new JSDOM instance
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      const { document } = dom.window;
      
      // Create article container
      const container = document.createElement('div');
      container.className = 'pubmed-article';
      
      // Add title
      const titleElem = document.createElement('h1');
      titleElem.textContent = title;
      container.appendChild(titleElem);
      
      // Add abstract
      const abstractHeader = document.createElement('h2');
      abstractHeader.textContent = 'Abstract';
      container.appendChild(abstractHeader);
      
      const abstractElem = document.createElement('div');
      abstractElem.className = 'abstract';
      
      // Split abstract by newlines and create paragraphs
      const paragraphs = abstractText.split('\n\n');
      paragraphs.forEach(para => {
        if (!para.trim()) return;
        const p = document.createElement('p');
        p.textContent = para;
        abstractElem.appendChild(p);
      });
      
      container.appendChild(abstractElem);
      
      // Add sections if available
      const sections = [
        { title: 'Methods', content: result.methods },
        { title: 'Results', content: result.results },
        { title: 'Discussion', content: result.discussion },
        { title: 'Conclusion', content: result.conclusion }
      ];
      
      sections.forEach(section => {
        if (!section.content) return;
        
        const sectionHeader = document.createElement('h2');
        sectionHeader.textContent = section.title;
        container.appendChild(sectionHeader);
        
        const sectionElem = document.createElement('div');
        sectionElem.className = section.title.toLowerCase();
        
        const p = document.createElement('p');
        p.textContent = section.content;
        sectionElem.appendChild(p);
        
        container.appendChild(sectionElem);
      });
      
      // Add tables if available
      if (result.tables.length > 0) {
        const tablesHeader = document.createElement('h2');
        tablesHeader.textContent = 'Tables';
        container.appendChild(tablesHeader);
        
        const tablesList = document.createElement('ul');
        tablesList.className = 'tables-list';
        
        result.tables.forEach((table, index) => {
          const item = document.createElement('li');
          item.textContent = `Table ${index + 1}`;
          tablesList.appendChild(item);
        });
        
        container.appendChild(tablesList);
      }
      
      // Add figures if available
      if (result.figures.length > 0) {
        const figuresHeader = document.createElement('h2');
        figuresHeader.textContent = 'Figures';
        container.appendChild(figuresHeader);
        
        const figuresList = document.createElement('ul');
        figuresList.className = 'figures-list';
        
        result.figures.forEach((figure, index) => {
          const item = document.createElement('li');
          item.textContent = `Figure ${index + 1}: ${figure.split('\n')[0]}`;
          figuresList.appendChild(item);
        });
        
        container.appendChild(figuresList);
      }
      
      document.body.appendChild(container);
      
      return dom.serialize();
    } catch (error) {
      Logger.error('ArticleContentExtractor', 'Error generating sanitized HTML', error);
      return `<html><body><h1>${title}</h1><p>${abstractText}</p></body></html>`;
    }
  }
}

export default ArticleContentExtractor;
