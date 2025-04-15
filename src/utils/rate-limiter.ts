/**
 * Utility class for rate limiting API requests
 */
class RateLimiter {
  private interval: number;
  private max_tokens: number;
  private tokens: number;
  private last_refill: number;
  private waiting_queue: Array<{ resolve: () => void }>;

  /**
   * Create a new rate limiter
   * @param tokens_per_interval Maximum number of tokens per interval
   * @param interval Interval in milliseconds
   */
  constructor(tokens_per_interval: number, interval: number) {
    this.interval = interval;
    this.max_tokens = tokens_per_interval;
    this.tokens = tokens_per_interval;
    this.last_refill = Date.now();
    this.waiting_queue = [];
  }

  /**
   * Refill tokens based on elapsed time
   */
  private RefillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.last_refill;
    const new_tokens = Math.floor((elapsed / this.interval) * this.max_tokens);

    if (new_tokens > 0) {
      this.tokens = Math.min(this.max_tokens, this.tokens + new_tokens);
      this.last_refill = now;

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
  public CheckLimit(): boolean {
    this.RefillTokens();
    return this.tokens > 0;
  }

  /**
   * Wait for a token to become available
   * @returns Promise that resolves when a token is available
   */
  public async WaitForSlot(): Promise<void> {
    this.RefillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waiting_queue.push({ resolve });
    });
  }

  /**
   * Reset the rate limiter
   */
  public ResetCounter(): void {
    this.tokens = this.max_tokens;
    this.last_refill = Date.now();
  }
}

export default RateLimiter;
