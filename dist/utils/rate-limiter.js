"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility class for rate limiting API requests
 */
class RateLimiter {
    /**
     * Create a new rate limiter
     * @param tokens_per_interval Maximum number of tokens per interval
     * @param interval Interval in milliseconds
     */
    constructor(tokens_per_interval, interval) {
        this.interval = interval;
        this.max_tokens = tokens_per_interval;
        this.tokens = tokens_per_interval;
        this.last_refill = Date.now();
        this.waiting_queue = [];
    }
    /**
     * Refill tokens based on elapsed time
     */
    RefillTokens() {
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
    CheckLimit() {
        this.RefillTokens();
        return this.tokens > 0;
    }
    /**
     * Wait for a token to become available
     * @returns Promise that resolves when a token is available
     */
    async WaitForSlot() {
        this.RefillTokens();
        if (this.tokens > 0) {
            this.tokens--;
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this.waiting_queue.push({ resolve });
        });
    }
    /**
     * Reset the rate limiter
     */
    ResetCounter() {
        this.tokens = this.max_tokens;
        this.last_refill = Date.now();
    }
}
exports.default = RateLimiter;
//# sourceMappingURL=rate-limiter.js.map