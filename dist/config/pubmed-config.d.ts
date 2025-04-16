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
export declare const CORE_CLINICAL_JOURNALS_FILTER: string;
/**
 * Cardiology Journals filter
 *
 * This filter restricts search results to high-impact cardiology-specific journals
 * to improve the relevance of cardiovascular medicine searches.
 *
 * The full list of journals is available in data/cardiology-journals.json
 */
export declare const CARDIOLOGY_JOURNALS_FILTER: string;
export declare const AGE_MAP: {
    readonly "Newborn: Birth-1 month": "infant, newborn[mh]";
    readonly "Infant: Birth-23 months": "infant[mh]";
    readonly "Preschool Child: 2-5 years": "child, preschool[mh]";
    readonly "Child: 6-12 years": "child[mh:noexp]";
    readonly "Adolescent: 13-18 years": "adolescent[mh]";
    readonly "Young Adult: 19-24 years": "\"young adult[mh]\"";
    readonly "Adult: 19+ years": "adult[mh]";
    readonly "Adult: 19-44 years": "adult[mh:noexp]";
    readonly "Middle Aged: 45-64 years": "middle aged[mh]";
    readonly "Middle Aged + Aged: 45+ years": "(middle aged[mh] OR aged[mh])";
    readonly "Aged: 65+ years": "aged[mh]";
    readonly "80 and over: 80+ years": "\"aged, 80 and over[mh]\"";
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
    readonly narrow: "(\n  Clinical Trial[pt] OR Controlled Clinical Trial[pt] OR Meta-Analysis[pt]\n  OR Multicenter Study[pt] OR Observational Study[pt] OR Practice Guideline[pt]\n  OR Randomized Controlled Trial[pt] OR Review[pt] OR Systematic Review[pt]\n) AND English[Language] AND humans[mh] AND free full text[Filter] ";
    readonly broad: "((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading]) AND English[Language]";
};
