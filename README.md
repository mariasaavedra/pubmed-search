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
  "topic": "SGLT2 Inhibitors",
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
pubmed-search
├── config/
│   └── pubmed.config.ts     # PubMed API configuration
├── src/
│   ├── controllers/
│   │   └── article.controller.ts
│   ├── services/
│   │   ├── blueprint.service.ts   # Blueprint processing
│   │   ├── pubmed.service.ts      # PubMed API interaction
│   │   ├── query.service.ts       # Query construction
│   │   └── ranking.service.ts     # Article scoring and ranking
│   ├── utils/
│   │   ├── mesh-mapper.ts         # MeSH term mapping
│   │   └── rate-limiter.ts        # API rate limiting (10 requests/second for E-utilities if using a key)
│   ├── routes/
│   │   └── article.routes.ts
│   └── app.ts                     # Express application
├── .env
├── package.json
└── README.md
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
  "topics": ["Thyroid Nodules", "Thyroid Cancer", "Thyroid Function Tests", "Thyroiditis"],
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

## License

MIT

---
