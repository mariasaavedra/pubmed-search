# PubMed Content Categorization - Technical Specifications

## Overview

This document outlines the technical specifications for implementing a content categorization system for the PubMed Clinical Article Retriever. The system will enhance article organization and filtering capabilities through MeSH qualifier-based categorization, visual taxonomies, specialty-specific filters, and article type classification.

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
  color: string;                          // Hex color code for visual display
  icon?: string;                          // Optional icon identifier
  mesh_descriptors: string[];             // MeSH descriptors that map to this category
  mesh_qualifiers?: string[];             // MeSH qualifiers that map to this category
  publication_types?: string[];           // Publication types that map to this category
  priority: number;                       // Sorting priority (lower numbers appear first)
}

export interface ArticleTypeDefinition {
  id: string;                             // Type identifier
  name: string;                           // Display name
  description: string;                    // Short description
  color: string;                          // Hex color code
  icon?: string;                          // Optional icon identifier
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
  
  // Additional helper methods for mapping would be implemented here
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
    icon: 'book',
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
    icon: 'search',
    pubmed_types: [
      'Meta-Analysis',
      'Systematic Review'
    ],
    priority: 2
  },
  // Additional article types would be defined here
];

export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    id: 'therapy',
    name: 'Therapy',
    description: 'Therapeutic interventions and treatments',
    color: '#E91E63', // Pink
    icon: 'medication',
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
    icon: 'stethoscope',
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
  // Additional categories would be defined here
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
  // Additional specialties would be defined here
};
```

## 2. Visual Taxonomies (Colored Tags, Labels)

### 2.1 User Interface Components

#### 2.1.1 Tag Component

Create a reusable tag component for displaying categories, article types, and specialties:

```typescript
// React component example (would be adapted to the project's frontend framework)
interface TagProps {
  text: string;
  color: string;
  icon?: string;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({ text, color, icon, onClick }) => {
  return (
    <div 
      className="tag" 
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {icon && <i className={`icon icon-${icon}`}></i>}
      <span>{text}</span>
    </div>
  );
};
```

#### 2.1.2 Tag Group Component

Create a component for displaying groups of related tags:

```typescript
interface TagGroupProps {
  tags: Array<{
    text: string;
    color: string;
    icon?: string;
  }>;
  title?: string;
  onTagClick?: (tag: string) => void;
}

const TagGroup: React.FC<TagGroupProps> = ({ tags, title, onTagClick }) => {
  return (
    <div className="tag-group">
      {title && <h4 className="tag-group-title">{title}</h4>}
      <div className="tags-container">
        {tags.map(tag => (
          <Tag 
            key={tag.text}
            text={tag.text}
            color={tag.color}
            icon={tag.icon}
            onClick={() => onTagClick && onTagClick(tag.text)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2.2 Styling for Tags

Create CSS styles for tags in `public/css/tags.css`:

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.tag:hover {
  opacity: 0.8;
}

.tag .icon {
  margin-right: 4px;
  font-size: 14px;
}

.tag-group {
  margin-bottom: 16px;
}

.tag-group-title {
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
}
```

### 2.3 Tag Rendering Service

Create a service for generating HTML/JSON representations of tags:

```typescript
import { Article, CategoryMapping, ArticleTypeDefinition } from '../types';
import { CATEGORY_MAPPINGS, ARTICLE_TYPE_DEFINITIONS } from '../config/category-config';

export class TagRenderingService {
  /**
   * Generate HTML string representation of article tags
   */
  public generateArticleTagsHtml(article: Article): string {
    const tags = this.getArticleTags(article);
    
    return tags.map(tag => `
      <div class="tag" style="background-color: ${tag.color}">
        ${tag.icon ? `<i class="icon icon-${tag.icon}"></i>` : ''}
        <span>${tag.text}</span>
      </div>
    `).join('');
  }
  
  /**
   * Generate JSON representation of article tags
   */
  public getArticleTags(article: Article): Array<{text: string, color: string, icon?: string}> {
    const tags: Array<{text: string, color: string, icon?: string}> = [];
    
    // Article type tag
    if (article.article_type) {
      const typeDefinition = ARTICLE_TYPE_DEFINITIONS.find(
        def => def.name === article.article_type
      );
      
      if (typeDefinition) {
        tags.push({
          text: article.article_type,
          color: typeDefinition.color,
          icon: typeDefinition.icon
        });
      }
    }
    
    // Primary category tag
    if (article.primary_category) {
      const categoryMapping = CATEGORY_MAPPINGS.find(
        mapping => mapping.name === article.primary_category
      );
      
      if (categoryMapping) {
        tags.push({
          text: article.primary_category,
          color: categoryMapping.color,
          icon: categoryMapping.icon
        });
      }
    }
    
    // Specialty tags
    if (article.specialty_tags && article.specialty_tags.length > 0) {
      article.specialty_tags.forEach(specialty => {
        tags.push({
          text: specialty,
          color: this.getSpecialtyColor(specialty),
          icon: 'tag'
        });
      });
    }
    
    return tags;
  }
  
  /**
   * Get color for a specialty
   */
  private getSpecialtyColor(specialty: string): string {
    // Map of specialties to colors
    const specialtyColors: Record<string, string> = {
      'Cardiology': '#F44336',      // Red
      'Neurology': '#673AB7',       // Deep Purple
      'Oncology': '#FF9800',        // Orange
      'Pediatrics': '#03A9F4',      // Light Blue
      'Psychiatry': '#795548',      // Brown
      'Dermatology': '#FF5722',     // Deep Orange
      'Endocrinology': '#4CAF50',   // Green
      'Gastroenterology': '#8BC34A' // Light Green
    };
    
    return specialtyColors[specialty] || '#607D8B'; // Blue Grey as default
  }
}
```

## 3. Specialty Filters Based on MeSH Headings

### 3.1 Specialty Filter Configuration

Extend `src/config/category-config.ts` with specialty-specific MeSH filters:

```typescript
export interface SpecialtyFilter {
  id: string;
  name: string;
  description: string;
  color: string;
  mesh_terms: string[];
  sub_specialties?: SpecialtyFilter[];
}

export const SPECIALTY_FILTERS: SpecialtyFilter[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system diseases',
    color: '#F44336', // Red
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
        color: '#D32F2F', // Dark Red
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
        color: '#E57373', // Light Red
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

### 3.2 Specialty Filtering Service

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

### 3.3 API Endpoint Extension

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

## 4. Article Type Classification

### 4.1 Publication Type Extraction

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

### 4.2 Article Type Query Parameters

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

### 4.3 Query Service Enhancement

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

## 5. Implementation Strategy

### 5.1 Development Phases

1. **Phase 1: Data Model and Backend Services**
   - Extend Article interface with new fields
   - Implement MeSH qualifier extraction in PubmedService
   - Create CategoryMapperService
   - Configure initial category and article type mappings

2. **Phase 2: API Enhancements**
   - Extend search endpoints with category/specialty/type filters
   - Update response format to include category information
   - Implement specialty filtering endpoint

3. **Phase 3: Frontend Components**
   - Develop tag components
   - Create tag styling
   - Implement tag rendering service

4. **Phase 4: Integration and Testing**
   - Integrate all components
   - Test with real PubMed queries
   - Refine category mappings based on test results

### 5.2 Database Schema Updates

If a database is used to cache article data, the following schema updates would be needed:

```sql
-- Add new columns to Articles table
ALTER TABLE Articles
ADD COLUMN article_type VARCHAR(100),
ADD COLUMN primary_category VARCHAR(100),
ADD COLUMN secondary_categories JSON,
ADD COLUMN specialty_tags JSON,
ADD COLUMN publication_types JSON,
ADD COLUMN mesh_qualifiers JSON;

-- Create Categories table
CREATE TABLE Categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) NOT NULL,
  icon VARCHAR(50),
  priority INTEGER NOT NULL
);

-- Create ArticleTypes table
CREATE TABLE ArticleTypes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20) NOT NULL,
  icon VARCHAR(50),
  priority INTEGER NOT NULL
);
```

## 6. Future Enhancements

1. **Machine Learning Classification**: Implement ML models to automatically categorize articles based on their abstract and full text.

2. **User-Defined Categories**: Allow users to create and save custom categories.

3. **Citation Network Visualization**: Use MeSH categories to visualize relationships between articles.

4. **Trend Analysis**: Track and visualize trends in medical literature by category over time.

5. **Personalized Recommendations**: Use categorization data to provide personalized article recommendations.

## 7. Technical Constraints

1. The categorization system should add minimal overhead to API response times.
2. Category mappings should be easily updatable without code changes.
3. The visual components should be responsive and accessible.
4. The implementation should maintain backward compatibility with existing APIs.
