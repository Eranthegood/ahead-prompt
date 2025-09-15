// Simplified and optimized prompts store
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSafeGamification } from '@/hooks/useSafeGamification';
import { useMixpanelContext } from '@/components/MixpanelProvider';
import { useAuth } from '@/hooks/useAuth';
import { RedditPixelService } from '@/services/redditPixelService';
import type { Prompt, PromptStatus } from '@/types';

export interface CreatePromptData {
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

// Single source of truth for prompts state
export const usePromptsStore = (
  workspaceId?: string,
  selectedProductId?: string,
  selectedEpicId?: string
) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { awardXP } = useSafeGamification();
  const { trackPromptCreated, trackPromptCompleted } = useMixpanelContext();
  const { user } = useAuth();

  // Filtered prompts with memoization
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    if (selectedProductId && selectedProductId !== 'all') {
      filtered = filtered.filter(p => p.product_id === selectedProductId);
    }

    if (selectedEpicId) {
      filtered = filtered.filter(p => p.epic_id === selectedEpicId);
    }

    return filtered;
  }, [prompts, selectedProductId, selectedEpicId]);

  // Clean up stuck generating prompts
  const cleanupStuckPrompts = useCallback(async (promptsToCheck: Prompt[]) => {
    const stuckPrompts = promptsToCheck.filter(p => 
      p.status === 'generating' && 
      p.generated_prompt && 
      p.generated_prompt.trim().length > 0
    );

    if (stuckPrompts.length > 0) {
      for (const prompt of stuckPrompts) {
        try {
          await supabase
            .from('prompts')
            .update({ 
              status: 'todo',
              updated_at: new Date().toISOString()
            })
            .eq('id', prompt.id);
        } catch (error) {
          console.error(`Error fixing stuck prompt ${prompt.id}:`, error);
        }
      }
      
      toast({
        title: "Prompts corrigés",
        description: `${stuckPrompts.length} prompt(s) bloqué(s) ont été réparés.`,
      });
    }
  }, [toast]);

  // Fetch prompts
  const fetchPrompts = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (selectedProductId && selectedProductId !== 'all') {
        query = query.eq('product_id', selectedProductId);
      }

      if (selectedEpicId) {
        query = query.eq('epic_id', selectedEpicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedPrompts = (data || []).map(p => ({ 
        ...p, 
        status: p.status as PromptStatus 
      }));
      
      setPrompts(processedPrompts);
      await cleanupStuckPrompts(processedPrompts);
      
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prompts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [workspaceId, selectedProductId, selectedEpicId, cleanupStuckPrompts, toast]);

  // Create prompt
  const createPrompt = useCallback(async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId || !promptData.title?.trim()) {
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
      status: promptData.status || 'todo',
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

    // Optimistic update
    setPrompts(prev => [optimisticPrompt, ...prev]);

    try {
      const payload = {
        workspace_id: workspaceId,
        title: promptData.title.trim(),
        description: promptData.description?.trim() || null,
        original_description: promptData.original_description?.trim() || promptData.description?.trim() || null,
        status: promptData.status || 'todo',
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

      const newPrompt = { ...data, status: data.status as PromptStatus };
      
      // Replace optimistic prompt with real data
      setPrompts(prev => prev.map(p => 
        p.id === optimisticPrompt.id ? newPrompt : p
      ));

      // Post-creation tasks
      awardXP('PROMPT_CREATE');
      trackPromptCreated({
        promptId: newPrompt.id,
        productId: newPrompt.product_id || undefined,
        epicId: newPrompt.epic_id || undefined,
        priority: newPrompt.priority
      });

      if (user?.id) {
        RedditPixelService.trackPromptCreated(newPrompt.id, user.id);
      }

      toast({
        title: 'Prompt créé',
        description: `"${promptData.title}" a été créé avec succès`,
      });

      return newPrompt;

    } catch (error: any) {
      console.error('Error creating prompt:', error);
      // Rollback optimistic update
      setPrompts(prev => prev.filter(p => p.id !== optimisticPrompt.id));
      
      toast({
        title: 'Erreur',  
        description: 'Impossible de créer le prompt.',
        variant: 'destructive',
      });
      return null;
    }
  }, [workspaceId, toast, awardXP, trackPromptCreated, user]);

  // Update prompt status
  const updatePromptStatus = useCallback(async (promptId: string, status: PromptStatus) => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, status, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', promptId);

      if (error) throw error;

      if (status === 'done') {
        awardXP('PROMPT_COMPLETE');
        trackPromptCompleted({ promptId });
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      // Rollback on error
      await fetchPrompts();
    }
  }, [awardXP, trackPromptCompleted, fetchPrompts]);

  // Delete prompt
  const deletePrompt = useCallback(async (promptId: string) => {
    const originalPrompts = prompts;
    
    // Optimistic update
    setPrompts(prev => prev.filter(p => p.id !== promptId));

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: 'Prompt supprimé',
        description: 'Le prompt a été supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      // Rollback
      setPrompts(originalPrompts);
      
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le prompt.',
        variant: 'destructive',
      });
    }
  }, [prompts, toast]);

  // Update prompt
  const updatePrompt = useCallback(async (promptId: string, updates: Partial<Prompt>) => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
    
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', promptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating prompt:', error);
      // Rollback on error
      await fetchPrompts();
    }
  }, [fetchPrompts]);

  // Update prompt priority
  const updatePromptPriority = useCallback(async (promptId: string, priority: number) => {
    return updatePrompt(promptId, { priority });
  }, [updatePrompt]);

  // Duplicate prompt
  const duplicatePrompt = useCallback(async (prompt: Prompt): Promise<void> => {
    await createPrompt({
      title: `${prompt.title} (copy)`,
      description: prompt.description || undefined,
      priority: prompt.priority,  
      epic_id: prompt.epic_id || undefined,
      product_id: prompt.product_id || undefined,
    });
  }, [createPrompt]);

  // Fetch prompts when dependencies change
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts: filteredPrompts,
    allPrompts: prompts,
    loading,
    createPrompt,
    updatePromptStatus,
    updatePrompt,
    updatePromptPriority,
    duplicatePrompt,
    deletePrompt,
    refetch: fetchPrompts,
  };
};