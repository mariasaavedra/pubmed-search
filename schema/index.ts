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
  full_text: string; // Full text of the article
  figures: string[]; // Array of figure URLs
  tables: string[]; // Array of table URLs
  supplementary_material: string[]; // Array of supplementary material URLs
  data_sets: string[]; // Array of data set URLs
  methods: string; // Methods used in the article
  results: string; // Results of the article
  discussion: string; // Discussion of the article
  conclusion: string; // Conclusion of the article
};
