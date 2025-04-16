# Repository Summary

Total Files: 10790
Total Directories: 1569
Top-level Directories: data, dist, node_modules, output, prompts, schema, src
File Types: 1 (1), (575), md (705), json (703), ts (1982), js (5000), map (1595), txt (39), mjs (51), cjs (24), cts (4), flow (2), png (6), bnf (6), c (3), mts (8), yml (19), bare (26), lock (1), markdown (5), pdl (2), bsd (4), sh (2), node (1), css (3), html (5), coffee (6), log (2), tmpl (2), mdown (1), yaml (2), tsbuildinfo (4), properties (1)
Has package.json: true
Has README.md: true
Notable .gitignore entries: .env, node_modules, dist, dist/\*, data/output

# Repository Structure

## File Tree

```
pubmed-search
  LOGGING.md
  README.md
  data
    journal-metrics.json
    output
      afib-cardiology-therapy-narrow-2025-04-16-044255152.json
      diet-cardiology-therapy-narrow-2025-04-16-044306638.json
      diet-cardiology-therapy-narrow-2025-04-16-044734190.json
      hypertension-cardiology-therapy-narrow-2025-04-16-042714045.json
      hypertension-cardiology-therapy-narrow-2025-04-16-043610714.json
      hypertension-cardiology-therapy-narrow-2025-04-16-043706636.json
      hypertension-cardiology-therapy-narrow-2025-04-16-043959230.json
      hypertension-cardiology-therapy-narrow-2025-04-16-044119160.json
      hypertension-cardiology-therapy-narrow-2025-04-16-044742918.json
      hypertension-cardiology-therapy-narrow-2025-04-16-044926716.json
      hypertension-cardiology-therapy-narrow-2025-04-16-045022362.json
      hypertension-cardiology-therapy-narrow-2025-04-16-045106943.json
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

````

### data/journal-metrics.json

```json
{
  "New England Journal of Medicine": {
    "impact_factor": 91.245,
    "h_index": 1060,
    "sjr_score": 18.27
  },
  "The Lancet": {
    "impact_factor": 79.321,
    "h_index": 868,
    "sjr_score": 15.87
  },
  "JAMA": {
    "impact_factor": 56.272,
    "h_index": 726,
    "sjr_score": 12.46
  },
  "BMJ": {
    "impact_factor": 39.89,
    "h_index": 580,
    "sjr_score": 7.79
  },
  "Annals of Internal Medicine": {
    "impact_factor": 25.391,
    "h_index": 418,
    "sjr_score": 9.19
  },
  "Nature Medicine": {
    "impact_factor": 53.44,
    "h_index": 512,
    "sjr_score": 17.85
  },
  "JAMA Internal Medicine": {
    "impact_factor": 21.87,
    "h_index": 305,
    "sjr_score": 8.23
  },
  "PLOS Medicine": {
    "impact_factor": 11.069,
    "h_index": 256,
    "sjr_score": 5.65
  },
  "Circulation": {
    "impact_factor": 29.69,
    "h_index": 598,
    "sjr_score": 10.84
  },
  "Journal of Clinical Oncology": {
    "impact_factor": 44.54,
    "h_index": 507,
    "sjr_score": 13.09
  },
  "Blood": {
    "impact_factor": 22.11,
    "h_index": 471,
    "sjr_score": 8.74
  },
  "Diabetes Care": {
    "impact_factor": 19.35,
    "h_index": 394,
    "sjr_score": 7.16
  },
  "Gastroenterology": {
    "impact_factor": 22.68,
    "h_index": 385,
    "sjr_score": 8.32
  },
  "Journal of the American College of Cardiology": {
    "impact_factor": 24.09,
    "h_index": 464,
    "sjr_score": 9.52
  },
  "Neurology": {
    "impact_factor": 9.91,
    "h_index": 396,
    "sjr_score": 4.76
  },
  "Annals of Neurology": {
    "impact_factor": 10.42,
    "h_index": 285,
    "sjr_score": 5.89
  },
  "Journal of Hepatology": {
    "impact_factor": 25.08,
    "h_index": 248,
    "sjr_score": 8.14
  },
  "American Journal of Psychiatry": {
    "impact_factor": 18.11,
    "h_index": 312,
    "sjr_score": 7.84
  },
  "Annals of the Rheumatic Diseases": {
    "impact_factor": 19.10,
    "h_index": 258,
    "sjr_score": 7.47
  },
  "Clinical Infectious Diseases": {
    "impact_factor": 20.99,
    "h_index": 308,
    "sjr_score": 8.07
  },
  "JAMA Psychiatry": {
    "impact_factor": 21.59,
    "h_index": 208,
    "sjr_score": 9.95
  },
  "JAMA Oncology": {
    "impact_factor": 24.80,
    "h_index": 154,
    "sjr_score": 11.14
  },
  "JAMA Neurology": {
    "impact_factor": 18.30,
    "h_index": 179,
    "sjr_score": 8.52
  },
  "JAMA Cardiology": {
    "impact_factor": 15.80,
    "h_index": 121,
    "sjr_score": 8.89
  },
  "Diabetes": {
    "impact_factor": 10.29,
    "h_index": 342,
    "sjr_score": 5.97
  },
  "European Heart Journal": {
    "impact_factor": 30.71,
    "h_index": 328,
    "sjr_score": 9.63
  },
  "Cancer Discovery": {
    "impact_factor": 39.40,
    "h_index": 175,
    "sjr_score": 17.92
  },
  "The Lancet Oncology": {
    "impact_factor": 41.32,
    "h_index": 289,
    "sjr_score": 14.87
  },
  "The Lancet Neurology": {
    "impact_factor": 44.18,
    "h_index": 271,
    "sjr_score": 14.64
  },
  "The Lancet Infectious Diseases": {
    "impact_factor": 25.07,
    "h_index": 253,
    "sjr_score": 12.29
  }
}


### data/output/schema.json

```json
{
  "clinical_category": "diagnosis",
  "clinical_scope": "narrow",
  "esearch_query": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?term=...",
  "article_count": 0,
  "clinical_specialty": "cardiology",
  "pmids": [111, 222, 333],
  "articles": [
    {
      "title": "Heart Failure Management",
      "abstract": "This article discusses the management of heart failure...",
      "authors": ["John Doe", "Jane Smith"],
      "journal": "Journal of Cardiology",
      "full_text": "This is the full text of the article...",
      "doi": "10.1000/j.jcard.2023.01.001",
      "pmid": 12345678,
      "publication_date": "2023-01-01",
      "publication_year": 2023,
      "publication_month": 1,
      "__html": "<div>...</div>",
      "__xml": "<xml>...</xml>",
      "year": 2023,
      "mesh_terms": ["Heart Failure", "Cardiovascular Diseases"]
    }
  ]
}

````

### data/specialties.json

```json
{
  "cardiology": {
    "common_topics": [
      "Acute coronary syndrome",
      "Myocardial infarction",
      "Heart failure",
      "Atrial fibrillation",
      "Ventricular tachycardia",
      "Bradyarrhythmias",
      "Sudden cardiac death",
      "Stable angina",
      "Unstable angina",
      "Coronary artery disease",
      "Percutaneous coronary intervention",
      "Coronary artery bypass grafting",
      "Hypertrophic cardiomyopathy",
      "Dilated cardiomyopathy",
      "Restrictive cardiomyopathy",
      "Takotsubo cardiomyopathy",
      "Valvular heart disease",
      "Aortic stenosis",
      "Mitral regurgitation",
      "Aortic regurgitation",
      "Mitral stenosis",
      "Tricuspid valve disease",
      "Endocarditis",
      "Pericarditis",
      "Myocarditis",
      "Congenital heart disease",
      "Heart transplantation",
      "Mechanical circulatory support",
      "Implantable cardioverter-defibrillator",
      "Cardiac resynchronization therapy",
      "Antiplatelet therapy",
      "Anticoagulation",
      "NOACs in atrial fibrillation",
      "Warfarin management",
      "Lipid management",
      "Hypertension management",
      "Pulmonary hypertension",
      "Chronic thromboembolic pulmonary hypertension",
      "Echocardiography",
      "Cardiac MRI",
      "Cardiac CT",
      "Nuclear cardiology",
      "Stress testing",
      "Electrocardiogram interpretation",
      "Holter monitoring",
      "Ambulatory blood pressure monitoring",
      "Pacing and pacemaker indications",
      "Sick sinus syndrome",
      "AV nodal reentrant tachycardia",
      "Long QT syndrome",
      "Brugada syndrome",
      "Wolff-Parkinson-White syndrome",
      "Hyperlipidemia",
      "Statins",
      "PCSK9 inhibitors",
      "Inclisiran",
      "Triglyceride lowering therapies",
      "Aspirin in primary prevention",
      "Aspirin in secondary prevention",
      "SGLT2 inhibitors for heart failure",
      "ARNI (sacubitril/valsartan) for heart failure",
      "Beta-blockers for heart failure",
      "Mineralocorticoid receptor antagonists",
      "Diuretics in heart failure",
      "Remote monitoring in cardiology",
      "Telecardiology",
      "COVID-19 and cardiac complications",
      "Cardiac amyloidosis",
      "Fabry disease",
      "Marfan syndrome",
      "Cardiac sarcoidosis",
      "Ischemic stroke prevention in AF",
      "Left atrial appendage closure",
      "Transcatheter aortic valve replacement (TAVR)",
      "Transcatheter mitral valve repair (MitraClip)",
      "Cardiac cachexia",
      "Sleep apnea and cardiovascular risk",
      "Obesity and cardiovascular disease",
      "Diabetes and cardiovascular risk",
      "Smoking cessation and risk reduction",
      "Secondary prevention in CAD",
      "Cardiac rehabilitation",
      "Frailty assessment in cardiology",
      "Antihypertensive therapy",
      "Resistant hypertension",
      "Hyperaldosteronism",
      "Pheochromocytoma and cardiac effects",
      "Coronary microvascular dysfunction",
      "Spontaneous coronary artery dissection (SCAD)",
      "Myocardial bridging",
      "Takayasu's arteritis",
      "Kawasaki disease",
      "Giant cell arteritis",
      "Patent foramen ovale and stroke",
      "Cardiogenic shock",
      "Mechanical support for shock (IABP, Impella, ECMO)",
      "Syncope evaluation",
      "QT prolonging medications and risk",
      "Cardio-oncology",
      "Alcohol septal ablation",
      "Lifestyle modification in cardiovascular disease"
    ],
    "mesh_terms": [
      "Cardiology",
      "Heart Diseases",
      "Coronary Disease",
      "Arrhythmias, Cardiac",
      "Heart Failure",
      "Hypertension",
      "Myocardial Infarction",
      "Vascular Diseases",
      "Echocardiography",
      "Therapeutics"
    ],
    "default_filters": ["Therapy", "Diagnosis", "Prognosis"]
  },
  "internal_medicine": {
    "common_topics": [
      "Hypertension",
      "Diabetes mellitus type 2",
      "Chronic kidney disease",
      "Acute kidney injury",
      "Thyroid disorders",
      "Dyslipidemia",
      "Obesity",
      "Metabolic syndrome",
      "Atrial fibrillation",
      "Chronic obstructive pulmonary disease (COPD)",
      "Asthma",
      "Pneumonia",
      "Heart failure",
      "Coronary artery disease",
      "Venous thromboembolism",
      "Deep vein thrombosis",
      "Pulmonary embolism",
      "Gastroesophageal reflux disease",
      "Peptic ulcer disease",
      "Hepatitis B",
      "Hepatitis C",
      "Cirrhosis",
      "Nonalcoholic fatty liver disease",
      "Irritable bowel syndrome",
      "Inflammatory bowel disease",
      "Crohn's disease",
      "Ulcerative colitis",
      "Anemia",
      "Iron deficiency",
      "B12 deficiency",
      "Folate deficiency",
      "Acute leukemia",
      "Lymphoma",
      "Multiple myeloma",
      "Rheumatoid arthritis",
      "Systemic lupus erythematosus",
      "Gout",
      "Osteoarthritis",
      "Osteoporosis",
      "Infective endocarditis",
      "Sepsis",
      "COVID-19 infection",
      "Influenza",
      "HIV infection",
      "Tuberculosis",
      "Urinary tract infection",
      "Pyelonephritis",
      "Prostate cancer",
      "Breast cancer",
      "Colorectal cancer",
      "Lung cancer",
      "Pancreatic cancer",
      "Melanoma",
      "Hypogonadism",
      "Polycystic ovary syndrome",
      "Menopause management",
      "Hypercalcemia",
      "Hyponatremia",
      "Hypokalemia",
      "Hyperkalemia",
      "Hyperthyroidism",
      "Hypothyroidism",
      "Parathyroid disease",
      "Addison's disease",
      "Cushing's syndrome",
      "Acromegaly",
      "Pituitary adenoma",
      "Coagulopathies",
      "Heparin-induced thrombocytopenia",
      "Anticoagulation therapy",
      "Antiplatelet therapy",
      "Chronic pain management",
      "Opioid prescribing",
      "Alcohol use disorder",
      "Smoking cessation",
      "Sleep apnea",
      "Depression",
      "Anxiety disorders",
      "Delirium",
      "Dementia",
      "Palliative care",
      "Advanced care planning",
      "Frailty and geriatric syndromes",
      "Polypharmacy",
      "Medication safety",
      "Vaccination in adults",
      "Preoperative risk assessment",
      "Falls prevention",
      "Venous access management",
      "Blood transfusion indications",
      "End-of-life care",
      "Healthcare-associated infections",
      "Clostridioides difficile infection",
      "Antibiotic stewardship",
      "Multimorbidity",
      "Health disparities",
      "LGBTQ health",
      "Telemedicine in internal medicine",
      "Practice guidelines adherence"
    ],
    "mesh_terms": [
      "Internal Medicine",
      "General Practice",
      "Chronic Disease",
      "Primary Health Care",
      "Diagnosis",
      "Therapeutics",
      "Drug Therapy",
      "Comorbidity",
      "Preventive Health Services",
      "Evidence-Based Practice"
    ],
    "default_filters": ["Diagnosis", "Therapy", "Clinical Prediction Guides"]
  }
}
```

### dist/app.d.ts

```ts
declare const app: import("express-serve-static-core").Express;
export default app;
```

### dist/app.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const article_routes_1 = __importDefault(require("./routes/article-routes"));
const pubmed_config_1 = require("./config/pubmed-config");
const logger_1 = require("./utils/logger");
const request_logger_1 = require("./middlewares/request-logger");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Request logging middleware
app.use(request_logger_1.requestLogger);
// Routes
app.use("/api", article_routes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
// Root endpoint with API information
app.get("/", (req, res) => {
  res.json({
    name: "PubMed Clinical Article Retriever API",
    version: "0.1.0",
    description:
      "A service for retrieving high-quality medical literature from PubMed based on clinical blueprints",
    endpoints: {
      articles: "POST /api/articles",
      specialties: "GET /api/specialties",
      topics: "GET /api/specialties/{specialty}/topics",
    },
    config: {
      rate_limit: {
        requests_per_second:
          1000 / pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
        max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
      },
      page_size: pubmed_config_1.PUBMED_CONFIG.page_size,
      page_limit: pubmed_config_1.PUBMED_CONFIG.page_limit,
    },
  });
});
// Error handling middleware
app.use((err, req, res, next) => {
  logger_1.Logger.error("Server", `Unhandled error: ${err.message}`, err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});
// Start the server
app.listen(port, "0.0.0.0", () => {
  logger_1.Logger.success(
    "Server",
    `PubMed Clinical Article Retriever API running on port ${port}`
  );
  logger_1.Logger.info("Server", `Health check: http://${host}:${port}/health`);
  logger_1.Logger.info("Server", `API documentation: http://${host}:${port}/`);
  // Log environment details
  logger_1.Logger.debug("Config", "Environment configuration loaded", {
    env: process.env.NODE_ENV || "development",
    rate_limits: {
      requests_per_second:
        1000 / pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
      max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
    },
  });
});
exports.default = app;
//# sourceMappingURL=app.js.map
```

### dist/app.js.map

[Non-code file, content not included]

### dist/config/pubmed-config.d.ts

```ts
export declare const PUBMED_CONFIG: {
  readonly base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  readonly esearch: "/esearch.fcgi";
  readonly efetch: "/efetch.fcgi";
  readonly esummary: "/esummary.fcgi";
  readonly page_limit: 1;
  readonly page_size: 5;
  readonly rate_limit: {
    readonly min_time: 3000;
    readonly max_concurrent: 3;
    readonly reservoir: 10;
    readonly reservoir_refresh_amount: 10;
    readonly reservoir_refresh_interval: number;
  };
  readonly journal_quality: {
    readonly impact_factor_threshold: 5;
    readonly h_index_threshold: 100;
    readonly sjr: 5;
  };
};
export declare const AGE_MAP: {
  readonly "Newborn: Birth-1 month": "infant, newborn[mh]";
  readonly "Infant: Birth-23 months": "infant[mh]";
  readonly "Preschool Child: 2-5 years": "child, preschool[mh]";
  readonly "Child: 6-12 years": "child[mh:noexp]";
  readonly "Adolescent: 13-18 years": "adolescent[mh]";
  readonly "Young Adult: 19-24 years": '"young adult[mh]"';
  readonly "Adult: 19+ years": "adult[mh]";
  readonly "Adult: 19-44 years": "adult[mh:noexp]";
  readonly "Middle Aged: 45-64 years": "middle aged[mh]";
  readonly "Middle Aged + Aged: 45+ years": "(middle aged[mh] OR aged[mh])";
  readonly "Aged: 65+ years": "aged[mh]";
  readonly "80 and over: 80+ years": '"aged, 80 and over[mh]"';
};
export declare const FILTER_MAP: {
  readonly Therapy: {
    readonly broad: "(((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading]))";
    readonly narrow: "(randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))";
  };
  readonly Diagnosis: {
    readonly broad: "(sensitiv*[Title/Abstract] OR sensitivity and specificity[MeSH Terms] OR diagnose[Title/Abstract] OR diagnosed[Title/Abstract] OR diagnoses[Title/Abstract] OR diagnosing[Title/Abstract] OR diagnosis[Title/Abstract] OR diagnostic[Title/Abstract] OR diagnosis[MeSH:noexp])";
    readonly narrow: "(specificity[Title/Abstract])";
  };
  readonly Etiology: {
    readonly broad: "(risk[Title/Abstract] OR risk[MeSH:noexp] OR (risk adjustment[MeSH:noexp] OR risk assessment[MeSH:noexp]))";
    readonly narrow: "((relative[Title/Abstract] AND risk[Title/Abstract]) OR (relative risk[Text Word]))";
  };
  readonly Prognosis: {
    readonly broad: "(incidence[MeSH:noexp] OR mortality[MeSH Terms] OR follow up studies[MeSH:noexp] OR prognos*[Text Word])";
    readonly narrow: "(prognos*[Title/Abstract] OR (first[Title/Abstract] AND episode[Title/Abstract]))";
  };
  readonly "Clinical Prediction Guides": {
    readonly broad: "(predict*[Title/Abstract] OR predictive value of tests[MeSH Terms] OR score[Title/Abstract])";
    readonly narrow: "(validation[Title/Abstract])";
  };
};
export declare const DEFAULT_FILTER: {
  readonly narrow: "(\n  Clinical Trial[pt] OR Controlled Clinical Trial[pt] OR Meta-Analysis[pt]\n  OR Multicenter Study[pt] OR Observational Study[pt] OR Practice Guideline[pt]\n  OR Randomized Controlled Trial[pt] OR Review[pt] OR Systematic Review[pt]\n)\nAND English[Language]";
};
```

### dist/config/pubmed-config.js

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FILTER =
  exports.FILTER_MAP =
  exports.AGE_MAP =
  exports.PUBMED_CONFIG =
    void 0;
exports.PUBMED_CONFIG = {
  // PubMed API
  // https://www.ncbi.nlm.nih.gov/books/NBK25501/
  base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
  esearch: "/esearch.fcgi",
  efetch: "/efetch.fcgi",
  esummary: "/esummary.fcgi",
  page_limit: 1,
  page_size: 5,
  rate_limit: {
    min_time: 3000,
    max_concurrent: 3,
    reservoir: 10,
    reservoir_refresh_amount: 10,
    reservoir_refresh_interval: 60 * 1000,
  },
  journal_quality: {
    impact_factor_threshold: 5,
    h_index_threshold: 100,
    sjr: 5,
  },
};
exports.AGE_MAP = {
  "Newborn: Birth-1 month": "infant, newborn[mh]",
  "Infant: Birth-23 months": "infant[mh]",
  "Preschool Child: 2-5 years": "child, preschool[mh]",
  "Child: 6-12 years": "child[mh:noexp]",
  "Adolescent: 13-18 years": "adolescent[mh]",
  "Young Adult: 19-24 years": '"young adult[mh]"',
  "Adult: 19+ years": "adult[mh]",
  "Adult: 19-44 years": "adult[mh:noexp]",
  "Middle Aged: 45-64 years": "middle aged[mh]",
  "Middle Aged + Aged: 45+ years": "(middle aged[mh] OR aged[mh])",
  "Aged: 65+ years": "aged[mh]",
  "80 and over: 80+ years": '"aged, 80 and over[mh]"',
};
exports.FILTER_MAP = {
  Therapy: {
    broad: `(((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading]))`,
    narrow: `(randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))`,
  },
  Diagnosis: {
    broad: `(sensitiv*[Title/Abstract] OR sensitivity and specificity[MeSH Terms] OR diagnose[Title/Abstract] OR diagnosed[Title/Abstract] OR diagnoses[Title/Abstract] OR diagnosing[Title/Abstract] OR diagnosis[Title/Abstract] OR diagnostic[Title/Abstract] OR diagnosis[MeSH:noexp])`,
    narrow: `(specificity[Title/Abstract])`,
  },
  Etiology: {
    broad: `(risk[Title/Abstract] OR risk[MeSH:noexp] OR (risk adjustment[MeSH:noexp] OR risk assessment[MeSH:noexp]))`,
    narrow: `((relative[Title/Abstract] AND risk[Title/Abstract]) OR (relative risk[Text Word]))`,
  },
  Prognosis: {
    broad: `(incidence[MeSH:noexp] OR mortality[MeSH Terms] OR follow up studies[MeSH:noexp] OR prognos*[Text Word])`,
    narrow: `(prognos*[Title/Abstract] OR (first[Title/Abstract] AND episode[Title/Abstract]))`,
  },
  "Clinical Prediction Guides": {
    broad: `(predict*[Title/Abstract] OR predictive value of tests[MeSH Terms] OR score[Title/Abstract])`,
    narrow: `(validation[Title/Abstract])`,
  },
};
exports.DEFAULT_FILTER = {
  narrow: `(
  Clinical Trial[pt] OR Controlled Clinical Trial[pt] OR Meta-Analysis[pt]
  OR Multicenter Study[pt] OR Observational Study[pt] OR Practice Guideline[pt]
  OR Randomized Controlled Trial[pt] OR Review[pt] OR Systematic Review[pt]
)
AND English[Language]`,
};
//# sourceMappingURL=pubmed-config.js.map
```

### dist/config/pubmed-config.js.map

[Non-code file, content not included]

### dist/controllers/article-controller.d.ts

```ts
import { Request, Response } from "express";
/**
 * Controller for handling article requests
 */
declare class ArticleController {
  private blueprint_service;
  private query_service;
  private pubmed_service;
  private ranking_service;
  private file_storage_service;
  constructor();
  /**
   * Handle article retrieval based on clinical blueprint
   * @param req Express request
   * @param res Express response
   */
  GetArticles(req: Request, res: Response): Promise<void>;
  /**
   * Get suggested topics for a specialty
   * @param req Express request
   * @param res Express response
   */
  GetSuggestedTopics(req: Request, res: Response): void;
  /**
   * Get all available specialties
   * @param _req Express request
   * @param res Express response
   */
  GetSpecialties(_req: Request, res: Response): void;
}
export default ArticleController;
```

### dist/controllers/article-controller.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const blueprint_service_1 = __importDefault(
  require("../services/blueprint-service")
);
const query_service_1 = __importDefault(require("../services/query-service"));
const pubmed_service_1 = __importDefault(require("../services/pubmed-service"));
const ranking_service_1 = __importDefault(
  require("../services/ranking-service")
);
const file_storage_service_1 = __importDefault(
  require("../services/file-storage-service")
);
const logger_1 = require("../utils/logger");
/**
 * Controller for handling article requests
 */
class ArticleController {
  constructor() {
    this.blueprint_service = new blueprint_service_1.default();
    this.query_service = new query_service_1.default();
    this.pubmed_service = new pubmed_service_1.default();
    this.ranking_service = new ranking_service_1.default();
    this.file_storage_service = new file_storage_service_1.default();
  }
  /**
   * Handle article retrieval based on clinical blueprint
   * @param req Express request
   * @param res Express response
   */
  async GetArticles(req, res) {
    const start_time = Date.now();
    try {
      // Validate request body
      const article_request = req.body;
      logger_1.Logger.debug(
        "ArticleController",
        "Received article request",
        article_request
      );
      // Process the blueprint
      const blueprint =
        this.blueprint_service.ProcessBlueprint(article_request);
      logger_1.Logger.debug(
        "ArticleController",
        "Processed blueprint",
        blueprint
      );
      // Build search query
      const query = this.query_service.BuildSearchQuery(blueprint);
      logger_1.Logger.debug("ArticleController", "Constructed query", query);
      // Validate query
      if (!this.query_service.ValidateQuery(query)) {
        res.status(400).json({
          error: "Invalid query construction",
        });
        return;
      }
      // Get total count (for pagination info)
      const total_count = await this.pubmed_service.GetArticleCount(query);
      logger_1.Logger.debug(
        "ArticleController",
        `Found ${total_count} total matching articles`
      );
      // Search articles
      const pmids = await this.pubmed_service.SearchArticles(
        query,
        article_request.page || 1,
        article_request.limit || 10
      );
      if (pmids.length === 0) {
        logger_1.Logger.info(
          "ArticleController",
          "No articles found for query"
        );
        const duration = Date.now() - start_time;
        const saved_filename = await this.file_storage_service.saveSearchResult(
          [],
          blueprint,
          query,
          [],
          0
        );
        logger_1.Logger.info(
          "ArticleController",
          `Empty search results saved to ${saved_filename}`
        );
        res.json({
          articles: [],
          meta: {
            total: 0,
            processing_time: duration,
            saved_filename,
          },
        });
        return;
      }
      logger_1.Logger.debug(
        "ArticleController",
        `Retrieved ${pmids.length} article IDs`,
        { pmids }
      );
      // Fetch article details
      const articles = await this.pubmed_service.FetchArticleDetails(pmids);
      logger_1.Logger.debug(
        "ArticleController",
        `Fetched details for ${articles.length} articles`
      );
      // Rank articles
      const ranked_articles = this.ranking_service.RankArticles(
        articles,
        blueprint.topics
      );
      logger_1.Logger.debug(
        "ArticleController",
        "Articles ranked successfully"
      );
      const duration = Date.now() - start_time;
      // Save search results
      const saved_filename = await this.file_storage_service.saveSearchResult(
        ranked_articles,
        blueprint,
        query + "-ranked",
        pmids,
        total_count
      );
      logger_1.Logger.info(
        "ArticleController",
        `Search results saved to ${saved_filename}`
      );
      // Return results
      logger_1.Logger.success(
        "ArticleController",
        `Request completed in ${duration}ms, returning ${ranked_articles.length} articles`
      );
      res.json({
        articles: ranked_articles,
        meta: {
          total: total_count,
          processing_time: duration,
          saved_filename,
          encoding: {
            tables: "base64",
            original_xml: "base64",
            sanitized_html: "base64",
          },
        },
      });
    } catch (error) {
      logger_1.Logger.error(
        "ArticleController",
        "Error retrieving articles",
        error
      );
      res.status(500).json({
        error: "An error occurred while processing your request",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  /**
   * Get suggested topics for a specialty
   * @param req Express request
   * @param res Express response
   */
  GetSuggestedTopics(req, res) {
    try {
      const { specialty } = req.params;
      logger_1.Logger.debug(
        "ArticleController",
        `Getting suggested topics for specialty: ${specialty}`
      );
      if (!specialty) {
        logger_1.Logger.warn(
          "ArticleController",
          "Specialty parameter is missing"
        );
        res.status(400).json({
          error: "Specialty parameter is required",
        });
        return;
      }
      const topics = this.blueprint_service.GetSuggestedTopics(specialty);
      logger_1.Logger.debug(
        "ArticleController",
        `Found ${topics.length} topics for ${specialty}`
      );
      res.json({
        specialty,
        topics,
      });
    } catch (error) {
      logger_1.Logger.error(
        "ArticleController",
        "Error getting suggested topics",
        error
      );
      res.status(500).json({
        error: "An error occurred while retrieving suggested topics",
      });
    }
  }
  /**
   * Get all available specialties
   * @param _req Express request
   * @param res Express response
   */
  GetSpecialties(_req, res) {
    try {
      logger_1.Logger.debug(
        "ArticleController",
        "Getting all available specialties"
      );
      const specialties = this.blueprint_service.GetSpecialties();
      const specialty_list = Object.keys(specialties);
      logger_1.Logger.debug(
        "ArticleController",
        `Found ${specialty_list.length} specialties`
      );
      res.json({
        specialties: specialty_list,
      });
    } catch (error) {
      logger_1.Logger.error(
        "ArticleController",
        "Error getting specialties",
        error
      );
      res.status(500).json({
        error: "An error occurred while retrieving specialties",
      });
    }
  }
}
exports.default = ArticleController;
//# sourceMappingURL=article-controller.js.map
```

### dist/controllers/article-controller.js.map

[Non-code file, content not included]

### dist/middlewares/request-logger.d.ts

```ts
import { Request, Response, NextFunction } from "express";
/**
 * Express middleware for logging HTTP requests and responses
 */
export declare function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void;
```

### dist/middlewares/request-logger.js

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../utils/logger");
/**
 * Generate a unique request ID
 * @returns A unique request ID
 */
function generateRequestId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
/**
 * Clean request body for logging - removes sensitive data
 * @param body Request body
 * @returns Cleaned body object
 */
function cleanRequestBody(body) {
  if (!body) return undefined;
  const cleanedBody = { ...body };
  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "api_key", "apiKey", "secret"];
  sensitiveFields.forEach((field) => {
    if (cleanedBody[field]) {
      cleanedBody[field] = "[REDACTED]";
    }
  });
  return cleanedBody;
}
/**
 * Express middleware for logging HTTP requests and responses
 */
function requestLogger(req, res, next) {
  // Add request ID and start time
  const requestId = generateRequestId();
  const startTime = Date.now();
  // Store request ID in response locals
  res.locals.requestId = requestId;
  // Log the incoming request
  logger_1.Logger.http(req.method, req.url, undefined, undefined);
  // Log detailed request info
  logger_1.Logger.debug("Request", `${req.method} ${req.url}`, {
    requestId: res.locals.requestId,
    body: req.method !== "GET" ? cleanRequestBody(req.body) : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
      accept: req.headers["accept"],
    },
  });
  // Store original methods
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);
  // Override res.send
  res.send = function (body) {
    const duration = Date.now() - startTime;
    // Log response info
    logger_1.Logger.http(req.method, req.url, res.statusCode, duration);
    // For errors, provide more detail
    if (res.statusCode >= 400) {
      logger_1.Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      logger_1.Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      logger_1.Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }
    return originalSend.call(this, body);
  };
  // Override res.json
  res.json = function (body) {
    const duration = Date.now() - startTime;
    // Log response info
    logger_1.Logger.http(req.method, req.url, res.statusCode, duration);
    // For errors, provide more detail
    if (res.statusCode >= 400 && res.statusCode < 500) {
      logger_1.Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      logger_1.Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      logger_1.Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }
    return originalJson.call(this, body);
  };
  // Continue to the next middleware
  next();
}
//# sourceMappingURL=request-logger.js.map
```

### dist/middlewares/request-logger.js.map

[Non-code file, content not included]

### dist/routes/article-routes.d.ts

```ts
declare const router: import("express-serve-static-core").Router;
export default router;
```

### dist/routes/article-routes.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_controller_1 = __importDefault(
  require("../controllers/article-controller")
);
const router = (0, express_1.Router)();
const controller = new article_controller_1.default();
/**
 * @route POST /api/articles
 * @description Get articles based on a clinical blueprint
 */
router.post("/articles", (req, res) => controller.GetArticles(req, res));
/**
 * @route GET /api/specialties
 * @description Get all available specialties
 */
router.get("/specialties", (req, res) => controller.GetSpecialties(req, res));
/**
 * @route GET /api/specialties/:specialty/topics
 * @description Get suggested topics for a specialty
 */
router.get("/specialties/:specialty/topics", (req, res) =>
  controller.GetSuggestedTopics(req, res)
);
exports.default = router;
//# sourceMappingURL=article-routes.js.map
```

### dist/routes/article-routes.js.map

[Non-code file, content not included]

### dist/services/article-content-service.d.ts

```ts
import { ContentExtractionResult } from "../types";
/**
 * Service for extracting and normalizing article content
 */
declare class ArticleContentService {
  private rate_limiter;
  constructor();
  /**
   * Extract content from PubMed article page
   * @param pmid PubMed ID
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content
   */
  extractContentFromPubMed(
    pmid: string,
    original_xml?: string
  ): Promise<ContentExtractionResult>;
  /**
   * Normalize content from DOM with enhanced HTML preservation
   * @param document DOM document
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content with HTML
   */
  private normalizeContent;
  /**
   * Extract text content from an element
   * @param element DOM element
   * @returns Cleaned text content
   */
  private extractTextContent;
  /**
   * Extract section content based on heading text or section attributes
   * @param mainContent Main content element
   * @param result Result object to populate
   */
  private extractSections;
  /**
   * Sanitize HTML to remove scripts and unsafe elements
   * @param html Raw HTML
   * @returns Sanitized HTML
   */
  private sanitizeHtml;
  /**
   * Clean extracted text
   * @param text Raw text
   * @returns Cleaned text
   */
  private cleanText;
  /**
   * Check if content meets quality standards
   * @param text Content to check
   * @returns True if quality content
   */
  private isQualityContent;
}
export default ArticleContentService;
```

### dist/services/article-content-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../utils/logger");
const rate_limiter_1 = __importDefault(require("../utils/rate-limiter"));
/**
 * Service for extracting and normalizing article content
 */
class ArticleContentService {
  constructor() {
    // Initialize rate limiter - conservative limits to avoid blocking
    this.rate_limiter = new rate_limiter_1.default(2, 1000); // 2 concurrent, 1 second between requests
    logger_1.Logger.debug(
      "ArticleContentService",
      "Initialized with rate limiting"
    );
  }
  /**
   * Extract content from PubMed article page
   * @param pmid PubMed ID
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content
   */
  async extractContentFromPubMed(pmid, original_xml) {
    try {
      await this.rate_limiter.WaitForSlot();
      logger_1.Logger.debug(
        "ArticleContentService",
        `Extracting content for PMID: ${pmid}`
      );
      const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
      // Create virtual console to suppress JSDOM warnings
      const virtualConsole = new jsdom_1.VirtualConsole();
      virtualConsole.on("error", () => {});
      virtualConsole.on("warn", () => {});
      // Use puppeteer for initial page load
      const browser = await puppeteer_1.default.launch({ headless: true });
      const page = await browser.newPage();
      try {
        logger_1.Logger.debug(
          "ArticleContentService",
          `Navigating to URL: ${url}`
        );
        // Set a page timeout
        await page.setDefaultNavigationTimeout(30000);
        await page.goto(url, { waitUntil: "networkidle0" });
        const content = await page.content();
        logger_1.Logger.debug(
          "ArticleContentService",
          `Page loaded successfully`
        );
        // Parse with enhanced JSDOM configuration
        const dom = new jsdom_1.JSDOM(content, {
          runScripts: "outside-only",
          resources: "usable",
          virtualConsole,
        });
        logger_1.Logger.debug(
          "ArticleContentService",
          `JSDOM initialized successfully`
        );
        const document = dom.window.document;
        // Remove non-content elements
        document
          .querySelectorAll(
            "script, style, nav, header, footer, .aside-section, .author-section, iframe"
          )
          .forEach((el) => el.remove());
        // Extract content
        const result = this.normalizeContent(document, original_xml);
        logger_1.Logger.debug(
          "ArticleContentService",
          `Content extraction completed for PMID: ${pmid}`
        );
        logger_1.Logger.debug(
          "ArticleContentService",
          `Successfully extracted content for PMID: ${pmid}`,
          {
            has_full_text: !!result.full_text,
            has_methods: !!result.methods,
            has_results: !!result.results,
            has_discussion: !!result.discussion,
            has_conclusion: !!result.conclusion,
            has_sanitized_html: !!result.sanitized_html,
            has_original_xml: !!result.original_xml,
            figure_count: result.figures.length,
            table_count: result.tables.length,
            supplementary_count: result.supplementary_material.length,
          }
        );
        return result;
      } finally {
        await browser.close();
      }
    } catch (error) {
      logger_1.Logger.error(
        "ArticleContentService",
        `Error extracting content for PMID: ${pmid}`,
        error
      );
      throw new Error(`Failed to extract content for PMID: ${pmid}`);
    }
  }
  /**
   * Normalize content from DOM with enhanced HTML preservation
   * @param document DOM document
   * @param original_xml Optional original XML from PubMed API
   * @returns Normalized content with HTML
   */
  normalizeContent(document, original_xml) {
    const result = {
      full_text: "",
      figures: [],
      tables: [],
      supplementary_material: [],
      original_xml: original_xml,
    };
    try {
      // Extract main content area
      const mainContent =
        document.querySelector("#article-details") ||
        document.querySelector("main") ||
        document.querySelector("article") ||
        document.querySelector(".article-body") ||
        document.body;
      if (mainContent) {
        // Sanitize HTML and store it
        const sanitizedHtml = this.sanitizeHtml(mainContent.outerHTML);
        result.sanitized_html = sanitizedHtml;
        // Extract full text
        result.full_text = this.extractTextContent(mainContent);
        // Extract sections using both attribute and heading detection
        this.extractSections(mainContent, result);
        // Extract figures
        const figures = document.querySelectorAll(
          'figure, .figure, div[class*="figure"]'
        );
        figures.forEach((figure) => {
          const img = figure.querySelector("img");
          if (img && img.src) {
            result.figures.push(img.src);
          }
        });
        // Extract tables
        const tables = document.querySelectorAll(
          'table, .table, div[class*="table"]'
        );
        tables.forEach((table) => {
          result.tables.push(this.sanitizeHtml(table.outerHTML));
        });
        // Extract supplementary materials
        const supplements = document.querySelectorAll(
          'a[href*="supplementary"], a[href*="supporting"], a[href*="supplement"], a[href*="appendix"]'
        );
        supplements.forEach((supp) => {
          const href = supp.href;
          if (href) {
            result.supplementary_material.push(href);
          }
        });
      }
      // Validate content quality
      if (!this.isQualityContent(result.full_text)) {
        logger_1.Logger.warn(
          "ArticleContentService",
          "Low-quality content detection"
        );
      }
      return result;
    } catch (error) {
      logger_1.Logger.error(
        "ArticleContentService",
        "Error normalizing content",
        error
      );
      throw new Error("Failed to normalize content");
    }
  }
  /**
   * Extract text content from an element
   * @param element DOM element
   * @returns Cleaned text content
   */
  extractTextContent(element) {
    // Target content-rich elements
    const contentElements = element.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, td, blockquote"
    );
    // If no rich elements are found, fall back to all text
    if (contentElements.length === 0) {
      return this.cleanText(element.textContent || "");
    }
    // Extract and join content from rich elements
    return Array.from(contentElements)
      .map((el) => this.cleanText(el.textContent || ""))
      .filter((text) => text.length > 0)
      .join("\n\n");
  }
  /**
   * Extract section content based on heading text or section attributes
   * @param mainContent Main content element
   * @param result Result object to populate
   */
  extractSections(mainContent, result) {
    // Try section-based extraction first
    const sections = mainContent.querySelectorAll(
      'section, div[role="region"]'
    );
    let sectionsFound = false;
    sections.forEach((section) => {
      const heading = section.querySelector("h1, h2, h3, h4, h5, h6");
      const sectionId = section.id || "";
      const sectionClass = section.className || "";
      const headingText = heading
        ? (heading.textContent || "").toLowerCase()
        : "";
      // Match by heading text, id, or class
      if (
        headingText.includes("method") ||
        sectionId.includes("method") ||
        sectionClass.includes("method")
      ) {
        result.methods = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("result") ||
        sectionId.includes("result") ||
        sectionClass.includes("result")
      ) {
        result.results = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("discussion") ||
        sectionId.includes("discussion") ||
        sectionClass.includes("discussion")
      ) {
        result.discussion = this.extractTextContent(section);
        sectionsFound = true;
      } else if (
        headingText.includes("conclusion") ||
        sectionId.includes("conclusion") ||
        sectionClass.includes("conclusion")
      ) {
        result.conclusion = this.extractTextContent(section);
        sectionsFound = true;
      }
    });
    // If no sections found, try heading-based extraction
    if (!sectionsFound) {
      const headings = mainContent.querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        const headingText = (heading.textContent || "").toLowerCase();
        let content = "";
        // Collect content until the next heading
        let nextElement = heading.nextElementSibling;
        while (nextElement && !nextElement.matches("h1, h2, h3, h4, h5, h6")) {
          content += this.cleanText(nextElement.textContent || "") + "\n\n";
          nextElement = nextElement.nextElementSibling;
        }
        // Assign to the appropriate section
        if (headingText.includes("method")) {
          result.methods = content;
        } else if (headingText.includes("result")) {
          result.results = content;
        } else if (headingText.includes("discussion")) {
          result.discussion = content;
        } else if (headingText.includes("conclusion")) {
          result.conclusion = content;
        }
      }
    }
  }
  /**
   * Sanitize HTML to remove scripts and unsafe elements
   * @param html Raw HTML
   * @returns Sanitized HTML
   */
  sanitizeHtml(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "safe-data:")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<link\b[^<]*(?:(?!>)<[^<]*)*>/gi, "")
      .replace(/<meta\b[^<]*(?:(?!>)<[^<]*)*>/gi, "");
  }
  /**
   * Clean extracted text
   * @param text Raw text
   * @returns Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\n+/g, "\n") // Normalize line breaks
      .trim();
  }
  /**
   * Check if content meets quality standards
   * @param text Content to check
   * @returns True if quality content
   */
  isQualityContent(text) {
    if (!text) return false;
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    return (
      words > 100 &&
      sentences > 5 &&
      avgWordsPerSentence > 5 &&
      avgWordsPerSentence < 30 &&
      !text.includes("Access denied") &&
      !text.includes("Subscription required")
    );
  }
}
exports.default = ArticleContentService;
//# sourceMappingURL=article-content-service.js.map
```

### dist/services/article-content-service.js.map

[Non-code file, content not included]

### dist/services/blueprint-service.d.ts

```ts
import { ArticleRequest, ProcessedBlueprint } from "../types";
/**
 * Service for processing clinical blueprints
 */
declare class BlueprintService {
  private specialties;
  constructor();
  /**
   * Process a blueprint request into a standardized format
   * @param request The blueprint request
   * @returns Processed blueprint
   */
  ProcessBlueprint(request: ArticleRequest): ProcessedBlueprint;
  /**
   * Normalize specialty name (lowercase, trim, handle aliases)
   * @param specialty Specialty name
   * @returns Normalized specialty name
   */
  NormalizeSpecialty(specialty: string): string;
  /**
   * Validate if a specialty exists in our database
   * @param specialty Specialty to validate
   * @returns True if the specialty is valid
   */
  ValidateSpecialty(specialty: string): boolean;
  /**
   * Get suggested topics for a specialty
   * @param specialty The specialty
   * @returns Array of common topics for the specialty
   */
  GetSuggestedTopics(specialty: string): string[];
  /**
   * Normalize topics (lowercase, trim, deduplicate)
   * @param topics Array of topics
   * @returns Normalized topics
   */
  NormalizeTopics(topics: string[]): string[];
  /**
   * Get MeSH terms for a specialty
   * @param specialty The specialty
   * @returns Array of MeSH terms for the specialty
   */
  GetSpecialtyMeshTerms(specialty: string): string[];
  /**
   * Get all specialties
   * @returns All specialties data
   */
  GetSpecialties(): Record<
    string,
    {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }
  >;
}
export default BlueprintService;
```

### dist/services/blueprint-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const file_reader_1 = __importDefault(require("../utils/file-reader"));
const logger_1 = require("../utils/logger");
/**
 * Service for processing clinical blueprints
 */
class BlueprintService {
  constructor() {
    this.specialties = file_reader_1.default.GetSpecialties();
    logger_1.Logger.debug(
      "BlueprintService",
      `Initialized with ${Object.keys(this.specialties).length} specialties`
    );
  }
  /**
   * Process a blueprint request into a standardized format
   * @param request The blueprint request
   * @returns Processed blueprint
   */
  ProcessBlueprint(request) {
    logger_1.Logger.debug(
      "BlueprintService",
      `Processing blueprint request`,
      request
    );
    // Normalize and validate inputs
    const normalized_specialty = this.NormalizeSpecialty(request.specialty);
    logger_1.Logger.debug(
      "BlueprintService",
      `Normalized specialty: ${request.specialty} -> ${normalized_specialty}`
    );
    const normalized_topics = this.NormalizeTopics(request.topics);
    logger_1.Logger.debug(
      "BlueprintService",
      `Normalized ${request.topics.length} topics -> ${normalized_topics.length} unique topics`
    );
    // Verify specialty exists
    if (!this.ValidateSpecialty(normalized_specialty)) {
      logger_1.Logger.error(
        "BlueprintService",
        `Invalid specialty: ${normalized_specialty}`
      );
      throw new Error(`Invalid specialty: ${normalized_specialty}`);
    }
    // Set default filters if not provided, or use the provided ones
    const clinical_queries =
      request.filters?.clinical_queries ||
      this.specialties[normalized_specialty].default_filters;
    const blueprint = {
      specialty: normalized_specialty,
      topics: normalized_topics,
      filters: {
        clinical_queries,
        age_group: request.filters?.age_group,
        year_range: request.filters?.year_range || 3, // Default to last 3 years
      },
    };
    logger_1.Logger.debug(
      "BlueprintService",
      `Blueprint processed successfully`,
      blueprint
    );
    return blueprint;
  }
  /**
   * Normalize specialty name (lowercase, trim, handle aliases)
   * @param specialty Specialty name
   * @returns Normalized specialty name
   */
  NormalizeSpecialty(specialty) {
    const normalized = specialty.toLowerCase().trim();
    // Handle common aliases
    const aliases = {
      cardio: "cardiology",
      neuro: "neurology",
      endo: "endocrinology",
      gastro: "gastroenterology",
      psych: "psychiatry",
      rheum: "rheumatology",
      id: "infectious_diseases",
      "infectious disease": "infectious_diseases",
      "infectious diseases": "infectious_diseases",
    };
    return aliases[normalized] || normalized;
  }
  /**
   * Validate if a specialty exists in our database
   * @param specialty Specialty to validate
   * @returns True if the specialty is valid
   */
  ValidateSpecialty(specialty) {
    return !!this.specialties[specialty];
  }
  /**
   * Get suggested topics for a specialty
   * @param specialty The specialty
   * @returns Array of common topics for the specialty
   */
  GetSuggestedTopics(specialty) {
    const normalized_specialty = this.NormalizeSpecialty(specialty);
    if (!this.ValidateSpecialty(normalized_specialty)) {
      return [];
    }
    return this.specialties[normalized_specialty].common_topics;
  }
  /**
   * Normalize topics (lowercase, trim, deduplicate)
   * @param topics Array of topics
   * @returns Normalized topics
   */
  NormalizeTopics(topics) {
    // Process each topic and remove duplicates
    const normalized = topics
      .map((topic) => topic.toLowerCase().trim())
      .filter((topic) => topic.length > 0);
    // Remove duplicates
    return [...new Set(normalized)];
  }
  /**
   * Get MeSH terms for a specialty
   * @param specialty The specialty
   * @returns Array of MeSH terms for the specialty
   */
  GetSpecialtyMeshTerms(specialty) {
    const normalized_specialty = this.NormalizeSpecialty(specialty);
    if (!this.ValidateSpecialty(normalized_specialty)) {
      return [];
    }
    return this.specialties[normalized_specialty].mesh_terms;
  }
  /**
   * Get all specialties
   * @returns All specialties data
   */
  GetSpecialties() {
    return this.specialties;
  }
}
exports.default = BlueprintService;
//# sourceMappingURL=blueprint-service.js.map
```

### dist/services/blueprint-service.js.map

[Non-code file, content not included]

### dist/services/file-storage-service.d.ts

```ts
import { ProcessedBlueprint, Article } from "../types";
declare class FileStorageService {
  private outputDir;
  constructor();
  /**
   * Save search results to a JSON file
   * @param articles The articles to save
   * @param blueprint The processed blueprint
   * @param query The search query used
   * @param pmids Array of PMIDs
   * @param totalCount Total number of articles found
   */
  saveSearchResult(
    articles: Article[],
    blueprint: ProcessedBlueprint,
    query: string,
    pmids: string[],
    totalCount: number
  ): Promise<string>;
  /**
   * Create a log-friendly preview of article content
   * @param result The saved search result
   * @returns Object with previews of important fields
   */
  private createContentPreview;
  /**
   * Generate MeSH terms for an article using the MeshMapper utility
   * @param article The article to generate terms for
   * @returns Array of MeSH terms
   */
  private generateMeshTerms;
  /**
   * Generate a filename for the search results
   * @param blueprint The processed blueprint
   * @returns The generated filename
   */
  private generateFilename;
}
export default FileStorageService;
```

### dist/services/file-storage-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const content_processor_1 = require("../utils/content-processor");
const mesh_mapper_1 = __importDefault(require("../utils/mesh-mapper"));
const crypto_1 = require("crypto");
class FileStorageService {
  constructor() {
    this.outputDir = path_1.default.join(process.cwd(), "data", "output");
  }
  /**
   * Save search results to a JSON file
   * @param articles The articles to save
   * @param blueprint The processed blueprint
   * @param query The search query used
   * @param pmids Array of PMIDs
   * @param totalCount Total number of articles found
   */
  async saveSearchResult(articles, blueprint, query, pmids, totalCount) {
    try {
      // Ensure output directory exists
      await promises_1.default.mkdir(this.outputDir, { recursive: true });
      const result = {
        clinical_category: blueprint.filters.clinical_queries[0], // Will be validated by type
        clinical_scope: "narrow", // Using narrow scope as default per config
        esearch_query: query,
        article_count: totalCount,
        clinical_specialty: blueprint.specialty,
        pmids: pmids,
        articles: articles.map((article) => ({
          pmid: article.pmid,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          journal: article.journal,
          year: new Date(article.pub_date).getFullYear(),
          // Use extracted MeSH terms if available, otherwise generate them
          mesh_terms: article.mesh_terms || this.generateMeshTerms(article),
          full_text: article.full_text,
          methods: article.methods,
          results: article.results,
          discussion: article.discussion,
          conclusion: article.conclusion,
          figures: article.figures,
          tables: article.tables
            ? content_processor_1.ContentProcessor.encodeArray(article.tables)
            : undefined,
          supplementary_material: article.supplementary_material,
          original_xml: content_processor_1.ContentProcessor.encodeContent(
            article.original_xml
          ),
          sanitized_html: content_processor_1.ContentProcessor.encodeContent(
            article.sanitized_html
          ),
        })),
        encoding_metadata: {
          tables: "base64",
          original_xml: "base64",
          sanitized_html: "base64",
        },
      };
      const filename = this.generateFilename(blueprint);
      const filepath = path_1.default.join(this.outputDir, filename);
      logger_1.Logger.info(
        "FileStorageService",
        `The complete data will be saved at ${filepath} which contains the search results`,
        this.createContentPreview(result)
      );
      await promises_1.default.writeFile(
        filepath,
        JSON.stringify(result, null, 2)
      );
      return filename;
    } catch (error) {
      logger_1.Logger.error(
        "FileStorageService",
        "Error saving search results",
        error
      );
      throw error;
    }
  }
  /**
   * Create a log-friendly preview of article content
   * @param result The saved search result
   * @returns Object with previews of important fields
   */
  createContentPreview(result) {
    // Extract first article for preview (or return empty if no articles)
    if (result.articles.length === 0) {
      return { articles: [] };
    }
    const firstArticle = result.articles[0];
    // Helper to create truncated preview
    const preview = (content, maxLength = 100) => {
      if (!content) return "[empty]";
      return content.length > maxLength
        ? `${content.substring(0, maxLength)}... (${content.length} chars)`
        : content;
    };
    // For encoded content, show both raw (encoded) preview and decoded preview
    const encodedPreview = (content, maxLength = 50) => {
      if (!content) return "[empty]";
      const decoded =
        content_processor_1.ContentProcessor.decodeContent(content);
      return `[Encoded: ${preview(content, maxLength)}] [Decoded: ${preview(
        decoded,
        maxLength
      )}]`;
    };
    return {
      article_count: result.article_count,
      articles_preview: {
        count: result.articles.length,
        first_article: {
          pmid: firstArticle.pmid,
          title: firstArticle.title,
          full_text: preview(firstArticle.full_text, 150),
          methods: preview(firstArticle.methods, 150),
          results: preview(firstArticle.results, 150),
          discussion: preview(firstArticle.discussion, 150),
          conclusion: preview(firstArticle.conclusion, 150),
          original_xml: encodedPreview(firstArticle.original_xml),
          sanitized_html: encodedPreview(firstArticle.sanitized_html),
          tables: Array.isArray(firstArticle.tables)
            ? `[${firstArticle.tables.length} tables, first: ${encodedPreview(
                firstArticle.tables[0]
              )}]`
            : "[no tables]",
        },
      },
    };
  }
  /**
   * Generate MeSH terms for an article using the MeshMapper utility
   * @param article The article to generate terms for
   * @returns Array of MeSH terms
   */
  generateMeshTerms(article) {
    const terms = [];
    // Add terms from the title
    if (article.title) {
      const titleTerms = mesh_mapper_1.default.MapTerm(article.title);
      terms.push(...titleTerms);
    }
    // Add terms from the abstract (if needed)
    if (article.abstract && terms.length < 3) {
      // Extract key phrases from abstract (simplified approach)
      const keyPhrases = article.abstract
        .split(/[.,;:]/)
        .map((phrase) => phrase.trim())
        .filter((phrase) => phrase.length > 10 && phrase.length < 60)
        .slice(0, 2); // Take up to 2 phrases
      // Generate terms from key phrases
      keyPhrases.forEach((phrase) => {
        const phraseTerms = mesh_mapper_1.default.MapTerm(phrase);
        terms.push(...phraseTerms);
      });
    }
    // Deduplicate terms
    const uniqueTerms = [...new Set(terms)];
    // Ensure we have at least some terms
    if (uniqueTerms.length === 0) {
      // If no terms were mapped, use a generic clinical term
      return ["Medical Subject Headings"];
    }
    return uniqueTerms;
  }
  /**
   * Generate a filename for the search results
   * @param blueprint The processed blueprint
   * @returns The generated filename
   */
  generateFilename(blueprint) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "")
      .replace(/[T]/g, "-")
      .replace(/[Z]/g, "");
    const sanitize = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const components = [
      sanitize(blueprint.topics[0]),
      sanitize(blueprint.specialty),
      sanitize(blueprint.filters.clinical_queries[0]),
      "narrow",
      timestamp,
      (0, crypto_1.randomBytes)(4).toString("hex"),
    ];
    return `${components.join("-")}.json`;
  }
}
exports.default = FileStorageService;
//# sourceMappingURL=file-storage-service.js.map
```

### dist/services/file-storage-service.js.map

[Non-code file, content not included]

### dist/services/pubmed-service.d.ts

```ts
import { ParsedArticleData } from "../types";
/**
 * Service for interacting with the PubMed API
 */
declare class PubmedService {
  private base_url;
  private api_key;
  private rate_limiter;
  private content_service;
  constructor();
  /**
   * Search for articles using a PubMed query
   * @param query PubMed search query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Search results with PMIDs
   */
  SearchArticles(
    query: string,
    page?: number,
    limit?: number
  ): Promise<string[]>;
  /**
   * Fetch article details by PMID
   * @param pmids Array of PubMed IDs
   * @returns Array of article details
   */
  FetchArticleDetails(pmids: string[]): Promise<ParsedArticleData[]>;
  /**
   * Parse XML response from PubMed
   * @param xml XML string
   * @returns Parsed XML object
   */
  private ParseXml;
  /**
   * Extract article data from PubMed response
   * @param data PubMed response data
   * @param original_xml Original XML response for preservation
   * @returns Array of parsed article data
   */
  private ExtractArticleData;
  /**
   * Helper method to safely extract text from XML elements
   * @param element XML element that might be string, object with _ property, or array of such objects
   * @returns Extracted text or empty string
   */
  private extractTextFromElement;
  /**
   * Get the count of articles matching a query
   * @param query PubMed search query
   * @returns Count of matching articles
   */
  GetArticleCount(query: string): Promise<number>;
}
export default PubmedService;
```

### dist/services/pubmed-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const dotenv_1 = __importDefault(require("dotenv"));
const pubmed_config_1 = require("../config/pubmed-config");
const rate_limiter_1 = __importDefault(require("../utils/rate-limiter"));
const article_content_service_1 = __importDefault(
  require("./article-content-service")
);
const logger_1 = require("../utils/logger");
// Load environment variables
dotenv_1.default.config();
/**
 * Service for interacting with the PubMed API
 */
class PubmedService {
  constructor() {
    this.base_url = pubmed_config_1.PUBMED_CONFIG.base_url;
    this.api_key = process.env.PUBMED_API_KEY;
    // Initialize rate limiter based on config
    this.rate_limiter = new rate_limiter_1.default(
      pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
      pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time
    );
    // Initialize content service
    this.content_service = new article_content_service_1.default();
    logger_1.Logger.debug("PubmedService", "Initialized with configuration", {
      base_url: this.base_url,
      api_key_present: !!this.api_key,
      rate_limit: {
        max_concurrent: pubmed_config_1.PUBMED_CONFIG.rate_limit.max_concurrent,
        min_time: pubmed_config_1.PUBMED_CONFIG.rate_limit.min_time,
      },
    });
  }
  /**
   * Search for articles using a PubMed query
   * @param query PubMed search query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Search results with PMIDs
   */
  async SearchArticles(
    query,
    page = 1,
    limit = pubmed_config_1.PUBMED_CONFIG.page_size
  ) {
    logger_1.Logger.debug(
      "PubmedService",
      `Searching articles with query, page=${page}, limit=${limit}`
    );
    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
    logger_1.Logger.debug("PubmedService", "Rate limit slot acquired");
    try {
      // Construct search URL
      const search_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.esearch}`;
      const retmax = Math.min(Math.max(1, limit), 100); // Between 1-100
      const retstart = (Math.max(1, page) - 1) * retmax;
      logger_1.Logger.debug(
        "PubmedService",
        `Making API request to ${search_url}`,
        {
          parameters: {
            db: "pubmed",
            term: query,
            retmode: "json",
            retmax,
            retstart,
            api_key_present: !!this.api_key,
          },
        }
      );
      // Make the API request
      const start_time = Date.now();
      const response = await axios_1.default.get(search_url, {
        params: {
          db: "pubmed",
          term: query,
          retmode: "json",
          retmax: retmax,
          retstart: retstart,
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;
      logger_1.Logger.debug(
        "PubmedService",
        `API request completed in ${duration}ms`
      );
      // Parse the response
      const search_results = response.data;
      // Check if we have valid results
      if (
        !search_results.esearchresult ||
        !search_results.esearchresult.idlist
      ) {
        logger_1.Logger.warn(
          "PubmedService",
          "No results found in search response"
        );
        return [];
      }
      const ids = search_results.esearchresult.idlist;
      logger_1.Logger.debug("PubmedService", `Found ${ids.length} article IDs`);
      return ids;
    } catch (error) {
      logger_1.Logger.error("PubmedService", "Error searching PubMed", error);
      throw new Error("Failed to search articles on PubMed");
    }
  }
  /**
   * Fetch article details by PMID
   * @param pmids Array of PubMed IDs
   * @returns Array of article details
   */
  async FetchArticleDetails(pmids) {
    if (pmids.length === 0) {
      logger_1.Logger.debug(
        "PubmedService",
        "No PMIDs provided, returning empty array"
      );
      return [];
    }
    logger_1.Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles`
    );
    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
    logger_1.Logger.debug(
      "PubmedService",
      "Rate limit slot acquired for fetch details"
    );
    try {
      // Construct fetch URL
      const fetch_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.efetch}`;
      logger_1.Logger.debug(
        "PubmedService",
        `Making API request to ${fetch_url}`,
        {
          parameters: {
            db: "pubmed",
            id_count: pmids.length,
            retmode: "xml",
            api_key_present: !!this.api_key,
          },
        }
      );
      // Make the API request
      const start_time = Date.now();
      const response = await axios_1.default.get(fetch_url, {
        params: {
          db: "pubmed",
          id: pmids.join(","),
          retmode: "xml",
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;
      logger_1.Logger.debug(
        "PubmedService",
        `API request for article details completed in ${duration}ms`
      );
      // Store original XML
      const original_xml = response.data;
      // Parse XML response
      const xml_data = await this.ParseXml(original_xml);
      // Extract article data
      const articles = await this.ExtractArticleData(xml_data, original_xml);
      logger_1.Logger.debug(
        "PubmedService",
        `Successfully extracted ${articles.length} article details`
      );
      return articles;
    } catch (error) {
      logger_1.Logger.error(
        "PubmedService",
        "Error fetching article details",
        error
      );
      throw new Error("Failed to fetch article details from PubMed");
    }
  }
  /**
   * Parse XML response from PubMed
   * @param xml XML string
   * @returns Parsed XML object
   */
  async ParseXml(xml) {
    logger_1.Logger.debug("PubmedService", "Parsing XML response");
    const start_time = Date.now();
    try {
      // Use enhanced XML parsing options to preserve structure and attributes
      const result = await (0, xml2js_1.parseStringPromise)(xml, {
        explicitArray: true, // Ensure all elements are arrays for consistency
        mergeAttrs: false, // Keep attributes separate
        explicitRoot: true, // Keep the root element
        normalizeTags: false, // Don't normalize tag names
        attrkey: "@", // Prefix attributes with @
        charkey: "_", // Use _ for element content
        trim: true, // Trim whitespace
      });
      const duration = Date.now() - start_time;
      logger_1.Logger.debug(
        "PubmedService",
        `XML parsing completed in ${duration}ms`
      );
      return result;
    } catch (error) {
      logger_1.Logger.error("PubmedService", "Error parsing XML", error);
      throw new Error("Failed to parse PubMed response");
    }
  }
  /**
   * Extract article data from PubMed response
   * @param data PubMed response data
   * @param original_xml Original XML response for preservation
   * @returns Array of parsed article data
   */
  async ExtractArticleData(data, original_xml) {
    try {
      if (
        !data.PubmedArticleSet ||
        !data.PubmedArticleSet.PubmedArticle ||
        !data.PubmedArticleSet.PubmedArticle.length
      ) {
        logger_1.Logger.warn(
          "PubmedService",
          "No articles found in PubMed response"
        );
        return [];
      }
      logger_1.Logger.debug(
        "PubmedService",
        `${data.PubmedArticleSet.PubmedArticle.length} articles found in XML data`
      );
      const articles = data.PubmedArticleSet.PubmedArticle;
      return Promise.all(
        articles.map(async (pubmedArticle) => {
          try {
            // Extract basic citation data
            const citation = pubmedArticle.MedlineCitation?.[0] || {};
            const pmid = this.extractTextFromElement(citation.PMID);
            logger_1.Logger.debug(
              "PubmedService",
              `Processing article with PMID ${pmid}`
            );
            // Extract article data - handle safely with optional chaining
            const articleData = citation.Article?.[0] || {};
            // Extract title
            const title = this.extractTextFromElement(articleData.ArticleTitle);
            // Extract journal info
            const journalData = articleData.Journal?.[0] || {};
            const journal = this.extractTextFromElement(journalData.Title);
            // Extract publication date
            let pubDate = "";
            const journalIssue = journalData.JournalIssue?.[0] || {};
            const pubDateData = journalIssue.PubDate?.[0] || {};
            const year = this.extractTextFromElement(pubDateData.Year);
            const month = this.extractTextFromElement(pubDateData.Month);
            const day = this.extractTextFromElement(pubDateData.Day);
            const medlineDate = this.extractTextFromElement(
              pubDateData.MedlineDate
            );
            if (year) {
              pubDate =
                month && day
                  ? `${year}-${month}-${day}`
                  : month
                  ? `${year}-${month}`
                  : year;
            } else if (medlineDate) {
              pubDate = medlineDate;
            }
            // Extract abstract and section-specific content
            const abstractData = articleData.Abstract?.[0] || {};
            const abstractTextElements = abstractData.AbstractText || [];
            let fullAbstract = "";
            let methodsText = "";
            let resultsText = "";
            let discussionText = "";
            let conclusionText = "";
            // Process abstract sections
            if (abstractTextElements.length > 0) {
              // Multiple abstract sections with labels
              abstractTextElements.forEach((section) => {
                const sectionText = this.extractTextFromElement(section);
                if (!sectionText) return;
                // Add to full abstract
                fullAbstract += sectionText + " ";
                // Check for section labels
                const nlmCategory = section["@"]
                  ? (
                      section["@"].NlmCategory ||
                      section["@"].Label ||
                      ""
                    ).toLowerCase()
                  : "";
                if (
                  nlmCategory.includes("methods") ||
                  nlmCategory.includes("materials")
                ) {
                  methodsText = sectionText;
                } else if (
                  nlmCategory.includes("results") ||
                  nlmCategory.includes("findings")
                ) {
                  resultsText = sectionText;
                } else if (
                  nlmCategory.includes("discussion") ||
                  nlmCategory.includes("interpretation")
                ) {
                  discussionText = sectionText;
                } else if (
                  nlmCategory.includes("conclusion") ||
                  nlmCategory.includes("summary")
                ) {
                  conclusionText = sectionText;
                }
              });
            } else if (typeof abstractData.AbstractText === "string") {
              // Simple string abstract
              fullAbstract = abstractData.AbstractText;
            }
            // Extract author list
            const authors = [];
            const authorListData = articleData.AuthorList?.[0] || {};
            const authorElements = authorListData.Author || [];
            authorElements.forEach((author) => {
              const lastName = this.extractTextFromElement(author.LastName);
              const initials = this.extractTextFromElement(author.Initials);
              const collectiveName = this.extractTextFromElement(
                author.CollectiveName
              );
              if (lastName && initials) {
                authors.push(`${lastName} ${initials}`);
              } else if (lastName) {
                authors.push(lastName);
              } else if (collectiveName) {
                authors.push(collectiveName);
              }
            });
            // Extract MeSH terms
            const meshTerms = [];
            const meshHeadingList = citation.MeshHeadingList?.[0] || {};
            const meshHeadings = meshHeadingList.MeshHeading || [];
            meshHeadings.forEach((mesh) => {
              // Extract descriptor name
              const descriptorElement = mesh.DescriptorName?.[0];
              if (descriptorElement) {
                const term = this.extractTextFromElement(descriptorElement);
                if (term) {
                  meshTerms.push(term);
                }
              }
              // Extract qualifier names
              const qualifierElements = mesh.QualifierName || [];
              qualifierElements.forEach((qualifier) => {
                const term = this.extractTextFromElement(qualifier);
                if (term) {
                  meshTerms.push(term);
                }
              });
            });
            logger_1.Logger.debug(
              "PubmedService",
              `Extracted ${meshTerms.length} MeSH terms for PMID ${pmid}`
            );
            // Initial article data from XML
            const baseArticle = {
              pmid,
              title,
              abstract: fullAbstract.trim(),
              authors,
              journal,
              pub_date: pubDate,
              url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
              methods: methodsText,
              results: resultsText,
              discussion: discussionText,
              conclusion: conclusionText,
              figures: [],
              tables: [],
              supplementary_material: [],
              original_xml: original_xml,
              mesh_terms: meshTerms,
            };
            try {
              // Try to enhance with web scraping content
              logger_1.Logger.debug(
                "PubmedService",
                `Attempting to enhance content for PMID ${pmid} with web scraping`
              );
              const content =
                await this.content_service.extractContentFromPubMed(
                  pmid,
                  original_xml
                );
              // Merge with preference for scraped content
              const details = {
                ...baseArticle,
                full_text: content.full_text || fullAbstract.trim(),
                methods: content.methods || baseArticle.methods,
                results: content.results || baseArticle.results,
                discussion: content.discussion || baseArticle.discussion,
                conclusion: content.conclusion || baseArticle.conclusion,
                figures: content.figures,
                tables: content.tables,
                supplementary_material: content.supplementary_material,
                sanitized_html: content.sanitized_html,
              };
              logger_1.Logger.debug(
                "PubmedService",
                `Successfully enhanced content for PMID ${pmid}`
              );
              return details;
            } catch (error) {
              // Web scraping failed - use basic XML data
              logger_1.Logger.warn(
                "PubmedService",
                `Web scraping failed for PMID ${pmid}, using XML extraction only`,
                error
              );
              return {
                ...baseArticle,
                full_text: fullAbstract.trim() || "No content available",
              };
            }
          } catch (articleError) {
            // Handle errors for individual articles
            const pmid =
              pubmedArticle.MedlineCitation?.[0]?.PMID?.[0]?._ || "Unknown";
            logger_1.Logger.error(
              "PubmedService",
              `Error processing article with PMID ${pmid}`,
              articleError
            );
            // Return minimal article data to prevent complete failure
            return {
              pmid,
              title:
                pubmedArticle.MedlineCitation?.[0]?.Article?.[0]
                  ?.ArticleTitle?.[0]?._ || "Untitled Article",
              abstract: "Error processing article content",
              authors: [],
              journal: "",
              pub_date: "",
              url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
              full_text: "Error processing article content",
              mesh_terms: [],
              figures: [],
              tables: [],
              supplementary_material: [],
            };
          }
        })
      );
    } catch (error) {
      logger_1.Logger.error(
        "PubmedService",
        "Critical error extracting article data",
        error
      );
      throw new Error("Failed to extract article data from PubMed response");
    }
  }
  /**
   * Helper method to safely extract text from XML elements
   * @param element XML element that might be string, object with _ property, or array of such objects
   * @returns Extracted text or empty string
   */
  extractTextFromElement(element) {
    if (!element) {
      return "";
    }
    // Handle array
    if (Array.isArray(element)) {
      if (element.length === 0) return "";
      element = element[0];
    }
    // Handle object with text content
    if (typeof element === "object") {
      return element._ || "";
    }
    // Handle string
    if (typeof element === "string") {
      return element;
    }
    return "";
  }
  /**
   * Get the count of articles matching a query
   * @param query PubMed search query
   * @returns Count of matching articles
   */
  async GetArticleCount(query) {
    logger_1.Logger.debug("PubmedService", "Getting article count for query");
    // Wait for rate limiting slot
    await this.rate_limiter.WaitForSlot();
    logger_1.Logger.debug(
      "PubmedService",
      "Rate limit slot acquired for article count"
    );
    try {
      // Construct search URL
      const search_url = `${this.base_url}${pubmed_config_1.PUBMED_CONFIG.esearch}`;
      logger_1.Logger.debug(
        "PubmedService",
        `Making count request to ${search_url}`
      );
      // Make the API request
      const start_time = Date.now();
      const response = await axios_1.default.get(search_url, {
        params: {
          db: "pubmed",
          term: query,
          retmode: "json",
          retmax: 0,
          api_key: this.api_key,
        },
      });
      const duration = Date.now() - start_time;
      logger_1.Logger.debug(
        "PubmedService",
        `Count request completed in ${duration}ms`
      );
      // Parse the response
      const search_results = response.data;
      if (search_results.esearchresult && search_results.esearchresult.count) {
        const count = parseInt(search_results.esearchresult.count, 10);
        logger_1.Logger.debug(
          "PubmedService",
          `Found ${count} total matching articles`
        );
        return count;
      }
      logger_1.Logger.warn(
        "PubmedService",
        "No count information in search response"
      );
      return 0;
    } catch (error) {
      logger_1.Logger.error(
        "PubmedService",
        "Error getting article count",
        error
      );
      throw new Error("Failed to get article count from PubMed");
    }
  }
}
exports.default = PubmedService;
//# sourceMappingURL=pubmed-service.js.map
```

### dist/services/pubmed-service.js.map

[Non-code file, content not included]

### dist/services/query-service.d.ts

```ts
import { ProcessedBlueprint, QueryFilters } from "../types";
/**
 * Service for constructing optimized PubMed search queries
 */
declare class QueryService {
  /**
   * Build a complete PubMed search query based on a processed blueprint
   * @param blueprint The processed blueprint
   * @returns PubMed search query string
   */
  BuildSearchQuery(blueprint: ProcessedBlueprint): string;
  /**
   * Build a query string for the topics
   * @param topics Array of topics
   * @returns Topic query string
   */
  BuildTopicQuery(topics: string[]): string;
  /**
   * Apply filters to the query
   * @param filters Query filters
   * @returns Filter query string
   */
  ApplyFilters(filters: QueryFilters): string;
  /**
   * Validate a constructed query
   * @param query The query to validate
   * @returns True if the query is valid
   */
  ValidateQuery(query: string): boolean;
  /**
   * Add pagination parameters to a query
   * @param query Base query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Query with pagination parameters
   */
  AddPagination(query: string, page?: number, limit?: number): string;
}
export default QueryService;
```

### dist/services/query-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mesh_mapper_1 = __importDefault(require("../utils/mesh-mapper"));
const pubmed_config_1 = require("../config/pubmed-config");
/**
 * Service for constructing optimized PubMed search queries
 */
class QueryService {
  /**
   * Build a complete PubMed search query based on a processed blueprint
   * @param blueprint The processed blueprint
   * @returns PubMed search query string
   */
  BuildSearchQuery(blueprint) {
    // Create the core topic query
    const topic_query = this.BuildTopicQuery(blueprint.topics);
    // Add filters
    const filter_query = this.ApplyFilters(blueprint.filters);
    // Combine all query parts
    return `(${topic_query}) AND (${filter_query})`;
  }
  /**
   * Build a query string for the topics
   * @param topics Array of topics
   * @returns Topic query string
   */
  BuildTopicQuery(topics) {
    if (topics.length === 0) {
      throw new Error("At least one topic is required");
    }
    // Map each topic to MeSH terms and format for search
    const topic_queries = topics.map((topic) => {
      const mesh_terms = mesh_mapper_1.default.MapTerm(topic);
      if (mesh_terms.length === 0) {
        // If no MeSH terms, use the original topic with various fields
        return `("${topic}"[Title/Abstract] OR "${topic}"[All Fields])`;
      }
      // If we have MeSH terms, create a more precise query
      const mesh_query = mesh_terms
        .map((term) => `"${term}"[MeSH Terms] OR "${term}"[Title/Abstract]`)
        .join(" OR ");
      return `(${mesh_query})`;
    });
    // Join topics with AND (since we want articles that mention both topics)
    return topics.length > 1
      ? `(${topic_queries.join(" AND ")})`
      : topic_queries[0];
  }
  /**
   * Apply filters to the query
   * @param filters Query filters
   * @returns Filter query string
   */
  ApplyFilters(filters) {
    const filter_parts = [];
    // Apply study type filters
    if (filters.clinical_queries && filters.clinical_queries.length > 0) {
      const study_filters = filters.clinical_queries
        .filter((type) => pubmed_config_1.FILTER_MAP[type])
        .map((type) => pubmed_config_1.FILTER_MAP[type].broad);
      if (study_filters.length > 0) {
        // Each filter is already wrapped in parentheses from the config
        // Just join them with OR and wrap the whole thing
        filter_parts.push(`(${study_filters.join(" OR ")})`);
      }
    } else {
      // Use default filter if no specific filters provided
      filter_parts.push(pubmed_config_1.DEFAULT_FILTER.narrow);
    }
    // Apply age group filter if specified
    if (filters.age_group && pubmed_config_1.AGE_MAP[filters.age_group]) {
      filter_parts.push(pubmed_config_1.AGE_MAP[filters.age_group]);
    }
    // Apply date range filter
    const year_range = filters.year_range || 3;
    filter_parts.push(`"last ${year_range} years"[PDat]`);
    // Join all filter parts with AND
    return filter_parts.join(" AND ");
  }
  /**
   * Validate a constructed query
   * @param query The query to validate
   * @returns True if the query is valid
   */
  ValidateQuery(query) {
    // Check minimum query length
    if (query.length < 10) {
      console.log("Query validation failed: Too short");
      return false;
    }
    // Check for balanced parentheses using a stack
    const stack = [];
    for (const char of query) {
      if (char === "(") {
        stack.push(char);
      } else if (char === ")") {
        if (stack.length === 0) {
          console.log("Query validation failed: Unmatched closing parenthesis");
          return false;
        }
        stack.pop();
      }
    }
    if (stack.length !== 0) {
      console.log(
        `Query validation failed: ${stack.length} unclosed parentheses`
      );
      return false;
    }
    // Validate PubMed field tags
    const validTags = [
      "MeSH Terms",
      "Title/Abstract",
      "All Fields",
      "Publication Type",
      "Text Word",
      "Language",
      "mh",
      "pt",
      "PDat",
      "MeSH Subheading",
      "MeSH:noexp",
      "noexp",
    ];
    const tagPattern = /\[(.*?)\]/g;
    const matches = query.match(tagPattern);
    if (matches) {
      for (const match of matches) {
        const tag = match.slice(1, -1); // Remove brackets
        if (!validTags.some((validTag) => tag.includes(validTag))) {
          console.log(`Query validation failed: Invalid field tag "${tag}"`);
          return false;
        }
      }
    }
    // Check basic query structure
    if (!query.includes("AND") && !query.includes("OR")) {
      console.log("Query validation failed: Missing boolean operators");
      return false;
    }
    // Ensure query doesn't end with operators
    if (/AND\s*$/.test(query) || /OR\s*$/.test(query)) {
      console.log("Query validation failed: Query ends with an operator");
      return false;
    }
    // Print the final query for inspection
    console.log("Validated query:", query);
    return true;
  }
  /**
   * Add pagination parameters to a query
   * @param query Base query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Query with pagination parameters
   */
  AddPagination(query, page = 1, limit = 10) {
    const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
    const retstart = (Math.max(1, page) - 1) * retmax;
    return `${query}&retmax=${retmax}&retstart=${retstart}`;
  }
}
exports.default = QueryService;
//# sourceMappingURL=query-service.js.map
```

### dist/services/query-service.js.map

[Non-code file, content not included]

### dist/services/ranking-service.d.ts

```ts
import { ParsedArticleData, RankedArticleData } from "../types";
/**
 * Service for scoring and ranking retrieved articles
 */
declare class RankingService {
  private journal_metrics;
  private impact_factor_threshold;
  private h_index_threshold;
  private sjr_threshold;
  constructor();
  /**
   * Score and rank articles
   * @param articles Array of parsed articles
   * @param topics Array of search topics
   * @returns Ranked articles
   */
  RankArticles(
    articles: ParsedArticleData[],
    topics: string[]
  ): RankedArticleData[];
  /**
   * Calculate relevance score based on article content and search topics
   * @param article Article data
   * @param topics Search topics
   * @returns Relevance score (0-10)
   */
  CalculateRelevanceScore(article: ParsedArticleData, topics: string[]): number;
  /**
   * Calculate journal impact score based on metrics
   * @param journal_name Journal name
   * @returns Journal impact score (0-10)
   */
  CalculateJournalScore(journal_name: string): number;
  /**
   * Filter articles by minimum score
   * @param articles Ranked articles
   * @param min_score Minimum score threshold
   * @returns Filtered articles
   */
  FilterArticlesByScore(
    articles: RankedArticleData[],
    min_score?: number
  ): RankedArticleData[];
}
export default RankingService;
```

### dist/services/ranking-service.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const file_reader_1 = __importDefault(require("../utils/file-reader"));
const pubmed_config_1 = require("../config/pubmed-config");
/**
 * Service for scoring and ranking retrieved articles
 */
class RankingService {
  constructor() {
    this.journal_metrics = file_reader_1.default.GetJournalMetrics();
    // Load thresholds from config
    this.impact_factor_threshold =
      pubmed_config_1.PUBMED_CONFIG.journal_quality.impact_factor_threshold;
    this.h_index_threshold =
      pubmed_config_1.PUBMED_CONFIG.journal_quality.h_index_threshold;
    this.sjr_threshold = pubmed_config_1.PUBMED_CONFIG.journal_quality.sjr;
  }
  /**
   * Score and rank articles
   * @param articles Array of parsed articles
   * @param topics Array of search topics
   * @returns Ranked articles
   */
  RankArticles(articles, topics) {
    // Score each article
    const scored_articles = articles.map((article) => {
      const relevance_score = this.CalculateRelevanceScore(article, topics);
      const journal_score = this.CalculateJournalScore(article.journal);
      return {
        ...article,
        scores: {
          relevance: relevance_score,
          journal_impact: journal_score,
        },
      };
    });
    // Sort by combined score (relevance + journal impact)
    return scored_articles.sort((a, b) => {
      const combined_a = a.scores.relevance + a.scores.journal_impact;
      const combined_b = b.scores.relevance + b.scores.journal_impact;
      return combined_b - combined_a; // Descending order
    });
  }
  /**
   * Calculate relevance score based on article content and search topics
   * @param article Article data
   * @param topics Search topics
   * @returns Relevance score (0-10)
   */
  CalculateRelevanceScore(article, topics) {
    if (!article || !topics || topics.length === 0) {
      return 0;
    }
    let score = 0;
    const normalized_topics = topics.map((topic) => topic.toLowerCase());
    // Score based on title (higher weight)
    const title_lower = article.title.toLowerCase();
    normalized_topics.forEach((topic) => {
      if (title_lower.includes(topic)) {
        score += 3; // Higher weight for title matches
      }
    });
    // Score based on abstract
    if (article.abstract) {
      const abstract_lower = article.abstract.toLowerCase();
      normalized_topics.forEach((topic) => {
        if (abstract_lower.includes(topic)) {
          score += 1; // Lower weight for abstract matches
        }
        // Bonus points for more prominent topic placement
        const first_100_chars = abstract_lower.substring(0, 100);
        if (first_100_chars.includes(topic)) {
          score += 0.5; // Bonus for topics in opening sentences
        }
      });
    }
    // Cap at 10
    return Math.min(10, score);
  }
  /**
   * Calculate journal impact score based on metrics
   * @param journal_name Journal name
   * @returns Journal impact score (0-10)
   */
  CalculateJournalScore(journal_name) {
    if (!journal_name) {
      return 0;
    }
    // Try to find an exact match
    let journal_metrics = this.journal_metrics[journal_name];
    // If no exact match, try to find a partial match
    if (!journal_metrics) {
      const journal_key = Object.keys(this.journal_metrics).find(
        (key) => journal_name.includes(key) || key.includes(journal_name)
      );
      if (journal_key) {
        journal_metrics = this.journal_metrics[journal_key];
      }
    }
    // If no match found, return a default low score
    if (!journal_metrics) {
      return 2; // Default score for unknown journals
    }
    // Calculate score based on metrics
    let score = 0;
    // Impact factor score (up to 5 points)
    if (journal_metrics.impact_factor) {
      score += Math.min(
        5,
        (journal_metrics.impact_factor / this.impact_factor_threshold) * 5
      );
    }
    // H-index score (up to 3 points)
    if (journal_metrics.h_index) {
      score += Math.min(
        3,
        (journal_metrics.h_index / this.h_index_threshold) * 3
      );
    }
    // SJR score (up to 2 points)
    if (journal_metrics.sjr_score) {
      score += Math.min(
        2,
        (journal_metrics.sjr_score / this.sjr_threshold) * 2
      );
    }
    // Normalize to 0-10 scale
    return Math.min(10, score);
  }
  /**
   * Filter articles by minimum score
   * @param articles Ranked articles
   * @param min_score Minimum score threshold
   * @returns Filtered articles
   */
  FilterArticlesByScore(articles, min_score = 5) {
    return articles.filter((article) => {
      const combined_score =
        article.scores.relevance + article.scores.journal_impact;
      return combined_score >= min_score;
    });
  }
}
exports.default = RankingService;
//# sourceMappingURL=ranking-service.js.map
```

### dist/services/ranking-service.js.map

[Non-code file, content not included]

### dist/types/index.d.ts

```ts
import { FILTER_MAP } from "../config/pubmed-config";
/**
 * Metadata about field encoding
 */
export interface EncodingMetadata {
  field_name: string;
  encoding: "base64" | "none";
}
export type ClinicalCategory = keyof typeof FILTER_MAP;
export type ClinicalScope = keyof (typeof FILTER_MAP)[ClinicalCategory];
export interface SavedSearchResult {
  clinical_category: ClinicalCategory;
  clinical_scope: ClinicalScope;
  esearch_query: string;
  article_count: number;
  clinical_specialty: string;
  pmids: string[];
  articles: SavedArticle[];
  encoding_metadata?: {
    tables: "base64";
    original_xml: "base64";
    sanitized_html: "base64";
  };
}
export interface SavedArticle
  extends Omit<Article, "scores" | "url" | "pub_date"> {
  year: number;
  mesh_terms: string[];
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
export interface ArticleRequest {
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
export interface ArticleResponse {
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
export interface Article {
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
export interface PubmedSearchResponse {
  header: {
    type: string;
    version: string;
  };
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    translationset: Array<{
      from: string;
      to: string;
    }>;
    querytranslation: string;
  };
}
export interface PubmedSummaryResponse {
  result: {
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      lastauthor: string;
      title: string;
      sortfirstauthor: string;
      volume: string;
      issue: string;
      pages: string;
      lang: string[];
      nlmuniqueid: string;
      issn: string;
      essn: string;
      pubtype: string[];
      recordstatus: string;
      pubstatus: string;
      articleids: Array<{
        idtype: string;
        idtypen: number;
        value: string;
      }>;
      fulljournalname: string;
      sortpubdate: string;
      sortdate: string;
    };
  };
}
export interface PubmedFetchResponse {
  PubmedArticleSet: {
    PubmedArticle: Array<{
      MedlineCitation: {
        PMID: string;
        MeshHeadingList?: {
          MeshHeading:
            | Array<{
                DescriptorName:
                  | string
                  | {
                      _: string;
                      UI: string;
                    };
                QualifierName?:
                  | Array<{
                      _: string;
                      UI: string;
                    }>
                  | {
                      _: string;
                      UI: string;
                    };
              }>
            | {
                DescriptorName:
                  | string
                  | {
                      _: string;
                      UI: string;
                    };
                QualifierName?:
                  | Array<{
                      _: string;
                      UI: string;
                    }>
                  | {
                      _: string;
                      UI: string;
                    };
              };
        };
        ChemicalList?: {
          Chemical:
            | Array<{
                NameOfSubstance:
                  | string
                  | {
                      _: string;
                      UI: string;
                    };
                RegistryNumber: string;
              }>
            | {
                NameOfSubstance:
                  | string
                  | {
                      _: string;
                      UI: string;
                    };
                RegistryNumber: string;
              };
        };
        Article: {
          ArticleTitle: string;
          Abstract?: {
            AbstractText:
              | string
              | Array<{
                  _: string;
                  Label?: string;
                  NlmCategory?: string;
                }>
              | {
                  _: string;
                  Label?: string;
                  NlmCategory?: string;
                };
          };
          AuthorList?: {
            Author:
              | Array<{
                  LastName?: string;
                  ForeName?: string;
                  Initials?: string;
                  CollectiveName?: string;
                  AffiliationInfo?:
                    | Array<{
                        Affiliation: string;
                      }>
                    | {
                        Affiliation: string;
                      };
                }>
              | {
                  LastName?: string;
                  ForeName?: string;
                  Initials?: string;
                  CollectiveName?: string;
                  AffiliationInfo?:
                    | Array<{
                        Affiliation: string;
                      }>
                    | {
                        Affiliation: string;
                      };
                };
          };
          PublicationTypeList?: {
            PublicationType:
              | Array<{
                  _: string;
                  UI: string;
                }>
              | {
                  _: string;
                  UI: string;
                };
          };
          Journal: {
            Title: string;
            JournalIssue: {
              Volume?: string;
              Issue?: string;
              PubDate: {
                Year?: string;
                Month?: string;
                Day?: string;
                MedlineDate?: string;
              };
            };
          };
        };
      };
    }>;
  };
}
export interface ProcessedBlueprint {
  specialty: string;
  topics: string[];
  filters: {
    clinical_queries: string[];
    age_group?: string;
    year_range: number;
  };
}
export interface JournalMetrics {
  title: string;
  impact_factor?: number;
  h_index?: number;
  sjr_score?: number;
}
export interface ContentExtractionResult {
  full_text: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures: string[];
  tables: string[];
  supplementary_material: string[];
  original_xml?: string;
  sanitized_html?: string;
}
export interface ParsedArticleData {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pub_date: string;
  abstract: string;
  url: string;
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
  mesh_terms?: string[];
}
export interface RankedArticleData extends ParsedArticleData {
  scores: {
    relevance: number;
    journal_impact: number;
  };
}
export interface QueryFilters {
  clinical_queries: string[];
  age_group?: string;
  year_range: number;
}
```

### dist/types/index.js

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=index.js.map
```

### dist/types/index.js.map

[Non-code file, content not included]

### dist/utils/content-processor.d.ts

```ts
/**
 * Utility for processing XML and HTML content for safe storage
 */
export declare class ContentProcessor {
  /**
   * Encode XML or HTML content to Base64 for safe storage
   * @param content Raw XML or HTML content
   * @returns Base64 encoded string or undefined if input is undefined
   */
  static encodeContent(content: string | undefined): string | undefined;
  /**
   * Decode Base64-encoded XML or HTML content
   * @param encodedContent Base64 encoded string
   * @returns Original XML or HTML content or undefined if input is undefined
   */
  static decodeContent(encodedContent: string | undefined): string | undefined;
  /**
   * Process an array of content items, encoding each non-empty item
   * @param items Array of content items
   * @returns Array of encoded content items
   */
  static encodeArray(items: string[] | undefined): string[] | undefined;
}
```

### dist/utils/content-processor.js

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentProcessor = void 0;
/**
 * Utility for processing XML and HTML content for safe storage
 */
class ContentProcessor {
  /**
   * Encode XML or HTML content to Base64 for safe storage
   * @param content Raw XML or HTML content
   * @returns Base64 encoded string or undefined if input is undefined
   */
  static encodeContent(content) {
    if (!content) return undefined;
    return Buffer.from(content).toString("base64");
  }
  /**
   * Decode Base64-encoded XML or HTML content
   * @param encodedContent Base64 encoded string
   * @returns Original XML or HTML content or undefined if input is undefined
   */
  static decodeContent(encodedContent) {
    if (!encodedContent) return undefined;
    return Buffer.from(encodedContent, "base64").toString();
  }
  /**
   * Process an array of content items, encoding each non-empty item
   * @param items Array of content items
   * @returns Array of encoded content items
   */
  static encodeArray(items) {
    if (!items) return undefined;
    return items
      .map((item) => (item ? this.encodeContent(item) : undefined))
      .filter(Boolean);
  }
}
exports.ContentProcessor = ContentProcessor;
//# sourceMappingURL=content-processor.js.map
```

### dist/utils/content-processor.js.map

[Non-code file, content not included]

### dist/utils/file-reader.d.ts

```ts
import { JournalMetrics } from "../types";
/**
 * Utility class for reading JSON data files
 */
declare class FileReader {
  /**
   * Read and parse a JSON file
   * @param filePath Path to the JSON file
   * @returns Parsed JSON data
   */
  static ReadJsonFile<T>(filePath: string): T;
  /**
   * Get specialty data from the specialties.json file
   * @returns Specialty data
   */
  static GetSpecialties(): Record<
    string,
    {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }
  >;
  /**
   * Get journal metrics data from the journal-metrics.json file
   * @returns Journal metrics data
   */
  static GetJournalMetrics(): Record<string, JournalMetrics>;
}
export default FileReader;
```

### dist/utils/file-reader.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Utility class for reading JSON data files
 */
class FileReader {
  /**
   * Read and parse a JSON file
   * @param filePath Path to the JSON file
   * @returns Parsed JSON data
   */
  static ReadJsonFile(filePath) {
    try {
      const absolutePath = path_1.default.resolve(filePath);
      const fileContent = fs_1.default.readFileSync(absolutePath, "utf8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }
  /**
   * Get specialty data from the specialties.json file
   * @returns Specialty data
   */
  static GetSpecialties() {
    return this.ReadJsonFile("data/specialties.json");
  }
  /**
   * Get journal metrics data from the journal-metrics.json file
   * @returns Journal metrics data
   */
  static GetJournalMetrics() {
    return this.ReadJsonFile("data/journal-metrics.json");
  }
}
exports.default = FileReader;
//# sourceMappingURL=file-reader.js.map
```

### dist/utils/file-reader.js.map

[Non-code file, content not included]

### dist/utils/logger.d.ts

```ts
/**
 * Available log levels
 */
export declare enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
/**
 * Global logger utility for colorful console logging
 */
export declare class Logger {
  /**
   * Current log level (configurable)
   */
  private static currentLevel;
  /**
   * Set the current log level
   * @param level The log level to set
   */
  static setLogLevel(level: LogLevel): void;
  /**
   * Log a debug message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static debug(context: string, message: string, data?: any): void;
  /**
   * Log an info message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static info(context: string, message: string, data?: any): void;
  /**
   * Log a warning message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static warn(context: string, message: string, data?: any): void;
  /**
   * Log an error message
   * @param context The context or component name
   * @param message The message to log
   * @param error Optional error to include
   */
  static error(context: string, message: string, error?: any): void;
  /**
   * Log a success message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static success(context: string, message: string, data?: any): void;
  /**
   * Log HTTP requests
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode HTTP status code
   * @param duration Request duration in ms
   */
  static http(
    method: string,
    url: string,
    statusCode?: number,
    duration?: number
  ): void;
}
```

### dist/utils/logger.js

```js
"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Available log levels
 */
var LogLevel;
(function (LogLevel) {
  LogLevel[(LogLevel["DEBUG"] = 0)] = "DEBUG";
  LogLevel[(LogLevel["INFO"] = 1)] = "INFO";
  LogLevel[(LogLevel["WARN"] = 2)] = "WARN";
  LogLevel[(LogLevel["ERROR"] = 3)] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Global logger utility for colorful console logging
 */
class Logger {
  /**
   * Set the current log level
   * @param level The log level to set
   */
  static setLogLevel(level) {
    Logger.currentLevel = level;
  }
  /**
   * Log a debug message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static debug(context, message, data) {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      console.log(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.blue.bold("[DEBUG]")} ${chalk_1.default.cyan(
          `[${context}]`
        )} ${message}`,
        data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }
  /**
   * Log an info message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static info(context, message, data) {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.green.bold("[INFO]")} ${chalk_1.default.cyan(
          `[${context}]`
        )} ${message}`,
        data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }
  /**
   * Log a warning message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static warn(context, message, data) {
    if (Logger.currentLevel <= LogLevel.WARN) {
      console.log(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.yellow.bold("[WARN]")} ${chalk_1.default.cyan(
          `[${context}]`
        )} ${message}`,
        data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }
  /**
   * Log an error message
   * @param context The context or component name
   * @param message The message to log
   * @param error Optional error to include
   */
  static error(context, message, error) {
    if (Logger.currentLevel <= LogLevel.ERROR) {
      console.error(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.red.bold("[ERROR]")} ${chalk_1.default.cyan(
          `[${context}]`
        )} ${message}`,
        error
          ? `\n${chalk_1.default.red(error.stack || JSON.stringify(error))}`
          : ""
      );
    }
  }
  /**
   * Log a success message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static success(context, message, data) {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.greenBright.bold(
          "[SUCCESS]"
        )} ${chalk_1.default.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk_1.default.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }
  /**
   * Log HTTP requests
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode HTTP status code
   * @param duration Request duration in ms
   */
  static http(method, url, statusCode, duration) {
    if (Logger.currentLevel <= LogLevel.INFO) {
      let message = `${method} ${url}`;
      if (statusCode) {
        const coloredStatus =
          statusCode >= 500
            ? chalk_1.default.red(statusCode)
            : statusCode >= 400
            ? chalk_1.default.yellow(statusCode)
            : statusCode >= 300
            ? chalk_1.default.cyan(statusCode)
            : chalk_1.default.green(statusCode);
        message += ` ${coloredStatus}`;
      }
      if (duration !== undefined) {
        const coloredDuration =
          duration > 1000
            ? chalk_1.default.red(`${duration}ms`)
            : duration > 500
            ? chalk_1.default.yellow(`${duration}ms`)
            : chalk_1.default.green(`${duration}ms`);
        message += ` ${coloredDuration}`;
      }
      console.log(
        `${chalk_1.default.gray(
          new Date().toISOString()
        )} ${chalk_1.default.magenta.bold("[HTTP]")} ${message}`
      );
    }
  }
}
exports.Logger = Logger;
/**
 * Current log level (configurable)
 */
Logger.currentLevel =
  process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG;
//# sourceMappingURL=logger.js.map
```

### dist/utils/logger.js.map

[Non-code file, content not included]

### dist/utils/mesh-mapper.d.ts

```ts
/**
 * Utility class for mapping terms to MeSH (Medical Subject Headings) terms
 */
declare class MeshMapper {
  private static term_mapping_cache;
  /**
   * Map a term to MeSH terms
   * @param term The term to map
   * @returns Array of MeSH terms
   */
  static MapTerm(term: string): string[];
  /**
   * Simplified MeSH term mapping (without API calls)
   * @param term The term to map
   * @returns Array of mapped MeSH terms
   */
  private static SimpleMeshMapping;
  /**
   * Validate if a term is a valid MeSH term
   * @param term The term to validate
   * @returns True if the term is a valid MeSH term
   */
  static ValidateMeshTerm(term: string): boolean;
  /**
   * Get the preferred MeSH term from a list of alternatives
   * @param alternatives Array of alternative terms
   * @returns The preferred MeSH term
   */
  static GetPreferredTerm(alternatives: string[]): string;
}
export default MeshMapper;
```

### dist/utils/mesh-mapper.js

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility class for mapping terms to MeSH (Medical Subject Headings) terms
 */
class MeshMapper {
  /**
   * Map a term to MeSH terms
   * @param term The term to map
   * @returns Array of MeSH terms
   */
  static MapTerm(term) {
    // Check if we already have a cached mapping
    if (this.term_mapping_cache[term.toLowerCase()]) {
      return this.term_mapping_cache[term.toLowerCase()];
    }
    // In a production environment, this would call the PubMed API
    // to get the proper MeSH term mappings. For now, we'll use a simplified approach.
    const mapped_terms = this.SimpleMeshMapping(term);
    // Cache the result
    this.term_mapping_cache[term.toLowerCase()] = mapped_terms;
    return mapped_terms;
  }
  /**
   * Simplified MeSH term mapping (without API calls)
   * @param term The term to map
   * @returns Array of mapped MeSH terms
   */
  static SimpleMeshMapping(term) {
    // This is a simplified mapping - in production, this would use PubMed's
    // term mapping API or a more comprehensive database
    const normalized_term = term.toLowerCase();
    // Some common mappings for demonstration
    const mappings = {
      "heart failure": ["Heart Failure", "Cardiac Failure"],
      hypertension: ["Hypertension", "High Blood Pressure"],
      diabetes: ["Diabetes Mellitus"],
      cancer: ["Neoplasms", "Tumors"],
      stroke: ["Stroke", "Cerebrovascular Accident"],
      asthma: ["Asthma", "Bronchial Asthma"],
      alzheimer: ["Alzheimer Disease", "Dementia"],
      parkinson: ["Parkinson Disease"],
      depression: ["Depression", "Depressive Disorder"],
      arthritis: ["Arthritis", "Joint Diseases"],
      copd: ["Pulmonary Disease, Chronic Obstructive", "COPD"],
      "kidney disease": ["Kidney Diseases", "Renal Insufficiency"],
      "liver disease": ["Liver Diseases", "Hepatic Diseases"],
      obesity: ["Obesity", "Overweight"],
      pneumonia: ["Pneumonia", "Lung Inflammation"],
      hiv: ["HIV", "AIDS", "HIV Infections"],
      tuberculosis: ["Tuberculosis", "TB"],
      malaria: ["Malaria"],
      covid: ["COVID-19", "SARS-CoV-2", "Coronavirus"],
    };
    // Check if we have an exact match
    for (const key in mappings) {
      if (normalized_term.includes(key)) {
        return mappings[key];
      }
    }
    // If no match, return the original term formatted for PubMed search
    return [`"${term}"[All Fields]`];
  }
  /**
   * Validate if a term is a valid MeSH term
   * @param term The term to validate
   * @returns True if the term is a valid MeSH term
   */
  static ValidateMeshTerm(term) {
    // This is a simplified validation - in production, this would
    // validate against the actual MeSH database
    const mapped_terms = this.MapTerm(term);
    return (
      mapped_terms.length > 0 && mapped_terms[0] !== `"${term}"[All Fields]`
    );
  }
  /**
   * Get the preferred MeSH term from a list of alternatives
   * @param alternatives Array of alternative terms
   * @returns The preferred MeSH term
   */
  static GetPreferredTerm(alternatives) {
    if (alternatives.length === 0) {
      return "";
    }
    // In a real implementation, this would have logic to determine the most
    // specific or relevant MeSH term from the alternatives.
    // For simplicity, we'll just return the first term that ends with [MeSH Terms]
    // or the first term if none match
    const mesh_term = alternatives.find((term) =>
      term.endsWith("[MeSH Terms]")
    );
    return mesh_term || alternatives[0];
  }
}
// A simple mapping cache to avoid redundant lookups
MeshMapper.term_mapping_cache = {};
exports.default = MeshMapper;
//# sourceMappingURL=mesh-mapper.js.map
```

### dist/utils/mesh-mapper.js.map

[Non-code file, content not included]

### dist/utils/rate-limiter.d.ts

```ts
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
```

### dist/utils/rate-limiter.js

```js
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
```

### dist/utils/rate-limiter.js.map

[Non-code file, content not included]

### llms.txt

[Non-code file, content not included]

### output/40228065.html

[Non-code file, content not included]

### package.json

```json
{
  "name": "pubmed-search",
  "version": "0.1.0",
  "description": "A lightweight Node.js service for retrieving high-quality medical literature from PubMed",
  "main": "dist/app.js",
  "scripts": {
    "start": "node dist/app.js",
    "dev": "ts-node-dev --respawn src/app.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@xmldom/xmldom": "^0.9.8",
    "axios": "^1.6.2",
    "chalk": "^4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^5.1.0",
    "express-rate-limit": "^7.1.4",
    "jsdom": "^26.1.0",
    "memory-cache": "^0.2.0",
    "puppeteer": "^24.6.1",
    "winston": "^3.11.0",
    "xml2js": "^0.6.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/jsdom": "^21.1.7",
    "@types/memory-cache": "^0.2.5",
    "@types/node": "^20.10.4",
    "@types/xml2js": "^0.4.14",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  },
  "keywords": ["pubmed", "medical", "articles", "clinical", "e-utilities"],
  "author": "",
  "license": "MIT"
}
```

### prompts/blueprint.md

[Non-code file, content not included]

### pubmed-api-specifications.md

[Non-code file, content not included]

### pubmed-content-extraction-specs.md

[Non-code file, content not included]

### schema/index.ts

```ts
type Journal = {
  id?: string;
  name: string;
  abbreviation: string; // Abbreviation of the journal name
  issn: string[]; // Array of ISSNs (print, electronic)
  sjr: number; // SJR score
  h_index: number; // H-index
  impact_factor: number; // Impact factor
  tier: number; // Ranking of the journal 1-3
};

type Article = {
  id?: string;
  title: string; // Title of the article
  abstract: string; // Abstract of the article
  authors: string[]; // Array of author names
  journal: Journal; // Journal object
  publication_date: string; // Publication date in ISO format
  doi: string; // DOI of the article
  keywords: string[]; // Array of keywords
  citations: number; // Number of citations
  references: string[]; // Array of references
  url: string; // URL of the article
  pdf_url: string; // URL of the PDF
  full_text?: string; // Full text of the article
  figures?: string[]; // Array of figure URLs
  tables?: string[]; // Array of table URLs
  supplementary_material?: string[]; // Array of supplementary material URLs
  data_sets?: string[]; // Array of data set URLs
  methods?: string; // Methods used in the article
  results?: string; // Results of the article
  discussion?: string; // Discussion of the article
  conclusion?: string; // Conclusion of the article
};
```

### src/app.ts

```ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import articleRoutes from "./routes/article-routes";
import { PUBMED_CONFIG } from "./config/pubmed-config";
import { Logger } from "./utils/logger";
import { requestLogger } from "./middlewares/request-logger";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const host = "0.0.0.0";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Request logging middleware
app.use(requestLogger);

// Routes
app.use("/api", articleRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint with API information
app.get("/", (req, res) => {
  res.json({
    name: "PubMed Clinical Article Retriever API",
    version: "0.1.0",
    description:
      "A service for retrieving high-quality medical literature from PubMed based on clinical blueprints",
    endpoints: {
      articles: "POST /api/articles",
      specialties: "GET /api/specialties",
      topics: "GET /api/specialties/{specialty}/topics",
    },
    config: {
      rate_limit: {
        requests_per_second: 1000 / PUBMED_CONFIG.rate_limit.min_time,
        max_concurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
      },
      page_size: PUBMED_CONFIG.page_size,
      page_limit: PUBMED_CONFIG.page_limit,
    },
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error("Server", `Unhandled error: ${err.message}`, err);

    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    });
  }
);

// Start the server
app.listen(port as number, "0.0.0.0", () => {
  Logger.success(
    "Server",
    `PubMed Clinical Article Retriever API running on port ${port}`
  );
  Logger.info("Server", `Health check: http://${host}:${port}/health`);
  Logger.info("Server", `API documentation: http://${host}:${port}/`);

  // Log environment details
  Logger.debug("Config", "Environment configuration loaded", {
    env: process.env.NODE_ENV || "development",
    rate_limits: {
      requests_per_second: 1000 / PUBMED_CONFIG.rate_limit.min_time,
      max_concurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
    },
  });
});

export default app;
```

### src/config/pubmed-config.ts

```ts
export const PUBMED_CONFIG = {
  // PubMed API
  // https://www.ncbi.nlm.nih.gov/books/NBK25501/
  base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
  esearch: "/esearch.fcgi",
  efetch: "/efetch.fcgi",
  esummary: "/esummary.fcgi",

  page_limit: 1,
  page_size: 5,
  rate_limit: {
    min_time: 3000,
    max_concurrent: 3,
    reservoir: 10,
    reservoir_refresh_amount: 10,
    reservoir_refresh_interval: 60 * 1000,
  },
  journal_quality: {
    impact_factor_threshold: 5,
    h_index_threshold: 100,
    sjr: 5,
  },
} as const;

export const AGE_MAP = {
  "Newborn: Birth-1 month": "infant, newborn[mh]",
  "Infant: Birth-23 months": "infant[mh]",
  "Preschool Child: 2-5 years": "child, preschool[mh]",
  "Child: 6-12 years": "child[mh:noexp]",
  "Adolescent: 13-18 years": "adolescent[mh]",
  "Young Adult: 19-24 years": '"young adult[mh]"',
  "Adult: 19+ years": "adult[mh]",
  "Adult: 19-44 years": "adult[mh:noexp]",
  "Middle Aged: 45-64 years": "middle aged[mh]",
  "Middle Aged + Aged: 45+ years": "(middle aged[mh] OR aged[mh])",
  "Aged: 65+ years": "aged[mh]",
  "80 and over: 80+ years": '"aged, 80 and over[mh]"',
} as const;

export const FILTER_MAP = {
  Therapy: {
    broad: `(((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading]))`,
    narrow: `(randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))`,
  },
  Diagnosis: {
    broad: `(sensitiv*[Title/Abstract] OR sensitivity and specificity[MeSH Terms] OR diagnose[Title/Abstract] OR diagnosed[Title/Abstract] OR diagnoses[Title/Abstract] OR diagnosing[Title/Abstract] OR diagnosis[Title/Abstract] OR diagnostic[Title/Abstract] OR diagnosis[MeSH:noexp])`,
    narrow: `(specificity[Title/Abstract])`,
  },
  Etiology: {
    broad: `(risk[Title/Abstract] OR risk[MeSH:noexp] OR (risk adjustment[MeSH:noexp] OR risk assessment[MeSH:noexp]))`,
    narrow: `((relative[Title/Abstract] AND risk[Title/Abstract]) OR (relative risk[Text Word]))`,
  },
  Prognosis: {
    broad: `(incidence[MeSH:noexp] OR mortality[MeSH Terms] OR follow up studies[MeSH:noexp] OR prognos*[Text Word])`,
    narrow: `(prognos*[Title/Abstract] OR (first[Title/Abstract] AND episode[Title/Abstract]))`,
  },
  "Clinical Prediction Guides": {
    broad: `(predict*[Title/Abstract] OR predictive value of tests[MeSH Terms] OR score[Title/Abstract])`,
    narrow: `(validation[Title/Abstract])`,
  },
} as const;

export const DEFAULT_FILTER = {
  narrow: `(
  Clinical Trial[pt] OR Controlled Clinical Trial[pt] OR Meta-Analysis[pt]
  OR Multicenter Study[pt] OR Observational Study[pt] OR Practice Guideline[pt]
  OR Randomized Controlled Trial[pt] OR Review[pt] OR Systematic Review[pt]
)
AND English[Language]`,
} as const;
```

### src/controllers/article-controller.ts

```ts
import { Request, Response } from "express";
import BlueprintService from "../services/blueprint-service";
import QueryService from "../services/query-service";
import PubmedService from "../services/pubmed-service";
import FileStorageService from "../services/file-storage-service";
import { ArticleRequest } from "../types";
import { Logger } from "../utils/logger";

/**
 * Controller for handling article requests
 */
class ArticleController {
  private blueprint_service: BlueprintService;
  private query_service: QueryService;
  private pubmed_service: PubmedService;

  constructor() {
    this.blueprint_service = new BlueprintService();
    this.query_service = new QueryService();
    this.pubmed_service = new PubmedService();
  }

  /**
   * Handle article retrieval based on clinical blueprint
   * @param req Express request
   * @param res Express response
   */
  public async getArticles(req: Request, res: Response): Promise<void> {
    const start_time = Date.now();

    try {
      // Validate request body
      const article_request = req.body as ArticleRequest;
      Logger.debug(
        "ArticleController",
        "Received article request",
        article_request
      );

      // Process the blueprint
      const blueprint =
        this.blueprint_service.processBlueprint(article_request);

      // Build search query
      const query = this.query_service.buildSearchQuery(blueprint);

      // Validate query
      if (!this.query_service.validateQuery(query)) {
        res.status(400).json({
          error: "Invalid query construction",
        });
        return;
      }

      // Get total count (for pagination info)
      const total_count = await this.pubmed_service.getArticleCount(query);
      Logger.debug(
        "ArticleController",
        `Found ${total_count} total matching articles`
      );

      // Search articles
      const pmids = await this.pubmed_service.searchArticles(
        query,
        article_request.page || 1,
        article_request.limit || 10
      );

      if (pmids.length === 0) {
        Logger.info("ArticleController", "No articles found for query");
        const duration = Date.now() - start_time;
        const saved_filename = await this.file_storage_service.saveSearchResult(
          [],
          blueprint,
          query,
          [],
          0
        );
        Logger.info(
          "ArticleController",
          `Empty search results saved to ${saved_filename}`
        );

        res.json({
          articles: [],
          meta: {
            total: 0,
            processing_time: duration,
            saved_filename,
          },
        });
        return;
      }

      Logger.debug(
        "ArticleController",
        `Retrieved ${pmids.length} article IDs`,
        { pmids }
      );

      // Fetch article details
      const articles = await this.pubmed_service.fetchArticleDetails(pmids);
      const duration = Date.now() - start_time;

      // Return results
      Logger.success(
        "ArticleController",
        `Request completed in ${duration}ms, returning ${articles.length} articles`
      );
      res.json({
        articles: articles,
        meta: {
          total: total_count,
          processing_time: duration,
          encoding: {
            tables: "base64",
            original_xml: "base64",
            sanitized_html: "base64",
          },
        },
      });
    } catch (error) {
      Logger.error("ArticleController", "Error retrieving articles", error);
      res.status(500).json({
        error: "An error occurred while processing your request",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get suggested topics for a specialty
   * @param req Express request
   * @param res Express response
   */
  public getSuggestedTopics(req: Request, res: Response): void {
    try {
      const { specialty } = req.params;
      Logger.debug(
        "ArticleController",
        `Getting suggested topics for specialty: ${specialty}`
      );

      if (!specialty) {
        Logger.warn("ArticleController", "Specialty parameter is missing");
        res.status(400).json({
          error: "Specialty parameter is required",
        });
        return;
      }

      const topics = this.blueprint_service.getSuggestedTopics(specialty);
      Logger.debug(
        "ArticleController",
        `Found ${topics.length} topics for ${specialty}`
      );

      res.json({
        specialty,
        topics,
      });
    } catch (error) {
      Logger.error(
        "ArticleController",
        "Error getting suggested topics",
        error
      );
      res.status(500).json({
        error: "An error occurred while retrieving suggested topics",
      });
    }
  }

  /**
   * Get all available specialties
   * @param _req Express request
   * @param res Express response
   */
  public getSpecialties(_req: Request, res: Response): void {
    try {
      Logger.debug("ArticleController", "Getting all available specialties");
      const specialties = this.blueprint_service.getSpecialties();
      const specialty_list = Object.keys(specialties);

      Logger.debug(
        "ArticleController",
        `Found ${specialty_list.length} specialties`
      );

      res.json({
        specialties: specialty_list,
      });
    } catch (error) {
      Logger.error("ArticleController", "Error getting specialties", error);
      res.status(500).json({
        error: "An error occurred while retrieving specialties",
      });
    }
  }
}

export default ArticleController;
```

### src/examples/pubmed-search-example.ts

```ts
/**
 * Example script demonstrating the usage of the E-utilities API wrapper
 * and XML/DOM processing with @xmldom/xmldom and jsdom
 */

import dotenv from "dotenv";
import EUtilitiesService from "../services/e-utilities.service";
import PubmedService from "../services/pubmed-service";
import ArticleContentExtractor from "../utils/article-content-extractor";
import { Logger } from "../utils/logger";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

async function runPubmedSearchExample() {
  try {
    Logger.info("Example", "Starting PubMed search example");

    // Initialize the PubMed service
    const pubmedService = new PubmedService();

    // Search for articles
    const searchTerm = "cardiomyopathy treatment guidelines";
    Logger.info("Example", `Searching for: ${searchTerm}`);

    // Get article count
    const totalCount = await pubmedService.getArticleCount(searchTerm);
    Logger.info("Example", `Found ${totalCount} matching articles`);

    // Get article IDs (first page, 5 results)
    const pmids = await pubmedService.searchArticles(searchTerm, 1, 5);
    Logger.info(
      "Example",
      `Retrieved ${pmids.length} article IDs: ${pmids.join(", ")}`
    );

    // Fetch article details
    const articles = await pubmedService.fetchArticleDetails(pmids);
    Logger.info("Example", `Retrieved ${articles.length} article details`);

    // Display article summaries
    console.log("\n--- ARTICLE SUMMARIES ---");
    articles.forEach((article, index) => {
      console.log(`\n[${index + 1}] ${article.title}`);
      console.log(`Authors: ${article.authors.join(", ")}`);
      console.log(`Journal: ${article.journal}`);
      console.log(`Date: ${article.pub_date}`);
      console.log(`PMID: ${article.pmid}`);
      console.log(`URL: ${article.url}`);
      const abstractPreview =
        article.abstract.length > 150
          ? article.abstract.substring(0, 150) + "..."
          : article.abstract;
      console.log(`Abstract: ${abstractPreview}`);
    });

    // Initialize E-utilities service directly for advanced usage
    console.log("\n--- DIRECT E-UTILITIES API USAGE ---");
    const eutils = new EUtilitiesService(
      process.env.CONTACT_EMAIL || "example@example.com"
    );

    // Get spelling suggestions
    const spellResult = await eutils.espell({
      term: "cardimyopthy",
    });
    console.log(
      `\nSpelling suggestion for "cardimyopthy": ${
        spellResult.eSpellResult?.CorrectedQuery || "No correction available"
      }`
    );

    // Get related articles for the first PMID
    if (pmids.length > 0) {
      try {
        const linkResults = await eutils.elink({
          dbfrom: "pubmed",
          id: pmids[0],
          cmd: "neighbor",
        });

        // Add extra protection against undefined responses
        const relatedPmids =
          linkResults?.linksets?.[0]?.linksetdbs
            ?.find((db) => db.linkname === "pubmed_pubmed")
            ?.links?.slice(0, 3) || [];

        console.log(
          `\nRelated articles for PMID ${pmids[0]}: ${
            relatedPmids.length > 0 ? relatedPmids.join(", ") : "None found"
          }`
        );
      } catch (error) {
        console.log(
          `\nUnable to fetch related articles for PMID ${pmids[0]}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Fetch and parse XML for the first article
    console.log("\n--- XML PROCESSING EXAMPLE ---");
    if (pmids.length > 0) {
      const xmlDoc = await eutils.efetchXML({
        id: pmids[0],
      });

      // Extract content using our extractor utility
      const extractedContent = ArticleContentExtractor.extractContent(
        xmlDoc,
        pmids[0]
      );

      console.log(`\nExtracted content for PMID ${pmids[0]}:`);
      console.log(
        `- Full text length: ${extractedContent.full_text.length} characters`
      );
      console.log(
        `- Methods section: ${
          extractedContent.methods ? "Present" : "Not present"
        }`
      );
      console.log(
        `- Results section: ${
          extractedContent.results ? "Present" : "Not present"
        }`
      );
      console.log(
        `- Discussion section: ${
          extractedContent.discussion ? "Present" : "Not present"
        }`
      );
      console.log(
        `- Conclusion section: ${
          extractedContent.conclusion ? "Present" : "Not present"
        }`
      );
      console.log(`- Figures: ${extractedContent.figures.length}`);
      console.log(`- Tables: ${extractedContent.tables.length}`);
      console.log(
        `- Supplementary materials: ${extractedContent.supplementary_material.length}`
      );

      // Save the sanitized HTML to a file for inspection
      const outputDir = path.join(__dirname, "../../output");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const htmlPath = path.join(outputDir, `${pmids[0]}.html`);
      fs.writeFileSync(htmlPath, extractedContent.sanitized_html || "");
      console.log(`\nSanitized HTML saved to ${htmlPath}`);
    }

    Logger.info("Example", "PubMed search example completed successfully");
  } catch (error) {
    Logger.error("Example", "Error running PubMed search example", error);
    console.error("An error occurred:", error);
  }
}

// Run the example
runPubmedSearchExample().catch(console.error);
```

### src/middlewares/request-logger.ts

```ts
import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";

/**
 * Generate a unique request ID
 * @returns A unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Clean request body for logging - removes sensitive data
 * @param body Request body
 * @returns Cleaned body object
 */
function cleanRequestBody(
  body: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!body) return undefined;

  const cleanedBody = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "api_key", "apiKey", "secret"];
  sensitiveFields.forEach((field) => {
    if (cleanedBody[field]) {
      cleanedBody[field] = "[REDACTED]";
    }
  });

  return cleanedBody;
}

/**
 * Express middleware for logging HTTP requests and responses
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add request ID and start time
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Store request ID in response locals
  res.locals.requestId = requestId;

  // Log the incoming request
  Logger.http(req.method, req.url, undefined, undefined);

  // Log detailed request info
  Logger.debug("Request", `${req.method} ${req.url}`, {
    requestId: res.locals.requestId,
    body: req.method !== "GET" ? cleanRequestBody(req.body) : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    params: Object.keys(req.params).length ? req.params : undefined,
    headers: {
      "user-agent": req.headers["user-agent"],
      "content-type": req.headers["content-type"],
      accept: req.headers["accept"],
    },
  });

  // Store original methods
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  // Override res.send
  res.send = function (body: unknown): Response {
    const duration = Date.now() - startTime;

    // Log response info
    Logger.http(req.method, req.url, res.statusCode, duration);

    // For errors, provide more detail
    if (res.statusCode >= 400) {
      Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }

    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function (body: unknown): Response {
    const duration = Date.now() - startTime;

    // Log response info
    Logger.http(req.method, req.url, res.statusCode, duration);

    // For errors, provide more detail
    if (res.statusCode >= 400 && res.statusCode < 500) {
      Logger.warn(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else if (res.statusCode >= 500) {
      Logger.error(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
          response: body,
        }
      );
    } else {
      Logger.debug(
        "Response",
        `${req.method} ${req.url} returned ${res.statusCode}`,
        {
          requestId: res.locals.requestId,
          duration: `${duration}ms`,
        }
      );
    }

    return originalJson.call(this, body);
  };

  // Continue to the next middleware
  next();
}
```

### src/routes/article-routes.ts

```ts
import { Router } from "express";
import ArticleController from "../controllers/article-controller";

const router = Router();
const controller = new ArticleController();

/**
 * @route POST /api/articles
 * @description Get articles based on a clinical blueprint
 */
router.post("/articles", (req, res) => controller.getArticles(req, res));

/**
 * @route GET /api/specialties
 * @description Get all available specialties
 */
router.get("/specialties", (req, res) => controller.getSpecialties(req, res));

/**
 * @route GET /api/specialties/:specialty/topics
 * @description Get suggested topics for a specialty
 */
router.get("/specialties/:specialty/topics", (req, res) =>
  controller.getSuggestedTopics(req, res)
);

export default router;
```

### src/services/blueprint-service.ts

```ts
import FileReader from "../utils/file-reader";
import { ArticleRequest, ProcessedBlueprint } from "../types";
import { Logger } from "../utils/logger";

/**
 * Service for processing clinical blueprints
 */
class BlueprintService {
  private specialties: Record<
    string,
    {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }
  >;

  constructor() {
    this.specialties = FileReader.getSpecialties();
    Logger.debug(
      "BlueprintService",
      `Initialized with ${Object.keys(this.specialties).length} specialties`
    );
  }

  /**
   * Process a blueprint request into a standardized format
   * @param request The blueprint request
   * @returns Processed blueprint
   */
  public processBlueprint(request: ArticleRequest): ProcessedBlueprint {
    Logger.debug("BlueprintService", `Processing blueprint request`, request);

    // Normalize and validate inputs
    const normalized_specialty = this.normalizeSpecialty(request.specialty);
    Logger.debug(
      "BlueprintService",
      `Normalized specialty: ${request.specialty} -> ${normalized_specialty}`
    );

    const normalized_topics = this.normalizeTopics(request.topics);
    Logger.debug(
      "BlueprintService",
      `Normalized ${request.topics.length} topics -> ${normalized_topics.length} unique topics`
    );

    // Verify specialty exists
    if (!this.validateSpecialty(normalized_specialty)) {
      Logger.error(
        "BlueprintService",
        `Invalid specialty: ${normalized_specialty}`
      );
      throw new Error(`Invalid specialty: ${normalized_specialty}`);
    }

    // Set default filters if not provided, or use the provided ones
    const clinical_queries =
      request.filters?.clinical_queries ||
      this.specialties[normalized_specialty].default_filters;

    const blueprint: ProcessedBlueprint = {
      specialty: normalized_specialty,
      topics: normalized_topics,
      filters: {
        clinical_queries,
        age_group: request.filters?.age_group,
        year_range: request.filters?.year_range || 3, // Default to last 3 years
      },
    };

    Logger.debug(
      "BlueprintService",
      `Blueprint processed successfully`,
      blueprint
    );
    return blueprint;
  }

  /**
   * Normalize specialty name (lowercase, trim, handle aliases)
   * @param specialty Specialty name
   * @returns Normalized specialty name
   */
  public normalizeSpecialty(specialty: string): string {
    const normalized = specialty.toLowerCase().trim();

    // Handle common aliases
    const aliases: Record<string, string> = {
      cardio: "cardiology",
      neuro: "neurology",
      endo: "endocrinology",
      gastro: "gastroenterology",
      psych: "psychiatry",
      rheum: "rheumatology",
      id: "infectious_diseases",
      "infectious disease": "infectious_diseases",
      "infectious diseases": "infectious_diseases",
    };

    return aliases[normalized] || normalized;
  }

  /**
   * Validate if a specialty exists in our database
   * @param specialty Specialty to validate
   * @returns True if the specialty is valid
   */
  public validateSpecialty(specialty: string): boolean {
    return !!this.specialties[specialty];
  }

  /**
   * Get suggested topics for a specialty
   * @param specialty The specialty
   * @returns Array of common topics for the specialty
   */
  public getSuggestedTopics(specialty: string): string[] {
    const normalized_specialty = this.normalizeSpecialty(specialty);

    if (!this.validateSpecialty(normalized_specialty)) {
      return [];
    }

    return this.specialties[normalized_specialty].common_topics;
  }

  /**
   * Normalize topics (lowercase, trim, deduplicate)
   * @param topics Array of topics
   * @returns Normalized topics
   */
  public normalizeTopics(topics: string[]): string[] {
    // Process each topic and remove duplicates
    const normalized = topics
      .map((topic) => topic.toLowerCase().trim())
      .filter((topic) => topic.length > 0);

    // Remove duplicates
    return [...new Set(normalized)];
  }

  /**
   * Get MeSH terms for a specialty
   * @param specialty The specialty
   * @returns Array of MeSH terms for the specialty
   */
  public getSpecialtyMeshTerms(specialty: string): string[] {
    const normalized_specialty = this.normalizeSpecialty(specialty);

    if (!this.validateSpecialty(normalized_specialty)) {
      return [];
    }

    return this.specialties[normalized_specialty].mesh_terms;
  }

  /**
   * Get all specialties
   * @returns All specialties data
   */
  public getSpecialties(): Record<
    string,
    {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }
  > {
    return this.specialties;
  }
}

export default BlueprintService;
```

### src/services/e-utilities.service.ts

```ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  DOMParser as XMLDOMParser,
  Document as XMLDocument,
} from "@xmldom/xmldom";
import { JSDOM } from "jsdom";
import { Logger } from "../utils/logger";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import RateLimiter from "../utils/rate-limiter";

import {
  BaseEUtilsParams,
  EInfoParams,
  EInfoDatabaseList,
  EInfoDatabaseInfo,
  ESearchParams,
  ESearchResponse,
  ESummaryParams,
  ESummaryResponse,
  PubmedESummaryResponse,
  EFetchParams,
  EPostParams,
  EPostResponse,
  ELinkParams,
  ELinkNeighborResponse,
  EGQueryParams,
  EGQueryResponse,
  ESpellParams,
  ESpellResponse,
  ECitMatchParams,
  ECitMatchResponse,
} from "../types/e-utilities.types";

/**
 * Strongly-typed wrapper for NCBI E-utilities API
 * Provides 1:1 mapping to the E-utilities endpoints
 */
export class EUtilitiesService {
  private baseUrl: string;
  private apiKey: string | undefined;
  private rateLimiter: RateLimiter;
  private appName: string = "PubmedSearchApp";
  private contactEmail: string;
  private xmlParser: XMLDOMParser;

  constructor(contactEmail: string) {
    this.baseUrl = PUBMED_CONFIG.base_url;
    this.apiKey = process.env.PUBMED_API_KEY;
    this.contactEmail = contactEmail;
    this.xmlParser = new XMLDOMParser();

    // Initialize rate limiter based on config
    this.rateLimiter = new RateLimiter(
      PUBMED_CONFIG.rate_limit.max_concurrent,
      PUBMED_CONFIG.rate_limit.min_time
    );

    Logger.debug("EUtilitiesService", "Initialized with configuration", {
      baseUrl: this.baseUrl,
      apiKeyPresent: !!this.apiKey,
      contactEmail: this.contactEmail,
      rateLimit: {
        maxConcurrent: PUBMED_CONFIG.rate_limit.max_concurrent,
        minTime: PUBMED_CONFIG.rate_limit.min_time,
      },
    });
  }

  /**
   * Add common API parameters to requests
   */
  private addCommonParams<T extends BaseEUtilsParams>(params: Partial<T>): T {
    return {
      ...params,
      tool: this.appName,
      email: this.contactEmail,
      api_key: this.apiKey,
    } as T;
  }

  /**
   * Execute API request with rate limiting
   */
  private async executeRequest<T>(
    endpoint: string,
    params: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();
    Logger.debug(
      "EUtilitiesService",
      `Rate limit slot acquired for ${endpoint}`
    );

    const url = `${this.baseUrl}${endpoint}`;

    try {
      Logger.debug("EUtilitiesService", `Making request to ${url}`, { params });

      const startTime = Date.now();
      const response = await axios.get<T>(url, {
        params,
        ...config,
      });
      const duration = Date.now() - startTime;

      Logger.debug(
        "EUtilitiesService",
        `Request to ${endpoint} completed in ${duration}ms`
      );

      return response.data;
    } catch (error) {
      Logger.error("EUtilitiesService", `Error in ${endpoint} request`, error);
      throw new Error(
        `E-utilities ${endpoint} request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Parse XML response to Document
   */
  public parseXML(xmlString: string): XMLDocument {
    return this.xmlParser.parseFromString(xmlString, "text/xml");
  }

  /**
   * Create a JSDOM instance from HTML/XML
   */
  public createDOM(content: string): JSDOM {
    return new JSDOM(content);
  }

  /**
   * EInfo: Get information about NCBI databases
   * @param params EInfo parameters
   * @returns Database information
   */
  public async einfo(
    params: Partial<EInfoParams> = {}
  ): Promise<EInfoDatabaseList | EInfoDatabaseInfo> {
    const fullParams = this.addCommonParams<EInfoParams>(params);
    return this.executeRequest<EInfoDatabaseList | EInfoDatabaseInfo>(
      "/einfo.fcgi",
      fullParams
    );
  }

  /**
   * ESearch: Search Entrez databases
   * @param params ESearch parameters
   * @returns Search results
   */
  public async esearch(
    params: Partial<ESearchParams>
  ): Promise<ESearchResponse> {
    const fullParams = this.addCommonParams<ESearchParams>({
      db: "pubmed",
      ...params,
    });

    return this.executeRequest<ESearchResponse>(
      PUBMED_CONFIG.esearch,
      fullParams
    );
  }

  /**
   * ESummary: Retrieve document summaries
   * @param params ESummary parameters
   * @returns Document summaries
   */
  public async esummary<T extends ESummaryResponse = ESummaryResponse>(
    params: Partial<ESummaryParams>
  ): Promise<T> {
    const fullParams = this.addCommonParams<ESummaryParams>({
      db: "pubmed",
      ...params,
    });

    return this.executeRequest<T>(PUBMED_CONFIG.esummary, fullParams);
  }

  /**
   * EFetch: Retrieve formatted data records
   * @param params EFetch parameters
   * @returns Raw formatted data (XML, text, etc.)
   */
  public async efetch(params: Partial<EFetchParams>): Promise<string> {
    const fullParams = this.addCommonParams<EFetchParams>({
      db: "pubmed",
      ...params,
    });

    return this.executeRequest<string>(PUBMED_CONFIG.efetch, fullParams, {
      responseType: "text",
    });
  }

  /**
   * EFetch with XML parsing: Retrieve and parse XML records
   * @param params EFetch parameters
   * @returns Parsed XML Document
   */
  public async efetchXML(params: Partial<EFetchParams>): Promise<XMLDocument> {
    const xml = await this.efetch({
      ...params,
      retmode: "xml",
    });

    return this.parseXML(xml);
  }

  /**
   * EPost: Upload UIDs to server
   * @param params EPost parameters
   * @returns EPost response with WebEnv and query_key
   */
  public async epost(params: Partial<EPostParams>): Promise<EPostResponse> {
    const fullParams = this.addCommonParams<EPostParams>({
      db: "pubmed",
      ...params,
    });

    return this.executeRequest<EPostResponse>("/epost.fcgi", fullParams);
  }

  /**
   * ELink: Find related records
   * @param params ELink parameters
   * @returns ELink response
   */
  public async elink(
    params: Partial<ELinkParams>
  ): Promise<ELinkNeighborResponse> {
    const fullParams = this.addCommonParams<ELinkParams>({
      dbfrom: "pubmed",
      ...params,
    });

    return this.executeRequest<ELinkNeighborResponse>(
      "/elink.fcgi",
      fullParams
    );
  }

  /**
   * EGQuery: Global query across databases
   * @param params EGQuery parameters
   * @returns EGQuery response
   */
  public async egquery(
    params: Partial<EGQueryParams>
  ): Promise<EGQueryResponse> {
    const fullParams = this.addCommonParams<EGQueryParams>(params);

    return this.executeRequest<EGQueryResponse>("/egquery.fcgi", fullParams);
  }

  /**
   * ESpell: Get spelling suggestions
   * @param params ESpell parameters
   * @returns ESpell response
   */
  public async espell(params: Partial<ESpellParams>): Promise<ESpellResponse> {
    const fullParams = this.addCommonParams<ESpellParams>({
      db: "pubmed",
      ...params,
    });

    return this.executeRequest<ESpellResponse>("/espell.fcgi", fullParams);
  }

  /**
   * ECitMatch: Match citation strings
   * @param params ECitMatch parameters
   * @returns Raw text response
   */
  public async ecitmatch(
    params: Partial<ECitMatchParams>
  ): Promise<ECitMatchResponse> {
    const fullParams = this.addCommonParams<ECitMatchParams>({
      db: "pubmed",
      ...params,
    });

    const rawText = await this.executeRequest<string>(
      "/ecitmatch.cgi",
      fullParams,
      { responseType: "text" }
    );

    return { raw: rawText };
  }
}

export default EUtilitiesService;
```

### src/services/file-storage-service.ts

```ts
import fs from "fs/promises";
import path from "path";
import { SavedSearchResult, ProcessedBlueprint, Article } from "../types";
import { Logger } from "../utils/logger";
import { ContentProcessor } from "../utils/content-processor";
import MeshMapper from "../utils/mesh-mapper";
import { randomBytes } from "crypto";

class FileStorageService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), "data", "output");
  }

  /**
   * Save search results to a JSON file
   * @param articles The articles to save
   * @param blueprint The processed blueprint
   * @param query The search query used
   * @param pmids Array of PMIDs
   * @param totalCount Total number of articles found
   */
  public async saveSearchResult(
    articles: Article[],
    blueprint: ProcessedBlueprint,
    query: string,
    pmids: string[],
    totalCount: number
  ): Promise<string> {
    try {
      // Ensure output directory exists
      // await fs.mkdir(this.outputDir, { recursive: true });

      // const result: SavedSearchResult = {
      //   clinical_category: blueprint.filters.clinical_queries[0] as any, // Will be validated by type
      //   clinical_scope: "narrow", // Using narrow scope as default per config
      //   esearch_query: query,
      //   article_count: totalCount,
      //   clinical_specialty: blueprint.specialty,
      //   pmids: pmids,
      //   articles: articles.map((article) => ({
      //     pmid: article.pmid,
      //     title: article.title,
      //     abstract: article.abstract,
      //     authors: article.authors,
      //     journal: article.journal,
      //     year: new Date(article.pub_date).getFullYear(),
      //     // Use extracted MeSH terms if available, otherwise generate them
      //     mesh_terms: (article as any).mesh_terms || this.generateMeshTerms(article),
      //     full_text: article.full_text,
      //     methods: article.methods,
      //     results: article.results,
      //     discussion: article.discussion,
      //     conclusion: article.conclusion,
      //     figures: article.figures,
      //     tables: article.tables
      //       ? ContentProcessor.encodeArray(article.tables)
      //       : undefined,
      //     supplementary_material: article.supplementary_material,
      //     original_xml: ContentProcessor.encodeContent(article.original_xml),
      //     sanitized_html: ContentProcessor.encodeContent(
      //       article.sanitized_html
      //     ),
      //   })),
      //   encoding_metadata: {
      //     tables: "base64",
      //     original_xml: "base64",
      //     sanitized_html: "base64",
      //   },
      // };

      // const filename = this.generateFilename(blueprint);
      // const filepath = path.join(this.outputDir, filename);
      // Logger.info(
      //   "FileStorageService",
      //   `The complete data will be saved at ${filepath} which contains the search results`,
      //   this.createContentPreview(result)
      // );

      // await fs.writeFile(filepath, JSON.stringify(result, null, 2));

      // return filename;
      Logger.info(
        "FileStorageService",
        `The complete data will be saved at ${this.outputDir} which contains the search results`
      );
      return "";
    } catch (error) {
      Logger.error("FileStorageService", "Error saving search results", error);
      throw error;
    }
  }

  /**
   * Create a log-friendly preview of article content
   * @param result The saved search result
   * @returns Object with previews of important fields
   */
  private createContentPreview(result: SavedSearchResult): any {
    // Extract first article for preview (or return empty if no articles)
    if (result.articles.length === 0) {
      return { articles: [] };
    }

    const firstArticle = result.articles[0];

    // Helper to create truncated preview
    const preview = (content: string | undefined, maxLength = 100): string => {
      if (!content) return "[empty]";
      return content.length > maxLength
        ? `${content.substring(0, maxLength)}... (${content.length} chars)`
        : content;
    };

    // For encoded content, show both raw (encoded) preview and decoded preview
    const encodedPreview = (
      content: string | undefined,
      maxLength = 50
    ): string => {
      if (!content) return "[empty]";
      const decoded = ContentProcessor.decodeContent(content);
      return `[Encoded: ${preview(content, maxLength)}] [Decoded: ${preview(
        decoded,
        maxLength
      )}]`;
    };

    return {
      article_count: result.article_count,
      articles_preview: {
        count: result.articles.length,
        first_article: {
          pmid: firstArticle.pmid,
          title: firstArticle.title,
          full_text: preview(firstArticle.full_text, 150),
          methods: preview(firstArticle.methods, 150),
          results: preview(firstArticle.results, 150),
          discussion: preview(firstArticle.discussion, 150),
          conclusion: preview(firstArticle.conclusion, 150),
          original_xml: encodedPreview(firstArticle.original_xml),
          sanitized_html: encodedPreview(firstArticle.sanitized_html),
          tables: Array.isArray(firstArticle.tables)
            ? `[${firstArticle.tables.length} tables, first: ${encodedPreview(
                firstArticle.tables[0]
              )}]`
            : "[no tables]",
        },
      },
    };
  }

  /**
   * Generate MeSH terms for an article using the MeshMapper utility
   * @param article The article to generate terms for
   * @returns Array of MeSH terms
   */
  private generateMeshTerms(article: Article): string[] {
    const terms: string[] = [];

    // Add terms from the title
    if (article.title) {
      const titleTerms = MeshMapper.mapTerm(article.title);
      terms.push(...titleTerms);
    }

    // Add terms from the abstract (if needed)
    if (article.abstract && terms.length < 3) {
      // Extract key phrases from abstract (simplified approach)
      const keyPhrases = article.abstract
        .split(/[.,;:]/)
        .map((phrase) => phrase.trim())
        .filter((phrase) => phrase.length > 10 && phrase.length < 60)
        .slice(0, 2); // Take up to 2 phrases

      // Generate terms from key phrases
      keyPhrases.forEach((phrase) => {
        const phraseTerms = MeshMapper.mapTerm(phrase);
        terms.push(...phraseTerms);
      });
    }

    // Deduplicate terms
    const uniqueTerms = [...new Set(terms)];

    // Ensure we have at least some terms
    if (uniqueTerms.length === 0) {
      // If no terms were mapped, use a generic clinical term
      return ["Medical Subject Headings"];
    }

    return uniqueTerms;
  }

  /**
   * Generate a filename for the search results
   * @param blueprint The processed blueprint
   * @returns The generated filename
   */
  private generateFilename(blueprint: ProcessedBlueprint): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "")
      .replace(/[T]/g, "-")
      .replace(/[Z]/g, "");

    const sanitize = (str: string): string =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const components = [
      sanitize(blueprint.topics[0]),
      sanitize(blueprint.specialty),
      sanitize(blueprint.filters.clinical_queries[0]),
      "narrow",
      timestamp,
      randomBytes(4).toString("hex"),
    ];

    return `${components.join("-")}.json`;
  }
}

export default FileStorageService;
```

### src/services/pubmed-service.ts

```ts
import { Document as XMLDocument } from "@xmldom/xmldom";
import dotenv from "dotenv";
import { PUBMED_CONFIG } from "../config/pubmed-config";
import { Article, PubmedSearchResponse } from "../types";
import { Logger } from "../utils/logger";
import EUtilitiesService from "./e-utilities.service";

// Load environment variables
dotenv.config();

/**
 * Service for interacting with the PubMed API
 * Uses the strongly-typed E-utilities service for API calls
 */
class PubmedService {
  private eutils: EUtilitiesService;
  private contactEmail: string;

  constructor() {
    // Using a default contact email, can be overridden in .env
    this.contactEmail =
      process.env.CONTACT_EMAIL || "pubmed-search@example.com";
    this.eutils = new EUtilitiesService(this.contactEmail);

    Logger.debug("PubmedService", "Initialized E-utilities service");
  }

  /**
   * Search for articles using a PubMed query
   * @param query PubMed search query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Search results with PMIDs
   */
  public async searchArticles(
    query: string,
    page: number = 1,
    limit: number = PUBMED_CONFIG.page_size
  ): Promise<string[]> {
    Logger.debug(
      "PubmedService",
      `Searching articles with query, page=${page}, limit=${limit}`
    );

    try {
      // Calculate pagination parameters
      const retmax = Math.min(Math.max(1, limit), 100); // Between 1-100
      const retstart = (Math.max(1, page) - 1) * retmax;

      // Use ESearch to find articles
      const searchResults = await this.eutils.esearch({
        term: query,
        retmode: "json",
        retmax,
        retstart,
      });

      // Check if we have valid results
      if (!searchResults.esearchresult || !searchResults.esearchresult.idlist) {
        Logger.warn("PubmedService", "No results found in search response");
        return [];
      }

      const ids = searchResults.esearchresult.idlist;
      Logger.debug("PubmedService", `Found ${ids.length} article IDs`);

      return ids;
    } catch (error) {
      Logger.error("PubmedService", "Error searching PubMed", error);
      throw new Error("Failed to search articles on PubMed");
    }
  }

  /**
   * Extract article metadata from a PubMed XML document
   * @param xmlDoc The XML Document containing article data
   * @returns Extracted Article object
   */
  private extractArticleFromXML(xmlDoc: XMLDocument): Article[] {
    try {
      const articles: Article[] = [];
      const articleNodes = xmlDoc.getElementsByTagName("PubmedArticle");

      Logger.debug(
        "PubmedService",
        `Extracting data from ${articleNodes.length} article nodes`
      );

      for (let i = 0; i < articleNodes.length; i++) {
        const articleNode = articleNodes.item(i);
        if (!articleNode) continue;

        // Extract PMID
        const pmidNode = articleNode.getElementsByTagName("PMID").item(0);
        const pmid = pmidNode?.textContent || "";

        // Extract article title
        const titleNode = articleNode
          .getElementsByTagName("ArticleTitle")
          .item(0);
        const title = titleNode?.textContent || "";

        // Extract journal info
        const journalNode = articleNode.getElementsByTagName("Journal").item(0);
        const journalTitleNode = journalNode
          ?.getElementsByTagName("Title")
          .item(0);
        const journal = journalTitleNode?.textContent || "";

        // Extract publication date
        const pubDateNode = articleNode.getElementsByTagName("PubDate").item(0);
        let pubDate = "";
        if (pubDateNode) {
          const year =
            pubDateNode.getElementsByTagName("Year").item(0)?.textContent || "";
          const month =
            pubDateNode.getElementsByTagName("Month").item(0)?.textContent ||
            "";
          const day =
            pubDateNode.getElementsByTagName("Day").item(0)?.textContent || "";
          pubDate = [year, month, day].filter(Boolean).join("-");
        }

        // Extract authors
        const authorNames: string[] = [];
        const authorListNode = articleNode
          .getElementsByTagName("AuthorList")
          .item(0);
        if (authorListNode) {
          const authorNodes = authorListNode.getElementsByTagName("Author");
          for (let j = 0; j < authorNodes.length; j++) {
            const authorNode = authorNodes.item(j);
            if (!authorNode) continue;

            const lastName =
              authorNode.getElementsByTagName("LastName").item(0)
                ?.textContent || "";
            const foreName =
              authorNode.getElementsByTagName("ForeName").item(0)
                ?.textContent || "";
            const initials =
              authorNode.getElementsByTagName("Initials").item(0)
                ?.textContent || "";

            if (lastName && (foreName || initials)) {
              authorNames.push(`${lastName} ${foreName || initials}`);
            } else if (lastName) {
              authorNames.push(lastName);
            }
          }
        }

        // Extract abstract
        const abstractNode = articleNode
          .getElementsByTagName("AbstractText")
          .item(0);
        const abstract = abstractNode?.textContent || "";

        // Build article URL
        const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

        // Create article object
        articles.push({
          pmid,
          title,
          authors: authorNames,
          journal,
          pub_date: pubDate,
          abstract,
          url,
          scores: {
            relevance: 0, // To be calculated later
            journal_impact: 0, // To be calculated later
          },
        });
      }

      return articles;
    } catch (error) {
      Logger.error(
        "PubmedService",
        "Error extracting article data from XML",
        error
      );
      throw new Error("Failed to extract article data from PubMed XML");
    }
  }

  /**
   * Fetch article details by PMID
   * @param pmids Array of PubMed IDs
   * @returns Array of article details
   */
  public async fetchArticleDetails(pmids: string[]): Promise<Article[]> {
    if (pmids.length === 0) {
      Logger.debug("PubmedService", "No PMIDs provided, returning empty array");
      return [];
    }

    Logger.debug(
      "PubmedService",
      `Fetching details for ${pmids.length} articles`
    );

    try {
      // Use EFetch to get articles in XML format
      const xmlDoc = await this.eutils.efetchXML({
        id: pmids.join(","),
        retmode: "xml",
      });

      // Extract article data from XML
      const articles = this.extractArticleFromXML(xmlDoc);

      Logger.debug(
        "PubmedService",
        `Successfully extracted ${articles.length} article details`
      );

      return articles;
    } catch (error) {
      Logger.error("PubmedService", "Error fetching article details", error);
      throw new Error("Failed to fetch article details from PubMed");
    }
  }

  /**
   * Get the count of articles matching a query
   * @param query PubMed search query
   * @returns Count of matching articles
   */
  public async getArticleCount(query: string): Promise<number> {
    Logger.debug("PubmedService", "Getting article count for query");

    try {
      // Use ESearch to get the count
      const searchResults = await this.eutils.esearch({
        term: query,
        retmode: "json",
        retmax: 0,
      });

      if (searchResults.esearchresult && searchResults.esearchresult.count) {
        const count = parseInt(searchResults.esearchresult.count, 10);
        Logger.debug("PubmedService", `Found ${count} total matching articles`);
        return count;
      }

      Logger.warn("PubmedService", "No count information in search response");
      return 0;
    } catch (error) {
      Logger.error("PubmedService", "Error getting article count", error);
      throw new Error("Failed to get article count from PubMed");
    }
  }

  /**
   * Get spelling suggestions for search terms
   * @param query The search query to check
   * @returns Corrected query if available, original query otherwise
   */
  public async getSpellingSuggestions(query: string): Promise<string> {
    try {
      const spellResults = await this.eutils.espell({
        term: query,
      });

      if (
        spellResults.eSpellResult &&
        spellResults.eSpellResult.CorrectedQuery &&
        spellResults.eSpellResult.CorrectedQuery !== query
      ) {
        return spellResults.eSpellResult.CorrectedQuery;
      }

      return query;
    } catch (error) {
      Logger.warn("PubmedService", "Error getting spelling suggestions", error);
      return query; // Return original query on error
    }
  }

  /**
   * Find related articles for a given PMID
   * @param pmid PubMed ID to find related articles for
   * @param limit Maximum number of related articles to return
   * @returns Array of related PMIDs
   */
  public async findRelatedArticles(
    pmid: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      const linkResults = await this.eutils.elink({
        dbfrom: "pubmed",
        id: pmid,
        cmd: "neighbor",
      });

      if (
        linkResults.linksets &&
        linkResults.linksets[0] &&
        linkResults.linksets[0].linksetdbs
      ) {
        for (const linksetdb of linkResults.linksets[0].linksetdbs) {
          if (linksetdb.linkname === "pubmed_pubmed" && linksetdb.links) {
            return linksetdb.links.slice(0, limit);
          }
        }
      }

      return [];
    } catch (error) {
      Logger.error("PubmedService", "Error finding related articles", error);
      return [];
    }
  }
}

export default PubmedService;
```

### src/services/query-service.ts

```ts
import MeshMapper from "../utils/mesh-mapper";
import { ProcessedBlueprint, QueryFilters } from "../types";
import { FILTER_MAP, AGE_MAP, DEFAULT_FILTER } from "../config/pubmed-config";

/**
 * Service for constructing optimized PubMed search queries
 */
class QueryService {
  /**
   * Build a complete PubMed search query based on a processed blueprint
   * @param blueprint The processed blueprint
   * @returns PubMed search query string
   */
  public buildSearchQuery(blueprint: ProcessedBlueprint): string {
    // Create the core topic query
    const topic_query = this.buildTopicQuery(blueprint.topics);

    // Add filters
    const filter_query = this.applyFilters(blueprint.filters);

    // Combine all query parts
    return `(${topic_query}) AND (${filter_query})`;
  }

  /**
   * Build a query string for the topics
   * @param topics Array of topics
   * @returns Topic query string
   */
  public buildTopicQuery(topics: string[]): string {
    if (topics.length === 0) {
      throw new Error("At least one topic is required");
    }

    // Map each topic to MeSH terms and format for search
    const topic_queries = topics.map((topic) => {
      const mesh_terms = MeshMapper.mapTerm(topic);

      if (mesh_terms.length === 0) {
        // If no MeSH terms, use the original topic with various fields
        return `("${topic}"[Title/Abstract] OR "${topic}"[All Fields])`;
      }

      // If we have MeSH terms, create a more precise query
      const mesh_query = mesh_terms
        .map((term) => `"${term}"[MeSH Terms] OR "${term}"[Title/Abstract]`)
        .join(" OR ");

      return `(${mesh_query})`;
    });

    // Join topics with AND (since we want articles that mention both topics)
    return topics.length > 1
      ? `(${topic_queries.join(" AND ")})`
      : topic_queries[0];
  }

  /**
   * Apply filters to the query
   * @param filters Query filters
   * @returns Filter query string
   */
  public applyFilters(filters: QueryFilters): string {
    const filter_parts: string[] = [];

    // Apply study type filters
    if (filters.clinical_queries && filters.clinical_queries.length > 0) {
      const study_filters = filters.clinical_queries
        .filter((type) => FILTER_MAP[type as keyof typeof FILTER_MAP])
        .map((type) => FILTER_MAP[type as keyof typeof FILTER_MAP].broad);

      if (study_filters.length > 0) {
        // Each filter is already wrapped in parentheses from the config
        // Just join them with OR and wrap the whole thing
        filter_parts.push(`(${study_filters.join(" OR ")})`);
      }
    } else {
      // Use default filter if no specific filters provided
      filter_parts.push(DEFAULT_FILTER.narrow);
    }

    // Apply age group filter if specified
    if (
      filters.age_group &&
      AGE_MAP[filters.age_group as keyof typeof AGE_MAP]
    ) {
      filter_parts.push(AGE_MAP[filters.age_group as keyof typeof AGE_MAP]);
    }

    // Apply date range filter
    const year_range = filters.year_range || 3;
    filter_parts.push(`"last ${year_range} years"[PDat]`);

    // Join all filter parts with AND
    return filter_parts.join(" AND ");
  }

  /**
   * Validate a constructed query
   * @param query The query to validate
   * @returns True if the query is valid
   */
  public validateQuery(query: string): boolean {
    // Check minimum query length
    if (query.length < 10) {
      console.log("Query validation failed: Too short");
      return false;
    }

    // Check for balanced parentheses using a stack
    const stack: string[] = [];
    for (const char of query) {
      if (char === "(") {
        stack.push(char);
      } else if (char === ")") {
        if (stack.length === 0) {
          console.log("Query validation failed: Unmatched closing parenthesis");
          return false;
        }
        stack.pop();
      }
    }
    if (stack.length !== 0) {
      console.log(
        `Query validation failed: ${stack.length} unclosed parentheses`
      );
      return false;
    }

    // Validate PubMed field tags
    const validTags = [
      "MeSH Terms",
      "Title/Abstract",
      "All Fields",
      "Publication Type",
      "Text Word",
      "Language",
      "mh",
      "pt",
      "PDat",
      "MeSH Subheading",
      "MeSH:noexp",
      "noexp",
    ];
    const tagPattern = /\[(.*?)\]/g;
    const matches = query.match(tagPattern);

    if (matches) {
      for (const match of matches) {
        const tag = match.slice(1, -1); // Remove brackets
        if (!validTags.some((validTag) => tag.includes(validTag))) {
          console.log(`Query validation failed: Invalid field tag "${tag}"`);
          return false;
        }
      }
    }

    // Check basic query structure
    if (!query.includes("AND") && !query.includes("OR")) {
      console.log("Query validation failed: Missing boolean operators");
      return false;
    }

    // Ensure query doesn't end with operators
    if (/AND\s*$/.test(query) || /OR\s*$/.test(query)) {
      console.log("Query validation failed: Query ends with an operator");
      return false;
    }

    // Print the final query for inspection
    console.log("Validated query:", query);
    return true;
  }

  /**
   * Add pagination parameters to a query
   * @param query Base query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Query with pagination parameters
   */
  public addPagination(
    query: string,
    page: number = 1,
    limit: number = 10
  ): string {
    const retmax = Math.min(Math.max(1, limit), 100); // Limit between 1-100
    const retstart = (Math.max(1, page) - 1) * retmax;

    return `${query}&retmax=${retmax}&retstart=${retstart}`;
  }
}

export default QueryService;
```

### src/types/e-utilities.types.ts

```ts
/**
 * Strong TypeScript definitions for PubMed E-Utilities API
 * Based on https://www.ncbi.nlm.nih.gov/books/NBK25497/
 */

// Common API parameters used across all E-Utilities
export interface BaseEUtilsParams {
  /** Application name (required) */
  tool: string;
  /** Contact email (required) */
  email: string;
  /** API key for higher rate limits */
  api_key?: string;
}

// Common database parameter used in most requests
export interface DbParam {
  /** NCBI database name */
  db: string;
}

// History server parameters
export interface HistoryParams {
  /** Uses NCBI history server - returns WebEnv value */
  usehistory?: "y" | "n";
  /** WebEnv value returned from a previous ESearch, EPost or ELink */
  WebEnv?: string;
  /** Query key returned from a previous ESearch, EPost or ELink */
  query_key?: string;
}

// Response mode and type parameters
export interface FormatParams {
  /** Return mode - JSON or XML */
  retmode?: "json" | "xml" | "text";
  /** Return type - varies by database */
  rettype?: string;
}

// Pagination parameters
export interface PaginationParams {
  /** Maximum number of results to return */
  retmax?: number;
  /** Number of IDs to skip (for pagination) */
  retstart?: number;
}

// ====== EInfo API ======

export interface EInfoParams extends BaseEUtilsParams, Partial<DbParam> {
  /** API version */
  version?: "1.0" | "2.0";
}

// EInfo response types depend on whether db is specified and version
export interface EInfoDatabaseList {
  einforesult: {
    dblist: string[];
  };
}

export interface EInfoDatabaseInfo {
  einforesult: {
    dbinfo: {
      dbname: string;
      menuname: string;
      description: string;
      dbbuild: string;
      count: string;
      lastupdate: string;
      fieldlist: Array<{
        name: string;
        fullname: string;
        description: string;
        termcount: string;
        isdate: string;
        isnumerical: string;
        singletoken: string;
        hierarchy: string;
        ishidden: string;
      }>;
      linklist?: Array<{
        name: string;
        menu: string;
        description: string;
        dbto: string;
      }>;
    };
  };
}

// ====== ESearch API ======

export interface ESearchParams
  extends BaseEUtilsParams,
    DbParam,
    PaginationParams,
    HistoryParams,
    FormatParams {
  /** Search term */
  term: string;
  /** Sort results */
  sort?: string;
  /** Field to restrict search */
  field?: string;
  /** Date range restriction (YYYY/MM/DD format) */
  datetype?: string;
  /** Start date for date range */
  reldate?: number;
  /** Minimum date */
  mindate?: string;
  /** Maximum date */
  maxdate?: string;
}

export interface ESearchResponse {
  header: {
    type: string;
    version: string;
  };
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    translationset: Array<{
      from: string;
      to: string;
    }>;
    translationstack?: Array<
      string | { term: string; field: string; count: string; explode: string }
    >;
    querytranslation: string;
    errorlist?: {
      phrasesnotfound: string[];
      fieldsnotfound: string[];
    };
    warninglist?: {
      phrasesignored: string[];
      quotedphrasesnotfound: string[];
      outputmessage: string[];
    };
  };
}

// ====== ESummary API ======

export interface ESummaryParams
  extends BaseEUtilsParams,
    DbParam,
    HistoryParams,
    FormatParams {
  /** Comma-separated list of UIDs */
  id?: string;
  /** Date to sort results by */
  sort?: string;
}

// ESummary has different response structures based on the database
// This is a generic type, specific databases would extend this
export interface ESummaryResponse {
  header?: {
    type: string;
    version: string;
  };
  result: {
    [uid: string]: {
      uid: string;
      [key: string]: any;
    };
  } & {
    uids: string[];
  };
}

// PubMed specific ESummary response
export interface PubmedESummaryResponse extends ESummaryResponse {
  result: {
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate?: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      lastauthor: string;
      title: string;
      sortfirstauthor: string;
      volume?: string;
      issue?: string;
      pages?: string;
      lang: string[];
      nlmuniqueid: string;
      issn?: string;
      essn?: string;
      pubtype: string[];
      recordstatus: string;
      pubstatus: string;
      articleids: Array<{
        idtype: string;
        idtypen: number;
        value: string;
      }>;
      fulljournalname: string;
      sortpubdate: string;
      sortdate: string;
    };
  } & {
    uids: string[];
  };
}

// ====== EFetch API ======

export interface EFetchParams
  extends BaseEUtilsParams,
    DbParam,
    HistoryParams,
    FormatParams {
  /** Comma-separated list of UIDs */
  id?: string;
  /** Number of items to retrieve */
  retmax?: number;
  /** Offset of first item to retrieve */
  retstart?: number;
  /** Sequence range to retrieve */
  seq_start?: number;
  /** End of sequence range */
  seq_stop?: number;
  /** Mode for strand selector */
  strand?: number;
  /** Enable complexity filtering */
  complexity?: number;
}

// EFetch response types depend on the database and retmode/rettype
// Raw XML or text is often returned

// ====== EPost API ======

export interface EPostParams extends BaseEUtilsParams, DbParam {
  /** Comma-separated list of UIDs */
  id: string;
}

export interface EPostResponse {
  header?: {
    type: string;
    version: string;
  };
  epostresult: {
    querykey: string;
    webenv: string;
  };
}

// ====== ELink API ======

export interface ELinkParams
  extends BaseEUtilsParams,
    HistoryParams,
    FormatParams {
  /** Database to link from */
  dbfrom: string;
  /** Database to link to */
  db?: string;
  /** Comma-separated list of UIDs */
  id?: string;
  /** Link name - use to limit results to a specific link type */
  linkname?: string;
  /** Link command - cmd=neighbor, cmd=acheck, etc. */
  cmd?:
    | "neighbor"
    | "neighbor_score"
    | "neighbor_history"
    | "acheck"
    | "ncheck"
    | "llinks"
    | "lcheck"
    | "prlinks";
  /** Date range to limit results */
  term?: string;
  /** Hold UIDs in history server */
  holding?: string;
  /** Date/time range */
  datetype?: string;
  /** Relative date range */
  reldate?: number;
  /** Minimum date */
  mindate?: string;
  /** Maximum date */
  maxdate?: string;
}

// ELink response types depend on the cmd parameter
export interface ELinkNeighborResponse {
  header?: {
    type: string;
    version: string;
  };
  linksets?: Array<{
    dbfrom?: string;
    ids?: string[];
    linksetdbs?: Array<{
      dbto?: string;
      linkname?: string;
      links?: string[];
    }>;
    ERROR?: string;
  }>;
}

// ====== EGQuery API ======

export interface EGQueryParams extends BaseEUtilsParams {
  /** Search term */
  term: string;
}

export interface EGQueryResponse {
  header?: {
    type: string;
    version: string;
  };
  eGQueryResult: {
    resultItem: Array<{
      DbName: string;
      MenuName: string;
      Count: string;
      Status: string;
    }>;
  };
}

// ====== ESpell API ======

export interface ESpellParams extends BaseEUtilsParams {
  /** Database to check spelling */
  db: string;
  /** Search term to check spelling */
  term: string;
}

export interface ESpellResponse {
  header?: {
    type: string;
    version: string;
  };
  eSpellResult: {
    Database: string;
    Query: string;
    CorrectedQuery?: string;
    SpelledQuery?: string;
    ERROR?: string;
  };
}

// ====== ECitMatch API ======

export interface ECitMatchParams extends BaseEUtilsParams {
  /** Database */
  db: string;
  /** Journal abbreviation */
  bdata: string;
  /**
   * Citation string(s)
   * Format: journal|year|volume|first page|author|your_key
   * Multiple citations can be separated by a pipe
   */
  citation: string;
}

export interface ECitMatchResponse {
  // Response is tab-delimited text
  // We'll need to parse it manually
  raw: string;
}
```

### src/types/index.ts

```ts
// Type definitions for the PubMed Search API
import { FILTER_MAP } from "../config/pubmed-config";

/**
 * Metadata about field encoding
 */
export interface EncodingMetadata {
  field_name: string;
  encoding: "base64" | "none";
}

// Utility types for configuration
export type ClinicalCategory = keyof typeof FILTER_MAP;
export type ClinicalScope = keyof (typeof FILTER_MAP)[ClinicalCategory];

// Search result storage types
export interface SavedSearchResult {
  clinical_category: ClinicalCategory;
  clinical_scope: ClinicalScope;
  esearch_query: string;
  article_count: number;
  clinical_specialty: string;
  pmids: string[];
  articles: Article[];
  encoding_metadata?: {
    tables: "base64";
    original_xml: "base64";
    sanitized_html: "base64";
  };
}

// Request type definitions
export interface ArticleRequest {
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

// Response type definitions
export interface ArticleResponse {
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

export interface Article {
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

// PubMed API response types
export interface PubmedSearchResponse {
  header: {
    type: string;
    version: string;
  };
  esearchresult: {
    count: string;
    retmax: string;
    retstart: string;
    idlist: string[];
    translationset: Array<{
      from: string;
      to: string;
    }>;
    querytranslation: string;
  };
}

export interface PubmedSummaryResponse {
  result: {
    [pmid: string]: {
      uid: string;
      pubdate: string;
      epubdate: string;
      source: string;
      authors: Array<{
        name: string;
        authtype: string;
        clusterid: string;
      }>;
      lastauthor: string;
      title: string;
      sortfirstauthor: string;
      volume: string;
      issue: string;
      pages: string;
      lang: string[];
      nlmuniqueid: string;
      issn: string;
      essn: string;
      pubtype: string[];
      recordstatus: string;
      pubstatus: string;
      articleids: Array<{
        idtype: string;
        idtypen: number;
        value: string;
      }>;
      fulljournalname: string;
      sortpubdate: string;
      sortdate: string;
    };
  };
}

// Internal processing types
export interface ProcessedBlueprint {
  specialty: string;
  topics: string[];
  filters: {
    clinical_queries: string[];
    age_group?: string;
    year_range: number;
  };
}

export interface JournalMetrics {
  title: string;
  impact_factor?: number;
  h_index?: number;
  sjr_score?: number;
}

export interface RankedArticleData extends Article {
  scores: {
    relevance: number;
    journal_impact: number;
  };
}

export interface QueryFilters {
  clinical_queries: string[];
  age_group?: string;
  year_range: number;
}

/**
 * Content extraction result from article processing
 */
export interface ContentExtractionResult {
  full_text: string;
  methods?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  figures: string[];
  tables: string[];
  supplementary_material: string[];
  original_xml?: string;
  sanitized_html?: string;
}
```

### src/utils/article-content-extractor.ts

```ts
import { Document as XMLDocument, XMLSerializer } from "@xmldom/xmldom";
import { JSDOM } from "jsdom";
import { Logger } from "./logger";
import { ContentExtractionResult } from "../types";

/**
 * Utility class for extracting structured content from PubMed article XML
 * Uses both @xmldom/xmldom for XML parsing and JSDOM for HTML manipulation
 */
export class ArticleContentExtractor {
  /**
   * Extract structured content from article XML
   * @param xmlDoc XML document containing article data
   * @param pmid PubMed ID for reference
   * @returns Structured content extraction result
   */
  public static extractContent(
    xmlDoc: XMLDocument,
    pmid: string
  ): ContentExtractionResult {
    try {
      // Initialize result object
      const result: ContentExtractionResult = {
        full_text: "",
        methods: "",
        results: "",
        discussion: "",
        conclusion: "",
        figures: [],
        tables: [],
        supplementary_material: [],
      };

      // Store original XML for reference
      const serializer = new XMLSerializer();
      result.original_xml = serializer.serializeToString(xmlDoc);

      // Extract full text by combining sections
      const articleNode = xmlDoc.getElementsByTagName("PubmedArticle").item(0);
      if (!articleNode) {
        Logger.warn(
          "ArticleContentExtractor",
          `No article found for PMID ${pmid}`
        );
        return result;
      }

      // Extract article title
      const titleNode = articleNode
        .getElementsByTagName("ArticleTitle")
        .item(0);
      const title = titleNode?.textContent || "";

      // Extract abstract text
      let abstractText = "";
      const abstractNodes = articleNode.getElementsByTagName("AbstractText");

      Logger.debug(
        "ArticleContentExtractor",
        `Found ${abstractNodes.length} abstract nodes for PMID ${pmid}`
      );

      // Check if we have labeled sections in the abstract
      let hasLabeledSections = false;
      for (let i = 0; i < abstractNodes.length; i++) {
        const node = abstractNodes.item(i);
        if (node && node.hasAttribute("Label")) {
          hasLabeledSections = true;
          break;
        }
      }

      if (hasLabeledSections) {
        Logger.debug(
          "ArticleContentExtractor",
          `Found labeled abstract sections for PMID ${pmid}`
        );
        // Process labeled abstract sections
        for (let i = 0; i < abstractNodes.length; i++) {
          const abstractNode = abstractNodes.item(i);
          if (!abstractNode) continue;

          const label = abstractNode.getAttribute("Label") || "";
          const text = abstractNode.textContent || "";

          Logger.debug(
            "ArticleContentExtractor",
            `Processing abstract section with label: ${label}`
          );

          if (label && text) {
            abstractText += `${label}: ${text}\n\n`;

            // Extract specific sections
            const lowerLabel = label.toLowerCase();
            if (lowerLabel.includes("method")) {
              result.methods += text + "\n";
              Logger.debug(
                "ArticleContentExtractor",
                `Added METHODS section for PMID ${pmid}`
              );
            } else if (lowerLabel.includes("result")) {
              result.results += text + "\n";
              Logger.debug(
                "ArticleContentExtractor",
                `Added RESULTS section for PMID ${pmid}`
              );
            } else if (lowerLabel.includes("discussion")) {
              result.discussion += text + "\n";
              Logger.debug(
                "ArticleContentExtractor",
                `Added DISCUSSION section for PMID ${pmid}`
              );
            } else if (
              lowerLabel.includes("conclusion") ||
              lowerLabel.includes("conclusions")
            ) {
              result.conclusion += text + "\n";
              Logger.debug(
                "ArticleContentExtractor",
                `Added CONCLUSION section for PMID ${pmid}`
              );
            }
          } else {
            abstractText += text + "\n\n";
          }
        }
      } else {
        // Process undivided abstract
        for (let i = 0; i < abstractNodes.length; i++) {
          const abstractNode = abstractNodes.item(i);
          if (!abstractNode) continue;
          abstractText += abstractNode.textContent + "\n";
        }
      }

      // Combine title and abstract for full text
      result.full_text = `${title}\n\n${abstractText}`;

      // Extract figures, tables, and supplementary materials if available
      this.extractFiguresAndTables(xmlDoc, result);

      // Generate sanitized HTML representation for display
      result.sanitized_html = this.generateSanitizedHTML(
        title,
        abstractText,
        result
      );

      return result;
    } catch (error) {
      Logger.error(
        "ArticleContentExtractor",
        `Error extracting content for PMID ${pmid}`,
        error
      );
      return {
        full_text: "",
        figures: [],
        tables: [],
        supplementary_material: [],
      };
    }
  }

  /**
   * Extract figures and tables from article XML
   * @param xmlDoc XML document
   * @param result Content extraction result to update
   */
  private static extractFiguresAndTables(
    xmlDoc: XMLDocument,
    result: ContentExtractionResult
  ): void {
    try {
      // Extract tables
      const tableNodes = xmlDoc.getElementsByTagName("Table");
      for (let i = 0; i < tableNodes.length; i++) {
        const tableNode = tableNodes.item(i);
        if (!tableNode) continue;

        const tableWrap = tableNode.parentNode as unknown as Element;
        const labelNode = tableWrap?.getElementsByTagName?.("Label")?.item(0);
        const captionNode = tableWrap
          ?.getElementsByTagName?.("Caption")
          ?.item(0);

        const label = labelNode?.textContent || "";
        const caption = captionNode?.textContent || "";

        // Extract table content
        let tableContent = "";
        const tableXML = new XMLSerializer().serializeToString(tableNode);

        // Format as string representation
        tableContent = `${label}\n${caption}\n\n${tableXML}`;
        result.tables.push(tableContent);
      }

      // Extract figures
      const figureNodes = xmlDoc.getElementsByTagName("Figure");
      for (let i = 0; i < figureNodes.length; i++) {
        const figureNode = figureNodes.item(i);
        if (!figureNode) continue;

        const labelNode = figureNode.getElementsByTagName("Label").item(0);
        const captionNode = figureNode.getElementsByTagName("Caption").item(0);

        const label = labelNode?.textContent || "";
        const caption = captionNode?.textContent || "";

        // Format as string representation
        const figureText = `${label}\n${caption}`;
        result.figures.push(figureText);
      }

      // Extract supplementary materials
      const suppNodes = xmlDoc.getElementsByTagName("SupplementaryMaterial");
      for (let i = 0; i < suppNodes.length; i++) {
        const suppNode = suppNodes.item(i);
        if (!suppNode) continue;

        const captionNode = suppNode.getElementsByTagName("Caption").item(0);
        const caption = captionNode?.textContent || "";

        // Look for media or links
        const mediaNodes = suppNode.getElementsByTagName("Media");
        const extLinkNodes = suppNode.getElementsByTagName("ExtLink");

        let suppInfo = caption + "\n";

        // Add media info
        if (mediaNodes.length > 0) {
          for (let j = 0; j < mediaNodes.length; j++) {
            const mediaNode = mediaNodes.item(j);
            if (!mediaNode) continue;

            const mimeType = mediaNode.getAttribute("mime-subtype") || "";
            const fileName = mediaNode.getAttribute("xlink:href") || "";
            suppInfo += `[${mimeType}] ${fileName}\n`;
          }
        }

        // Add external links
        if (extLinkNodes.length > 0) {
          for (let j = 0; j < extLinkNodes.length; j++) {
            const linkNode = extLinkNodes.item(j);
            if (!linkNode) continue;

            const url = linkNode.getAttribute("xlink:href") || "";
            const text = linkNode.textContent || "";
            suppInfo += `[${text}] ${url}\n`;
          }
        }

        result.supplementary_material.push(suppInfo.trim());
      }
    } catch (error) {
      Logger.error(
        "ArticleContentExtractor",
        "Error extracting figures and tables",
        error
      );
    }
  }

  /**
   * Generate sanitized HTML representation of the article
   * @param title Article title
   * @param abstractText Abstract text
   * @param result Content extraction result
   * @returns Sanitized HTML string
   */
  private static generateSanitizedHTML(
    title: string,
    abstractText: string,
    result: ContentExtractionResult
  ): string {
    try {
      // Create a new JSDOM instance
      const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
      const { document } = dom.window;

      // Create article container
      const container = document.createElement("div");
      container.className = "pubmed-article";

      // Add title
      const titleElem = document.createElement("h1");
      titleElem.textContent = title;
      container.appendChild(titleElem);

      // Add abstract
      const abstractHeader = document.createElement("h2");
      abstractHeader.textContent = "Abstract";
      container.appendChild(abstractHeader);

      const abstractElem = document.createElement("div");
      abstractElem.className = "abstract";

      // Split abstract by newlines and create paragraphs
      const paragraphs = abstractText.split("\n\n");
      paragraphs.forEach((para) => {
        if (!para.trim()) return;
        const p = document.createElement("p");
        p.textContent = para;
        abstractElem.appendChild(p);
      });

      container.appendChild(abstractElem);

      // Add sections if available
      const sections = [
        { title: "Methods", content: result.methods },
        { title: "Results", content: result.results },
        { title: "Discussion", content: result.discussion },
        { title: "Conclusion", content: result.conclusion },
      ];

      sections.forEach((section) => {
        if (!section.content) return;

        const sectionHeader = document.createElement("h2");
        sectionHeader.textContent = section.title;
        container.appendChild(sectionHeader);

        const sectionElem = document.createElement("div");
        sectionElem.className = section.title.toLowerCase();

        const p = document.createElement("p");
        p.textContent = section.content;
        sectionElem.appendChild(p);

        container.appendChild(sectionElem);
      });

      // Add tables if available
      if (result.tables.length > 0) {
        const tablesHeader = document.createElement("h2");
        tablesHeader.textContent = "Tables";
        container.appendChild(tablesHeader);

        const tablesList = document.createElement("ul");
        tablesList.className = "tables-list";

        result.tables.forEach((table, index) => {
          const item = document.createElement("li");
          item.textContent = `Table ${index + 1}`;
          tablesList.appendChild(item);
        });

        container.appendChild(tablesList);
      }

      // Add figures if available
      if (result.figures.length > 0) {
        const figuresHeader = document.createElement("h2");
        figuresHeader.textContent = "Figures";
        container.appendChild(figuresHeader);

        const figuresList = document.createElement("ul");
        figuresList.className = "figures-list";

        result.figures.forEach((figure, index) => {
          const item = document.createElement("li");
          item.textContent = `Figure ${index + 1}: ${figure.split("\n")[0]}`;
          figuresList.appendChild(item);
        });

        container.appendChild(figuresList);
      }

      document.body.appendChild(container);

      return dom.serialize();
    } catch (error) {
      Logger.error(
        "ArticleContentExtractor",
        "Error generating sanitized HTML",
        error
      );
      return `<html><body><h1>${title}</h1><p>${abstractText}</p></body></html>`;
    }
  }
}

export default ArticleContentExtractor;
```

### src/utils/content-processor.ts

```ts
/**
 * Utility for processing XML and HTML content for safe storage
 */
export class ContentProcessor {
  /**
   * Encode XML or HTML content to Base64 for safe storage
   * @param content Raw XML or HTML content
   * @returns Base64 encoded string or undefined if input is undefined
   */
  public static encodeContent(content: string | undefined): string | undefined {
    if (!content) return undefined;
    return Buffer.from(content).toString("base64");
  }

  /**
   * Decode Base64-encoded XML or HTML content
   * @param encodedContent Base64 encoded string
   * @returns Original XML or HTML content or undefined if input is undefined
   */
  public static decodeContent(
    encodedContent: string | undefined
  ): string | undefined {
    if (!encodedContent) return undefined;
    return Buffer.from(encodedContent, "base64").toString();
  }

  /**
   * Process an array of content items, encoding each non-empty item
   * @param items Array of content items
   * @returns Array of encoded content items
   */
  public static encodeArray(items: string[] | undefined): string[] | undefined {
    if (!items) return undefined;
    return items
      .map((item) => (item ? this.encodeContent(item) : undefined))
      .filter(Boolean) as string[];
  }
}
```

### src/utils/file-reader.ts

```ts
import fs from "fs";
import path from "path";
import { JournalMetrics } from "../types";

/**
 * Utility class for reading JSON data files
 */
class FileReader {
  /**
   * Read and parse a JSON file
   * @param filePath Path to the JSON file
   * @returns Parsed JSON data
   */
  static readJsonFile<T>(filePath: string): T {
    try {
      const absolutePath = path.resolve(filePath);
      const fileContent = fs.readFileSync(absolutePath, "utf8");
      return JSON.parse(fileContent) as T;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * Get specialty data from the specialties.json file
   * @returns Specialty data
   */
  static getSpecialties(): Record<
    string,
    {
      common_topics: string[];
      mesh_terms: string[];
      default_filters: string[];
    }
  > {
    return this.readJsonFile<
      Record<
        string,
        {
          common_topics: string[];
          mesh_terms: string[];
          default_filters: string[];
        }
      >
    >("data/specialties.json");
  }

  /**
   * Get journal metrics data from the journal-metrics.json file
   * @returns Journal metrics data
   */
  static getJournalMetrics(): Record<string, JournalMetrics> {
    return this.readJsonFile<Record<string, JournalMetrics>>(
      "data/journal-metrics.json"
    );
  }
}

export default FileReader;
```

### src/utils/logger.ts

```ts
import chalk from "chalk";
/**
 * Available log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Global logger utility for colorful console logging
 */
export class Logger {
  /**
   * Current log level (configurable)
   */
  private static currentLevel: LogLevel =
    process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG;

  /**
   * Set the current log level
   * @param level The log level to set
   */
  static setLogLevel(level: LogLevel): void {
    Logger.currentLevel = level;
  }

  /**
   * Log a debug message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static debug(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.DEBUG) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.blue.bold(
          "[DEBUG]"
        )} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }

  /**
   * Log an info message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static info(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.green.bold(
          "[INFO]"
        )} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }

  /**
   * Log a warning message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static warn(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.WARN) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.yellow.bold(
          "[WARN]"
        )} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }

  /**
   * Log an error message
   * @param context The context or component name
   * @param message The message to log
   * @param error Optional error to include
   */
  static error(context: string, message: string, error?: any): void {
    if (Logger.currentLevel <= LogLevel.ERROR) {
      console.error(
        `${chalk.gray(new Date().toISOString())} ${chalk.red.bold(
          "[ERROR]"
        )} ${chalk.cyan(`[${context}]`)} ${message}`,
        error ? `\n${chalk.red(error.stack || JSON.stringify(error))}` : ""
      );
    }
  }

  /**
   * Log a success message
   * @param context The context or component name
   * @param message The message to log
   * @param data Optional data to include
   */
  static success(context: string, message: string, data?: any): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.greenBright.bold(
          "[SUCCESS]"
        )} ${chalk.cyan(`[${context}]`)} ${message}`,
        data ? `\n${chalk.gray(JSON.stringify(data, null, 2))}` : ""
      );
    }
  }

  /**
   * Log HTTP requests
   * @param method HTTP method
   * @param url Request URL
   * @param statusCode HTTP status code
   * @param duration Request duration in ms
   */
  static http(
    method: string,
    url: string,
    statusCode?: number,
    duration?: number
  ): void {
    if (Logger.currentLevel <= LogLevel.INFO) {
      let message = `${method} ${url}`;

      if (statusCode) {
        const coloredStatus =
          statusCode >= 500
            ? chalk.red(statusCode)
            : statusCode >= 400
            ? chalk.yellow(statusCode)
            : statusCode >= 300
            ? chalk.cyan(statusCode)
            : chalk.green(statusCode);

        message += ` ${coloredStatus}`;
      }

      if (duration !== undefined) {
        const coloredDuration =
          duration > 1000
            ? chalk.red(`${duration}ms`)
            : duration > 500
            ? chalk.yellow(`${duration}ms`)
            : chalk.green(`${duration}ms`);

        message += ` ${coloredDuration}`;
      }

      console.log(
        `${chalk.gray(new Date().toISOString())} ${chalk.magenta.bold(
          "[HTTP]"
        )} ${message}`
      );
    }
  }
}
```

### src/utils/mesh-mapper.ts

```ts
/**
 * Utility class for mapping terms to MeSH (Medical Subject Headings) terms
 */
class MeshMapper {
  // A simple mapping cache to avoid redundant lookups
  private static term_mapping_cache: Record<string, string[]> = {};

  /**
   * Map a term to MeSH terms
   * @param term The term to map
   * @returns Array of MeSH terms
   */
  static mapTerm(term: string): string[] {
    // Check if we already have a cached mapping
    if (this.term_mapping_cache[term.toLowerCase()]) {
      return this.term_mapping_cache[term.toLowerCase()];
    }

    // In a production environment, this would call the PubMed API
    // to get the proper MeSH term mappings. For now, we'll use a simplified approach.
    const mapped_terms = this.simpleMeshMapping(term);

    // Cache the result
    this.term_mapping_cache[term.toLowerCase()] = mapped_terms;

    return mapped_terms;
  }

  /**
   * Simplified MeSH term mapping (without API calls)
   * @param term The term to map
   * @returns Array of mapped MeSH terms
   */
  private static simpleMeshMapping(term: string): string[] {
    // This is a simplified mapping - in production, this would use PubMed's
    // term mapping API or a more comprehensive database
    const normalized_term = term.toLowerCase();

    // Some common mappings for demonstration
    const mappings: Record<string, string[]> = {
      "heart failure": ["Heart Failure", "Cardiac Failure"],
      hypertension: ["Hypertension", "High Blood Pressure"],
      diabetes: ["Diabetes Mellitus"],
      cancer: ["Neoplasms", "Tumors"],
      stroke: ["Stroke", "Cerebrovascular Accident"],
      asthma: ["Asthma", "Bronchial Asthma"],
      alzheimer: ["Alzheimer Disease", "Dementia"],
      parkinson: ["Parkinson Disease"],
      depression: ["Depression", "Depressive Disorder"],
      arthritis: ["Arthritis", "Joint Diseases"],
      copd: ["Pulmonary Disease, Chronic Obstructive", "COPD"],
      "kidney disease": ["Kidney Diseases", "Renal Insufficiency"],
      "liver disease": ["Liver Diseases", "Hepatic Diseases"],
      obesity: ["Obesity", "Overweight"],
      pneumonia: ["Pneumonia", "Lung Inflammation"],
      hiv: ["HIV", "AIDS", "HIV Infections"],
      tuberculosis: ["Tuberculosis", "TB"],
      malaria: ["Malaria"],
      covid: ["COVID-19", "SARS-CoV-2", "Coronavirus"],
    };

    // Check if we have an exact match
    for (const key in mappings) {
      if (normalized_term.includes(key)) {
        return mappings[key];
      }
    }

    // If no match, return the original term formatted for PubMed search
    return [`"${term}"[All Fields]`];
  }

  /**
   * Validate if a term is a valid MeSH term
   * @param term The term to validate
   * @returns True if the term is a valid MeSH term
   */
  static validateMeshTerm(term: string): boolean {
    // This is a simplified validation - in production, this would
    // validate against the actual MeSH database
    const mapped_terms = this.mapTerm(term);
    return (
      mapped_terms.length > 0 && mapped_terms[0] !== `"${term}"[All Fields]`
    );
  }

  /**
   * Get the preferred MeSH term from a list of alternatives
   * @param alternatives Array of alternative terms
   * @returns The preferred MeSH term
   */
  static getPreferredTerm(alternatives: string[]): string {
    if (alternatives.length === 0) {
      return "";
    }

    // In a real implementation, this would have logic to determine the most
    // specific or relevant MeSH term from the alternatives.
    // For simplicity, we'll just return the first term that ends with [MeSH Terms]
    // or the first term if none match
    const mesh_term = alternatives.find((term) =>
      term.endsWith("[MeSH Terms]")
    );
    return mesh_term || alternatives[0];
  }
}

export default MeshMapper;
```

### src/utils/rate-limiter.ts

```ts
/**
 * Utility class for rate limiting API requests
 */
class RateLimiter {
  private interval: number;
  private max_tokens: number;
  private tokens: number;
  private last_refill: number;
  private waiting_queue: Array<{ resolve: () => void }>;

  /**
   * Create a new rate limiter
   * @param tokens_per_interval Maximum number of tokens per interval
   * @param interval Interval in milliseconds
   */
  constructor(tokens_per_interval: number, interval: number) {
    this.interval = interval;
    this.max_tokens = tokens_per_interval;
    this.tokens = tokens_per_interval;
    this.last_refill = Date.now();
    this.waiting_queue = [];
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
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
  public checkLimit(): boolean {
    this.refillTokens();
    return this.tokens > 0;
  }

  /**
   * Wait for a token to become available
   * @returns Promise that resolves when a token is available
   */
  public async waitForSlot(): Promise<void> {
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waiting_queue.push({ resolve });
    });
  }

  /**
   * Reset the rate limiter
   */
  public resetCounter(): void {
    this.tokens = this.max_tokens;
    this.last_refill = Date.now();
  }
}

export default RateLimiter;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
