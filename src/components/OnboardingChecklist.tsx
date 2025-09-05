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
    <div className="border-b border-border/50 pb-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">
            {isFullyCompleted ? '🎉 Setup complet' : '👋 Setup'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} étapes
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 p-0"
        >
          {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div 
          className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {!isCollapsed && (
        <div className="space-y-2 mt-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-md transition-all text-xs",
                item.completed
                  ? "bg-primary/5 border-primary/10"
                  : "hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all flex-shrink-0",
                  item.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground"
                )}
              >
                {item.completed && <Check className="w-2.5 h-2.5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-medium text-xs line-clamp-2",
                  item.completed ? "text-foreground" : "text-foreground"
                )}>
                  {item.title}
                </h4>
              </div>

              {!item.completed && item.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className="h-6 px-2 text-xs shrink-0"
                >
                  +
                </Button>
              )}
            </div>
          ))}

          {isFullyCompleted && (
            <div className="mt-3 p-2 bg-primary/10 rounded-md">
              <p className="text-xs text-foreground font-medium">
                ✨ Setup terminé !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};