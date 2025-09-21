import React from 'react';
import { OnboardingPromptCreator } from './OnboardingPromptCreator';

interface PromptCreationOnboardingStepProps {
  productId: string;
  onPromptCreated: (promptId: string) => void;
}

export function PromptCreationOnboardingStep({ 
  productId, 
  onPromptCreated 
}: PromptCreationOnboardingStepProps) {
  return (
    <OnboardingPromptCreator 
      productId={productId}
      onPromptCreated={onPromptCreated}
    />
  );
}