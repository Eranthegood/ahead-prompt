import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const suggestionExamples = [
    "Ajouter authentification utilisateur",
    "Créer page d'accueil responsive", 
    "Implémenter recherche avec filtres",
    "Optimiser performance API",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
  };

  const handleCreatePrompt = async () => {
    if (!title.trim() || !workspace || isCreating) return;

    setIsCreating(true);
    try {
      const prompt = await createPrompt({
        title: title.trim(),
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
      {/* Message simple */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Créez votre premier prompt</h3>
        </div>
        <p className="text-muted-foreground">
          Décrivez simplement votre idée, l'IA génère le prompt parfait !
        </p>
      </div>

      {/* Exemples rapides */}
      <div className="space-y-2">
        <Label className="text-sm">Exemples d'idées :</Label>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestionExamples.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Création rapide */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt-title">Votre idée :</Label>
          <Input
            id="prompt-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Ajouter authentification utilisateur"
            maxLength={100}
            className="text-base"
          />
        </div>

        <Button
          onClick={handleCreatePrompt}
          disabled={!title.trim() || isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              L'IA génère...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Créer mon prompt
            </>
          )}
        </Button>
      </div>

      {/* Conseil simple */}
      <div className="text-center text-sm text-muted-foreground">
        💡 Raccourci : <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Q</kbd> pour créer rapidement
      </div>
    </div>
  );
}