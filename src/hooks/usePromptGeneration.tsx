import { useState } from 'react';
import { PromptTransformService } from '@/services/promptTransformService';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useToast } from '@/hooks/use-toast';

export interface UsePromptGenerationOptions {
  workspaceId: string;
  productId?: string;
}

export function usePromptGeneration({ workspaceId, productId }: UsePromptGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { knowledgeItems } = useKnowledge(workspaceId, productId);
  const { toast } = useToast();

  const generateWithKnowledge = async (
    rawIdea: string, 
    selectedKnowledgeIds: string[] = [],
    provider: 'openai' | 'claude' = 'openai',
    model?: string
  ) => {
    if (!rawIdea?.trim()) {
      throw new Error('Raw idea is required for generation');
    }

    setIsGenerating(true);
    try {
      // Filter selected knowledge items
      const selectedKnowledgeItems = knowledgeItems.filter(item =>
        selectedKnowledgeIds.includes(item.id)
      );

      console.log(`Generating prompt with ${selectedKnowledgeItems.length} knowledge items`);

      // Transform the prompt with knowledge context
      const result = await PromptTransformService.transformPrompt(
        rawIdea,
        selectedKnowledgeItems,
        provider,
        model
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate prompt');
      }

      // Show success toast with knowledge usage info
      if (selectedKnowledgeItems.length > 0) {
        toast({
          title: 'Prompt généré avec succès',
          description: `Utilisation de ${selectedKnowledgeItems.length} élément(s) de connaissance`,
          variant: 'default'
        });
      }

      return result.transformedPrompt;
    } catch (error) {
      console.error('Prompt generation failed:', error);
      toast({
        title: 'Erreur de génération',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWithKnowledge,
    isGenerating,
    availableKnowledgeCount: knowledgeItems.length
  };
}