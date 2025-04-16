import { Article, ArticleTypeDefinition, CategoryMapping, MeshQualifier } from '../types';
import { ARTICLE_TYPE_DEFINITIONS, CATEGORY_MAPPINGS, SPECIALTY_MESH_MAPPINGS } from '../config/category-config';
import { Logger } from '../utils/logger';

/**
 * Service for mapping articles to categories based on MeSH terms and qualifiers
 */
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
  
  /**
   * Process a batch of articles to add categorization
   */
  public processBatch(articles: Article[]): Article[] {
    return articles.map(article => this.mapArticleToCategories(article));
  }
}

export default CategoryMapperService;
