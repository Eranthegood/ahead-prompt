import { supabase } from '@/integrations/supabase/client';

export interface TransformPromptRequest {
  rawIdea: string;
}

export interface TransformPromptResponse {
  transformedPrompt: string;
  error?: string;
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
  static async transformPrompt(rawIdea: string): Promise<TransformPromptResponse> {
    try {
      if (!rawIdea.trim()) {
        throw new Error('L\'idée ne peut pas être vide');
      }

      const { data, error } = await supabase.functions.invoke('transform-prompt', {
        body: { rawIdea: rawIdea.trim() }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erreur lors de la transformation du prompt');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.transformedPrompt) {
        throw new Error('Aucun prompt transformé reçu');
      }

      // Save to history
      this.saveToHistory(rawIdea, data.transformedPrompt);

      // Award XP for AI generation
      // Note: This is called from a static method, so XP will be awarded in the component that uses this service
      
      return { transformedPrompt: data.transformedPrompt };
    } catch (error) {
      console.error('Transform prompt error:', error);
      return { 
        transformedPrompt: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
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
