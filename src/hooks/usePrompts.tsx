
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { PromptTransformService, stripHtmlAndNormalize } from '@/services/promptTransformService';
import type { Prompt, PromptStatus } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  status?: PromptStatus;
  priority?: number;
  epic_id?: string;
  product_id?: string;
  generated_prompt?: string;
  generated_at?: string;
}

export const usePrompts = (workspaceId?: string, selectedProductId?: string, selectedEpicId?: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { awardXP } = useGamification();

  // Fetch prompts
  const fetchPrompts = async () => {
    if (!workspaceId) return;
    
    try {
      let query = supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Apply server-side filtering for better performance
      if (selectedProductId && selectedProductId !== 'all') {
        query = query.eq('product_id', selectedProductId);
      }

      if (selectedEpicId) {
        query = query.eq('epic_id', selectedEpicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts((data || []).map(p => ({ ...p, status: p.status as PromptStatus })));
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to auto-generate prompt if content is sufficient
  const autoGeneratePrompt = async (promptId: string, content: string) => {
    try {
      const cleanContent = stripHtmlAndNormalize(content);
      
      // Only auto-generate if we have sufficient content (more than just a title)
      if (cleanContent.length > 20) {
        console.log('Auto-generating prompt for sufficient content:', cleanContent.length, 'characters');
        
        const response = await PromptTransformService.transformPrompt(content);
        
        if (response.success && response.transformedPrompt) {
          // Update the prompt with the generated content
          const { error } = await supabase
            .from('prompts')
            .update({
              generated_prompt: response.transformedPrompt,
              generated_at: new Date().toISOString(),
            })
            .eq('id', promptId);

          if (!error) {
            // Update local state
            setPrompts(prev => prev.map(p => 
              p.id === promptId 
                ? { 
                    ...p, 
                    generated_prompt: response.transformedPrompt,
                    generated_at: new Date().toISOString()
                  }
                : p
            ));
            
            console.log('Auto-generated prompt successfully for prompt:', promptId);
          }
        }
      }
    } catch (error) {
      console.log('Auto-generation failed, but continuing silently:', error);
      // Fail silently - auto-generation is a nice-to-have, not critical
    }
  };

  // Create prompt with optimistic update and auto-generation
  const createPrompt = async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId) return null;

    // 🚀 1. Optimistic update - immediate UI response
    const optimisticPrompt: Prompt = {
      id: `temp-${Date.now()}`,
      workspace_id: workspaceId,
      title: promptData.title.trim(),
      description: promptData.description?.trim() || null,
      status: promptData.status || 'todo',
      priority: promptData.priority || 2, // Default to normal priority
      order_index: 0,
      epic_id: promptData.epic_id || null,
      product_id: promptData.product_id || null,
      generated_prompt: promptData.generated_prompt || null,
      generated_at: promptData.generated_at || null,
      is_debug_session: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add immediately to UI
    setPrompts(prev => [optimisticPrompt, ...prev]);

    try {
      // 📡 2. Send to database
      const payload = {
        workspace_id: workspaceId,
        title: promptData.title.trim(),
        description: promptData.description?.trim() || undefined,
        status: promptData.status || 'todo',
        priority: promptData.priority || 2, // Default to normal priority
        epic_id: promptData.epic_id || undefined,
        product_id: promptData.product_id || undefined,
        generated_prompt: promptData.generated_prompt || undefined,
        generated_at: promptData.generated_at || undefined,
        order_index: 0,
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // 🔴 Rollback on error
        setPrompts(prev => prev.filter(p => p.id !== optimisticPrompt.id));
        
        // Contextual error messages
        if (error.message?.includes('epic_id')) {
          toast({
            title: 'Erreur',
            description: 'L\'epic sélectionné n\'existe pas.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de créer le prompt. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        throw error;
      }

      // ✅ 3. Replace with real data
      const realPrompt = { ...data, status: data.status as PromptStatus };
      setPrompts(prev => prev.map(p => p.id === optimisticPrompt.id ? realPrompt : p));

      // 🤖 4. Auto-generate prompt if we have description content
      if (realPrompt.description) {
        // Don't await this - let it run in background
        autoGeneratePrompt(realPrompt.id, realPrompt.description);
      }

      // Award XP for creating a prompt
      awardXP('PROMPT_CREATE');

      // 🎉 Success notification
      toast({
        title: 'Prompt créé',
        description: `"${promptData.title}" a été créé avec succès`,
      });

      return realPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      return null;
    }
  };

  // Update prompt status with optimistic update
  const updatePromptStatus = async (promptId: string, status: PromptStatus): Promise<void> => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, status, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ status })
        .eq('id', promptId);

      if (error) {
        // Rollback on error
        await fetchPrompts();
        throw error;
      }

      // Award XP for completing a prompt
      if (status === 'done') {
        awardXP('PROMPT_COMPLETE');
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  // Update prompt priority with optimistic update
  const updatePromptPriority = async (promptId: string, priority: number): Promise<void> => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, priority, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ priority })
        .eq('id', promptId);

      if (error) {
        // Rollback on error
        await fetchPrompts();
        throw error;
      }

      toast({
        title: 'Succès',
        description: 'Priorité mise à jour',
      });
    } catch (error) {
      console.error('Error updating prompt priority:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la priorité',
        variant: 'destructive',
      });
    }
  };

  // Duplicate prompt with optimistic update
  const duplicatePrompt = async (prompt: Prompt): Promise<void> => {
    // Create optimistic duplicate
    const duplicatePrompt: Prompt = {
      id: `temp-${Date.now()}`,
      workspace_id: prompt.workspace_id,
      title: `${prompt.title} (Copy)`,
      description: prompt.description,
      status: 'todo',
      priority: prompt.priority,
      epic_id: prompt.epic_id,
      product_id: prompt.product_id,
      order_index: 0,
      generated_prompt: prompt.generated_prompt,
      generated_at: prompt.generated_at,
      is_debug_session: prompt.is_debug_session || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add immediately to UI
    setPrompts(prev => [duplicatePrompt, ...prev]);

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          workspace_id: prompt.workspace_id,
          title: `${prompt.title} (Copy)`,
          description: prompt.description,
          status: 'todo',
          priority: prompt.priority,
          product_id: prompt.product_id,
          epic_id: prompt.epic_id,
          generated_prompt: prompt.generated_prompt,
          generated_at: prompt.generated_at,
          order_index: 0
        })
        .select()
        .single();

      if (error) {
        // Rollback on error
        setPrompts(prev => prev.filter(p => p.id !== duplicatePrompt.id));
        throw error;
      }

      // Replace with real data
      const realPrompt = { ...data, status: data.status as PromptStatus };
      setPrompts(prev => prev.map(p => p.id === duplicatePrompt.id ? realPrompt : p));

      toast({
        title: 'Prompt dupliqué',
        description: 'Une copie a été créée'
      });
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de dupliquer le prompt',
        variant: 'destructive'
      });
    }
  };

  // Delete prompt with optimistic update
  const deletePrompt = async (promptId: string): Promise<void> => {
    // Store for potential rollback
    const promptToDelete = prompts.find(p => p.id === promptId);
    
    // Optimistic delete
    setPrompts(prev => prev.filter(p => p.id !== promptId));

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) {
        // Rollback on error
        if (promptToDelete) {
          setPrompts(prev => [promptToDelete, ...prev]);
        }
        throw error;
      }

      toast({
        title: 'Prompt supprimé',
        description: 'Le prompt a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le prompt',
        variant: 'destructive'
      });
    }
  };

  // Update prompt with optimistic update and auto-generation
  const updatePrompt = async (promptId: string, updates: Partial<Prompt>): Promise<void> => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, ...updates, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      if (error) {
        // Rollback on error
        await fetchPrompts();
        throw error;
      }

      // 🤖 Auto-generate prompt if description was updated and has sufficient content
      if (updates.description) {
        // Don't await this - let it run in background
        autoGeneratePrompt(promptId, updates.description);
      }

      toast({
        title: 'Prompt mis à jour',
        description: 'Les modifications ont été sauvegardées'
      });
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le prompt',
        variant: 'destructive'
      });
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchPrompts();

    if (!workspaceId) return;

    const channel = supabase
      .channel('prompts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prompts',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setPrompts(prevPrompts => {
          switch (eventType) {
            case 'INSERT':
              // Only add if it's not a temporary optimistic update
              if (newRecord && !newRecord.id.startsWith('temp-') && !prevPrompts.find(p => p.id === newRecord.id)) {
                return [newRecord as Prompt, ...prevPrompts];
              }
              break;

            case 'UPDATE':
              // Update existing prompt, prioritize real data over optimistic updates
              return prevPrompts.map(prompt => {
                if (prompt.id === newRecord.id && !prompt.id.startsWith('temp-')) {
                  return { ...prompt, ...newRecord, status: newRecord.status as PromptStatus };
                }
                return prompt;
              });

            case 'DELETE':
              // Remove deleted prompt
              return prevPrompts.filter(p => p.id !== oldRecord.id);
          }
          return prevPrompts;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, selectedProductId, selectedEpicId]);

  return {
    prompts,
    loading,
    createPrompt,
    updatePromptStatus,
    updatePromptPriority,
    duplicatePrompt,
    deletePrompt,
    updatePrompt,
    refetch: fetchPrompts,
  };
};
