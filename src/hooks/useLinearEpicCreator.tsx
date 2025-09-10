import { useState, useCallback } from 'react';
import type { Product } from '@/types';

export type EpicCreationStep = 'basic' | 'product' | 'visual' | 'advanced' | 'review';

interface CreateEpicData {
  name: string;
  description?: string;
  color: string;
  productId?: string;
  priority?: number;
  dueDate?: Date;
  tags?: string[];
}

interface UseLinearEpicCreatorProps {
  selectedProductId?: string;
  onClose?: () => void;
}

export const useLinearEpicCreator = ({ 
  selectedProductId,
  onClose 
}: UseLinearEpicCreatorProps) => {
  const [currentStep, setCurrentStep] = useState<EpicCreationStep>('basic');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(selectedProductId);
  const [priority, setPriority] = useState<number>(3);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  const steps: EpicCreationStep[] = ['basic', 'product', 'visual', 'advanced', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  const resetForm = useCallback(() => {
    setCurrentStep('basic');
    setName('');
    setDescription('');
    setColor('#8B5CF6');
    setSelectedProduct(selectedProductId);
    setPriority(3);
    setDueDate(undefined);
    setTags([]);
    setIsExpanded(false);
    setCreateMore(false);
  }, [selectedProductId]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  }, [currentStepIndex, steps]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  }, [currentStepIndex, steps]);

  const goToStep = useCallback((step: EpicCreationStep) => {
    setCurrentStep(step);
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'basic':
        return name.trim().length > 0;
      case 'product':
        return true; // Product is optional
      case 'visual':
        return true; // Color has default
      case 'advanced':
        return true; // All advanced options are optional
      case 'review':
        return name.trim().length > 0;
      default:
        return false;
    }
  }, [currentStep, name]);

  const getEpicData = useCallback((): CreateEpicData => {
    return {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      productId: selectedProduct,
      priority,
      dueDate,
      tags: tags.length > 0 ? tags : undefined,
    };
  }, [name, description, color, selectedProduct, priority, dueDate, tags]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return {
    // Step management
    currentStep,
    currentStepIndex,
    steps,
    nextStep,
    previousStep,
    goToStep,
    canProceed,
    isFirstStep,
    isLastStep,
    progress,

    // Form data
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    selectedProduct,
    setSelectedProduct,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    tags,
    setTags,
    isExpanded,
    setIsExpanded,
    createMore,
    setCreateMore,

    // Utilities
    resetForm,
    getEpicData,
  };
};