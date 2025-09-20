import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Zap, Search, Keyboard, FolderPlus, BookOpen, StickyNote, X } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: 'Bienvenue sur Ahead.love !',
    description: 'Votre workspace intelligent pour capturer et organiser vos prompts AI pendant les temps d\'attente de génération.',
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Pendant que Cursor, Claude ou GitHub Copilot génèrent votre code (2-4 minutes), 
          restez productif en préparant vos 3-4 prochains moves.
        </p>
        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm font-medium">
            💡 Transformez vos temps d'attente en moments productifs
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'Organisation par Produit > Epic > Prompts',
    description: 'Structurez vos idées avec notre hiérarchie claire inspirée de Todoist et Slack.',
    icon: <FolderPlus className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="font-medium">Produit</span>
            <span className="text-muted-foreground">- Vos différents projets</span>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <div className="w-3 h-3 bg-secondary rounded"></div>
            <span className="font-medium">Epic</span>
            <span className="text-muted-foreground">- Fonctionnalités majeures</span>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span className="font-medium">Prompts</span>
            <span className="text-muted-foreground">- Vos idées et tâches</span>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">Navigation intuitive dans la barre latérale, exactement comme Todoist !</p>
        </div>
      </div>
    )
  },
  {
    title: 'Workflow Kanban Intelligent',
    description: 'Vos prompts évoluent automatiquement : Todo → En Cours → Terminé.',
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-3 bg-yellow-500/10 rounded">
            <div className="font-medium text-yellow-600 dark:text-yellow-400">Todo</div>
            <div className="text-xs text-muted-foreground mt-1">Nouvelles idées</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded">
            <div className="font-medium text-blue-600 dark:text-blue-400">En Cours</div>
            <div className="text-xs text-muted-foreground mt-1">Copié (Cmd+C)</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded">
            <div className="font-medium text-green-600 dark:text-green-400">Terminé</div>
            <div className="text-xs text-muted-foreground mt-1">Accompli ✨</div>
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm">
            <strong>Astuce :</strong> Copiez un prompt (Cmd+C) et il passe automatiquement en "En Cours" !
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'Raccourcis Clavier Ultra-Rapides',
    description: 'Travaillez à la vitesse de la pensée avec nos raccourcis optimisés.',
    icon: <Keyboard className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Création rapide de prompt</span>
            <Badge variant="secondary">Q</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Ouvrir la bibliothèque</span>
            <Badge variant="secondary">L</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Knowledge Box</span>
            <Badge variant="secondary">K</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Notes rapides</span>
            <Badge variant="secondary">N</Badge>
          </div>
        </div>
        <div className="bg-accent/20 p-3 rounded-lg">
          <p className="text-sm">Perfect for capturing 2 AM ideas without leaving your keyboard! 🌙</p>
        </div>
      </div>
    )
  },
  {
    title: 'Knowledge Box & Recherche Globale',
    description: 'Stockez vos références et retrouvez tout instantanément.',
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Box
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Liens & docs</li>
              <li>• Système de design</li>
              <li>• Snippets de code</li>
              <li>• PDFs importants</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Recherche Globale
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tous vos prompts</li>
              <li>• Contenu KB</li>
              <li>• Filtres avancés</li>
              <li>• Auto-archivage</li>
            </ul>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">Comme Claude Projects ou Notebook LLM, mais optimisé pour les devs !</p>
        </div>
      </div>
    )
  }
];

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  const step = onboardingSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-3">
            {step.icon}
            <div>
              <div className="text-lg">{step.title}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Étape {currentStep + 1} sur {onboardingSteps.length}
              </div>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {step.content}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Passer
            </Button>
            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === onboardingSteps.length - 1 ? (
                'Commencer !'
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}