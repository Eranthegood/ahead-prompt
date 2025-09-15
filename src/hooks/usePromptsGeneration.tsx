import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useKnowledge } from '@/hooks/useKnowledge';
import { PromptTransformService, stripHtmlAndNormalize } from '@/services/promptTransformService';
import type { Prompt, PromptStatus } from '@/types';

export const usePromptsGeneration = (
  workspaceId: string | undefined,
  selectedProductId: string | undefined,
  prompts: Prompt[],
  setPrompts: (update: (prev: Prompt[]) => Prompt[]) => void
) => {
  const { toast } = useToast();
  const { knowledgeItems } = useKnowledge(workspaceId || '', selectedProductId);

  // Revert status helper
  const revertStatusToTodo = useCallback(async (promptId: string, reason: string) => {
    console.log(`Reverting status to 'todo' for prompt ${promptId}. Reason: ${reason}`);
    
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, status: 'todo' as PromptStatus, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          status: 'todo',
          updated_at: new Date().toISOString(),
        })
        .eq('id', promptId);

      if (error) {
        console.error(`Failed to revert status for prompt ${promptId}:`, error);
      }
    } catch (error) {
      console.error(`Error reverting status for prompt ${promptId}:`, error);
    }
  }, [setPrompts]);

  // Auto-generate prompt using background service
  const autoGeneratePrompt = useCallback(async (
    promptId: string, 
    content: string, 
    knowledgeContext?: string[],
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ) => {
    const cleanContent = stripHtmlAndNormalize(content);
    
    if (cleanContent.length <= 15) {
      console.log(`Content too short for auto-generation: ${cleanContent.length} characters`);
      return;
    }

    console.log(`Starting background generation for prompt: ${promptId}`);
    
    try {
      // Get knowledge items for context
      const selectedKnowledgeItems = knowledgeContext 
        ? knowledgeItems.filter(item => knowledgeContext.includes(item.id))
        : [];

      // Call background generation function - don't await, return immediately
      const { error } = await supabase.functions.invoke('generate-prompt-background', {
        body: { 
          promptId, 
          content: cleanContent, 
          knowledgeContext: selectedKnowledgeItems, 
          provider, 
          model 
        }
      });

      if (error) {
        console.error('Background generation invoke error:', error);
        throw error;
      }

      console.log('Background generation started successfully for prompt:', promptId);

    } catch (error: any) {
      console.error('Error starting background prompt generation:', error);
      
      // Revert status on immediate error
      await revertStatusToTodo(promptId, `Background generation start failed: ${error.message}`);
      
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de démarrer la génération. Le prompt reste disponible.",
      });
    }
  }, [knowledgeItems, toast, revertStatusToTodo]);

  return {
    autoGeneratePrompt,
    revertStatusToTodo
  };
};