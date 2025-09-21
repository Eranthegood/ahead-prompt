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
      {/* Message principal simplifié */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Créez votre premier prompt</h3>
          <p className="text-muted-foreground">
            Écrivez simplement votre idée, l'IA génère le prompt parfait
          </p>
        </div>
      </div>

      {/* Zone de création simplifiée */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6 space-y-4">
          {/* Input principal mis en avant */}
          <div className="space-y-3">
            <Label htmlFor="prompt-idea" className="text-lg font-medium">
              Quelle est votre idée ?
            </Label>
            <Input
              id="prompt-idea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Ajouter une page de connexion"
              className="text-lg h-12 text-center"
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground text-center">
              C'est tout ! L'IA va transformer cette idée en prompt détaillé et prêt à utiliser.
            </p>
          </div>

          {/* Exemples rapides */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Ou choisissez un exemple :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestionExamples.map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bouton de création principal */}
          <Button
            onClick={handleCreatePrompt}
            disabled={!title.trim() || isCreating}
            className="w-full h-12"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                L'IA génère votre prompt...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Générer le prompt parfait
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Message de motivation */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg text-center">
        <p className="text-sm">
          <strong>✨ Magie de l'IA :</strong> Vous donnez l'idée, on fait le reste !
        </p>
      </div>
    </div>
  );
}