import React, { useState } from 'react';
import { LinearPromptItem } from '@/components/LinearPromptItem';
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
    <div className="rounded-md border p-2 bg-background">
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
  );
}
