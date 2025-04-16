# Core Clinical Journals Filter

## Overview

All PubMed searches in this application are automatically filtered to the Core Clinical Journals subset (`jsubsetaim[text]`), which includes approximately 120 high-quality clinical journals selected by the National Library of Medicine for their clinical relevance.

## Benefits

- **Quality Assurance**: All search results come from respected, clinically-relevant sources
- **Clinical Focus**: Articles have immediate application to clinical practice
- **Reduced Noise**: Eliminates less relevant or lower-quality publications
- **Trusted Sources**: Includes leading journals from major medical specialties

## Implementation Details

The Core Clinical Journals filter is automatically added to all search queries constructed by the QueryService:

```typescript
// Always add the Core Clinical Journals filter
const journalFilter = "jsubsetaim[text]";

// Combine all parts with proper parentheses
const query = `(${searchTerm}) AND (${clinicalQueryFilter}) AND (${dateFilter}) AND (${journalFilter})`;
```

## About Core Clinical Journals

The Core Clinical Journals, also known as the Abridged Index Medicus (AIM), represent a subset of MEDLINE journals that are considered to be of immediate interest to the practicing physician. This collection was first published in print as the Abridged Index Medicus in 1970, containing bibliographic information from about 120 core clinical English language journals.

### Selection Criteria

Journals in this collection are selected based on:

1. Quality of editorial work
2. Clinical relevance
3. Production quality
4. Impact factor
5. Timeliness of content 
6. Geographic coverage

### Example Core Clinical Journals

Some of the notable journals in this collection include:

- New England Journal of Medicine
- JAMA (Journal of the American Medical Association)
- The Lancet
- BMJ (British Medical Journal)
- Annals of Internal Medicine
- Circulation
- Pediatrics
- Journal of Clinical Oncology
- American Journal of Psychiatry
- Blood

## Impact on Search Results

Using this filter:

- **Reduces Quantity**: You may see fewer total results compared to unfiltered searches
- **Increases Quality**: Results are more likely to be clinically relevant and from high-impact sources
- **Focuses Content**: Articles typically represent important clinical findings and current best practices

## Further Information

For a complete list of Core Clinical Journals and more information about the Abridged Index Medicus, visit the official NLM page: [https://www.nlm.nih.gov/bsd/aim.html](https://www.nlm.nih.gov/bsd/aim.html)
