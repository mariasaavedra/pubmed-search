# PubMed Clinical Article Retriever

A lightweight TypeScript, Express Node.js service for retrieving high-quality, emerging medical literature from PubMed based on clinical blueprints.

## Overview

This application serves as a backend service that:

1. Accepts clinical blueprints (specialty, topic, objective)
2. Constructs optimized PubMed search queries
3. Retrieves and ranks articles based on relevance and quality
4. Returns a scored and filtered list of articles suitable for medical education

## Prerequisites

- NodeJS
- npm or yarn
- NCBI API Key (optional but recommended)
- OpenAI API Key (for embedding-based relevance ranking)

## Configuration

See `src/config/pubmed-config.ts` for API keys and settings.

Files of importance:

- `article-controller.ts`: Handles API requests and responses.
- `e-utilities.service.ts`: Strongly-typed wrapper for NCBI E-utilities API.
- `pubmed-service.ts`: Interacts with the PubMed API.
- `embedding.service.ts`: Handles semantic ranking using OpenAI embeddings.
- `full-text-fetcher.service.ts`: Retrieves full-text content where available.
- `journal-ranking.service.ts`: Scores articles based on journal quality.
- `pubmed-config.ts`: Configuration for PubMed API keys and settings.
- `data/specialties.json`: Contains specialty-specific topics and MeSH terms.
- `data/clinically-useful-journals.json`: Contains high-quality journal list.

## Usage

### Starting the Server

```bash
npm start
```

### API Endpoints

#### POST /api/articles

Retrieves articles based on a clinical blueprint.

**Request Body (ArticleRequest):**

```typescript
interface ArticleRequest {
  specialty: string;
  topics: string[];
  filters?: {
    clinical_queries?: string[];
    age_group?: string;
    year_range?: number;
  };
  page?: number;
  limit?: number;
}
```

**Example Request:**

```json
{
  "specialty": "Cardiology",
  "topics": ["SGLT2 Inhibitors"],
  "filters": {
    "clinical_queries": ["Therapy"],
    "year_range": 3
  },
  "page": 1,
  "limit": 10
}
```

**Response (ArticleResponse):**

```typescript
interface ArticleResponse {
  articles: Article[];
  meta: {
    total: number;
    processing_time: number;
    saved_filename: string;
    encoding?: {
      tables: "base64";
      original_xml: "base64";
      sanitized_html: "base64";
    };
  };
}

interface Article {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_date: string;
  abstract: string;
  url: string;
  scores: {
    relevance: number;
    journal_impact: number;
  };
  full_text?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures?: string[];
  tables?: string[];
  supplementary_material?: string[];
  original_xml?: string;
  sanitized_html?: string;
}
```

**Example Response:**

```json
{
  "articles": [
    {
      "pmid": "35123456",
      "title": "SGLT2 Inhibitors in Heart Failure with Preserved Ejection Fraction",
      "authors": ["Smith J", "Johnson A"],
      "journal": "New England Journal of Medicine",
      "pub_date": "2025-02-15",
      "abstract": "...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35123456/",
      "scores": {
        "relevance": 0.95,
        "journal_impact": 1.0
      },
      "full_text": "..."
    }
  ],
  "meta": {
    "total": 42,
    "processing_time": 1240,
    "saved_filename": "",
    "encoding": {
      "tables": "base64",
      "original_xml": "base64",
      "sanitized_html": "base64"
    }
  }
}
```

#### GET /api/specialties

Returns a list of all available medical specialties.

**Response:**

```json
{
  "specialties": ["Cardiology", "Neurology", "Oncology", "Endocrinology", "Pediatrics"]
}
```

#### GET /api/specialties/:specialty/topics

Returns suggested topics for a specific specialty.

**Response:**

```json
{
  "specialty": "Cardiology",
  "topics": ["Heart Failure", "Hypertension", "SGLT2 Inhibitors", "Atrial Fibrillation"]
}
```

## Project Structure

```
pubmed-search/
├── data/
│   ├── specialties.json             # Specialty data with topics and MeSH terms
│   ├── clinically-useful-journals.json # List of high-quality medical journals
│   └── cardiology-journals.json     # Specialty-specific journal list
├── src/
│   ├── app.ts                       # Main Express application
│   ├── config/
│   │   └── pubmed-config.ts         # PubMed API configuration
│   ├── controllers/
│   │   └── article-controller.ts
│   ├── data/
│   │   └── journals.ts              # Journal data handling
│   ├── routes/
│   │   └── article-routes.ts
│   ├── services/
│   │   ├── article-service.ts       # Main service orchestration
│   │   ├── blueprint-service.ts     # Blueprint processing
│   │   ├── e-utilities.service.ts   # NCBI E-utilities API wrapper
│   │   ├── embedding.service.ts     # OpenAI embedding for relevance ranking
│   │   ├── full-text-fetcher.service.ts # Content retrieval service
│   │   ├── journal-ranking.service.ts # Journal quality scoring 
│   │   ├── pubmed-service.ts        # PubMed API interaction
│   │   └── query-service.ts         # Query construction
│   ├── types/
│   │   ├── index.ts                 # Core TypeScript interfaces
│   │   └── e-utilities.types.ts     # E-utilities specific types
│   └── utils/
│       ├── article-content-extractor.ts # Article content extraction
│       ├── content-processor.ts     # Content formatting and processing
│       ├── file-reader.ts           # JSON data loading
│       ├── logger.ts                # Custom logging utility
│       ├── mesh-mapper.ts           # MeSH term mapping
│       └── rate-limiter.ts          # API rate limiting
├── tsconfig.json
└── package.json
```

## Core Components

### Blueprint Service

Processes clinical blueprints and extracts key concepts for search.

### Query Service

Constructs optimized PubMed queries using MeSH terms and proximity operators.

### E-Utilities Service

Strongly-typed wrapper for the NCBI E-utilities API, handling rate limiting and error recovery.

### PubMed Service

Handles communication with the E-utilities API, including rate limiting and pagination.

### Embedding Service

Uses OpenAI embeddings to calculate semantic similarity between queries and articles.

### Full-Text Fetcher Service

Attempts to retrieve full-text content for articles where available, enhancing the quality of relevance scoring.

### Journal Ranking Service

Scores articles based on journal quality using a curated list of clinically useful journals.

## Examples

### Example Blueprint

```json
{
  "specialty": "Endocrinology",
  "topics": [
    "Thyroid Nodules",
    "Thyroid Cancer",
    "Thyroid Function Tests",
    "Thyroiditis"
  ]
}
```

### Example Query Construction

```
("Thyroid Nodules"[MeSH] OR "Thyroid Nodules"[Title/Abstract])
AND
("guideline"[Publication Type] OR "practice guideline"[Publication Type])
AND
("last 3 years"[PDat])
```

## Performance Considerations

- Uses connection pooling for E-utilities API
- Implements proper rate limiting (10 requests/second with API key, 3 without)
- Caches MeSH term mappings to reduce API calls
- Batches article metadata retrieval
- Implements exponential backoff for rate limit errors
- Optimizes semantic search with batched embedding requests

## PubMed API Rate Limiting

This application implements NCBI's E-utilities API guidelines:

- **With API key**: Up to 10 requests/second
- **Without API key**: Limited to 3 requests/second
- All requests include tool name and contact email
- Request throttling with configurable concurrency limits
- Automatic retry with exponential backoff

Set your NCBI API key in the `.env` file:

```
PUBMED_API_KEY=your_api_key_here
```

## Semantic Relevance Ranking

The service uses OpenAI's text-embedding-3-small model to calculate semantic similarity between:
- The user's query (specialty + topics)
- Article content (full text when available, or title + abstract)

Set your OpenAI API key in the `.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Journal Quality Scoring

Articles are scored based on journal quality using:
- A curated list of clinically useful journals
- Normalized name matching to handle variations in journal name formatting
- Two-tier scoring (1.0 for clinically useful journals, 0.1 for others)

## Full Text Content Retrieval

The service attempts to enhance article content by:
- Fetching clean abstracts from PubMed E-utilities
- Retrieving full text content when available via DOI links
- Extracting article content from PubMed pages
- Cleaning and structuring the content for better readability

## Running the Application

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the server
npm start

# Start with auto-reload for development
npm run dev
```

The server will be available at http://localhost:3000 with complete API documentation at the root endpoint.

### Example API Request

```http
POST /api/articles
Content-Type: application/json

{
  "specialty": "cardiology",
  "topics": ["heart failure", "hypertension"],
  "filters": {
    "clinical_queries": ["Therapy", "Diagnosis"],
    "year_range": 2
  },
  "page": 1,
  "limit": 10
}
```

This will return ranked articles related to heart failure and hypertension from high-quality cardiology journals, published within the last 2 years.

## License

MIT

---
