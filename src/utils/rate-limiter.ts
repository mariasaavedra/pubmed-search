import { Logger } from './logger';

/**
 * Utility class for rate limiting API requests to NCBI E-utilities
 * 
 * Rate limits per NCBI E-utilities documentation:
 * - With API key: Up to 10 requests/second
 * - Without API key: Limited to 3 requests/second
 * 
 * Reference: https://www.ncbi.nlm.nih.gov/books/NBK25497/#chapter2.Usage_Guidelines_and_Requirements
 */
class RateLimiter {
  private interval: number;
  private max_tokens: number;
  private tokens: number;
  private last_refill: number;
  private waiting_queue: Array<{ resolve: () => void; reject: (error: Error) => void }>;
  private isApiKeyUsed: boolean;

  /**
   * Create a new rate limiter
   * @param tokens_per_interval Maximum number of concurrent requests
   * @param interval Minimum time between requests in milliseconds
   */
  constructor(tokens_per_interval: number, interval: number) {
    this.interval = interval;
    this.max_tokens = tokens_per_interval;
    this.tokens = tokens_per_interval;
    this.last_refill = Date.now();
    this.waiting_queue = [];
    // Determine if using API key based on interval (faster interval = API key is being used)
    this.isApiKeyUsed = interval < 300; // If less than ~3 requests/second, API key is being used
    
    Logger.debug('RateLimiter', 'Initialized rate limiter', {
      max_tokens: tokens_per_interval,
      interval_ms: interval,
      requests_per_second: (1000 / interval).toFixed(2),
      using_api_key: this.isApiKeyUsed
    });
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.last_refill;
    const new_tokens = Math.floor((elapsed / this.interval) * this.max_tokens);

    if (new_tokens > 0) {
      this.tokens = Math.min(this.max_tokens, this.tokens + new_tokens);
      this.last_refill = now;

      if (this.waiting_queue.length > 0) {
        Logger.debug('RateLimiter', `Processing waiting queue. Available tokens: ${this.tokens}, Queue length: ${this.waiting_queue.length}`);
      }

      // Process waiting requests if tokens are available
      while (this.tokens > 0 && this.waiting_queue.length > 0) {
        const request = this.waiting_queue.shift();
        if (request) {
          this.tokens--;
          request.resolve();
        }
      }
    }
  }

  /**
   * Check if a request can be made
   * @returns True if the request is allowed, false otherwise
   */
  public checkLimit(): boolean {
    this.refillTokens();
    return this.tokens > 0;
  }

  /**
   * Wait for a token to become available
   * @returns Promise that resolves when a token is available
   * @throws Error if waiting for a slot exceeds the maximum wait time
   */
  public async waitForSlot(): Promise<void> {
    this.refillTokens();

    // If tokens are available, use one immediately
    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    // Calculate wait time until next token should be available
    const waitTime = this.interval - (Date.now() - this.last_refill);
    
    Logger.debug('RateLimiter', `No tokens available, adding to queue. Current queue length: ${this.waiting_queue.length}, estimated wait: ${waitTime}ms`);

    // No tokens available, queue the request
    return new Promise<void>((resolve, reject) => {
      // Add a timeout to reject the promise if waiting too long
      const timeoutId = setTimeout(() => {
        // Remove the request from the queue
        const index = this.waiting_queue.findIndex(req => req.resolve === resolve && req.reject === reject);
        if (index !== -1) {
          this.waiting_queue.splice(index, 1);
          Logger.warn('RateLimiter', `Request at queue position ${index} timed out after 60 seconds`);
        }
        
        reject(new Error('Rate limit timeout: waited too long for an available slot. Consider increasing rate limit interval or reducing concurrent requests.'));
      }, 60000); // 60 second timeout for more leniency

      // Add request to queue with cleanup
      this.waiting_queue.push({
        resolve: () => {
          clearTimeout(timeoutId);
          resolve();
        },
        reject
      });
    });
  }

  /**
   * Reset the rate limiter
   */
  public resetCounter(): void {
    this.tokens = this.max_tokens;
    this.last_refill = Date.now();
    Logger.debug('RateLimiter', 'Rate limiter reset, tokens restored', { tokens: this.tokens });
  }

  /**
   * Get the current status of the rate limiter
   * @returns Object containing current status
   */
  public getStatus(): { 
    availableTokens: number; 
    queueLength: number; 
    isApiKeyUsed: boolean;
    requestsPerSecond: number;
  } {
    this.refillTokens();
    return {
      availableTokens: this.tokens,
      queueLength: this.waiting_queue.length,
      isApiKeyUsed: this.isApiKeyUsed,
      requestsPerSecond: 1000 / this.interval
    };
  }
}

export default RateLimiter;
