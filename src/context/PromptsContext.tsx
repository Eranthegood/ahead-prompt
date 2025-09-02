import React, { createContext, useContext, useMemo } from 'react';
import { usePrompts } from '@/hooks/usePrompts';
import type { Prompt, PromptStatus } from '@/types';

interface PromptsContextValue {
  prompts: Prompt[];
  loading: boolean;
  createPrompt: ReturnType<typeof usePrompts>['createPrompt'];
  updatePromptStatus: (promptId: string, status: PromptStatus) => Promise<void>;
  updatePromptPriority: (promptId: string, priority: number) => Promise<void>;
  duplicatePrompt: (prompt: Prompt) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  updatePrompt: (promptId: string, updates: Partial<Prompt>) => Promise<void>;
  refetch: () => Promise<void>;
  cleanupStuckGeneratingPrompts: () => void;
}

export const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

interface PromptsProviderProps {
  workspaceId?: string;
  selectedProductId?: string;
  selectedEpicId?: string;
  children: React.ReactNode;
}

export function PromptsProvider({ workspaceId, selectedProductId, selectedEpicId, children }: PromptsProviderProps) {
  const promptsApi = usePrompts(
    workspaceId,
    selectedProductId,
    selectedEpicId
  );

  const value = useMemo<PromptsContextValue>(() => ({
    prompts: promptsApi.prompts || [],
    loading: promptsApi.loading || false,
    createPrompt: promptsApi.createPrompt || (async () => null),
    updatePromptStatus: promptsApi.updatePromptStatus || (async () => {}),
    updatePromptPriority: promptsApi.updatePromptPriority || (async () => {}),
    duplicatePrompt: promptsApi.duplicatePrompt || (async () => {}),
    deletePrompt: promptsApi.deletePrompt || (async () => {}),
    updatePrompt: promptsApi.updatePrompt || (async () => {}),
    refetch: promptsApi.refetch || (async () => {}),
    cleanupStuckGeneratingPrompts: promptsApi.cleanupStuckGeneratingPrompts || (() => {}),
  }), [promptsApi]);

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function PromptsExternalProvider({ value, children }: { value: PromptsContextValue; children: React.ReactNode }) {
  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePromptsContext() {
  return useContext(PromptsContext);
}
