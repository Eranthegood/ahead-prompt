import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { LinearPromptCreator } from '@/components/LinearPromptCreator';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { useToast } from '@/hooks/use-toast';
import { useEventEmitter } from '@/hooks/useEventManager';
interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  epic_id?: string;
  product_id?: string;
  priority?: number;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

interface OnboardingPromptCreatorProps {
  productId: string;
  onPromptCreated: (promptId: string) => void;
}

export function OnboardingPromptCreator({ 
  productId, 
  onPromptCreated 
}: OnboardingPromptCreatorProps) {
  const [isCreated, setIsCreated] = useState(false);
  const [createdPromptTitle, setCreatedPromptTitle] = useState('');

  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);
  const { epics } = useEpics(workspace?.id, productId);
  // Use shared PromptsContext to avoid state desync with the main list
  const promptsCtx = require('@/context/PromptsContext').usePromptsContext?.();
  const { createPrompt } = (promptsCtx || usePrompts(workspace?.id, productId)) as { createPrompt: (data: CreatePromptData) => Promise<any> };
  const { toast } = useToast();

  const emit = useEventEmitter();
  
  const handleSave = async (promptData: CreatePromptData) => {
    try {
      const prompt = await createPrompt(promptData);
      
      if (prompt) {
        setIsCreated(true);
        setCreatedPromptTitle(promptData.title);
        
        toast({
          title: "Prompt créé et génération lancée !",
          description: "L'IA génère un prompt détaillé en arrière-plan",
        });
        
        // Notify the app to refresh prompts and select the new one
        emit('prompt-created', { 
          promptId: prompt.id, productId: promptData.product_id || productId 
        });
        
        onPromptCreated(prompt.id);
        return prompt;
      }
    } catch (error) {
      console.error('💥 Onboarding createPrompt error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le prompt",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (isCreated) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Premier prompt créé !</h3>
          <p className="text-muted-foreground">
            <strong>"{createdPromptTitle}"</strong> est maintenant dans votre workspace
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-accent-foreground bg-accent/20 px-3 py-2 rounded-lg">
          <Sparkles className="h-4 w-4" />
          <span>L'IA génère un prompt détaillé pour vous...</span>
          <Clock className="h-4 w-4 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre et explication */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Créez votre premier prompt</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Saisissez une idée simple, l'IA va la transformer en prompt détaillé.
        </p>
      </div>

      {/* Conseil d'utilisation */}
      <div className="bg-accent/20 p-3 rounded-lg">
        <p className="text-sm">
          💡 <strong>Raccourci :</strong> Utilisez <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Q</kbd> pour ouvrir cette interface rapidement après l'onboarding !
        </p>
      </div>

      {/* LinearPromptCreator - même composant que l'app normale, ouvert par défaut */}
      {workspace && (
        <LinearPromptCreator
          isOpen={true}
          onClose={() => {}} // Pas de fermeture possible pendant l'onboarding
          onSave={handleSave}
          workspace={workspace}
          products={products || []}
          epics={epics || []}
          selectedProductId={productId}
        />
      )}
    </div>
  );
}