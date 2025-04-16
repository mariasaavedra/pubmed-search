import dotenv from 'dotenv';
import { EUtilitiesService } from '../services/e-utilities.service';
import { Logger } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Test script to verify PubMed rate limiting and API key usage
 * 
 * This script sends multiple concurrent requests to PubMed E-utilities
 * to demonstrate the rate limiting behavior with API key.
 */
async function testRateLimiting() {
  Logger.info('Test', 'Starting PubMed E-utilities rate limit test');
  
  // Initialize service with contact email
  const eutils = new EUtilitiesService('your-email@example.com');
  
  // Number of requests to make (adjusted to demonstrate rate limiting without excessive timeouts)
  const numRequests = 8;
  
  Logger.info('Test', `Making ${numRequests} concurrent requests to test rate limiting`);
  
  // Create an array of promises for concurrent requests
  // We're using staggered execution to better handle rate limits
  const requests = Array.from({ length: numRequests }).map((_, i) => {
    return (async () => {
      // Small staggered delay to prevent all requests hitting at exact same millisecond
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, i * 50));
      }
      try {
        const startTime = Date.now();
        
        // Simple search request with unique term to prevent caching
        const result = await eutils.esearch({
          term: `cancer treatment ${i}`,
          retmax: 5
        });
        
        const duration = Date.now() - startTime;
        
        // The response comes as XML string for the XML retmode
        // Parse it to extract the count
        let count = 0;
        const resultStr = result as any;
        
        if (typeof resultStr === 'string') {
          // Extract count from XML using regex
          const countMatch = (resultStr as string).match(/<Count>(\d+)<\/Count>/);
          if (countMatch && countMatch[1]) {
            count = parseInt(countMatch[1], 10);
          }
        } else if (resultStr?.esearchresult?.count) {
          // If result is JSON object
          count = parseInt(resultStr.esearchresult.count, 10);
        }
        
        // Just log a shortened response preview to keep logs clean
        const logStr = typeof resultStr === 'string' 
          ? (resultStr as string).substring(0, 50) + '...' 
          : JSON.stringify(resultStr || {}).substring(0, 50) + '...';
        
        Logger.debug('Test', `Response for request ${i + 1}: ${logStr}`);
        
        Logger.info('Test', `Request ${i + 1}/${numRequests} completed in ${duration}ms - Found ${count} results`);
        
        return { success: true, index: i, duration, count };
      } catch (error) {
        Logger.error('Test', `Request ${i + 1}/${numRequests} failed:`, error);
        return { success: false, index: i, error: error instanceof Error ? error.message : String(error) };
      }
    })();
  });
  
  // Execute all requests and wait for completion
  const results = await Promise.all(requests);
  
  // Calculate statistics
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = results
    .filter(r => r.success && 'duration' in r)
    .reduce((sum, r) => sum + (r as any).duration, 0) / successful;
  
  Logger.info('Test', 'Rate limit test completed', {
    total: numRequests,
    successful,
    failed,
    averageDurationMs: avgDuration.toFixed(2)
  });
}

// Run the test
testRateLimiting()
  .then(() => {
    Logger.info('Test', 'Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    Logger.error('Test', 'Test failed with error:', error);
    process.exit(1);
  });
