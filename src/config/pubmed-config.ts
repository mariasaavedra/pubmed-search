import {
  CLINICALLY_USEFUL_JOURNALS,
  CARDIOLOGY_JOURNALS,
  INTERNAL_MEDICINE_JOURNALS,
  createJournalFilter,
} from "../data/journals";

export const PUBMED_CONFIG = {
  // PubMed API
  // https://www.ncbi.nlm.nih.gov/books/NBK25501/
  base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
  esearch: "/esearch.fcgi",
  efetch: "/efetch.fcgi",
  esummary: "/esummary.fcgi",

  page_limit: 1,
  page_size: 20,
  rate_limit: {
    // With API key: Up to 10 requests/second
    // Without API key: Limited to 3 requests/second
    with_api_key: {
      requests_per_second: 10,
      max_concurrent: 5,
    },
    without_api_key: {
      requests_per_second: 3,
      max_concurrent: 3,
    },
    // Time between requests in milliseconds (1000ms / requests_per_second)
    min_time_with_key: 100, // 10 requests per second
    min_time_without_key: 334, // ~3 requests per second
  },
  journal_quality: {
    impact_factor_threshold: 5,
    h_index_threshold: 100,
    sjr: 5,
  },
} as const;

/**
 * Clinically Useful Journals (CUJ) filter - Updated 2023
 *
 * This filter restricts search results to 241 journals identified as having high clinical utility
 * based on a data-driven approach documented in the Journal of the Medical Library Association.
 *
 * Reference: Klein-Fedyshin M, Ketchum AM. PubMed's core clinical journals filter: redesigned
 * for contemporary clinical impact and utility. J Med Libr Assoc. 2023;111(3):665-676.
 *
 * The full list of journals is available in data/clinically-useful-journals.json
 */
export const CORE_CLINICAL_JOURNALS_FILTER = createJournalFilter(
  CLINICALLY_USEFUL_JOURNALS
);

/**
 * Cardiology Journals filter
 *
 * This filter restricts search results to high-impact cardiology-specific journals
 * to improve the relevance of cardiovascular medicine searches.
 *
 * The full list of journals is available in data/cardiology-journals.json
 */
export const CARDIOLOGY_JOURNALS_FILTER =
  createJournalFilter(CARDIOLOGY_JOURNALS);
/**
 * Internal Medicine Journals filter
 *
 * This filter restricts search results to high-impact internal medicine-specific journals
 * to improve the relevance of internal medicine searches.
 *
 * The full list of journals is available in data/internal-medicine-journals.json
 */
export const INTERNAL_MEDICINE_JOURNALS_FILTER = createJournalFilter(
  INTERNAL_MEDICINE_JOURNALS
);

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
) AND (English[Language] AND humans[mh] AND free full text[Filter] AND hasabstract) `,

  broad: `((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading]) AND English[Language]`,
} as const;
