import React, { useState } from 'react';
import { LinearPromptItem } from '@/components/LinearPromptItem';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, Mouse, Copy, Settings, CheckCircle } from 'lucide-react';
import type { Prompt, Product, Epic } from '@/types';

// Lightweight wrapper rendering a single LinearPromptItem with mock data
export default function LinearPromptOnboardingMock() {
  const [mockPrompt, setMockPrompt] = useState<Prompt & { product?: Product; epic?: Epic }>({
    id: 'mock-1',
    workspace_id: 'mock-workspace',
    epic_id: null,
    product_id: null,
    title: 'Refactor onboarding to use LinearPromptCard layout',
    description: 'Ensure consistent UI by using the same card everywhere',
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

  return (
    <div className="space-y-4">
      {/* Marketing context header */}
      <div className="text-center space-y-2">
        <h4 className="font-semibold text-sm">✨ Your Daily Workflow in Action</h4>
        <p className="text-xs text-muted-foreground">
          This is the exact prompt card you'll use hundreds of times. Try the interactive features!
        </p>
      </div>

      {/* Interactive prompt card with annotations */}
      <div className="space-y-3">
        <div className="rounded-md border p-2 bg-background relative">
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

        {/* Interactive features explanation */}
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Settings className="h-3 w-3 text-primary" />
            <span><strong>Priority Dropdown:</strong> Click the flame/minus/clock icon to set urgency</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Copy className="h-3 w-3 text-primary" />
            <span><strong>Copy Button:</strong> One click copies to clipboard & moves to "In Progress"</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <CheckCircle className="h-3 w-3 text-primary" />
            <span><strong>Status Badge:</strong> Click to cycle between Todo → In Progress → Done</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Mouse className="h-3 w-3 text-primary" />
            <span><strong>Click Anywhere:</strong> Opens full prompt details & editing</span>
          </div>
        </div>

        {/* Magic workflow callout */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary mb-1">🚀 The Magic Workflow</p>
          <p className="text-xs text-muted-foreground">
            Copy a prompt → Auto-moves to "In Progress" → Work with AI → Mark as Done. 
            <strong> Zero friction, maximum productivity!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
