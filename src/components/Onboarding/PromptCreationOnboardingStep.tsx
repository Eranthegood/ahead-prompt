import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, CheckCircle, Sparkles, Clock, Target, Palette, Bot, Loader2 } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { useToast } from '@/hooks/use-toast';
import { LinearActionButtons } from '@/components/ui/linear-buttons';
import { useLinearPromptCreator } from '@/hooks/useLinearPromptCreator';

interface PromptCreationOnboardingStepProps {
  productId: string;
  onPromptCreated: (promptId: string) => void;
}

export function PromptCreationOnboardingStep({ 
  productId, 
  onPromptCreated 
}: PromptCreationOnboardingStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdPromptTitle, setCreatedPromptTitle] = useState('');

  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);
  const { epics } = useEpics(workspace?.id, productId);
  const { knowledgeItems } = useKnowledge(workspace?.id, productId);
  const { createPrompt } = usePrompts(workspace?.id, productId);
  const { toast } = useToast();
  
  const {
    title,
    setTitle,
    priority,
    setPriority,
    selectedProduct,
    setSelectedProduct,
    selectedEpic,
    setSelectedEpic,
    providerConfig,
    setProviderConfig,
    selectedKnowledge,
    setSelectedKnowledge,
    resetForm
  } = useLinearPromptCreator({
    selectedProductId: productId,
  });


  const handleCreatePrompt = async () => {
    if (!title.trim() || !workspace || isCreating) return;

    setIsCreating(true);
    try {
      const prompt = await createPrompt({
        title: title.trim(),
        original_description: title.trim().length < 16 ? `${title.trim()} - Générer un prompt détaillé à partir de cette idée` : title.trim(),
        product_id: selectedProduct || productId,
        epic_id: selectedEpic,
        status: 'todo',
        priority,
        ai_provider: providerConfig.provider,
        ai_model: providerConfig.model,
        knowledge_context: selectedKnowledge.map(item => item.id),
      });

      if (prompt) {
        setIsCreated(true);
        setCreatedPromptTitle(title);
        toast({
          title: "Prompt créé et génération lancée !",
          description: "L'IA génère un prompt détaillé en arrière-plan",
        });
        // Notify the app to refresh prompts and select the new one
        window.dispatchEvent(new CustomEvent('prompt-created', { detail: { promptId: prompt.id, productId: selectedProduct || productId } }));
        onPromptCreated(prompt.id);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le prompt",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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


      {/* Interface de création intégrée */}
      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="pb-4">
          <Label className="text-base font-medium">Interface de création complète</Label>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Titre du prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt-title">Titre du prompt *</Label>
            <Input
              id="prompt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Ajouter authentification utilisateur"
              maxLength={100}
              className="text-base"
            />
          </div>

          {/* Boutons d'action linéaires */}
          <div className="space-y-2">
            <Label>Options avancées</Label>
            <LinearActionButtons
              priority={priority}
              onPriorityChange={setPriority}
              selectedProduct={selectedProduct}
              onProductChange={setSelectedProduct}
              selectedEpic={selectedEpic}
              onEpicChange={setSelectedEpic}
              providerConfig={providerConfig}
              onProviderChange={setProviderConfig}
              selectedKnowledge={selectedKnowledge}
              onKnowledgeChange={setSelectedKnowledge}
              products={products || []}
              epics={epics || []}
              knowledgeItems={knowledgeItems || []}
              onCreateProduct={() => {}}
              onCreateEpic={() => {}}
              onExpandToggle={() => {}}
            />
          </div>

          {/* Bouton de création */}
          <Button
            onClick={handleCreatePrompt}
            disabled={!title.trim() || isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création et génération...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Créer le prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Conseil d'utilisation */}
      <div className="bg-accent/20 p-3 rounded-lg">
        <p className="text-sm">
          💡 <strong>Raccourci :</strong> Utilisez <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Q</kbd> pour ouvrir cette interface rapidement !
        </p>
      </div>
    </div>
  );
}