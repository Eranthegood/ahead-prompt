import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EpicCreationStep } from '@/hooks/useLinearEpicCreator';

interface EpicProgressIndicatorProps {
  currentStep: EpicCreationStep;
  onStepClick: (step: EpicCreationStep) => void;
  className?: string;
}

const stepConfig = {
  basic: { label: 'Basic Info', order: 0 },
  product: { label: 'Product', order: 1 },
  visual: { label: 'Visual', order: 2 },
  advanced: { label: 'Advanced', order: 3 },
  review: { label: 'Review', order: 4 },
};

export function EpicProgressIndicator({
  currentStep,
  onStepClick,
  className
}: EpicProgressIndicatorProps) {
  const currentOrder = stepConfig[currentStep].order;

  return (
    <div className={cn("flex items-center justify-between w-full max-w-md mx-auto", className)}>
      {Object.entries(stepConfig).map(([step, config], index) => {
        const isCompleted = config.order < currentOrder;
        const isCurrent = step === currentStep;
        const isClickable = config.order <= currentOrder;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => isClickable && onStepClick(step as EpicCreationStep)}
                disabled={!isClickable}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200",
                  {
                    "bg-primary text-primary-foreground": isCurrent || isCompleted,
                    "bg-muted text-muted-foreground": !isCurrent && !isCompleted,
                    "hover:bg-primary/20 cursor-pointer": isClickable,
                    "cursor-not-allowed": !isClickable,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{config.order + 1}</span>
                )}
              </button>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  {
                    "text-primary": isCurrent || isCompleted,
                    "text-muted-foreground": !isCurrent && !isCompleted,
                  }
                )}
              >
                {config.label}
              </span>
            </div>
            {index < Object.keys(stepConfig).length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 transition-colors duration-200",
                  {
                    "bg-primary": config.order < currentOrder,
                    "bg-muted": config.order >= currentOrder,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}