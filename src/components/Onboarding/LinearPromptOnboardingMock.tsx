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

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
      content: 'Click the flame/minus/clock icon to set High/Normal/Low priority. High priority prompts bubble to the top!',
      style: { top: '15px', left: '8px' }, // Points to priority dropdown (far left)
      arrowClass: 'right-[-4px] top-1/2 -translate-y-1/2'
    },
    {
      id: 'copy',
      title: '📋 Magic Copy',
      content: 'One click copies to clipboard AND auto-moves to "In Progress". Zero extra steps!',
      style: { top: '-50px', left: '85px' }, // Points to copy button
      arrowClass: 'bottom-[-4px] left-1/2 -translate-x-1/2'
    },
    {
      id: 'status',
      title: '⚡ Status Flow',
      content: 'Todo → In Progress → Done. Click the status badge to cycle through states instantly.',
      style: { top: '15px', right: '140px' }, // Points to status area
      arrowClass: 'left-[-4px] top-1/2 -translate-y-1/2'
    },
    {
      id: 'title',
      title: '✏️ Full Edit Mode',
      content: 'Click anywhere on the title area to open detailed editing modal with rich text support!',
      style: { bottom: '-50px', left: '200px', transform: 'translateX(-50%)' }, // Points to title area (center)
      arrowClass: 'top-[-4px] left-1/2 -translate-x-1/2'
    }
  ];

  const showTooltip = (stepId: string) => {
    setActiveTooltip(stepId);
    // Auto-hide after 4 seconds
    setTimeout(() => setActiveTooltip(null), 4000);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Interactive demo header */}
        <div className="text-center space-y-2">
          <h4 className="font-semibold text-sm">✨ Interactive Prompt Card Demo</h4>
          <p className="text-xs text-muted-foreground">
            Click the buttons below to explore each feature with precision tooltips!
          </p>
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

          {/* Interactive tooltip overlays with precise positioning */}
          {interactiveSteps.map((step) => (
            <div
              key={step.id}
              className={`absolute transition-all duration-300 ${
                activeTooltip === step.id
                  ? 'opacity-100 scale-100 z-20 animate-scale-in' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={step.style}
            >
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-xl max-w-64 text-xs border border-primary/20">
                <div className="font-semibold mb-1">{step.title}</div>
                <div className="leading-relaxed">{step.content}</div>
                
                {/* Precise arrow pointer */}
                <div className={`absolute w-2 h-2 bg-primary rotate-45 ${step.arrowClass}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive feature buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('priority')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'priority' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Target className="h-3 w-3 text-primary" />
            <span>Priority System</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('copy')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'copy' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Zap className="h-3 w-3 text-primary" />
            <span>Auto-Progress</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('status')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'status' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Clock className="h-3 w-3 text-primary" />
            <span>Status Flow</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('title')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'title' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Mouse className="h-3 w-3 text-primary" />
            <span>Click to Edit</span>
          </Button>
        </div>

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