# PubMed Clinical Article Retriever - Logging System

This document describes the enhanced logging system that has been implemented to improve debugging and visibility into the application's behavior.

## Overview

The logging system provides colorful, structured console output with different log levels to make it easier to understand the flow of the application and diagnose issues. It also includes request/response logging middleware for HTTP traffic.

## Features

- 🌈 **Colorful Console Output**: Using the `chalk` library for better visual distinction between log types
- 📊 **Log Levels**: DEBUG, INFO, WARN, ERROR with configurable filtering
- 🔍 **Request/Response Logging**: Captures HTTP requests and responses with timing information
- 🆔 **Request IDs**: Generated for each request to correlate logs across the request lifecycle
- 📝 **Structured Data**: JSON formatting for complex objects
- ⏱️ **Performance Metrics**: Timing information for API calls and processing steps

## Log Levels

- **DEBUG** (blue): Detailed information for debugging purposes
- **INFO** (green): General information about application progress
- **WARN** (yellow): Warning conditions that should be addressed
- **ERROR** (red): Error conditions that need attention
- **SUCCESS** (bright green): Successful operations worth highlighting
- **HTTP** (magenta): HTTP request/response logging

## Usage in Code

```typescript
import { Logger } from '../utils/logger';

// Simple message
Logger.info('Component', 'Operation completed successfully');

// With data
Logger.debug('Component', 'Processing data', { 
  items: data.length,
  filters: applied_filters
});

// Error handling
try {
  // some operation
} catch (error) {
  Logger.error('Component', 'Operation failed', error);
}

// HTTP request logging is automatic via middleware
```

## Configuration

The log level can be set based on the environment:

```typescript
// In a configuration file or application startup
import { Logger, LogLevel } from './utils/logger';

if (process.env.NODE_ENV === 'production') {
  Logger.setLogLevel(LogLevel.INFO);
} else if (process.env.NODE_ENV === 'test') {
  Logger.setLogLevel(LogLevel.ERROR);
} else {
  Logger.setLogLevel(LogLevel.DEBUG);
}
```

## Request Logger Middleware

The request logger middleware:

1. Generates a unique ID for each request
2. Logs the incoming request details (method, URL, body, query params)
3. Times the request processing duration
4. Logs the response (status code, timing)
5. Provides detailed information for errors

This middleware is registered in `app.ts` and applies to all routes automatically.

## Implementation

The logging system consists of:

- `src/utils/logger.ts`: Core logging utility with different log levels
- `src/middlewares/request-logger.ts`: Express middleware for HTTP logging
- Integration in services and controllers for detailed operational logging

## Best Practices

1. **Use appropriate log levels**: DEBUG for detailed flow, INFO for normal operations, WARN for potential issues, ERROR for actual failures
2. **Include context**: Always include the component/service name as the first parameter
3. **Structure data**: For complex objects, pass them as the third parameter rather than interpolating in strings
4. **Be concise**: Log messages should be clear and to the point
5. **Include timing**: For performance-sensitive operations, include timing information

## Example Log Output

```
2025-04-15T18:20:35.123Z [INFO] [PubmedService] Initialized with configuration
2025-04-15T18:20:37.456Z [DEBUG] [BlueprintService] Processing blueprint request
2025-04-15T18:20:37.789Z [HTTP] GET /api/specialties 200 15ms
2025-04-15T18:20:38.012Z [ERROR] [PubmedService] Error fetching article details
2025-04-15T18:20:39.345Z [SUCCESS] [ArticleController] Request completed in 205ms, returning 10 articles
