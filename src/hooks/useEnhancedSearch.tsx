import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { Prompt, Epic, Product, KnowledgeItem } from '@/types';
import type { PromptLibraryItem } from '@/types/prompt-library';

interface SearchResults {
  prompts: Prompt[];
  epics: Epic[];
  products: Product[];
  knowledge: KnowledgeItem[];
  promptLibrary: PromptLibraryItem[];
}

interface UseEnhancedSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  enableFuzzySearch?: boolean;
}

export function useEnhancedSearch(
  query: string, 
  options: UseEnhancedSearchOptions = {}
) {
  const { 
    debounceMs = 300, 
    maxResults = 50, 
    enableFuzzySearch = true 
  } = options;

  const [searchResults, setSearchResults] = useState<SearchResults>({
    prompts: [],
    epics: [],
    products: [],
    knowledge: [],
    promptLibrary: []
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { workspace } = useWorkspace();
  const promptsCtx = usePromptsContext();
  const prompts = promptsCtx?.prompts ?? [];
  const { products } = useProducts(workspace?.id || '');
  const { epics } = useEpics(workspace?.id || '');
  const { knowledgeItems } = useKnowledge(workspace?.id || '');
  const { items: promptLibraryItems } = usePromptLibrary();

  // Client-side fuzzy search for immediate results
  const clientSearchResults = useMemo(() => {
    if (!query.trim() || !enableFuzzySearch) {
      return { prompts: [], epics: [], products: [], knowledge: [], promptLibrary: [] };
    }

    const searchTerm = query.toLowerCase();
    
    const searchPrompts = prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.description?.toLowerCase().includes(searchTerm)
    ).slice(0, maxResults);

    const searchEpics = epics.filter(epic =>
      epic.name.toLowerCase().includes(searchTerm) ||
      epic.description?.toLowerCase().includes(searchTerm)
    ).slice(0, maxResults);

    const searchProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    ).slice(0, maxResults);

    const searchKnowledge = knowledgeItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    ).slice(0, maxResults);

    const searchPromptLibrary = promptLibraryItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.body.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.category?.toLowerCase().includes(searchTerm)
    ).slice(0, maxResults);

    return {
      prompts: searchPrompts,
      epics: searchEpics,
      products: searchProducts,
      knowledge: searchKnowledge,
      promptLibrary: searchPromptLibrary
    };
  }, [query, prompts, epics, products, knowledgeItems, promptLibraryItems, maxResults, enableFuzzySearch]);

  // Advanced server-side search with full-text capabilities
  const performAdvancedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !workspace?.id) {
      setSearchResults({ prompts: [], epics: [], products: [], knowledge: [], promptLibrary: [] });
      setHasSearched(false);
      return;
    }

    setIsSearching(true);

    try {
      const searchTerm = `%${searchQuery.trim()}%`;

      // Search prompts with advanced text search
      const { data: promptResults } = await supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('updated_at', { ascending: false })
        .limit(maxResults);

      // Search epics
      const { data: epicResults } = await supabase
        .from('epics')
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('updated_at', { ascending: false })
        .limit(maxResults);

      // Search products
      const { data: productResults } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .order('updated_at', { ascending: false })
        .limit(maxResults);

      // Search knowledge base
      const { data: knowledgeResults } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order('updated_at', { ascending: false })
        .limit(maxResults);

      // Search prompt library
      const { data: promptLibraryResults } = await supabase
        .from('prompt_library' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .or(`title.ilike.${searchTerm},body.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .order('updated_at', { ascending: false })
        .limit(maxResults);

      setSearchResults({
        prompts: (promptResults || []) as Prompt[],
        epics: (epicResults || []) as Epic[],
        products: (productResults || []) as Product[],
        knowledge: (knowledgeResults || []) as KnowledgeItem[],
        promptLibrary: (promptLibraryResults || []) as unknown as PromptLibraryItem[]
      });
      
      setHasSearched(true);
    } catch (error) {
      console.error('Advanced search error:', error);
      setSearchResults({ prompts: [], epics: [], products: [], knowledge: [], promptLibrary: [] });
    } finally {
      setIsSearching(false);
    }
  }, [workspace?.id, maxResults]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performAdvancedSearch(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, performAdvancedSearch, debounceMs]);

  // Combine client-side and server-side results
  const combinedResults = useMemo(() => {
    if (!hasSearched || isSearching) {
      return clientSearchResults;
    }
    
    // Merge and deduplicate results, prioritizing server results
    const mergeUnique = <T extends { id: string }>(client: T[], server: T[]): T[] => {
      const serverIds = new Set(server.map(item => item.id));
      const uniqueClient = client.filter(item => !serverIds.has(item.id));
      return [...server, ...uniqueClient].slice(0, maxResults);
    };

    return {
      prompts: mergeUnique(clientSearchResults.prompts, searchResults.prompts),
      epics: mergeUnique(clientSearchResults.epics, searchResults.epics),
      products: mergeUnique(clientSearchResults.products, searchResults.products),
      knowledge: mergeUnique(clientSearchResults.knowledge, searchResults.knowledge),
      promptLibrary: mergeUnique(clientSearchResults.promptLibrary, searchResults.promptLibrary)
    };
  }, [clientSearchResults, searchResults, hasSearched, isSearching, maxResults]);

  const totalResults = combinedResults.prompts.length + 
                      combinedResults.epics.length + 
                      combinedResults.products.length + 
                      combinedResults.knowledge.length + 
                      combinedResults.promptLibrary.length;

  return {
    searchResults: combinedResults,
    isSearching,
    hasSearched,
    totalResults,
    isEmpty: totalResults === 0 && hasSearched && !isSearching
  };
}