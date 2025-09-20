import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Zap, Search, Keyboard, FolderPlus, BookOpen, StickyNote, X, Circle, CircleDot, CheckCircle, Flame, Minus, Clock } from 'lucide-react';
import { getPriorityDisplay } from '@/lib/utils';
import { getStatusIcon } from '@/components/ui/status-icon';

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: 'Create Prompts Lightning Fast',
    description: 'Capture your AI prompt ideas instantly while waiting for code generation.',
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Q</kbd> to instantly create a new prompt. 
          No more losing brilliant ideas during those 2-4 minute AI wait times.
        </p>
        <div className="bg-primary/10 p-4 rounded-lg">
          <p className="text-sm font-medium">
            ⚡ From idea to organized prompt in seconds
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Perfect for Bug Fixes, Features, Refactors, and Documentation
        </div>
      </div>
    )
  },
  {
    title: 'Product > Epic > Prompts Organization',
    description: 'Structure your ideas with our clean hierarchy inspired by Todoist and Slack.',
    icon: <FolderPlus className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="font-medium">Product</span>
            <span className="text-muted-foreground">- Your different projects</span>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <div className="w-3 h-3 bg-secondary rounded"></div>
            <span className="font-medium">Epic</span>
            <span className="text-muted-foreground">- Major features</span>
          </div>
          <div className="flex items-center gap-2 ml-12">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span className="font-medium">Prompts</span>
            <span className="text-muted-foreground">- Your ideas and tasks</span>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">Intuitive sidebar navigation, just like Todoist!</p>
        </div>
      </div>
    )
  },
  {
    title: 'Smart Kanban Workflow',
    description: 'Your prompts automatically evolve: Todo → In Progress → Done with priority management.',
    icon: <Zap className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-3 bg-yellow-500/10 rounded">
            <div className="flex items-center justify-center gap-2 font-medium text-yellow-600 dark:text-yellow-400">
              <Circle className="w-4 h-4" />
              Todo
            </div>
            <div className="text-xs text-muted-foreground mt-1">New ideas</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded">
            <div className="flex items-center justify-center gap-2 font-medium text-blue-600 dark:text-blue-400">
              <CircleDot className="w-4 h-4" />
              In Progress
            </div>
            <div className="text-xs text-muted-foreground mt-1">Copied (Cmd+C)</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded">
            <div className="flex items-center justify-center gap-2 font-medium text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 fill-current" />
              Done
            </div>
            <div className="text-xs text-muted-foreground mt-1">Completed ✨</div>
          </div>
        </div>
        <div className="bg-accent/20 p-3 rounded-lg">
          <p className="text-sm font-medium mb-2">Priority System:</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-destructive" />
              High
            </span>
            <span className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-orange-500" />
              Normal
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              Low
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">High priority prompts appear at the top of each column</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <p className="text-sm">
            <strong>Tip:</strong> Copy a prompt (Cmd+C) and it automatically moves to "In Progress"!
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'Ultra-Fast Keyboard Shortcuts',
    description: 'Work at the speed of thought with our optimized shortcuts.',
    icon: <Keyboard className="h-8 w-8 text-primary" />,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Quick prompt creation</span>
            <Badge variant="secondary">Q</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Open prompt library</span>
            <Badge variant="secondary">L</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Knowledge Box</span>
            <Badge variant="secondary">K</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">Quick notes</span>
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
    title: 'Knowledge Box & Global Search',
    description: 'Store your references and find everything instantly.',
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
              <li>• Links & docs</li>
              <li>• Design systems</li>
              <li>• Code snippets</li>
              <li>• Important PDFs</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Global Search
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All your prompts</li>
              <li>• KB content</li>
              <li>• Advanced filters</li>
              <li>• Auto-archiving</li>
            </ul>
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">Like Claude Projects or Notebook LLM, but optimized for developers!</p>
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
                Step {currentStep + 1} of {onboardingSteps.length}
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
            Previous
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
              Skip
            </Button>
            <Button onClick={nextStep} className="flex items-center gap-2">
              {currentStep === onboardingSteps.length - 1 ? (
                'Get Started!'
              ) : (
                <>
                  Next
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