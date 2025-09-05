import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Workspace, Product, Epic } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { usePrompts } from '@/hooks/usePrompts';

interface OnboardingChecklistProps {
  workspace: Workspace;
  onComplete?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

export const OnboardingChecklist = ({ workspace, onComplete }: OnboardingChecklistProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { knowledgeItems } = useKnowledge(workspace.id);
  const { prompts } = usePrompts(workspace.id);

  // Check if user has completed onboarding before
  const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${workspace.id}`) === 'true';
  
  if (hasCompletedOnboarding) {
    return null;
  }

  const checklistItems: ChecklistItem[] = [
    {
      id: 'product',
      title: 'Créer votre premier produit',
      description: 'Organisez vos projets en créant un produit',
      completed: (products?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-product-dialog'))
    },
    {
      id: 'epic',
      title: 'Créer votre premier epic',
      description: 'Structurez votre travail avec des epics',
      completed: (epics?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-epic-dialog'))
    },
    {
      id: 'knowledge',
      title: 'Ajouter vos premières connaissances',
      description: 'Stockez des infos utiles pour vos prompts',
      completed: (knowledgeItems?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-knowledge-dialog'))
    },
    {
      id: 'prompt',
      title: 'Créer votre premier prompt',
      description: 'Commencez à planifier vos idées',
      completed: (prompts?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-quick-prompt'))
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const isFullyCompleted = completedCount === totalCount;

  // Auto-complete onboarding when all items are done
  useEffect(() => {
    if (isFullyCompleted && completedCount > 0) {
      setTimeout(() => {
        localStorage.setItem(`onboarding_completed_${workspace.id}`, 'true');
        onComplete?.();
      }, 2000); // Small delay to show completion state
    }
  }, [isFullyCompleted, completedCount, workspace.id, onComplete]);

  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {isFullyCompleted ? '🎉 Félicitations !' : '👋 Bienvenue sur Ahead.love'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isFullyCompleted 
                ? 'Vous avez terminé la configuration initiale !' 
                : `Complétez ces étapes pour bien démarrer (${completedCount}/${totalCount})`
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-4"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mt-3">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  item.completed
                    ? "bg-primary/10 border-primary/20"
                    : "bg-background border-border hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    item.completed
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  )}
                >
                  {item.completed && <Check className="w-3 h-3" />}
                </div>
                
                <div className="flex-1">
                  <h4 className={cn(
                    "font-medium text-sm",
                    item.completed ? "text-foreground" : "text-foreground"
                  )}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {!item.completed && item.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={item.action}
                    className="shrink-0"
                  >
                    Créer
                  </Button>
                )}
              </div>
            ))}
          </div>

          {isFullyCompleted && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground font-medium">
                ✨ Parfait ! Vous êtes prêt à utiliser Ahead.love pour booster votre productivité !
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};