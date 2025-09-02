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

  // Helper function to handle optimistic updates with rollback capability
  const withOptimisticUpdate = async <T,>(
    optimisticUpdate: (prev: Prompt[]) => Prompt[],
    operation: () => Promise<T>,
    rollback: (prev: Prompt[]) => Prompt[]
  ): Promise<T | null> => {
    // Apply optimistic update
    setPrompts(optimisticUpdate);
    setLoading(false);

    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Rollback on error
      setPrompts(rollback);
      throw error;
    }
  };

  // Helper function to show contextual error messages
  const showErrorToast = (error: any, context: string) => {
    let description = `Impossible de ${context}. Veuillez réessayer.`;
    
    if (error.message?.includes('epic_id')) {
      description = 'L\'epic sélectionné n\'existe pas.';
    }

    toast({
      title: 'Erreur',
      description,
      variant: 'destructive',
    });
  };

  // Fetch prompts with filtering
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
      showErrorToast(error, 'charger les prompts');
    } finally {
      setLoading(false);
    }
  };

  // Create optimistic prompt for immediate UI feedback
  const createOptimisticPrompt = (promptData: CreatePromptData): Prompt => ({
    id: `temp-${Date.now()}`,
    workspace_id: workspaceId!,
    title: promptData.title.trim(),
    description: promptData.description?.trim() || null,
    status: promptData.status || 'todo',
    priority: promptData.priority || 2,
    order_index: 0,
    epic_id: promptData.epic_id || null,
    product_id: promptData.product_id || null,
    generated_prompt: promptData.generated_prompt || null,
    generated_at: promptData.generated_at || null,
    is_debug_session: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Prepare database payload from prompt data
  const createDatabasePayload = (promptData: CreatePromptData) => ({
    workspace_id: workspaceId!,
    title: promptData.title.trim(),
    description: promptData.description?.trim() || undefined,
    status: promptData.status || 'todo',
    priority: promptData.priority || 2,
    epic_id: promptData.epic_id || undefined,
    product_id: promptData.product_id || undefined,
    generated_prompt: promptData.generated_prompt || undefined,
    generated_at: promptData.generated_at || undefined,
    order_index: 0,
  });

  // Auto-generate prompt if content is sufficient
  const autoGeneratePrompt = async (promptId: string, content: string) => {
    try {
      const cleanContent = stripHtmlAndNormalize(content);
      
      // Only auto-generate if we have sufficient content (more than just a title)
      if (cleanContent.length > 20) {
        console.log('Auto-generating prompt for sufficient content:', cleanContent.length, 'characters');
        
        // Step 1: Update status to 'generating'
        await withOptimisticUpdate(
          (prev) => prev.map(p => 
            p.id === promptId 
              ? { ...p, status: 'generating' as PromptStatus, updated_at: new Date().toISOString() }
              : p
          ),
          async () => {
            const { error } = await supabase
              .from('prompts')
              .update({
                status: 'generating',
                updated_at: new Date().toISOString(),
              })
              .eq('id', promptId);

            if (error) throw error;
          },
          (prev) => prev.map(p => 
            p.id === promptId 
              ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
              : p
          )
        );
        
        // Step 2: Call the transform service
        const response = await PromptTransformService.transformPrompt(content);
        
        if (response.success && response.transformedPrompt) {
          // Step 3: Update with generated content and change status back to 'todo'
          await withOptimisticUpdate(
            (prev) => prev.map(p => 
              p.id === promptId 
                ? { 
                    ...p, 
                    generated_prompt: response.transformedPrompt,
                    generated_at: new Date().toISOString(),
                    status: 'todo' as PromptStatus,
                    updated_at: new Date().toISOString()
                  }
                : p
            ),
            async () => {
              const { error } = await supabase
                .from('prompts')
                .update({
                  generated_prompt: response.transformedPrompt,
                  generated_at: new Date().toISOString(),
                  status: 'todo',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', promptId);

              if (error) throw error;
            },
            (prev) => prev.map(p => 
              p.id === promptId 
                ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
                : p
            )
          );
          
          console.log('Auto-generated prompt successfully for prompt:', promptId);
          toast({
            title: "Prompt généré !",
            description: "Le prompt a été transformé et est maintenant prêt à être utilisé.",
          });
        } else {
          // Failed to generate - revert status to 'todo'
          await withOptimisticUpdate(
            (prev) => prev.map(p => 
              p.id === promptId 
                ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
                : p
            ),
            async () => {
              const { error } = await supabase
                .from('prompts')
                .update({
                  status: 'todo',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', promptId);

              if (error) throw error;
            },
            (prev) => prev.map(p => 
              p.id === promptId 
                ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
                : p
            )
          );
        }
      }
    } catch (error) {
      console.log('Auto-generation failed:', error);
      
      // On error, revert status to 'todo'
      try {
        await withOptimisticUpdate(
          (prev) => prev.map(p => 
            p.id === promptId 
              ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
              : p
          ),
          async () => {
            const { error } = await supabase
              .from('prompts')
              .update({
                status: 'todo',
                updated_at: new Date().toISOString(),
              })
              .eq('id', promptId);

            if (error) throw error;
          },
          (prev) => prev.map(p => 
            p.id === promptId 
              ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
              : p
          )
        );
      } catch (revertError) {
        console.error('Failed to revert status after generation error:', revertError);
      }
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le prompt. Veuillez réessayer.",
      });
    }
  };

  // Insert prompt into database
  const insertPromptToDatabase = async (promptData: CreatePromptData) => {
    const payload = createDatabasePayload(promptData);
    
    const { data, error } = await supabase
      .from('prompts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { ...data, status: data.status as PromptStatus };
  };

  // Handle post-creation tasks (XP, auto-generation, toast)
  const handlePostCreationTasks = async (prompt: Prompt, title: string) => {
    // Auto-generate prompt if we have description content
    if (prompt.description) {
      // Don't await this - let it run in background
      autoGeneratePrompt(prompt.id, prompt.description);
    }

    // Award XP for creating a prompt
    awardXP('PROMPT_CREATE');

    // Success notification
    toast({
      title: 'Prompt créé',
      description: `"${title}" a été créé avec succès`,
    });
  };

  // Create prompt with optimistic update and auto-generation
  const createPrompt = async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId) return null;

    const optimisticPrompt = createOptimisticPrompt(promptData);

    try {
      const realPrompt = await withOptimisticUpdate(
        // Optimistic update - add immediately to UI
        prev => [optimisticPrompt, ...prev],
        // Database operation
        () => insertPromptToDatabase(promptData),
        // Rollback - remove optimistic prompt
        prev => prev.filter(p => p.id !== optimisticPrompt.id)
      );

      if (!realPrompt) throw new Error('Failed to create prompt');

      // Replace optimistic prompt with real data
      setPrompts(prev => prev.map(p => p.id === optimisticPrompt.id ? realPrompt : p));

      // Handle post-creation tasks
      await handlePostCreationTasks(realPrompt, promptData.title);

      return realPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      showErrorToast(error, 'créer le prompt');
      return null;
    }
  };

  // Update prompt status with optimistic update
  const updatePromptStatus = async (promptId: string, status: PromptStatus): Promise<void> => {
    const updateData = { status, updated_at: new Date().toISOString() };

    try {
      await withOptimisticUpdate(
        // Optimistic update
        prev => prev.map(p => p.id === promptId ? { ...p, ...updateData } : p),
        // Database operation
        async () => {
          const { error } = await supabase
            .from('prompts')
            .update({ status })
            .eq('id', promptId);
          if (error) throw error;
        },
        // Rollback - refetch all data
        () => { fetchPrompts(); return []; }
      );

      // Award XP for completing a prompt
      if (status === 'done') {
        awardXP('PROMPT_COMPLETE');
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      showErrorToast(error, 'mettre à jour le statut');
    }
  };

  // Update prompt priority with optimistic update
  const updatePromptPriority = async (promptId: string, priority: number): Promise<void> => {
    const updateData = { priority, updated_at: new Date().toISOString() };

    try {
      await withOptimisticUpdate(
        // Optimistic update
        prev => prev.map(p => p.id === promptId ? { ...p, ...updateData } : p),
        // Database operation
        async () => {
          const { error } = await supabase
            .from('prompts')
            .update({ priority })
            .eq('id', promptId);
          if (error) throw error;
        },
        // Rollback - refetch all data
        () => { fetchPrompts(); return []; }
      );

      toast({
        title: 'Succès',
        description: 'Priorité mise à jour',
      });
    } catch (error) {
      console.error('Error updating prompt priority:', error);
      showErrorToast(error, 'mettre à jour la priorité');
    }
  };

  // Create duplicate prompt data
  const createDuplicatePromptData = (original: Prompt): Omit<Prompt, 'id'> => ({
    workspace_id: original.workspace_id,
    title: `${original.title} (Copy)`,
    description: original.description,
    status: 'todo',
    priority: original.priority,
    epic_id: original.epic_id,
    product_id: original.product_id,
    order_index: 0,
    generated_prompt: original.generated_prompt,
    generated_at: original.generated_at,
    is_debug_session: original.is_debug_session || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Duplicate prompt with optimistic update
  const duplicatePrompt = async (prompt: Prompt): Promise<void> => {
    const duplicateData = createDuplicatePromptData(prompt);
    const optimisticDuplicate: Prompt = { ...duplicateData, id: `temp-${Date.now()}` };

    try {
      const realPrompt = await withOptimisticUpdate(
        // Optimistic update - add duplicate immediately
        prev => [optimisticDuplicate, ...prev],
        // Database operation
        async () => {
          const { data, error } = await supabase
            .from('prompts')
            .insert(duplicateData)
            .select()
            .single();
          if (error) throw error;
          return { ...data, status: data.status as PromptStatus };
        },
        // Rollback - remove optimistic duplicate
        prev => prev.filter(p => p.id !== optimisticDuplicate.id)
      );

      if (!realPrompt) throw new Error('Failed to duplicate prompt');

      // Replace optimistic duplicate with real data
      setPrompts(prev => prev.map(p => p.id === optimisticDuplicate.id ? realPrompt : p));

      toast({
        title: 'Prompt dupliqué',
        description: 'Une copie a été créée'
      });
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      showErrorToast(error, 'dupliquer le prompt');
    }
  };

  // Delete prompt with optimistic update
  const deletePrompt = async (promptId: string): Promise<void> => {
    const promptToDelete = prompts.find(p => p.id === promptId);

    try {
      await withOptimisticUpdate(
        // Optimistic update - remove immediately
        prev => prev.filter(p => p.id !== promptId),
        // Database operation
        async () => {
          const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', promptId);
          if (error) throw error;
        },
        // Rollback - restore deleted prompt
        prev => promptToDelete ? [promptToDelete, ...prev] : prev
      );

      toast({
        title: 'Prompt supprimé',
        description: 'Le prompt a été supprimé'
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      showErrorToast(error, 'supprimer le prompt');
    }
  };

  // Update prompt with optimistic update and auto-generation
  const updatePrompt = async (promptId: string, updates: Partial<Prompt>): Promise<void> => {
    const updateData = { ...updates, updated_at: new Date().toISOString() };

    try {
      await withOptimisticUpdate(
        // Optimistic update
        prev => prev.map(p => p.id === promptId ? { ...p, ...updateData } : p),
        // Database operation
        async () => {
          const { error } = await supabase
            .from('prompts')
            .update(updateData)
            .eq('id', promptId);
          if (error) throw error;
        },
        // Rollback - refetch all data
        () => { fetchPrompts(); return []; }
      );

      // Auto-generate prompt if description was updated and has sufficient content
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
      showErrorToast(error, 'mettre à jour le prompt');
    }
  };

  // Handle real-time subscription events
  const handleRealtimeEvent = (payload: any) => {
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
          // Update existing prompt, preserving important fields if not explicitly updated
          return prevPrompts.map(prompt => {
            if (prompt.id === newRecord.id && !prompt.id.startsWith('temp-')) {
              // Preserve generated_prompt and generated_at if they exist but are not in the update
              const preservedFields: Partial<Prompt> = {};
              
              if (prompt.generated_prompt && !newRecord.generated_prompt) {
                preservedFields.generated_prompt = prompt.generated_prompt;
              }
              
              if (prompt.generated_at && !newRecord.generated_at) {
                preservedFields.generated_at = prompt.generated_at;
              }
              
              const updatedPrompt = { 
                ...prompt, 
                ...newRecord, 
                ...preservedFields,
                status: newRecord.status as PromptStatus 
              };
              
              console.log('Real-time UPDATE:', {
                promptId: newRecord.id,
                hadGeneratedPrompt: !!prompt.generated_prompt,
                updateHasGeneratedPrompt: !!newRecord.generated_prompt,
                preserved: Object.keys(preservedFields)
              });
              
              return updatedPrompt;
            }
            return prompt;
          });

        case 'DELETE':
          // Remove deleted prompt
          return prevPrompts.filter(p => p.id !== oldRecord.id);
      }
      return prevPrompts;
    });
  };

  // Set up real-time subscription and initial fetch
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
      }, handleRealtimeEvent)
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