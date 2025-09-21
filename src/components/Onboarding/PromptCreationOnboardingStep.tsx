import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useToast } from '@/hooks/use-toast';

interface PromptCreationOnboardingStepProps {
  productId: string;
  onPromptCreated: (promptId: string) => void;
}

export function PromptCreationOnboardingStep({ 
  productId, 
  onPromptCreated 
}: PromptCreationOnboardingStepProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdPromptTitle, setCreatedPromptTitle] = useState('');

  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { createPrompt } = usePrompts(workspace?.id, productId);
  const { toast } = useToast();

  const suggestionExamples = [
    "Ajouter authentification utilisateur",
    "Créer page d'accueil responsive",
    "Implémenter recherche avec filtres",
    "Optimiser performance API",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
    setDescription(`Implémentation complète de: ${suggestion.toLowerCase()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspace || isCreating) return;

    setIsCreating(true);
    try {
      const prompt = await createPrompt({
        title: title.trim(),
        description: description.trim() || undefined,
        product_id: productId,
        status: 'todo',
        priority: 1,
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Créons votre premier prompt</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Décrivez rapidement une idée. L'IA va la transformer en prompt détaillé !
        </p>
      </div>

      <div className="space-y-3">
        <Label>Ou choisissez un exemple :</Label>
        <div className="flex flex-wrap gap-2">
          {suggestionExamples.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-title">Titre du prompt *</Label>
              <Input
                id="prompt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Ajouter authentification utilisateur"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-description">Description (optionnel)</Label>
              <Textarea
                id="prompt-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires sur votre idée..."
                rows={3}
                maxLength={500}
              />
            </div>

            <Button
              type="submit"
              disabled={!title.trim() || isCreating}
              className="w-full"
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
          </form>
        </CardContent>
      </Card>

      <div className="bg-accent/20 p-3 rounded-lg">
        <p className="text-sm">
          ✨ <strong>Génération AI:</strong> Votre idée sera automatiquement transformée en prompt détaillé !
        </p>
      </div>
    </div>
  );
}