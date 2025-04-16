Create a comprehensive PubMed search configuration for clinical specialties following this schema:

{
  "specialty_name": {
    "common_topics": [
      "topic 1",
      "topic 2",
      "topic 3",
      ...
    ],
    "mesh_terms": [
      "MeSH Term 1",
      "MeSH Term 2",
      "MeSH Term 3",
      ...
    ],
    "default_filters": [
      "Therapy",
      "Diagnosis",
      "Prognosis",
      ...
    ]
  },
  "another_specialty": {
    "common_topics": [
      ...
    ],
    "mesh_terms": [
      ...
    ],
    "default_filters": [
      ...
    ]
  }
}

For each specialty, include:
1. 100 common topics that are highly relevant to clinical practice
2. 5-10 key MeSH terms that cover the broader categories within the specialty
3. 2-3 default filters most appropriate for the specialty (from: Therapy, Diagnosis, Prognosis, Etiology, Clinical Prediction Guides)

Ensure coverage includes:
- High-prevalence and high-impact conditions within the specialty
- Key diagnostic approaches and therapeutic interventions
- Recent advances and practice-changing developments from the past 2-3 years
- Areas with established clinical practice guidelines

Prioritize terms that will retrieve high-quality clinical evidence and provide clinically actionable knowledge for practicing physicians.