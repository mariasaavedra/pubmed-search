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

## Configuration

See pubmed.config.js for API keys and settings.

## Usage

### Starting the Server

```bash
npm start
```

### API Endpoints

#### POST /api/articles

Retrieves articles based on a clinical blueprint.

**Request Body:**

```json
{
  "specialty": "Cardiology",
  "topic": "SGLT2 Inhibitors"
}
```

**Response:**

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
      "url": "https://pubmed.ncbi.nlm.nih.gov/35123456/"
    }
  ]
}
```

## Project Structure

```
pubmed-search/
├── data/
│   ├── specialties.json      # Specialty data with topics and MeSH terms
│   └── journal-metrics.json  # Journal impact factors and metrics
├── src/
│   ├── app.ts                # Main Express application
│   ├── config/
│   │   └── pubmed-config.ts  # PubMed API configuration
│   ├── controllers/
│   │   └── article-controller.ts
│   ├── routes/
│   │   └── article-routes.ts
│   ├── services/
│   │   ├── blueprint-service.ts   # Blueprint processing
│   │   ├── pubmed-service.ts      # PubMed API interaction
│   │   ├── query-service.ts       # Query construction
│   │   └── ranking-service.ts     # Article scoring and ranking
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── utils/
│       ├── file-reader.ts         # JSON data loading
│       ├── mesh-mapper.ts         # MeSH term mapping
│       └── rate-limiter.ts        # API rate limiting
├── tsconfig.json
└── package.json
```

## Core Components

### Blueprint Service

Processes clinical blueprints and extracts key concepts for search.

### Query Service

Constructs optimized PubMed queries using MeSH terms and proximity operators.

### PubMed Service

Handles communication with the E-utilities API, including rate limiting and pagination.

### Ranking Service

Scores articles based on relevance, journal quality, and structural characteristics.

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
- Implements proper rate limiting (3 requests/second)
- Caches MeSH term mappings to reduce API calls
- Batches article metadata retrieval

## Extending the Service

### Adding Custom Scoring Algorithms

Create a new scoring module in `src/services/ranking/` and register it in `ranking.service.js`.

### Supporting New Specialties

Update the specialty-specific configurations in `config/specialties/`.

Features Implemented
Blueprint Processing: Normalizes and validates specialty and topic inputs, handling aliases and applying default filters when needed.

Query Construction: Builds optimized PubMed search queries using MeSH terms, filters, and date ranges.

PubMed API Integration: Interacts with PubMed's E-utilities API with proper rate limiting and pagination.

Article Ranking: Scores articles based on relevance to the search topics and journal quality metrics.

RESTful API:

POST /api/articles - Retrieve articles based on specialty and topics
GET /api/specialties - Get all available specialties
GET /api/specialties/:specialty/topics - Get suggested topics for a specialty
Running the Application

# Build the TypeScript code

npm run build

# Start the server

npm start

# Start with auto-reload for development

npm run dev
The server will be available at http://localhost:3000 with complete API documentation at the root endpoint.

Example API Request
POST /api/articles
{
"specialty": "cardiology",
"topics": ["heart failure", "hypertension"],
"filters": {
"clinical_queries": ["Therapy", "Diagnosis"],
"year_range": 5
},
"page": 1,
"limit": 10
}
This will return ranked articles related to heart failure and hypertension from high-quality cardiology journals, published within the last 5 years.

## License

MIT

---
