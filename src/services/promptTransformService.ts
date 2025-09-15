import { supabase } from '@/integrations/supabase/client';

// Utility function to strip HTML and normalize text
export const stripHtmlAndNormalize = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Replace other HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

export interface TransformPromptRequest {
  rawIdea: string;
  knowledgeContext?: any[];
  provider?: 'openai' | 'claude';
  model?: string;
}

export interface TransformPromptResponse {
  transformedPrompt: string;
  error?: string;
  success?: boolean;
}

export interface PromptHistory {
  id: string;
  rawIdea: string;
  transformedPrompt: string;
  timestamp: Date;
}

const HISTORY_KEY = 'prompt_transform_history';
const MAX_HISTORY_ITEMS = 10;

export class PromptTransformService {
  static async transformPrompt(
    rawIdea: string, 
    knowledgeItems?: any[],
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ): Promise<TransformPromptResponse> {
    try {
      // Clean and validate the input
      const cleanIdea = stripHtmlAndNormalize(rawIdea);
      
      if (!cleanIdea || cleanIdea.length < 3) {
        return {
          success: false,
          transformedPrompt: '',
          error: 'Please add more context to your idea for better generation.'
        };
      }

      // Prepare knowledge context if provided
      const knowledgeContext = knowledgeItems && knowledgeItems.length > 0 
        ? knowledgeItems.map(item => ({
            title: item.title,
            content: item.content,
            category: item.category,
            tags: item.tags || []
          }))
        : undefined;

      // Helper to invoke edge function with optional model override
      const invokeTransform = async (modelOverride?: string) => {
        return await supabase.functions.invoke('transform-prompt', {
          body: {
            rawIdea: cleanIdea,
            knowledgeContext,
            provider,
            model: modelOverride ?? model,
          },
        });
      };

      // First attempt with provided model (if any)
      let { data, error } = await invokeTransform(model);

      // If it failed or returned empty, try a safe fallback for OpenAI
      if (
        error ||
        data?.error ||
        !data?.transformedPrompt ||
        (typeof data?.transformedPrompt === 'string' && data.transformedPrompt.trim().length === 0)
      ) {
        console.warn('Primary transform failed, attempting fallback model...', {
          provider,
          model,
          error,
          dataError: data?.error,
        });

        if (provider === 'openai') {
          const fallbackModel = undefined; // Let the edge function default to gpt-4o
          const fallback = await invokeTransform(fallbackModel);
          data = fallback.data;
          error = fallback.error;
        }
      }

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error during prompt transformation');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.transformedPrompt || data.transformedPrompt.trim().length === 0) {
        throw new Error('No transformed prompt received');
      }

      // Save to history
      this.saveToHistory(cleanIdea, data.transformedPrompt);

      // Award XP for AI generation
      // Note: This is called from a static method, so XP will be awarded in the component that uses this service
      
      return { success: true, transformedPrompt: data.transformedPrompt };
    } catch (error) {
      console.error('Transform prompt error:', error);
      return { 
        success: false,
        transformedPrompt: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static saveToHistory(rawIdea: string, transformedPrompt: string): void {
    try {
      const history = this.getHistory();
      const newItem: PromptHistory = {
        id: crypto.randomUUID(),
        rawIdea,
        transformedPrompt,
        timestamp: new Date()
      };

      // Add to beginning and keep only last 10
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('Failed to save prompt to history:', error);
    }
  }

  static getHistory(): PromptHistory[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to load prompt history:', error);
      return [];
    }
  }

  static clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear prompt history:', error);
    }
  }

  static removeFromHistory(id: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to remove item from history:', error);
    }
  }
}
