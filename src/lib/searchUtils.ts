import { Prompt, Product, Epic } from '@/types';

export interface SearchablePrompt extends Prompt {
  product?: Product;
  epic?: Epic;
}

export interface SearchResult {
  prompt: SearchablePrompt;
  score: number;
  matchedFields: string[];
  matchedTerms: string[];
}

/**
 * Normalize text for search: remove accents, lowercase, trim
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
}

/**
 * Split search query into individual terms
 */
export function getSearchTerms(query: string): string[] {
  return normalizeText(query)
    .split(/\s+/)
    .filter(term => term.length > 0);
}

/**
 * Check if a term matches within text using flexible matching
 * Supports partial word matching and full word matching
 */
export function matchesTerm(text: string, term: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedTerm = normalizeText(term);
  
  if (normalizedTerm.length === 0) return false;
  
  // Direct substring match
  if (normalizedText.includes(normalizedTerm)) {
    return true;
  }
  
  // Word boundary matching for partial terms
  const words = normalizedText.split(/\s+/);
  return words.some(word => 
    word.startsWith(normalizedTerm) || 
    word.includes(normalizedTerm)
  );
}

/**
 * Calculate relevance score for a text field
 */
export function calculateFieldScore(text: string, terms: string[], fieldWeight: number): {
  score: number;
  matchedTerms: string[];
} {
  if (!text) return { score: 0, matchedTerms: [] };
  
  const normalizedText = normalizeText(text);
  const matchedTerms: string[] = [];
  let score = 0;
  
  for (const term of terms) {
    if (matchesTerm(text, term)) {
      matchedTerms.push(term);
      
      // Higher score for exact matches
      if (normalizedText.includes(normalizeText(term))) {
        score += fieldWeight * 2;
      } else {
        score += fieldWeight;
      }
      
      // Bonus for matches at the beginning
      if (normalizedText.startsWith(normalizeText(term))) {
        score += fieldWeight * 0.5;
      }
    }
  }
  
  return { score, matchedTerms };
}

/**
 * Enhanced search function for prompts
 */
export function searchPrompts(
  prompts: SearchablePrompt[], 
  query: string,
  options: {
    minScore?: number;
    maxResults?: number;
  } = {}
): SearchResult[] {
  const { minScore = 0.1, maxResults = 100 } = options;
  
  if (!query.trim()) {
    return prompts.map(prompt => ({
      prompt,
      score: 1,
      matchedFields: [],
      matchedTerms: []
    }));
  }
  
  const terms = getSearchTerms(query);
  if (terms.length === 0) return [];
  
  const results: SearchResult[] = [];
  
  for (const prompt of prompts) {
    let totalScore = 0;
    const allMatchedFields: string[] = [];
    const allMatchedTerms: string[] = [];
    
    // Search in title (highest weight)
    const titleResult = calculateFieldScore(prompt.title, terms, 3);
    totalScore += titleResult.score;
    if (titleResult.matchedTerms.length > 0) {
      allMatchedFields.push('title');
      allMatchedTerms.push(...titleResult.matchedTerms);
    }
    
    // Search in generated_prompt (high weight)
    const generatedResult = calculateFieldScore(prompt.generated_prompt || '', terms, 2.5);
    totalScore += generatedResult.score;
    if (generatedResult.matchedTerms.length > 0) {
      allMatchedFields.push('generated_prompt');
      allMatchedTerms.push(...generatedResult.matchedTerms);
    }
    
    // Search in description (medium weight)
    const descriptionResult = calculateFieldScore(prompt.description || '', terms, 2);
    totalScore += descriptionResult.score;
    if (descriptionResult.matchedTerms.length > 0) {
      allMatchedFields.push('description');
      allMatchedTerms.push(...descriptionResult.matchedTerms);
    }
    
    // Search in product name (medium weight)
    const productResult = calculateFieldScore(prompt.product?.name || '', terms, 1.5);
    totalScore += productResult.score;
    if (productResult.matchedTerms.length > 0) {
      allMatchedFields.push('product');
      allMatchedTerms.push(...productResult.matchedTerms);
    }
    
    // Search in epic name (medium weight)
    const epicResult = calculateFieldScore(prompt.epic?.name || '', terms, 1.5);
    totalScore += epicResult.score;
    if (epicResult.matchedTerms.length > 0) {
      allMatchedFields.push('epic');
      allMatchedTerms.push(...epicResult.matchedTerms);
    }
    
    // Normalize score based on number of terms and apply minimum threshold
    const normalizedScore = totalScore / (terms.length * 3); // Normalize by max possible score
    
    if (normalizedScore >= minScore) {
      results.push({
        prompt,
        score: normalizedScore,
        matchedFields: [...new Set(allMatchedFields)],
        matchedTerms: [...new Set(allMatchedTerms)]
      });
    }
  }
  
  // Sort by score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Highlight matched terms in text for display
 */
export function highlightMatches(text: string, terms: string[]): string {
  if (!text || terms.length === 0) return text;
  
  let highlightedText = text;
  
  for (const term of terms) {
    const normalizedTerm = normalizeText(term);
    if (normalizedTerm.length === 0) continue;
    
    // Create a regex for case-insensitive highlighting
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  }
  
  return highlightedText;
}