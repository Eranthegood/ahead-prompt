import React, { useState } from 'react';
import { LinearPromptItem } from '@/components/LinearPromptItem';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ArrowDown, Mouse, Copy, Settings, CheckCircle, Zap, Target, Clock } from 'lucide-react';
import type { Prompt, Product, Epic } from '@/types';

// Lightweight wrapper rendering a single LinearPromptItem with mock data and interactive tooltips
export default function LinearPromptOnboardingMock() {
  const [mockPrompt, setMockPrompt] = useState<Prompt & { product?: Product; epic?: Epic }>({
    id: 'mock-1',
    workspace_id: 'mock-workspace',
    epic_id: null,
    product_id: null,
    title: 'Add interactive tooltips to onboarding flow',
    description: 'Guide users through each feature with engaging, contextual explanations',
    status: 'todo',
    priority: 2,
    order_index: 0,
    generated_prompt: null,
    generated_at: null,
    is_debug_session: false,
    cursor_agent_id: null,
    cursor_agent_status: null,
    github_pr_number: null,
    github_pr_url: null,
    github_pr_status: null,
    cursor_branch_name: null,
    cursor_logs: null,
    workflow_metadata: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopyGenerated = () => {
    // Simulate auto-move to in_progress for demo
    setMockPrompt((p) => ({ ...p, status: 'in_progress' }));
    console.info('[OnboardingMock] Copied prompt -> status in_progress');
  };

  const handlePromptClick = () => {
    console.info('[OnboardingMock] Clicked prompt');
  };

  const handlePriorityChange = (_p: Prompt, newPriority: number) => {
    setMockPrompt((p) => ({ ...p, priority: newPriority as any }));
  };

  const handleStatusChange = (_p: Prompt, newStatus: any) => {
    setMockPrompt((p) => ({ ...p, status: newStatus }));
  };

  const interactiveSteps = [
    {
      id: 'priority',
      title: '🔥 Priority Control',
      content: 'Click to set High/Normal/Low priority. High priority prompts bubble to the top!',
      position: 'left',
      highlight: 'priority-area'
    },
    {
      id: 'copy',
      title: '📋 Magic Copy',
      content: 'One click copies to clipboard AND auto-moves to "In Progress". Zero extra steps!',
      position: 'top',
      highlight: 'copy-button'
    },
    {
      id: 'status',
      title: '⚡ Status Flow',
      content: 'Todo → In Progress → Done. Click to cycle through states instantly.',
      position: 'right',
      highlight: 'status-area'
    },
    {
      id: 'title',
      title: '✏️ Full Edit Mode',
      content: 'Click anywhere on the title to open detailed editing. Rich text, tags, everything!',
      position: 'bottom',
      highlight: 'title-area'
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setActiveStep(0);
    
    // Auto-advance through steps
    setTimeout(() => setActiveStep(1), 2000);
    setTimeout(() => setActiveStep(2), 4000);
    setTimeout(() => setActiveStep(3), 6000);
    setTimeout(() => {
      setIsPlaying(false);
      setActiveStep(0);
    }, 8000);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Interactive demo header */}
        <div className="text-center space-y-3">
          <h4 className="font-semibold text-sm">✨ Interactive Prompt Card Demo</h4>
          <p className="text-xs text-muted-foreground">
            Every element is clickable and optimized for speed. Try it!
          </p>
          
          <Button 
            size="sm" 
            onClick={startDemo} 
            disabled={isPlaying}
            className="h-7 text-xs"
          >
            {isPlaying ? 'Playing Demo...' : '▶ Start Interactive Tour'}
          </Button>
        </div>

        {/* Main prompt card with overlay tooltips */}
        <div className="relative">
          <div className="rounded-md border-2 border-primary/20 p-2 bg-background">
            <LinearPromptItem
              prompt={mockPrompt}
              onPromptClick={handlePromptClick}
              onCopyGenerated={handleCopyGenerated}
              onShowActionDrawer={() => console.info('[OnboardingMock] Open action drawer')}
              onPriorityChange={handlePriorityChange}
              onStatusChange={handleStatusChange}
              onDuplicate={() => console.info('[OnboardingMock] Duplicate')}
              onDelete={() => console.info('[OnboardingMock] Delete')}
              onEdit={() => console.info('[OnboardingMock] Edit')}
            />
          </div>

          {/* Interactive tooltip overlays */}
          {interactiveSteps.map((step, index) => (
            <div
              key={step.id}
              className={`absolute transition-all duration-300 ${
                isPlaying && activeStep === index 
                  ? 'opacity-100 scale-100 z-20' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={{
                top: step.position === 'top' ? '-40px' : 
                     step.position === 'bottom' ? '60px' : '10px',
                left: step.position === 'left' ? '-10px' : 
                      step.position === 'right' ? '80%' : '50%',
                transform: step.position === 'top' || step.position === 'bottom' 
                  ? 'translateX(-50%)' : 'translateY(0)'
              }}
            >
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg max-w-60 text-xs">
                <div className="font-semibold mb-1">{step.title}</div>
                <div>{step.content}</div>
                
                {/* Arrow pointer */}
                <div 
                  className={`absolute w-2 h-2 bg-primary rotate-45 ${
                    step.position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                    step.position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                    step.position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                    'left-[-4px] top-1/2 -translate-y-1/2'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Static hover tooltips for manual exploration */}
        {!isPlaying && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-help hover:bg-muted">
                  <Target className="h-3 w-3 text-primary" />
                  <span>Priority System</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🔥 High → 🔸 Normal → 🕐 Low<br/>High priority always stays on top!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-help hover:bg-muted">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>Auto-Progress</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy button automatically moves<br/>prompts to "In Progress" state!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-help hover:bg-muted">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>Status Flow</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Todo → In Progress → Done<br/>Click status badge to cycle through!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded cursor-help hover:bg-muted">
                  <Mouse className="h-3 w-3 text-primary" />
                  <span>Click to Edit</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click anywhere on title for<br/>full editing modal with rich text!</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Workflow success message */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
            🚀 Zero-Friction Workflow
          </p>
          <p className="text-xs text-muted-foreground">
            While AI generates code (2-4 min), capture your next 3-4 ideas instantly. 
            <strong>Never lose momentum again!</strong>
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
