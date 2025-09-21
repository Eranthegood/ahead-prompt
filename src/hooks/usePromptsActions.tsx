import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSafeGamification } from '@/hooks/useSafeGamification';
import { useMixpanelContext } from '@/components/MixpanelProvider';
import { useAuth } from '@/hooks/useAuth';
import { RedditPixelService } from '@/services/redditPixelService';
import type { Prompt, PromptStatus } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  status?: PromptStatus;
  priority?: number;
  epic_id?: string;
  product_id?: string;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

// Debounced update function
const createDebouncedUpdater = () => {
  let timeout: NodeJS.Timeout;
  const updates = new Map();

  return (promptId: string, data: any, callback: () => Promise<void>) => {
    updates.set(promptId, { ...updates.get(promptId), ...data });
    
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const batch = Array.from(updates.entries());
      updates.clear();
      
      for (const [id, updateData] of batch) {
        try {
          await supabase
            .from('prompts')
            .update(updateData)
            .eq('id', id);
        } catch (error) {
          console.error(`Failed to update prompt ${id}:`, error);
        }
      }
      
      callback();
    }, 300);
  };
};

const debouncedUpdater = createDebouncedUpdater();

export const usePromptsActions = (
  workspaceId: string | undefined,
  prompts: Prompt[],
  setPrompts: (update: (prev: Prompt[]) => Prompt[]) => void,
  refetch: () => Promise<void>
) => {
  const { toast } = useToast();
  const { awardXP } = useSafeGamification();
  const { trackPromptCreated, trackPromptCompleted } = useMixpanelContext();
  const { user } = useAuth();

  // Optimistic update helper
  const withOptimisticUpdate = useCallback(<T,>(
    optimisticUpdate: (prev: Prompt[]) => Prompt[],
    operation: () => Promise<T>,
    rollback: (prev: Prompt[]) => Prompt[]
  ) => {
    setPrompts(optimisticUpdate);

    return operation().catch(error => {
      setPrompts(rollback);
      throw error;
    });
  }, [setPrompts]);

  // Create prompt
  const createPrompt = useCallback(async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId) return null;

    if (!promptData.title?.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le titre est requis.',
        variant: 'destructive',
      });
      return null;
    }

    const optimisticPrompt: Prompt = {
      id: `temp-${Date.now()}`,
      workspace_id: workspaceId,
      title: promptData.title.trim(),
      description: promptData.description?.trim() || null,
      original_description: promptData.original_description?.trim() || promptData.description?.trim() || null,
      status: promptData.status || (
        (promptData.description?.trim().length || 0) > 15 || 
        (promptData.original_description?.trim().length || 0) > 15 
          ? 'generating' : 'todo'
      ),
      priority: promptData.priority || 2,
      order_index: 0,
      epic_id: promptData.epic_id || null,
      product_id: promptData.product_id || null,
      generated_prompt: promptData.generated_prompt || null,
      generated_at: promptData.generated_at || null,
      is_debug_session: false,
      cursor_agent_id: null,
      cursor_agent_status: null,
      github_pr_number: null,
      github_pr_url: null,
      github_pr_status: null,
      cursor_branch_name: null,
      cursor_logs: {},
      workflow_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const result = await withOptimisticUpdate(
        (prev) => [optimisticPrompt, ...prev],
        async () => {
          const payload = {
            workspace_id: workspaceId,
            title: promptData.title.trim(),
            description: promptData.description?.trim() || null,
            original_description: promptData.original_description?.trim() || promptData.description?.trim() || null,
            status: promptData.status || (
              (promptData.description?.trim().length || 0) > 15 || 
              (promptData.original_description?.trim().length || 0) > 15 
                ? 'generating' : 'todo'
            ),
            priority: promptData.priority || 2,
            epic_id: promptData.epic_id || null,
            product_id: promptData.product_id || null,
            generated_prompt: promptData.generated_prompt || null,
            generated_at: promptData.generated_at || null,
            order_index: 0,
          };

          const { data, error } = await supabase
            .from('prompts')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          return { ...data, status: data.status as PromptStatus };
        },
        (prev) => prev.filter(p => p.id !== optimisticPrompt.id)
      );

      // Update optimistic prompt with real data
      setPrompts(prev => prev.map(p => 
        p.id === optimisticPrompt.id ? result : p
      ));

      // Post-creation tasks
      awardXP('PROMPT_CREATE');
      trackPromptCreated({
        promptId: result.id,
        productId: result.product_id || undefined,
        epicId: result.epic_id || undefined,
        priority: result.priority
      });

      if (user?.id) {
        RedditPixelService.trackPromptCreated(result.id, user.id);
      }

      toast({
        title: 'Prompt créé',
        description: `"${promptData.title}" a été créé avec succès`,
      });

      return result;

    } catch (error: any) {
      console.error('Error creating prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le prompt. Veuillez réessayer.',
        variant: 'destructive',
      });
      return null;
    }
  }, [workspaceId, setPrompts, withOptimisticUpdate, toast, awardXP, trackPromptCreated, user]);

  // Update prompt status with debouncing
  const updatePromptStatus = useCallback((promptId: string, status: PromptStatus) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, status, updated_at: new Date().toISOString() }
        : p
    ));

    debouncedUpdater(promptId, { 
      status, 
      updated_at: new Date().toISOString() 
    }, () => refetch());

    if (status === 'done') {
      awardXP('PROMPT_COMPLETE');
      trackPromptCompleted({ promptId });
    }
  }, [setPrompts, refetch, awardXP, trackPromptCompleted]);

  // Delete prompt
  const deletePrompt = useCallback(async (promptId: string) => {
    try {
      await withOptimisticUpdate(
        (prev) => prev.filter(p => p.id !== promptId),
        async () => {
          const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', promptId);

          if (error) throw error;
        },
        (prev) => prompts // Rollback to original state
      );

      toast({
        title: 'Prompt supprimé',
        description: 'Le prompt a été supprimé avec succès',
      });

    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le prompt. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  }, [withOptimisticUpdate, prompts, toast]);

  return {
    createPrompt,
    updatePromptStatus,
    deletePrompt,
    withOptimisticUpdate
  };
};