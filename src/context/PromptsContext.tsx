import React, { createContext, useContext, useMemo } from 'react';
import { usePromptsStore } from '@/hooks/usePromptsStore';
import type { Prompt, PromptStatus } from '@/types';

interface PromptsContextValue {
  prompts: Prompt[];
  loading: boolean;
  createPrompt: ReturnType<typeof usePromptsStore>['createPrompt'];
  updatePromptStatus: (promptId: string, status: PromptStatus) => Promise<void>;
  updatePrompt: (promptId: string, updates: Partial<Prompt>) => Promise<void>;
  updatePromptPriority: (promptId: string, priority: number) => Promise<void>;
  duplicatePrompt: (prompt: Prompt) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const PromptsContext = createContext<PromptsContextValue | undefined>(undefined);

interface PromptsProviderProps {
  workspaceId?: string;
  selectedProductId?: string;
  selectedEpicId?: string;
  children: React.ReactNode;
}

export function PromptsProvider({ workspaceId, selectedProductId, selectedEpicId, children }: PromptsProviderProps) {
  const promptsStore = usePromptsStore(
    workspaceId,
    selectedProductId,
    selectedEpicId
  );

  const value = useMemo<PromptsContextValue>(() => ({
    prompts: promptsStore.prompts || [],
    loading: promptsStore.loading || false,
    createPrompt: promptsStore.createPrompt || (async () => null),
    updatePromptStatus: promptsStore.updatePromptStatus || (async () => {}),
    updatePrompt: promptsStore.updatePrompt || (async () => {}),
    updatePromptPriority: promptsStore.updatePromptPriority || (async () => {}),
    duplicatePrompt: promptsStore.duplicatePrompt || (async () => {}),
    deletePrompt: promptsStore.deletePrompt || (async () => {}),
    refetch: promptsStore.refetch || (async () => {}),
  }), [promptsStore]);

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
