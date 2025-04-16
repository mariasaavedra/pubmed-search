# PubMed E-utilities API Usage Guidelines

This document outlines the proper usage of the PubMed E-utilities API in this application, including rate limiting and API key configuration.

## NCBI E-utilities Rate Limits

According to NCBI guidelines:

- **With API key**: Up to 10 requests/second
- **Without API key**: Limited to 3 requests/second
- All requests must include tool name and contact email
- Limits are per API key, not per IP address

Reference: https://www.ncbi.nlm.nih.gov/books/NBK25497/#chapter2.Usage_Guidelines_and_Requirements

## API Key Setup

This application uses an API key stored in the `.env` file. The current API key is:

```
PUBMED_API_KEY=e8bd05f7ddc874fa9ed9ebe48b1af5b3a309
```

### How to Get an API Key

1. Register for an NCBI account at https://www.ncbi.nlm.nih.gov/
2. After signing in, click on your username in the upper right corner
3. Go to "Account Settings"
4. In the "API Key Management" section, click "Create an API Key"
5. Copy the key and set it in your `.env` file

## Implementation Details

Our implementation automatically adapts to the presence of an API key:

### Configuration (`src/config/pubmed-config.ts`)

The configuration file defines different rate limits based on whether an API key is provided:

```typescript
rate_limit: {
  // With API key: Up to 10 requests/second
  // Without API key: Limited to 3 requests/second
  with_api_key: {
    requests_per_second: 10,
    max_concurrent: 5
  },
  without_api_key: {
    requests_per_second: 3,
    max_concurrent: 3
  },
  // Time between requests in milliseconds (1000ms / requests_per_second)
  min_time_with_key: 100,  // 10 requests per second
  min_time_without_key: 334, // ~3 requests per second
}
```

### Rate Limiter (`src/utils/rate-limiter.ts`)

A token bucket algorithm implementation that:

- Enforces the appropriate request rate based on API key presence
- Queues requests that exceed the rate limit
- Implements timeout protection to prevent hung requests
- Provides logging and status information

### E-utilities Service (`src/services/e-utilities.service.ts`)

The service:

- Automatically includes the API key in all requests if available
- Uses the rate limiter to control request frequency
- Implements exponential backoff retry for rate limit errors
- Provides detailed error logging for troubleshooting

## Testing Rate Limiting

The application includes a test script to verify rate limiting behavior:

```bash
# Run with ts-node
npx ts-node src/examples/test-rate-limit.ts
```

This script:

- Makes multiple concurrent requests to PubMed
- Logs request timing and success/failure
- Reports statistics on completion

## Best Practices

When working with the PubMed E-utilities API:

1. **Always include contact email and tool name** in requests
2. **Use the API key** for better throughput (10 vs 3 requests/second)
3. **Implement proper error handling** for rate limit errors (HTTP 429)
4. **Use WebEnv and query_key** for multi-step operations to reduce API calls
5. **Add delays between requests** for large batches
6. **Avoid unnecessary requests** by caching results where appropriate
7. **Run intensive operations during off-peak hours** (nights and weekends)

## Troubleshooting

If you encounter rate limiting issues:

1. Verify the API key is correctly set in the `.env` file
2. Check that all requests include the API key parameter
3. Review logs for rate limit error responses (HTTP 429)
4. Consider reducing concurrent request count
5. Implement additional delay between batches of requests for very large operations

## Reference Documentation

- [NCBI E-utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [Usage Guidelines and Requirements](https://www.ncbi.nlm.nih.gov/books/NBK25497/#chapter2.Usage_Guidelines_and_Requirements)
- [NCBI Insights Blog: New API Keys for the E-utilities](https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/)
