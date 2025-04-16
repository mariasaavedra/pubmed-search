/**
 * Example script demonstrating the usage of the E-utilities API wrapper
 * and XML/DOM processing with @xmldom/xmldom and jsdom
 */

import dotenv from 'dotenv';
import EUtilitiesService from '../services/e-utilities.service';
import PubmedService from '../services/pubmed-service';
import ArticleContentExtractor from '../utils/article-content-extractor';
import { Logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function runPubmedSearchExample() {
  try {
    Logger.info('Example', 'Starting PubMed search example');
    
    // Initialize the PubMed service
    const pubmedService = new PubmedService();
    
    // Search for articles
    const searchTerm = 'cardiomyopathy treatment guidelines';
    Logger.info('Example', `Searching for: ${searchTerm}`);
    
    // Get article count
    const totalCount = await pubmedService.getArticleCount(searchTerm);
    Logger.info('Example', `Found ${totalCount} matching articles`);
    
    // Get article IDs (first page, 5 results)
    const pmids = await pubmedService.searchArticles(searchTerm, 1, 5);
    Logger.info('Example', `Retrieved ${pmids.length} article IDs: ${pmids.join(', ')}`);
    
    // Fetch article details
    const articles = await pubmedService.fetchArticleDetails(pmids);
    Logger.info('Example', `Retrieved ${articles.length} article details`);
    
    // Display article summaries
    console.log('\n--- ARTICLE SUMMARIES ---');
    articles.forEach((article, index) => {
      console.log(`\n[${index + 1}] ${article.title}`);
      console.log(`Authors: ${article.authors.join(', ')}`);
      console.log(`Journal: ${article.journal}`);
      console.log(`Date: ${article.pub_date}`);
      console.log(`PMID: ${article.pmid}`);
      console.log(`URL: ${article.url}`);
      const abstractPreview = article.abstract.length > 150 
        ? article.abstract.substring(0, 150) + '...' 
        : article.abstract;
      console.log(`Abstract: ${abstractPreview}`);
    });
    
    // Initialize E-utilities service directly for advanced usage
    console.log('\n--- DIRECT E-UTILITIES API USAGE ---');
    const eutils = new EUtilitiesService(process.env.CONTACT_EMAIL || 'example@example.com');
    
    // Get spelling suggestions
    const spellResult = await eutils.espell({
      term: 'cardimyopthy',
    });
    console.log(`\nSpelling suggestion for "cardimyopthy": ${spellResult.eSpellResult.CorrectedQuery}`);
    
    // Get related articles for the first PMID
    if (pmids.length > 0) {
      const linkResults = await eutils.elink({
        dbfrom: 'pubmed',
        id: pmids[0],
        cmd: 'neighbor',
      });
      
      const relatedPmids = linkResults.linksets[0]?.linksetdbs?.find(
        db => db.linkname === 'pubmed_pubmed'
      )?.links.slice(0, 3) || [];
      
      console.log(`\nRelated articles for PMID ${pmids[0]}: ${relatedPmids.join(', ')}`);
    }
    
    // Fetch and parse XML for the first article
    console.log('\n--- XML PROCESSING EXAMPLE ---');
    if (pmids.length > 0) {
      const xmlDoc = await eutils.efetchXML({
        id: pmids[0],
      });
      
      // Extract content using our extractor utility
      const extractedContent = ArticleContentExtractor.extractContent(xmlDoc, pmids[0]);
      
      console.log(`\nExtracted content for PMID ${pmids[0]}:`);
      console.log(`- Full text length: ${extractedContent.full_text.length} characters`);
      console.log(`- Methods section: ${extractedContent.methods ? 'Present' : 'Not present'}`);
      console.log(`- Results section: ${extractedContent.results ? 'Present' : 'Not present'}`);
      console.log(`- Discussion section: ${extractedContent.discussion ? 'Present' : 'Not present'}`);
      console.log(`- Conclusion section: ${extractedContent.conclusion ? 'Present' : 'Not present'}`);
      console.log(`- Figures: ${extractedContent.figures.length}`);
      console.log(`- Tables: ${extractedContent.tables.length}`);
      console.log(`- Supplementary materials: ${extractedContent.supplementary_material.length}`);
      
      // Save the sanitized HTML to a file for inspection
      const outputDir = path.join(__dirname, '../../output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const htmlPath = path.join(outputDir, `${pmids[0]}.html`);
      fs.writeFileSync(htmlPath, extractedContent.sanitized_html || '');
      console.log(`\nSanitized HTML saved to ${htmlPath}`);
    }
    
    Logger.info('Example', 'PubMed search example completed successfully');
  } catch (error) {
    Logger.error('Example', 'Error running PubMed search example', error);
    console.error('An error occurred:', error);
  }
}

// Run the example
runPubmedSearchExample().catch(console.error);
