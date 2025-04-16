/**
 * Utility class for rate limiting API requests
 */
declare class RateLimiter {
    private interval;
    private max_tokens;
    private tokens;
    private last_refill;
    private waiting_queue;
    /**
     * Create a new rate limiter
     * @param tokens_per_interval Maximum number of tokens per interval
     * @param interval Interval in milliseconds
     */
    constructor(tokens_per_interval: number, interval: number);
    /**
     * Refill tokens based on elapsed time
     */
    private RefillTokens;
    /**
     * Check if a request can be made
     * @returns True if the request is allowed, false otherwise
     */
    CheckLimit(): boolean;
    /**
     * Wait for a token to become available
     * @returns Promise that resolves when a token is available
     */
    WaitForSlot(): Promise<void>;
    /**
     * Reset the rate limiter
     */
    ResetCounter(): void;
}
export default RateLimiter;
