import React from 'react';
import { QuickPromptDialog } from './QuickPromptDialog';
import type { Workspace, Epic, Product, PromptPriority } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  epic_id?: string;
  product_id?: string;
  priority?: PromptPriority;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

interface LinearPromptCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  workspace: Workspace;
  epics?: Epic[];
  products?: Product[];
  selectedProductId?: string;
  selectedEpicId?: string;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  onProductsRefetch?: () => void;
}

/**
 * LinearPromptCreator - Wrapper around QuickPromptDialog for backward compatibility
 * 
 * This component maintains the same API as the original LinearPromptCreator
 * but now uses QuickPromptDialog as the underlying implementation to avoid
 * UI duplication and maintain consistency across the app.
 * 
 * All functionality is now handled by QuickPromptDialog including:
 * - Rich text editing with formatting toolbar
 * - Product/Epic selection and management
 * - Knowledge context integration
 * - AI provider selection
 * - Auto-save and draft management
 * - Animation and UX enhancements
 */
export const LinearPromptCreator: React.FC<LinearPromptCreatorProps> = (props) => {
  return <QuickPromptDialog {...props} />;
};

// Export types for backward compatibility
export type { CreatePromptData, LinearPromptCreatorProps };