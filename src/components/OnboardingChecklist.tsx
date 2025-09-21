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
  const [forceUpdate, setForceUpdate] = useState(0);
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { knowledgeItems } = useKnowledge(workspace.id);
  const { prompts } = usePrompts(workspace.id);

  // Debug: Log current data state
  console.log('OnboardingChecklist - Current data:', {
    products: products?.length || 0,
    epics: epics?.length || 0,
    knowledgeItems: knowledgeItems?.length || 0,
    prompts: prompts?.length || 0,
    forceUpdate
  });

  // Force re-render when data changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [products?.length, epics?.length, knowledgeItems?.length, prompts?.length]);

  // Auto-complete onboarding when all items are done
  useEffect(() => {
    const checklistItems: ChecklistItem[] = [
      {
        id: 'product',
        title: 'Create your first product',
        description: 'Organize your projects and prompts by creating a product workspace',
        completed: (products?.length || 0) > 0,
        action: () => window.dispatchEvent(new CustomEvent('open-product-dialog'))
      },
      {
        id: 'epic',
        title: 'Create your first epic',
        description: 'Group related features and organize your development workflow',
        completed: (epics?.length || 0) > 0,
        action: (products?.length || 0) > 0 ? () => window.dispatchEvent(new CustomEvent('open-epic-dialog')) : undefined
      },
      {
        id: 'knowledge',
        title: 'Add your knowledge base',
        description: 'Store docs, links, and context to enhance your AI prompts',
        completed: (knowledgeItems?.length || 0) > 0,
        action: (products?.length || 0) > 0 ? () => window.dispatchEvent(new CustomEvent('open-knowledge-dialog')) : undefined
      },
      {
        id: 'prompt',
        title: 'Create your first prompt',
        description: 'Start capturing your development ideas and next moves',
        completed: (prompts?.length || 0) > 0,
        action: () => window.dispatchEvent(new CustomEvent('open-quick-prompt'))
      }
    ];

    const completedCount = checklistItems.filter(item => item.completed).length;
    const totalCount = checklistItems.length;
    const isFullyCompleted = completedCount === totalCount;

    if (isFullyCompleted && completedCount > 0) {
      setTimeout(() => {
        localStorage.setItem(`onboarding_completed_${workspace.id}`, 'true');
        onComplete?.();
      }, 2000); // Small delay to show completion state
    }
  }, [products?.length, epics?.length, knowledgeItems?.length, prompts?.length, workspace.id, onComplete]);

  // Check if user has completed onboarding before - AFTER all hooks
  const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${workspace.id}`) === 'true';
  
  if (hasCompletedOnboarding) {
    return null;
  }

  const checklistItems: ChecklistItem[] = [
    {
      id: 'product',
      title: 'Create your first product',
      description: 'Organize your projects and prompts by creating a product workspace',
      completed: (products?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-product-dialog'))
    },
    {
      id: 'epic',
      title: 'Create your first epic',
      description: 'Group related features and organize your development workflow',
      completed: (epics?.length || 0) > 0,
      action: (products?.length || 0) > 0 ? () => window.dispatchEvent(new CustomEvent('open-epic-dialog')) : undefined
    },
    {
      id: 'knowledge',
      title: 'Add your knowledge base',
      description: 'Store docs, links, and context to enhance your AI prompts',
      completed: (knowledgeItems?.length || 0) > 0,
      action: (products?.length || 0) > 0 ? () => window.dispatchEvent(new CustomEvent('open-knowledge-dialog')) : undefined
    },
    {
      id: 'prompt',
      title: 'Create your first prompt',
      description: 'Start capturing your development ideas and next moves',
      completed: (prompts?.length || 0) > 0,
      action: () => window.dispatchEvent(new CustomEvent('open-quick-prompt'))
    }
  ];

  console.log('OnboardingChecklist - Checklist items completion:', checklistItems.map(item => ({
    id: item.id,
    completed: item.completed
  })));

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const isFullyCompleted = completedCount === totalCount;
  const progressPercentage = (completedCount / totalCount) * 100;


  return (
    <div className="border-b border-border/50 pb-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">
            {isFullyCompleted ? '🎉 Setup complete' : '👋 Getting started'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} steps completed
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
          {checklistItems.map((item, index) => {
            const hasProducts = (products?.length || 0) > 0;
            const isDisabled = (item.id === 'knowledge' || item.id === 'epic') && !hasProducts;
            
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md transition-all duration-300 text-xs group hover:scale-[1.02]",
                  item.completed
                    ? "bg-primary/10 border border-primary/20 shadow-sm"
                    : isDisabled
                    ? "opacity-50 cursor-not-allowed bg-muted/20"
                    : "hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10"
                )}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: item.completed ? 'pulse 2s ease-in-out' : undefined
                }}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 flex-shrink-0 relative overflow-hidden",
                    item.completed
                      ? "bg-primary border-primary text-primary-foreground scale-110 shadow-sm"
                      : isDisabled
                      ? "border-muted-foreground/30 bg-muted/10"
                      : "border-muted-foreground group-hover:border-primary/50 group-hover:scale-105"
                  )}
                >
                  {item.completed ? (
                    <Check className="w-2.5 h-2.5 animate-in zoom-in duration-300" />
                  ) : isDisabled ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary/30 transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-xs line-clamp-2 transition-colors duration-200",
                    item.completed 
                      ? "text-foreground" 
                      : isDisabled
                      ? "text-muted-foreground"
                      : "text-foreground group-hover:text-primary"
                  )}>
                    {item.title}
                  </h4>
                  {isDisabled && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {item.id === 'knowledge' ? 'Create a product first' : 'Create a product first'}
                    </p>
                  )}
                </div>

                {!item.completed && item.action && !isDisabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Opening ${item.id} dialog`);
                      item.action();
                    }}
                    className="h-6 px-2 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-110"
                    title={`Create ${item.title.toLowerCase()}`}
                  >
                    +
                  </Button>
                )}

                {item.completed && (
                  <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
                    ✓ Done
                  </div>
                )}
              </div>
            );
          })}

          {isFullyCompleted && (
            <div className="mt-3 p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-md border border-primary/20 animate-in slide-in-from-bottom duration-500">
              <p className="text-xs text-foreground font-medium flex items-center gap-2">
                <span className="animate-bounce">✨</span>
                You're all set! Ready to build amazing things.
                <span className="animate-pulse">🚀</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};