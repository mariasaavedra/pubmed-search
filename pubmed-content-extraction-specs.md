# PubMed Content Extraction Specifications

## API Capabilities Analysis

After reviewing the PubMed E-Utilities API documentation, the following APIs are most relevant for content extraction:

1. **EFetch API (`/efetch.fcgi`)**: 
   - Retrieves full records from PubMed in various formats (XML, text)
   - Can access complete metadata including MeSH terms, abstract sections, article structure
   - Format can be controlled via `retmode` and `rettype` parameters

2. **ESummary API (`/esummary.fcgi`)**:
   - Retrieves document summaries
   - Provides essential metadata in a more compact format
   - Better for bulk retrieval of basic information

## Content Extraction Enhancement Strategy

### 1. Structured Data Extraction from XML

The PubMed XML format contains structured sections that can be directly mapped to our content requirements:

#### MeSH Terms
- Located in `MedlineCitation.MeshHeadingList.MeshHeading`
- Each MeshHeading contains a `DescriptorName` (the main term) and possibly `QualifierName` elements
- Example: `<DescriptorName UI="D006801">Hypertension</DescriptorName>`

#### Abstract Sections
- Located in `MedlineCitation.Article.Abstract.AbstractText`
- May contain labeled sections with NlmCategory attributes:
  - "OBJECTIVE"/"BACKGROUND" - Introduction
  - "METHODS" - Methods
  - "RESULTS" - Results
  - "CONCLUSIONS" - Conclusion
  - "DISCUSSION" - Discussion

#### Publication Types
- Located in `MedlineCitation.Article.PublicationTypeList.PublicationType`
- Identifies if the article is a clinical trial, review, etc.

#### Chemical Lists
- Located in `MedlineCitation.ChemicalList.Chemical`
- Lists substances discussed in the article

### 2. Enhanced XML Parsing

Modify our XML parsing configuration to:
- Preserve attributes for category identification
- Maintain structure of nested elements
- Keep original XML formatting for reference

```javascript
// Recommended XML parsing options
const xmlOptions = {
  explicitArray: false, 
  explicitRoot: false,
  mergeAttrs: false,  // Keep attributes separate
  attrkey: '@',       // Prefix attributes with @
  charkey: '#text'    // Use #text for element content
};
```

### 3. Web Scraping Fallback Strategy

When structured data from the API is insufficient:

1. Use Puppeteer to access the full HTML article page
2. Extract content from specific DOM elements:
   - `#article-details` - Main article container
   - Sections with headings containing "methods", "results", "discussion", etc.
   - Tables, figures, and supplementary material links

### 4. Error Handling and Fallbacks

Implement a robust error handling strategy:
- Never fail completely if content extraction partially succeeds
- Use multiple extraction methods with prioritization:
  1. Direct XML parsing from EFetch (highest quality, structured)
  2. Web scraping from PubMed article page (good for full text)
  3. Fallback to basic metadata if both methods fail
- Log detailed information about extraction success/failure

## Implementation Specifications

### 1. Modify PubmedService.ParseXml

```typescript
private async ParseXml(xml: string): Promise<PubmedFetchResponse> {
  // Use modified parsing options to preserve attributes and structure
  const result = await parseStringPromise(xml, {
    explicitArray: false,
    explicitRoot: false,
    mergeAttrs: false,
    attrkey: '@',
    charkey: '#text'
  });
  
  return result;
}
```

### 2. Enhance ExtractArticleData Method

```typescript
private async ExtractArticleData(
  data: PubmedFetchResponse,
  original_xml: string
): Promise<ParsedArticleData[]> {
  // Extract structured data from XML
  // Extract MeSH terms, publication types, chemicals
  // Parse abstract sections by label
  // Attempt web scraping for additional content
  // Implement robust fallbacks
}
```

### 3. Type Updates

```typescript
// Update PubmedFetchResponse type to reflect structured XML
interface PubmedFetchResponse {
  PubmedArticleSet: {
    PubmedArticle: Array<{
      MedlineCitation: {
        PMID: string;
        MeshHeadingList?: {
          MeshHeading: Array<{
            DescriptorName: {
              '@UI': string;
              '#text': string;
            };
            QualifierName?: Array<{
              '@UI': string;
              '#text': string;
            }>;
          }>;
        };
        Article: {
          // ... other article fields
          Abstract?: {
            AbstractText: Array<{
              '@NlmCategory'?: string;
              '@Label'?: string;
              '#text': string;
            }> | string;
          };
        };
      };
    }>;
  };
}
```

## Expected Outcomes

With these enhancements, the content extraction process should:

1. Successfully extract structured metadata from PubMed's XML API
2. Correctly organize abstract sections into the appropriate fields (methods, results, etc.)
3. Include MeSH terms and other relevant indexing information
4. Provide full text content when available
5. Gracefully handle errors and partial failures
6. Maintain compatibility with the existing application structure
