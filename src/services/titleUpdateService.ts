import { supabase } from '@/integrations/supabase/client';
import { generateTitleFromContent } from '@/lib/titleUtils';

interface PromptTitleUpdate {
  id: string;
  title: string;
  description: string | null;
  newTitle: string;
}

export class TitleUpdateService {
  /**
   * Updates titles for all prompts that have generic titles
   * @param workspaceId - The workspace ID to update prompts for
   * @returns Promise with update results
   */
  static async updateAllGenericTitles(workspaceId: string) {
    try {
      // Fetch all prompts with generic titles
      const { data: prompts, error: fetchError } = await supabase
        .from('prompts')
        .select('id, title, description')
        .eq('workspace_id', workspaceId)
        .in('title', [
          'Nouvelle idée',
          'Idée modifiée', 
          'New idea',
          'Modified idea',
          'Untitled Prompt'
        ]);

      if (fetchError) {
        throw new Error(`Error fetching prompts: ${fetchError.message}`);
      }

      if (!prompts || prompts.length === 0) {
        return {
          success: true,
          message: 'No prompts with generic titles found',
          updatedCount: 0,
          updates: []
        };
      }

      // Generate new titles for each prompt
      const updates: PromptTitleUpdate[] = prompts.map(prompt => {
        const content = prompt.description || prompt.title;
        const newTitle = generateTitleFromContent(content);
        
        return {
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          newTitle
        };
      });

      // Filter out prompts where the new title is the same as the old one
      const meaningfulUpdates = updates.filter(update => 
        update.newTitle !== update.title && 
        update.newTitle !== 'Nouvelle idée'
      );

      if (meaningfulUpdates.length === 0) {
        return {
          success: true,
          message: 'No meaningful title updates needed',
          updatedCount: 0,
          updates: []
        };
      }

      // Update titles in database
      const updatePromises = meaningfulUpdates.map(async (update) => {
        const { error } = await supabase
          .from('prompts')
          .update({ 
            title: update.newTitle,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);

        if (error) {
          console.error(`Error updating prompt ${update.id}:`, error);
          return { id: update.id, success: false, error: error.message };
        }

        return { id: update.id, success: true };
      });

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(result => result.success);
      const failedUpdates = results.filter(result => !result.success);

      return {
        success: failedUpdates.length === 0,
        message: `Updated ${successfulUpdates.length} prompt titles successfully${
          failedUpdates.length > 0 ? `, ${failedUpdates.length} failed` : ''
        }`,
        updatedCount: successfulUpdates.length,
        updates: meaningfulUpdates,
        failures: failedUpdates
      };

    } catch (error) {
      console.error('Error in updateAllGenericTitles:', error);
      return {
        success: false,
        message: `Error updating titles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedCount: 0,
        updates: []
      };
    }
  }

  /**
   * Preview what titles would be generated without updating
   * @param workspaceId - The workspace ID to preview updates for
   * @returns Promise with preview data
   */
  static async previewTitleUpdates(workspaceId: string) {
    try {
      const { data: prompts, error } = await supabase
        .from('prompts')
        .select('id, title, description')
        .eq('workspace_id', workspaceId)
        .in('title', [
          'Nouvelle idée',
          'Idée modifiée', 
          'New idea',
          'Modified idea',
          'Untitled Prompt'
        ]);

      if (error) {
        throw new Error(`Error fetching prompts: ${error.message}`);
      }

      if (!prompts || prompts.length === 0) {
        return {
          success: true,
          previews: [],
          message: 'No prompts with generic titles found'
        };
      }

      const previews = prompts.map(prompt => {
        const content = prompt.description || prompt.title;
        const newTitle = generateTitleFromContent(content);
        
        return {
          id: prompt.id,
          currentTitle: prompt.title,
          newTitle,
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          willUpdate: newTitle !== prompt.title && newTitle !== 'Nouvelle idée'
        };
      });

      return {
        success: true,
        previews,
        message: `Found ${previews.filter(p => p.willUpdate).length} prompts that can be updated`
      };

    } catch (error) {
      console.error('Error in previewTitleUpdates:', error);
      return {
        success: false,
        previews: [],
        message: `Error previewing updates: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}