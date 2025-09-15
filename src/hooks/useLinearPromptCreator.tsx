import { useState, useCallback } from 'react';
import type { PromptPriority, KnowledgeItem } from '@/types';

interface ProviderConfig {
  provider: 'openai' | 'claude';
  model?: string;
}

interface UseLinearPromptCreatorProps {
  selectedProductId?: string;
  selectedEpicId?: string;
}

export const useLinearPromptCreator = ({ 
  selectedProductId, 
  selectedEpicId 
}: UseLinearPromptCreatorProps) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PromptPriority>(2);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(selectedProductId);
  const [selectedEpic, setSelectedEpic] = useState<string | undefined>(selectedEpicId);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'openai',
    model: 'gpt-5-2025-08-07',
  });
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeItem[]>([]);
  const [createMore, setCreateMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setPriority(2);
    setSelectedProduct(selectedProductId);
    setSelectedEpic(selectedEpicId);
    setProviderConfig({
      provider: 'openai',
      model: 'gpt-5-2025-08-07',
    });
    setSelectedKnowledge([]);
    setIsExpanded(false);
  }, [selectedProductId, selectedEpicId]);

  const handleProductChange = useCallback((productId?: string) => {
    setSelectedProduct(productId);
    // Clear epic if it doesn't belong to the selected product
    if (selectedEpic && productId) {
      // This validation would need epic data, but we'll handle it in the component
      setSelectedEpic(undefined);
    }
  }, [selectedEpic]);

  const handleEpicChange = useCallback((epicId?: string) => {
    setSelectedEpic(epicId);
    // Auto-assign product if epic is selected but no product
    // This logic would be handled in the component with access to epic data
  }, []);

  return {
    title,
    setTitle,
    priority,
    setPriority,
    selectedProduct,
    setSelectedProduct: handleProductChange,
    selectedEpic,
    setSelectedEpic: handleEpicChange,
    providerConfig,
    setProviderConfig,
    selectedKnowledge,
    setSelectedKnowledge,
    createMore,
    setCreateMore,
    isExpanded,
    setIsExpanded,
    resetForm,
  };
};