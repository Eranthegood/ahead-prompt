import { supabase } from '@/integrations/supabase/client';

export interface TitleGenerationRequest {
  title: string;
  description?: string;
  provider?: 'openai' | 'claude';
  model?: string;
}

export interface TitleGenerationResponse {
  titles: string[];
  error?: string;
  success?: boolean;
}

export class TitleGenerationService {
  static async generateBetterTitles(
    title: string,
    description?: string,
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ): Promise<TitleGenerationResponse> {
    try {
      if (!title || title.trim().length === 0) {
        return {
          success: false,
          titles: [],
          error: 'Title is required for generation.'
        };
      }

      const { data, error } = await supabase.functions.invoke('generate-better-title', {
        body: { 
          title: title.trim(),
          description: description?.trim(),
          provider,
          model
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error during title generation');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.titles || !Array.isArray(data.titles)) {
        throw new Error('No titles received from generation service');
      }

      return { 
        success: true, 
        titles: data.titles.filter((t: string) => t && t.trim().length > 0)
      };
    } catch (error) {
      console.error('Generate better titles error:', error);
      return { 
        success: false,
        titles: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async enhancePromptTitle(promptId: string, workspaceId: string): Promise<{ success: boolean; newTitle?: string; error?: string }> {
    try {
      // Get the current prompt
      const { data: prompt, error: fetchError } = await supabase
        .from('prompts')
        .select('title, description')
        .eq('id', promptId)
        .single();

      if (fetchError) {
        throw new Error('Failed to fetch prompt for title enhancement');
      }

      // Generate better titles
      const result = await this.generateBetterTitles(
        prompt.title,
        prompt.description,
        'openai'
      );

      if (!result.success || result.titles.length === 0) {
        throw new Error(result.error || 'No improved titles generated');
      }

      // Use the best title (first in array)
      const newTitle = result.titles[0];

      // Update the prompt with the new title
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      if (updateError) {
        throw new Error('Failed to update prompt with new title');
      }

      return {
        success: true,
        newTitle
      };
    } catch (error) {
      console.error('Enhance prompt title error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}