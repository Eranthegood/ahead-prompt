export interface PromptLibraryItem {
  id: string;
  workspace_id?: string;
  user_id?: string;
  title: string;
  body: string;
  ai_model: string;
  tags: string[];
  category?: string;
  is_favorite: boolean;
  is_system_prompt?: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptLibraryItemData {
  title: string;
  body: string;
  ai_model: string;
  tags: string[];
  category?: string;
}

export interface SystemPromptTemplate extends Omit<PromptLibraryItem, 'id' | 'workspace_id' | 'user_id' | 'created_at' | 'updated_at' | 'usage_count' | 'is_favorite'> {
  id: string;
  is_system: true;
}

export type AIModel = 'openai-gpt-4' | 'openai-gpt-3.5' | 'claude-3.5-sonnet' | 'claude-3-haiku' | 'gemini-pro';

export const AI_MODELS: { value: AIModel; label: string }[] = [
  { value: 'openai-gpt-4', label: 'GPT-4' },
  { value: 'openai-gpt-3.5', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
];

export const PROMPT_CATEGORIES = [
  'Bug Fix',
  'Feature',
  'Refactor',
  'Documentation',
  'Testing',
  'Performance',
  'Design',
  'Integration',
  'General',
] as const;

export type PromptCategory = typeof PROMPT_CATEGORIES[number];