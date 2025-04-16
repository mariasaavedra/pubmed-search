# Repository Summary

Total Files: 10790
Total Directories: 1569
Top-level Directories: data, dist, node_modules, output, prompts, schema, src
File Types: 1 (1), (575), md (705), json (703), ts (1982), js (5000), map (1595), txt (39), mjs (51), cjs (24), cts (4), flow (2), png (6), bnf (6), c (3), mts (8), yml (19), bare (26), lock (1), markdown (5), pdl (2), bsd (4), sh (2), node (1), css (3), html (5), coffee (6), log (2), tmpl (2), mdown (1), yaml (2), tsbuildinfo (4), properties (1)
Has package.json: true
Has README.md: true
Notable .gitignore entries: .env, node_modules, dist, dist/\*, data/output
Entry points:
- src/app.ts
- src/config/pubmed-config.ts
- src/controllers/article-controller.ts 

# Repository Structure

## File Tree

```
pubmed-search
  LOGGING.md
  README.md
  data
    journal-metrics.json
    output
      schema.json
    specialties.json
  dist
    app.d.ts
    app.js
    app.js.map
    config
      pubmed-config.d.ts
      pubmed-config.js
      pubmed-config.js.map
    controllers
      article-controller.d.ts
      article-controller.js
      article-controller.js.map
    middlewares
      request-logger.d.ts
      request-logger.js
      request-logger.js.map
    routes
      article-routes.d.ts
      article-routes.js
      article-routes.js.map
    services
      article-content-service.d.ts
      article-content-service.js
      article-content-service.js.map
      blueprint-service.d.ts
      blueprint-service.js
      blueprint-service.js.map
      file-storage-service.d.ts
      file-storage-service.js
      file-storage-service.js.map
      pubmed-service.d.ts
      pubmed-service.js
      pubmed-service.js.map
      query-service.d.ts
      query-service.js
      query-service.js.map
      ranking-service.d.ts
      ranking-service.js
      ranking-service.js.map
    types
      index.d.ts
      index.js
      index.js.map
    utils
      content-processor.d.ts
      content-processor.js
      content-processor.js.map
      file-reader.d.ts
      file-reader.js
      file-reader.js.map
      logger.d.ts
      logger.js
      logger.js.map
      mesh-mapper.d.ts
      mesh-mapper.js
      mesh-mapper.js.map
      rate-limiter.d.ts
      rate-limiter.js
      rate-limiter.js.map
  llms.txt
  output
    40228065.html
  package.json
  prompts
    blueprint.md
  pubmed-api-specifications.md
  pubmed-content-extraction-specs.md
  schema
    index.ts
  src
    app.ts
    config
      pubmed-config.ts
    controllers
      article-controller.ts
    examples
      pubmed-search-example.ts
    middlewares
      request-logger.ts
    routes
      article-routes.ts
    services
      blueprint-service.ts
      e-utilities.service.ts
      file-storage-service.ts
      pubmed-service.ts
      query-service.ts
    types
      e-utilities.types.ts
      index.ts
    utils
      article-content-extractor.ts
      content-processor.ts
      file-reader.ts
      logger.ts
      mesh-mapper.ts
      rate-limiter.ts
  tsconfig.json
```

## File Contents

### LOGGING.md

[Non-code file, content not included]

### README.md

````md
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
````

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
      "full_text": "...",
      "url": "https://pubmed.ncbi.nlm.nih.gov/35123456/"
      "_html": "<div>...</div>",
      "_xml": "<xml>...</xml>"
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
This will return ranked related to heart failure and hypertension from high-quality cardiology journals, published within the last 5 years.
