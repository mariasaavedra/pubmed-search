import dotenv from "dotenv";
import ArticleService from "../services/article-service";
import { Logger } from "../utils/logger";

// Load environment variables
dotenv.config();

/**
 * Test script to verify the new explanation and relevance scale features
 */
async function testArticleExplanations() {
  try {
    Logger.info("TestScript", "Testing article explanations and relevance scores...");
    
    const articleService = new ArticleService();
    
    // Sample request
    const request = {
      specialty: "Cardiology",
      topics: ["Heart Failure"],
      filters: {
        clinical_queries: ["Therapy"],
        year_range: 3
      },
      limit: 5 // Just get a few articles for testing
    };
    
    Logger.info("TestScript", `Searching for ${request.specialty} articles on ${request.topics}`);
    
    // Get articles with the new explanation and relevance scale
    const response = await articleService.getArticles(request);
    
    if (response.articles.length === 0) {
      Logger.error("TestScript", "No articles found to test");
      return;
    }
    
    // Display the results
    Logger.success("TestScript", `Found ${response.articles.length} articles`);
    
    response.articles.forEach((article, index) => {
      console.log(`\n--- Article ${index + 1} ---`);
      console.log(`Title: ${article.title}`);
      console.log(`Journal: ${article.journal}`);
      console.log(`Relevance Score (0-1): ${article.scores.relevance.toFixed(3)}`);
      console.log(`Relevance Scale (1-5): ${article.scores.relevance_scale}`);
      console.log(`Journal Impact: ${article.scores.journal_impact.toFixed(2)}`);
      console.log(`Explanation: ${article.selection_explanation}`);
    });
    
    Logger.success("TestScript", "Test completed successfully");
    
  } catch (error) {
    Logger.error("TestScript", "Error testing article explanations", error);
  }
}

// Run the test
testArticleExplanations();
