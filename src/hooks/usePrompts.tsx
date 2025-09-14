// Optimized usePrompts hook combining data, actions, and generation
import { usePromptsData } from './usePromptsData';
import { usePromptsActions } from './usePromptsActions';
import { usePromptsGeneration } from './usePromptsGeneration';
import { supabase } from '@/integrations/supabase/client';

export interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  status?: 'todo' | 'in_progress' | 'done' | 'generating';
  priority?: number;
  epic_id?: string;
  product_id?: string;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

export const usePrompts = (
  workspaceId?: string, 
  selectedProductId?: string, 
  selectedEpicId?: string
) => {
  // Get data hook
  const { 
    prompts, 
    allPrompts, 
    loading, 
    refetch, 
    setPrompts 
  } = usePromptsData(workspaceId, selectedProductId, selectedEpicId);

  // Get actions hook
  const {
    createPrompt,
    updatePromptStatus,
    deletePrompt,
    withOptimisticUpdate
  } = usePromptsActions(workspaceId, allPrompts, setPrompts, refetch);

  // Get generation hook
  const {
    autoGeneratePrompt,
    revertStatusToTodo
  } = usePromptsGeneration(workspaceId, selectedProductId, allPrompts, setPrompts);

  // Legacy methods for backward compatibility
  const updatePrompt = async (promptId: string, updates: Partial<any>) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
    
    // Implement actual database update
    try {
      await supabase
        .from('prompts')
        .update(updates)
        .eq('id', promptId);
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  };

  const updatePromptPriority = async (promptId: string, priority: number) => {
    return updatePrompt(promptId, { priority });
  };

  const duplicatePrompt = async (prompt: any): Promise<void> => {
    // Handle both string and Prompt object for backward compatibility
    const promptId = typeof prompt === 'string' ? prompt : prompt.id;
    const originalPrompt = allPrompts.find(p => p.id === promptId);
    if (!originalPrompt) return;

    await createPrompt({
      title: `${originalPrompt.title} (copy)`,
      description: originalPrompt.description || undefined,
      priority: originalPrompt.priority,
      epic_id: originalPrompt.epic_id || undefined,
      product_id: originalPrompt.product_id || undefined,
    });
  };

  const cleanupStuckGeneratingPrompts = async () => {
    // This is now handled in usePromptsData
    console.log('Cleanup handled automatically in data hook');
  };

  return {
    prompts,
    loading,
    createPrompt,
    updatePromptStatus: async (promptId: string, status: any) => {
      updatePromptStatus(promptId, status);
    },
    updatePromptPriority,
    duplicatePrompt,
    deletePrompt,
    updatePrompt,
    autoGeneratePrompt,
    revertStatusToTodo,
    cleanupStuckGeneratingPrompts,
    refetch,
    withOptimisticUpdate
  };
};