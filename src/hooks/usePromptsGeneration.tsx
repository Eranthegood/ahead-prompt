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

  // 🚨 CRITICAL FUNCTION - DO NOT MODIFY WITHOUT READING PROMPT_GENERATION_CRITICAL.md
  // This function handles local AI generation after dialog close
  // Must complete generating → todo transition in < 5 seconds
  const autoGeneratePrompt = useCallback(async (
    promptId: string, 
    content: string, 
    knowledgeContext?: string[],
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ) => {
    const cleanContent = stripHtmlAndNormalize(content);
    
    if (cleanContent.length <= 15) {
      console.warn('❌ Content too short after cleaning:', { 
        promptId,
        original: content, 
        cleaned: cleanContent,
        threshold: 15
      });
      return;
    }

    console.log(`🤖 [autoGeneratePrompt] Starting generation for prompt: ${promptId}`, {
      contentLength: cleanContent.length,
      provider,
      model,
      knowledgeContext: knowledgeContext?.length || 0
    });
    
    // Step 0: Initial toast
    toast({
      title: "🤖 Génération en cours...",
      description: "Votre prompt est en cours de transformation par l'IA.",
    });
    
    try {
      // Check current status first
      const currentPrompt = prompts.find(p => p.id === promptId);
      console.log(`🔍 [autoGeneratePrompt] Current prompt status:`, {
        promptId,
        currentStatus: currentPrompt?.status,
        promptExists: !!currentPrompt
      });

      // Step 1: Ensure generating status (may already be set)
      if (currentPrompt?.status !== 'generating') {
        console.log(`📝 [autoGeneratePrompt] Setting status to generating for ${promptId}`);
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, status: 'generating' as PromptStatus, updated_at: new Date().toISOString() }
            : p
        ));

        const { error: statusError } = await supabase
          .from('prompts')
          .update({
            status: 'generating',
            updated_at: new Date().toISOString(),
          })
          .eq('id', promptId);

        if (statusError) {
          console.error(`❌ [autoGeneratePrompt] Failed to set generating status:`, statusError);
          throw statusError;
        }
      } else {
        console.log(`✅ [autoGeneratePrompt] Prompt already in generating status`);
      }

      // Step 2: Transform content
      const selectedKnowledgeItems = knowledgeContext 
        ? knowledgeItems.filter(item => knowledgeContext.includes(item.id))
        : [];

      console.log('🚀 [autoGeneratePrompt] Starting AI transformation:', {
        promptId,
        provider,
        model,
        contentLength: cleanContent.length,
        knowledgeItemsCount: selectedKnowledgeItems.length
      });
        
      const response = await Promise.race([
        PromptTransformService.transformPrompt(content, selectedKnowledgeItems, provider, model),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transform timeout')), 30000)
        )
      ]) as any;

      console.log('📥 [autoGeneratePrompt] AI transformation result:', {
        promptId,
        success: response.success,
        hasContent: !!response.transformedPrompt,
        contentLength: response.transformedPrompt?.length || 0,
        error: response.error
      });
      
      if (response.success && response.transformedPrompt) {
        console.log('💾 [autoGeneratePrompt] Updating prompt with generated content');
        
        // Step 3: Update with generated content
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { 
                ...p, 
                generated_prompt: response.transformedPrompt,
                generated_at: new Date().toISOString(),
                status: 'todo' as PromptStatus,
                updated_at: new Date().toISOString()
              }
            : p
        ));

        // Update database in one atomic call
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            generated_prompt: response.transformedPrompt,
            generated_at: new Date().toISOString(),
            status: 'todo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', promptId);

        if (updateError) {
          console.error('❌ [autoGeneratePrompt] Database update failed:', updateError);
          throw updateError;
        }
        
        console.log('✅ [autoGeneratePrompt] Generation completed successfully for:', promptId);
        
        toast({
          title: "✅ Prompt généré !",
          description: "Le prompt a été transformé et est maintenant prêt à être utilisé.",
        });
        
        // Notify provider/UI to refresh
        window.dispatchEvent(new CustomEvent('refetch-prompts'));


      } else {
        console.error('❌ [autoGeneratePrompt] Generation failed:', {
          promptId,
          success: response.success,
          hasTransformedPrompt: !!response.transformedPrompt,
          error: response.error || 'No transformed content received'
        });
        await revertStatusToTodo(promptId, "Transform service failed");
      }

    } catch (error: any) {
      console.error('💥 [autoGeneratePrompt] Generation error:', {
        promptId,
        error: error.message,
        stack: error.stack
      });
      await revertStatusToTodo(promptId, `Auto-generation error: ${error.message}`);
      
      toast({
        variant: "destructive",
        title: "❌ Erreur de génération",
        description: "Impossible de générer le prompt. Veuillez réessayer.",
      });
    }
  }, [setPrompts, knowledgeItems, toast, revertStatusToTodo]);

  return {
    autoGeneratePrompt,
    revertStatusToTodo
  };
};