import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useAuth } from '@/hooks/useAuth';
import { useMixpanelContext } from '@/components/MixpanelProvider';
import { PromptTransformService, stripHtmlAndNormalize } from '@/services/promptTransformService';
import { RedditPixelService } from '@/services/redditPixelService';
import { useAgentAutomation } from '@/hooks/useAgentAutomation';
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
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

export const usePrompts = (workspaceId?: string, selectedProductId?: string, selectedEpicId?: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { awardXP } = useGamification();
  const { knowledgeItems } = useKnowledge(workspaceId || '', selectedProductId);
  const { trackPromptCreated, trackPromptCompleted } = useMixpanelContext();
  const { user } = useAuth();
  const { triggerWorkflowAutomation } = useAgentAutomation();

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
    let description = `Erreur impossible de sauvegarder la modification. ${context}. Veuillez réessayer.`;
    
    if (error.message?.includes('epic_id')) {
      description = 'L\'epic sélectionné n\'existe pas.';
    } else if (error.message?.includes('product_id')) {
      description = 'Le produit sélectionné n\'existe pas.';
    } else if (error.message?.includes('workspace_id')) {
      description = 'Workspace invalide.';
    } else if (error.message?.includes('title')) {
      description = 'Le titre est requis.';
    }

    console.error(`Error in ${context}:`, error);

    toast({
      title: 'Erreur',
      description,
      variant: 'destructive',
    });
  };

  // Clean up stuck prompts in 'generating' status that already have generated content
  const cleanupStuckGeneratingPrompts = async (prompts: Prompt[]) => {
    const stuckPrompts = prompts.filter(p => 
      p.status === 'generating' && 
      p.generated_prompt && 
      p.generated_prompt.trim().length > 0
    );

    if (stuckPrompts.length > 0) {
      console.log(`Found ${stuckPrompts.length} stuck prompts in generating status, fixing...`, stuckPrompts.map(p => p.id));
      
      // Fix each stuck prompt individually to avoid batch failures
      for (const prompt of stuckPrompts) {
        try {
          const { error } = await supabase
            .from('prompts')
            .update({ 
              status: 'todo',
              updated_at: new Date().toISOString()
            })
            .eq('id', prompt.id);
          
          if (error) {
            console.error(`Failed to fix stuck prompt ${prompt.id}:`, error);
          } else {
            console.log(`Fixed stuck prompt: ${prompt.id}`);
          }
        } catch (error) {
          console.error(`Error fixing stuck prompt ${prompt.id}:`, error);
        }
      }
      
      // Show notification if any prompts were fixed
      if (stuckPrompts.length > 0) {
        toast({
          title: "Prompts corrigés",
          description: `${stuckPrompts.length} prompt(s) bloqué(s) en génération ont été réparés.`,
        });
      }
    }
  };

  // Fetch prompts with filtering and cleanup
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
      
      const processedPrompts = (data || []).map(p => ({ ...p, status: p.status as PromptStatus }));
      setPrompts(processedPrompts);

      // Clean up any stuck prompts after loading
      await cleanupStuckGeneratingPrompts(processedPrompts);
      
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
  });

  // Prepare database payload from prompt data
  const createDatabasePayload = (promptData: CreatePromptData) => {
    const payload = {
      workspace_id: workspaceId!,
      title: promptData.title.trim(),
      description: promptData.description?.trim() || null,
      status: promptData.status || 'todo',
      priority: promptData.priority || 2,
      epic_id: promptData.epic_id || null,
      product_id: promptData.product_id || null,
      generated_prompt: promptData.generated_prompt || null,
      generated_at: promptData.generated_at || null,
      order_index: 0,
    };
    
    console.log('CreateDatabasePayload: Generated payload:', payload);
    return payload;
  };

  // Automatically generate prompt using AI service with knowledge context
  const autoGeneratePrompt = async (
    promptId: string, 
    content: string, 
    knowledgeContext?: string[],
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ) => {
    const cleanContent = stripHtmlAndNormalize(content);
    
    console.log(`Auto-generating prompt for: ${promptId}, content length: ${cleanContent.length}`);
    
    try {
      // Only auto-generate if content is substantial
      if (cleanContent.length > 15) {
        // Step 1: Set status to generating
        console.log(`Step 1: Setting generating status for prompt ${promptId}`);
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

            if (error) {
              console.error(`Failed to set generating status for prompt ${promptId}:`, error);
              throw error;
            }
            console.log(`Successfully set generating status for prompt ${promptId}`);
          },
          (prev) => prev.map(p => 
            p.id === promptId 
              ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
              : p
          )
        );
        
        // Step 2: Get selected knowledge items and call the transform service
        console.log(`Step 2: Calling transform service for prompt ${promptId}`);
        const selectedKnowledgeItems = knowledgeContext 
          ? knowledgeItems.filter(item => knowledgeContext.includes(item.id))
          : [];
          
        console.log(`Including ${selectedKnowledgeItems.length} knowledge items in transformation`);
        
        const response = await Promise.race([
          PromptTransformService.transformPrompt(content, selectedKnowledgeItems, provider, model),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transform timeout')), 30000)
          )
        ]) as any;
        
        if (response.success && response.transformedPrompt) {
          // Step 3: Update with generated content and change status back to 'todo'
          console.log(`Step 3: Updating with generated content and setting todo status for prompt ${promptId}`);
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
              // Update in two separate calls to ensure robustness
              const { error: contentError } = await supabase
                .from('prompts')
                .update({
                  generated_prompt: response.transformedPrompt,
                  generated_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', promptId);

              if (contentError) {
                console.error(`Failed to update content for prompt ${promptId}:`, contentError);
                throw contentError;
              }

              // Separate status update to ensure it happens
              const { error: statusError } = await supabase
                .from('prompts')
                .update({
                  status: 'todo',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', promptId);

              if (statusError) {
                console.error(`Failed to update status to todo for prompt ${promptId}:`, statusError);
                throw statusError;
              }
              
              console.log(`Successfully completed auto-generation for prompt ${promptId}`);
            },
            (prev) => prev.map(p => 
              p.id === promptId 
                ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
                : p
            )
          );
          
          console.log(`Auto-generated prompt successfully for prompt: ${promptId}`);
          toast({
            title: "Prompt généré !",
            description: "Le prompt a été transformé et est maintenant prêt à être utilisé.",
          });
        } else {
          // Failed to generate - revert status to 'todo'
          console.log(`Transform failed for prompt ${promptId}, reverting to todo`);
          await revertStatusToTodo(promptId, "Transform service failed");
        }
      } else {
        console.log(`Content too short for auto-generation: ${cleanContent.length} characters`);
      }
    } catch (error) {
      console.error(`Auto-generation failed for prompt ${promptId}:`, error);
      await revertStatusToTodo(promptId, `Auto-generation error: ${error.message}`);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le prompt. Veuillez réessayer.",
      });
    }
  };

  // Helper function to revert status to 'todo' with enhanced error handling
  const revertStatusToTodo = async (promptId: string, reason: string) => {
    console.log(`Reverting status to 'todo' for prompt ${promptId}. Reason: ${reason}`);
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

          if (error) {
            console.error(`Failed to revert status for prompt ${promptId}:`, error);
            throw error;
          }
          console.log(`Successfully reverted status to 'todo' for prompt ${promptId}`);
        },
        (prev) => prev.map(p => 
          p.id === promptId 
            ? { ...p, status: 'generating' as PromptStatus, updated_at: new Date().toISOString() }
            : p
        )
      );
    } catch (revertError) {
      console.error(`Failed to revert status after generation error for prompt ${promptId}:`, revertError);
      // As a last resort, try a direct update without optimistic handling
      try {
        const { error } = await supabase
          .from('prompts')
          .update({ status: 'todo', updated_at: new Date().toISOString() })
          .eq('id', promptId);
        
        if (error) {
          console.error(`Last resort revert failed for prompt ${promptId}:`, error);
        } else {
          console.log(`Last resort revert succeeded for prompt ${promptId}`);
        }
      } catch (lastResortError) {
        console.error(`Last resort revert also failed for prompt ${promptId}:`, lastResortError);
      }
    }
  };

  // Insert prompt into database
  const insertPromptToDatabase = async (promptData: CreatePromptData) => {
    const payload = createDatabasePayload(promptData);
    console.log('InsertPrompt: Database payload:', payload);
    
    const { data, error } = await supabase
      .from('prompts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('InsertPrompt: Database error:', error);
      throw error;
    }
    
    console.log('InsertPrompt: Database response:', data);
    return { ...data, status: data.status as PromptStatus };
  };

  // Handle post-creation tasks (XP, auto-generation, toast)
  const handlePostCreationTasks = async (prompt: Prompt, title: string, promptData: CreatePromptData) => {
    // Auto-generate prompt if we have description content
    if (prompt.description) {
      // Don't await this - let it run in background
      autoGeneratePrompt(
        prompt.id, 
        prompt.description, 
        promptData.knowledge_context,
        promptData.ai_provider || 'openai',
        promptData.ai_model
      );
    }

    // Award XP for creating a prompt
    awardXP('PROMPT_CREATE');

    // Track prompt creation
    trackPromptCreated({
      promptId: prompt.id,
      productId: prompt.product_id || undefined,
      epicId: prompt.epic_id || undefined,
      priority: prompt.priority
    });

    // Track Reddit conversion for prompt creation
    if (user?.id) {
      console.log('[Reddit Tracking] Prompt created, tracking client-side');
      RedditPixelService.trackPromptCreated(prompt.id, user.id);
    }

    // Success notification
    toast({
      title: 'Prompt créé',
      description: `"${title}" a été créé avec succès`,
    });
  };

  // Create prompt with optimistic update and auto-generation
  const createPrompt = async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId) {
      console.error('CreatePrompt: No workspace ID provided');
      return null;
    }

    console.log('CreatePrompt: Starting with data:', promptData);

    // Validate required fields
    if (!promptData.title || promptData.title.trim().length === 0) {
      console.error('CreatePrompt: Title is required');
      showErrorToast(new Error('Title is required'), 'créer le prompt');
      return null;
    }

    const optimisticPrompt = createOptimisticPrompt(promptData);
    console.log('CreatePrompt: Created optimistic prompt:', optimisticPrompt);

    try {
      const realPrompt = await withOptimisticUpdate(
        // Optimistic update - add immediately to UI
        prev => {
          console.log('CreatePrompt: Adding optimistic prompt to UI');
          return [optimisticPrompt, ...prev];
        },
        // Database operation
        async () => {
          console.log('CreatePrompt: Inserting to database');
          return await insertPromptToDatabase(promptData);
        },
        // Rollback - remove optimistic prompt
        prev => {
          console.log('CreatePrompt: Rolling back optimistic update');
          return prev.filter(p => p.id !== optimisticPrompt.id);
        }
      );

      if (!realPrompt) {
        console.error('CreatePrompt: Database operation returned null');
        throw new Error('Failed to create prompt');
      }

      console.log('CreatePrompt: Successfully created prompt:', realPrompt);

      // Replace optimistic prompt with real data
      setPrompts(prev => prev.map(p => p.id === optimisticPrompt.id ? realPrompt : p));

      // Handle post-creation tasks
      await handlePostCreationTasks(realPrompt, promptData.title, promptData);

      return realPrompt;
    } catch (error) {
      console.error('CreatePrompt: Error creating prompt:', error);
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
        
        // Track prompt completion
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
          trackPromptCompleted({
            promptId: promptId,
            completionTime: prompt.created_at ? 
              Math.round((new Date().getTime() - new Date(prompt.created_at).getTime()) / (1000 * 60)) : 
              undefined
          });
        }
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

  // Update prompt silently without toast notifications
  const updatePromptSilently = async (promptId: string, updates: Partial<Prompt>): Promise<void> => {
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
    } catch (error) {
      console.error('Error updating prompt silently:', error);
      throw error; // Let caller handle the error
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
    updatePromptSilently,
    refetch: fetchPrompts,
    cleanupStuckGeneratingPrompts: () => cleanupStuckGeneratingPrompts(prompts),
  };
};