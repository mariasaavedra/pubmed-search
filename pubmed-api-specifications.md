# PubMed E-Utilities API Implementation Specifications

## Architecture Overview

This document outlines the architecture and implementation details for the PubMed E-Utilities API integration. The implementation follows a layered approach with strong typing to ensure robust type safety across the system.

![Architecture Diagram]
```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   Article Controller│     │   PubMed Service    │     │  E-Utilities Service│
│                     │     │                     │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘     └─────────┬───────────┘
          │                           │                           │
          │ Uses                      │ Uses                      │ HTTP
          ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   Content Extraction│     │  XML/DOM Processing │     │   PubMed API        │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Core Components

### 1. E-Utilities Types (`src/types/e-utilities.types.ts`)

Contains comprehensive TypeScript type definitions for all PubMed E-Utilities endpoints, parameters, and responses:

- `BaseEUtilsParams`: Common parameters for all API requests
- `ESearchParams`, `EFetchParams`, etc.: Endpoint-specific parameters
- `ESearchResponse`, `EFetchResponse`, etc.: Strongly-typed response interfaces

### 2. E-Utilities Service (`src/services/e-utilities.service.ts`)

Provides a 1:1 wrapper for the NCBI E-Utilities API with strongly-typed methods:

- Direct access to all E-Utilities endpoints
- Rate limiting support
- XML parsing capabilities
- Error handling

### 3. PubMed Service (`src/services/pubmed-service.ts`)

High-level service for common PubMed operations:

- Article searching
- Article detail retrieval
- XML content extraction via DOM parsing
- Metadata handling

### 4. Article Content Extractor (`src/utils/article-content-extractor.ts`)

Utility for extracting structured content from PubMed XML:

- Extracts full text, sections, tables, and figures
- Generates sanitized HTML from XML content
- Uses both @xmldom/xmldom and jsdom libraries

## XML Processing Approach

The implementation leverages two complementary DOM libraries:

1. **@xmldom/xmldom**: For parsing and navigating PubMed's XML responses
   - Efficient XML parsing following the DOM Level 2 Core spec
   - Used for initial XML document parsing and traversal

2. **jsdom**: For HTML generation and manipulation
   - More complete DOM implementation with browser-like functionality
   - Used for creating sanitized HTML representations of articles

## Implementation Details

### E-Utilities API Wrapper

```typescript
// Example: Searching for articles with ESearch
const searchResults = await eutils.esearch({
  term: "cardiomyopathy treatment",
  retmax: 10,
  retmode: "json"
});

// Example: Fetching article details with EFetch
const xmlDocument = await eutils.efetchXML({
  id: "12345678,87654321",
  retmode: "xml"
});
```

### XML Content Extraction

```typescript
// Parse XML from PubMed
const xmlDoc = await eutils.efetchXML({ id: pmid });

// Extract structured content
const content = ArticleContentExtractor.extractContent(xmlDoc, pmid);
```

## Best Practices

1. **Rate Limiting**: Always use the built-in rate limiting to avoid exceeding PubMed's request limits
2. **Error Handling**: Handle API errors appropriately, especially for network timeouts
3. **XML Processing**: Use the ArticleContentExtractor for consistent content extraction
4. **Type Safety**: Leverage the strongly-typed interfaces throughout the application
5. **API Key**: Use a PubMed API key in production for higher rate limits

## Usage Examples

See `src/examples/pubmed-search-example.ts` for detailed examples of:

- Basic article searching
- XML content extraction
- Advanced E-Utilities API usage

## Performance Considerations

1. **History Server**: For complex queries, consider using the History Server (WebEnv and query_key)
2. **Batch Requests**: When possible, batch PMID requests rather than individual calls
3. **Caching**: Implement response caching for frequently accessed data
4. **Selective Fetching**: Only request the specific fields needed to minimize data transfer

## Extension Points

The architecture is designed for easy extension:

1. **Additional Endpoints**: Add new E-Utilities endpoints by extending the type definitions and service
2. **Enhanced Extraction**: Extend ArticleContentExtractor for more sophisticated content processing
3. **Custom Parsers**: Implement specialized parsers for specific article types or journals

## References

- [PubMed E-Utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25497/)
- [@xmldom/xmldom Documentation](https://www.npmjs.com/package/@xmldom/xmldom)
- [jsdom Documentation](https://github.com/jsdom/jsdom)
