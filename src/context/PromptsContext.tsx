import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { usePrompts } from '@/hooks/usePrompts';
import type { Prompt, PromptStatus } from '@/types';

interface PromptsContextValue {
  prompts: Prompt[];
  loading: boolean;
  createPrompt: (promptData: any) => Promise<any>;
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
  const promptsHook = usePrompts(
    workspaceId,
    selectedProductId,
    selectedEpicId
  );

  // Listen for prompt creation events (e.g., from onboarding) to refresh the list
  useEffect(() => {
    const handlePromptCreated = (e: CustomEvent) => {
      console.log('[PromptsProvider] Prompt created, refreshing...', e.detail);
      promptsHook.refetch?.();
    };
    
    window.addEventListener('prompt-created', handlePromptCreated as EventListener);
    return () => window.removeEventListener('prompt-created', handlePromptCreated as EventListener);
  }, [promptsHook.refetch]);

  const value = useMemo<PromptsContextValue>(() => ({
    prompts: promptsHook.prompts || [],
    loading: promptsHook.loading || false,
    createPrompt: promptsHook.createPrompt || (async () => null),
    updatePromptStatus: promptsHook.updatePromptStatus || (async () => {}),
    updatePrompt: promptsHook.updatePrompt || (async () => {}),
    updatePromptPriority: promptsHook.updatePromptPriority || (async () => {}),
    duplicatePrompt: promptsHook.duplicatePrompt || (async () => {}),
    deletePrompt: promptsHook.deletePrompt || (async () => {}),
    refetch: promptsHook.refetch || (async () => {}),
  }), [promptsHook]);

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
