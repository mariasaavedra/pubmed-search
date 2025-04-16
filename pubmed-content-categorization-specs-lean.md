# PubMed Content Categorization - Technical Specifications (Lean Approach)

## Overview

This document outlines the technical specifications for implementing a backend-focused content categorization system for the PubMed Clinical Article Retriever. The system will enhance article organization and filtering capabilities through MeSH qualifier-based categorization, specialty-specific filters, and article type classification, focusing primarily on the data model and backend services.

## 1. MeSH Qualifier-Based Categorization System

### 1.1 Data Model Enhancements

#### 1.1.1 Article Type Extensions

Extend the `Article` interface in `src/types/index.ts`:

```typescript
export interface Article {
  // existing fields...
  
  // New fields for categorization
  article_type?: string;                  // e.g., "Review", "Clinical Trial", "Guideline", "Case Report"
  publication_type?: string[];            // PubMed publication types array
  mesh_qualifiers?: MeshQualifier[];      // Array of MeSH qualifiers with their descriptors
  primary_category?: string;              // Primary category derived from MeSH terms
  secondary_categories?: string[];        // Secondary categories
  specialty_tags?: string[];              // Derived specialty tags
}

export interface MeshQualifier {
  descriptor: string;                     // Main MeSH heading/descriptor
  qualifiers: string[];                   // Qualifier terms like "therapy", "diagnosis", etc.
  major_topic: boolean;                   // Whether this is marked as a major topic
}
```

#### 1.1.2 Category Mapping Types

Create new types for category mapping in `src/types/index.ts`:

```typescript
export interface CategoryMapping {
  id: string;                             // Category identifier
  name: string;                           // Display name
  description: string;                    // Short description of the category
  color: string;                          // Hex color code for later UI integration
  mesh_descriptors: string[];             // MeSH descriptors that map to this category
  mesh_qualifiers?: string[];             // MeSH qualifiers that map to this category
  publication_types?: string[];           // Publication types that map to this category
  priority: number;                       // Sorting priority (lower numbers appear first)
}

export interface ArticleTypeDefinition {
  id: string;                             // Type identifier
  name: string;                           // Display name
  description: string;                    // Short description
  color: string;                          // Hex color code for later UI integration
  pubmed_types: string[];                 // PubMed publication types that match this definition
  priority: number;                       // Sorting priority
}
```

### 1.2 MeSH Qualifier Extraction Service

#### 1.2.1 Enhanced XML Parsing

Extend the `extractArticleFromXML` method in `PubmedService` to extract and parse MeSH qualifiers:

```typescript
private extractMeshQualifiers(meshNode: Node): MeshQualifier {
  const descriptorNode = meshNode.getElementsByTagName('DescriptorName').item(0);
  const descriptor = descriptorNode?.textContent || '';
  const majorTopic = descriptorNode?.getAttribute('MajorTopicYN') === 'Y';
  
  const qualifiers: string[] = [];
  const qualifierNodes = meshNode.getElementsByTagName('QualifierName');
  
  for (let i = 0; i < qualifierNodes.length; i++) {
    const qualifierNode = qualifierNodes.item(i);
    if (qualifierNode?.textContent) {
      qualifiers.push(qualifierNode.textContent);
    }
  }
  
  return {
    descriptor,
    qualifiers,
    major_topic: majorTopic
  };
}
```

### 1.3 Category Mapper Service

Create a new service `src/services/category-mapper.service.ts` to map MeSH terms and qualifiers to categories:

```typescript
import { Article, CategoryMapping, MeshQualifier, ArticleTypeDefinition } from '../types';
import { CATEGORY_MAPPINGS, ARTICLE_TYPE_DEFINITIONS } from '../config/category-config';
import { Logger } from '../utils/logger';

export class CategoryMapperService {
  /**
   * Map an article to categories based on its MeSH terms and qualifiers
   */
  public mapArticleToCategories(article: Article): Article {
    if (!article.mesh_qualifiers || article.mesh_qualifiers.length === 0) {
      return article;
    }
    
    try {
      // Map article type first
      const articleType = this.determineArticleType(article);
      
      // Map categories based on MeSH terms
      const categories = this.mapMeshTermsToCategories(article.mesh_qualifiers);
      
      // Map specialties based on MeSH terms
      const specialtyTags = this.mapToSpecialtyTags(article.mesh_qualifiers);
      
      // Return the enhanced article
      return {
        ...article,
        article_type: articleType?.name,
        primary_category: categories.length > 0 ? categories[0] : undefined,
        secondary_categories: categories.length > 1 ? categories.slice(1) : [],
        specialty_tags: specialtyTags
      };
    } catch (error) {
      Logger.error('CategoryMapperService', 'Error mapping article to categories', error);
      return article;
    }
  }
  
  /**
   * Determine article type from publication types
   */
  private determineArticleType(article: Article): ArticleTypeDefinition | undefined {
    if (!article.publication_type || article.publication_type.length === 0) {
      return undefined;
    }
    
    // Find matching article type definitions, sorted by priority
    const matchingTypes = ARTICLE_TYPE_DEFINITIONS
      .filter(typeDef => 
        typeDef.pubmed_types.some(pubType => 
          article.publication_type!.includes(pubType)
        )
      )
      .sort((a, b) => a.priority - b.priority);
    
    return matchingTypes.length > 0 ? matchingTypes[0] : undefined;
  }
  
  /**
   * Map MeSH qualifiers to categories
   */
  private mapMeshTermsToCategories(meshQualifiers: MeshQualifier[]): string[] {
    // First, map based on major topics and their qualifiers (highest priority)
    const majorTopicMatches = this.getMajorTopicCategoryMatches(meshQualifiers);
    if (majorTopicMatches.length > 0) {
      return majorTopicMatches;
    }
    
    // Then, map based on any MeSH descriptor matches
    const descriptorMatches = this.getDescriptorCategoryMatches(meshQualifiers);
    if (descriptorMatches.length > 0) {
      return descriptorMatches;
    }
    
    // Fallback: map based on qualifiers only
    return this.getQualifierCategoryMatches(meshQualifiers);
  }
  
  /**
   * Get category matches based on major topics
   */
  private getMajorTopicCategoryMatches(meshQualifiers: MeshQualifier[]): string[] {
    const matches: string[] = [];
    
    // Find major topics
    const majorTopics = meshQualifiers.filter(mq => mq.major_topic);
    
    for (const topic of majorTopics) {
      // Check for descriptor matches
      const descriptorMatches = CATEGORY_MAPPINGS.filter(mapping => 
        mapping.mesh_descriptors.some(descriptor => 
          descriptor.toLowerCase() === topic.descriptor.toLowerCase()
        )
      );
      
      // Check for qualifier matches
      const qualifierMatches = CATEGORY_MAPPINGS.filter(mapping => 
        mapping.mesh_qualifiers && topic.qualifiers.some(qualifier => 
          mapping.mesh_qualifiers!.some(mq => 
            mq.toLowerCase() === qualifier.toLowerCase()
          )
        )
      );
      
      // Combine and sort by priority
      const allMatches = [...descriptorMatches, ...qualifierMatches]
        .sort((a, b) => a.priority - b.priority);
        
      if (allMatches.length > 0) {
        matches.push(allMatches[0].name);
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }
  
  /**
   * Get category matches based on any descriptor
   */
  private getDescriptorCategoryMatches(meshQualifiers: MeshQualifier[]): string[] {
    const matches: string[] = [];
    
    for (const qualifier of meshQualifiers) {
      const descriptorMatches = CATEGORY_MAPPINGS.filter(mapping => 
        mapping.mesh_descriptors.some(descriptor => 
          descriptor.toLowerCase() === qualifier.descriptor.toLowerCase()
        )
      ).sort((a, b) => a.priority - b.priority);
      
      if (descriptorMatches.length > 0) {
        matches.push(descriptorMatches[0].name);
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }
  
  /**
   * Get category matches based on qualifiers only
   */
  private getQualifierCategoryMatches(meshQualifiers: MeshQualifier[]): string[] {
    const matches: string[] = [];
    
    for (const qualifier of meshQualifiers) {
      if (qualifier.qualifiers.length === 0) continue;
      
      const qualifierMatches = CATEGORY_MAPPINGS.filter(mapping => 
        mapping.mesh_qualifiers && qualifier.qualifiers.some(q => 
          mapping.mesh_qualifiers!.some(mq => 
            mq.toLowerCase() === q.toLowerCase()
          )
        )
      ).sort((a, b) => a.priority - b.priority);
      
      if (qualifierMatches.length > 0) {
        matches.push(qualifierMatches[0].name);
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }
  
  /**
   * Map MeSH terms to specialty tags
   */
  private mapToSpecialtyTags(meshQualifiers: MeshQualifier[]): string[] {
    const specialtyTags: string[] = [];
    const allDescriptors = meshQualifiers.map(mq => mq.descriptor);
    
    // Iterate through the specialty mapping
    for (const [specialty, meshTerms] of Object.entries(SPECIALTY_MESH_MAPPINGS)) {
      const hasMatch = meshTerms.some(term => 
        allDescriptors.some(descriptor => 
          descriptor.toLowerCase().includes(term.toLowerCase())
        )
      );
      
      if (hasMatch) {
        specialtyTags.push(specialty);
      }
    }
    
    return specialtyTags;
  }
}
```

### 1.4 Configuration

Create a new configuration file `src/config/category-config.ts` for category mappings:

```typescript
import { CategoryMapping, ArticleTypeDefinition } from '../types';

export const ARTICLE_TYPE_DEFINITIONS: ArticleTypeDefinition[] = [
  {
    id: 'guideline',
    name: 'Clinical Guideline',
    description: 'Official clinical practice guidelines',
    color: '#4CAF50', // Green
    pubmed_types: [
      'Guideline', 
      'Practice Guideline',
      'Consensus Development Conference',
      'Consensus Development Conference, NIH'
    ],
    priority: 1
  },
  {
    id: 'systematic_review',
    name: 'Systematic Review',
    description: 'Systematic review or meta-analysis',
    color: '#2196F3', // Blue
    pubmed_types: [
      'Meta-Analysis',
      'Systematic Review'
    ],
    priority: 2
  },
  {
    id: 'randomized_trial',
    name: 'Randomized Trial',
    description: 'Randomized controlled trial',
    color: '#9C27B0', // Purple
    pubmed_types: [
      'Randomized Controlled Trial'
    ],
    priority: 3
  },
  {
    id: 'clinical_trial',
    name: 'Clinical Trial',
    description: 'Clinical trial (non-randomized)',
    color: '#673AB7', // Deep Purple
    pubmed_types: [
      'Clinical Trial',
      'Clinical Trial, Phase I',
      'Clinical Trial, Phase II',
      'Clinical Trial, Phase III',
      'Clinical Trial, Phase IV'
    ],
    priority: 4
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Literature review or narrative review',
    color: '#FF9800', // Orange
    pubmed_types: [
      'Review'
    ],
    priority: 5
  },
  {
    id: 'case_report',
    name: 'Case Report',
    description: 'Case report or case series',
    color: '#795548', // Brown
    pubmed_types: [
      'Case Reports'
    ],
    priority: 6
  }
];

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    id: 'therapy',
    name: 'Therapy',
    description: 'Therapeutic interventions and treatments',
    color: '#E91E63', // Pink
    mesh_descriptors: [
      'Therapeutics',
      'Treatment Outcome',
      'Drug Therapy'
    ],
    mesh_qualifiers: [
      'therapy',
      'therapeutic use',
      'drug therapy'
    ],
    priority: 1
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    description: 'Diagnostic techniques and procedures',
    color: '#9C27B0', // Purple
    mesh_descriptors: [
      'Diagnosis',
      'Diagnostic Techniques and Procedures'
    ],
    mesh_qualifiers: [
      'diagnosis',
      'diagnostic use'
    ],
    priority: 2
  },
  {
    id: 'prognosis',
    name: 'Prognosis',
    description: 'Disease outcomes and prognostic factors',
    color: '#009688', // Teal
    mesh_descriptors: [
      'Prognosis',
      'Survival Analysis',
      'Disease Progression'
    ],
    mesh_qualifiers: [
      'mortality',
      'complications'
    ],
    priority: 3
  },
  {
    id: 'etiology',
    name: 'Etiology',
    description: 'Disease causes and risk factors',
    color: '#FF5722', // Deep Orange
    mesh_descriptors: [
      'Etiology',
      'Risk Factors',
      'Causality'
    ],
    mesh_qualifiers: [
      'etiology',
      'epidemiology',
      'genetics'
    ],
    priority: 4
  },
  {
    id: 'prevention',
    name: 'Prevention',
    description: 'Disease prevention and prophylaxis',
    color: '#8BC34A', // Light Green
    mesh_descriptors: [
      'Primary Prevention',
      'Secondary Prevention',
      'Preventive Health Services'
    ],
    mesh_qualifiers: [
      'prevention & control'
    ],
    priority: 5
  }
];

// Map of specialties to their related MeSH terms
export const SPECIALTY_MESH_MAPPINGS: Record<string, string[]> = {
  'Cardiology': [
    'Heart Diseases',
    'Cardiovascular Diseases',
    'Vascular Diseases',
    'Heart',
    'Myocardium'
  ],
  'Neurology': [
    'Nervous System Diseases',
    'Brain Diseases',
    'Neurodegenerative Diseases',
    'Stroke',
    'Epilepsy'
  ],
  'Oncology': [
    'Neoplasms',
    'Cancer',
    'Tumors',
    'Carcinoma'
  ],
  'Pulmonology': [
    'Lung Diseases',
    'Respiratory Tract Diseases',
    'Pulmonary Disease, Chronic Obstructive',
    'Asthma'
  ],
  'Gastroenterology': [
    'Digestive System Diseases',
    'Gastrointestinal Diseases',
    'Liver Diseases',
    'Inflammatory Bowel Diseases'
  ],
  'Infectious Diseases': [
    'Infections',
    'Bacterial Infections',
    'Viral Infections',
    'Communicable Diseases',
    'Anti-Infective Agents'
  ],
  'Endocrinology': [
    'Endocrine System Diseases',
    'Diabetes Mellitus',
    'Thyroid Diseases',
    'Hormones'
  ],
  'Psychiatry': [
    'Mental Disorders',
    'Mood Disorders',
    'Anxiety Disorders',
    'Psychotic Disorders'
  ]
};
```

## 2. Specialty Filters Based on MeSH Headings

### 2.1 Specialty Filter Configuration

Extend `src/config/category-config.ts` with specialty-specific MeSH filters:

```typescript
export interface SpecialtyFilter {
  id: string;
  name: string;
  description: string;
  mesh_terms: string[];
  sub_specialties?: SpecialtyFilter[];
}

export const SPECIALTY_FILTERS: SpecialtyFilter[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system diseases',
    mesh_terms: [
      'Heart Diseases',
      'Cardiovascular Diseases',
      'Vascular Diseases',
      'Heart',
      'Blood Vessels'
    ],
    sub_specialties: [
      {
        id: 'interventional_cardiology',
        name: 'Interventional Cardiology',
        description: 'Catheter-based treatments of heart diseases',
        mesh_terms: [
          'Angioplasty',
          'Stents',
          'Cardiac Catheterization',
          'Percutaneous Coronary Intervention'
        ]
      },
      {
        id: 'electrophysiology',
        name: 'Electrophysiology',
        description: 'Heart rhythm disorders',
        mesh_terms: [
          'Arrhythmias, Cardiac',
          'Cardiac Electrophysiology',
          'Catheter Ablation',
          'Pacemaker, Artificial'
        ]
      }
    ]
  },
  // Additional specialties would be defined here
];
```

### 2.2 Specialty Filtering Service

Create a new service for filtering articles by specialty in `src/services/specialty-filter.service.ts`:

```typescript
import { Article, SpecialtyFilter } from '../types';
import { SPECIALTY_FILTERS } from '../config/category-config';

export class SpecialtyFilterService {
  /**
   * Filter articles by specialty
   */
  public filterBySpecialty(articles: Article[], specialtyId: string): Article[] {
    const specialty = this.findSpecialtyById(specialtyId);
    if (!specialty) {
      return articles;
    }
    
    return articles.filter(article => 
      this.articleMatchesSpecialty(article, specialty)
    );
  }
  
  /**
   * Check if an article matches a specialty based on MeSH terms
   */
  private articleMatchesSpecialty(article: Article, specialty: SpecialtyFilter): boolean {
    if (!article.mesh_terms || article.mesh_terms.length === 0) {
      return false;
    }
    
    // Check if any of the article's MeSH terms match the specialty's MeSH terms
    return article.mesh_terms.some(meshTerm => 
      specialty.mesh_terms.some(specialtyMesh => 
        meshTerm.toLowerCase().includes(specialtyMesh.toLowerCase())
      )
    );
  }
  
  /**
   * Find a specialty by ID, including sub-specialties
   */
  private findSpecialtyById(specialtyId: string): SpecialtyFilter | undefined {
    // Look for direct match
    const directMatch = SPECIALTY_FILTERS.find(s => s.id === specialtyId);
    if (directMatch) {
      return directMatch;
    }
    
    // Look in sub-specialties
    for (const specialty of SPECIALTY_FILTERS) {
      if (specialty.sub_specialties) {
        const subSpecialty = specialty.sub_specialties.find(
          sub => sub.id === specialtyId
        );
        if (subSpecialty) {
          return subSpecialty;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Get all available specialties (flattened)
   */
  public getAllSpecialties(): SpecialtyFilter[] {
    const result: SpecialtyFilter[] = [];
    
    for (const specialty of SPECIALTY_FILTERS) {
      result.push(specialty);
      
      if (specialty.sub_specialties) {
        result.push(...specialty.sub_specialties);
      }
    }
    
    return result;
  }
}
```

### 2.3 API Endpoint Extension

Extend the article controller to support specialty filtering:

```typescript
/**
 * Get articles filtered by specialty
 */
public async getArticlesBySpecialty(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { specialtyId } = req.params;
    
    if (!specialtyId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "specialtyId is required"
      });
    }
    
    const { articles } = await this.article_service.getArticles(req.body);
    
    const specialtyFilterService = new SpecialtyFilterService();
    const filteredArticles = specialtyFilterService.filterBySpecialty(
      articles,
      specialtyId
    );
    
    res.json({
      articles: filteredArticles,
      meta: {
        total: filteredArticles.length,
        specialty: specialtyId
      }
    });
  } catch (error) {
    Logger.error("ArticleController", "Error filtering by specialty", error);
    res.status(500).json({
      error: "An error occurred while filtering articles by specialty",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
```

## 3. Article Type Classification

### 3.1 Publication Type Extraction

Extend the article extraction in `PubmedService` to include publication types:

```typescript
// Add to the extractArticleFromXML method
const pubTypeNodes = articleNode.getElementsByTagName('PublicationType');
const publicationTypes: string[] = [];

for (let j = 0; j < pubTypeNodes.length; j++) {
  const pubTypeNode = pubTypeNodes.item(j);
  if (pubTypeNode?.textContent) {
    publicationTypes.push(pubTypeNode.textContent);
  }
}

// Add to the article object
publication_type: publicationTypes.length > 0 ? publicationTypes : undefined,
```

### 3.2 Article Type Query Parameters

Update the API to support filtering by article type:

```typescript
// Add to ArticleRequest in src/types/index.ts
export interface ArticleRequest {
  // existing fields...
  filters?: {
    // existing filters...
    article_types?: string[];  // Filter by article types
  };
}
```

### 3.3 Query Service Enhancement

Extend the query construction in QueryService to include article type filters:

```typescript
/**
 * Build publication type filters
 */
private buildPublicationTypeFilter(articleTypes: string[]): string {
  if (!articleTypes || articleTypes.length === 0) {
    return '';
  }
  
  const typeMap: Record<string, string> = {
    'Clinical Guideline': '("Guideline"[Publication Type] OR "Practice Guideline"[Publication Type])',
    'Systematic Review': '("Systematic Review"[Publication Type] OR "Meta-Analysis"[Publication Type])',
    'Randomized Trial': '"Randomized Controlled Trial"[Publication Type]',
    'Clinical Trial': '"Clinical Trial"[Publication Type]',
    'Case Report': '"Case Reports"[Publication Type]',
    'Review': '"Review"[Publication Type]'
  };
  
  const filters = articleTypes
    .map(type => typeMap[type] || `"${type}"[Publication Type]`)
    .filter(Boolean);
    
  if (filters.length === 0) {
    return '';
  }
  
  return filters.length === 1 
    ? filters[0] 
    : `(${filters.join(' OR ')})`;
}
```

## 4. Implementation Strategy

### 4.1 Development Phases

1. **Phase 1: Core Data Model**
   - Extend the Article interface with new fields
   - Add MeshQualifier interface to types
   - Update any dependent code that uses the Article type

2. **Phase 2: MeSH Qualifier Extraction**
   - Implement enhanced XML parsing in PubmedService
   - Extract MeSH qualifiers during article parsing
   - Include publication types in the extraction

3. **Phase 3: Category Mapping**
   - Implement CategoryMapperService
   - Configure category and article type definitions
   - Add specialty mappings

4. **Phase 4: API Enhancements**
   - Add article type filtering to queries
   - Implement specialty filtering
   - Update response format to include category information

5. **Future Phase: UI Integration**
   - Implement frontend components for displaying tags
   - Add filter UI elements
   - Create visual taxonomies

### 4.2 Integration with Existing Workflow

```typescript
// Example integration in ArticleService
public async getArticles(request: ArticleRequest): Promise<ArticleResponse> {
  // Existing query construction and article retrieval
  const articles = await this.pubmed_service.fetchArticleDetails(pmids);
  
  // New: Enhance articles with categories
  const categoryMapper = new CategoryMapperService();
  const categorizedArticles = articles.map(article => 
    categoryMapper.mapArticleToCategories(article)
  );
  
  // New: Apply specialty filtering if requested
  if (request.filters?.specialty) {
    const specialtyFilter = new SpecialtyFilterService();
    const filteredArticles = specialtyFilter.filterBySpecialty(
      categorizedArticles, 
      request.filters.specialty
    );
    
    return {
      articles: filteredArticles,
      meta: {
        total: filteredArticles.length,
        processing_time: performance.now() - startTime,
        saved_filename: filename
      }
    };
  }
  
  // Continue with existing workflow (ranking, etc.)
  // ...
}
```

## 5. Technical Constraints

1. **Performance**: The categorization system should add minimal overhead to API response times. Consider implementing lazy loading or background processing for category mapping.

2. **Extensibility**: Category mappings should be easily updatable without code changes. Consider externalizing mappings to configuration files.

3. **Backward Compatibility**: All changes must maintain compatibility with existing APIs. New fields should be optional.

4. **Maintainability**: Code should follow the project's established patterns and style. Add comprehensive comments and unit tests.

5. **Accuracy**: Category mappings should be refined over time based on user feedback. Consider implementing a feedback mechanism.

## 6. Future Enhancements

1. **User Interface**: Implement visual taxonomies with colored tags and labels once the backend functionality is stable.

2. **Machine Learning Classification**: Train models to automatically categorize articles based on their abstracts and full text.

3. **User-Defined Categories**: Allow users to create and save custom categories.

4. **Citation Network Visualization**: Use MeSH categories to visualize relationships between articles.

5. **Trend Analysis**: Track and visualize trends in medical literature by category.
