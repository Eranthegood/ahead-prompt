import React, { forwardRef, useRef } from "react";
import { motion } from "framer-motion";
import { User, BookOpen, Bot, FileText, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<
  HTMLDivElement,
  { 
    className?: string; 
    children?: React.ReactNode;
    isActive?: boolean;
    isCompleted?: boolean;
  }
>(({ className, children, isActive = false, isCompleted = false }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative z-10 flex size-12 items-center justify-center rounded-full border-2 p-3 transition-all duration-300",
        "bg-background shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        isActive && "border-primary bg-primary/10 shadow-[0_0_20px_-12px_hsl(var(--primary)/0.6)]",
        isCompleted && "border-primary bg-primary text-primary-foreground",
        !isActive && !isCompleted && "border-border/50",
        className,
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.1 : 1, 
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.div>
  );
});

Circle.displayName = "Circle";

interface PromptGenerationAnimationProps {
  isVisible: boolean;
  currentStep: 'input' | 'knowledge' | 'processing' | 'output' | 'complete';
  selectedProvider?: 'openai' | 'claude';
  onComplete?: () => void;
}

export function PromptGenerationAnimation({ 
  isVisible, 
  currentStep, 
  selectedProvider = 'openai',
  onComplete 
}: PromptGenerationAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const knowledgeRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  if (!isVisible) return null;

  const getStepStatus = (step: string) => {
    const steps = ['input', 'knowledge', 'processing', 'output', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    return {
      isActive: stepIndex === currentIndex,
      isCompleted: stepIndex < currentIndex
    };
  };

  const ProviderIcon = selectedProvider === 'openai' ? Bot : Brain;

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-md w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Generating Enhanced Prompt</h3>
          <p className="text-sm text-muted-foreground">
            AI is processing your idea with selected knowledge
          </p>
        </div>

        <div
          className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-lg p-6"
          ref={containerRef}
        >
          <div className="flex size-full flex-col max-w-lg max-h-[160px] items-stretch justify-between gap-8">
            <div className="flex flex-row items-center justify-between">
              <Circle 
                ref={inputRef}
                {...getStepStatus('input')}
              >
                <User className="h-5 w-5" />
              </Circle>
              <Circle 
                ref={knowledgeRef}
                {...getStepStatus('knowledge')}
              >
                <BookOpen className="h-5 w-5" />
              </Circle>
            </div>
            
            <div className="flex flex-row items-center justify-center">
              <Circle 
                ref={processingRef}
                className="size-16"
                {...getStepStatus('processing')}
              >
                <ProviderIcon className="h-6 w-6" />
              </Circle>
            </div>
            
            <div className="flex flex-row items-center justify-center">
              <Circle 
                ref={outputRef}
                {...getStepStatus('output')}
              >
                <FileText className="h-5 w-5" />
              </Circle>
            </div>
          </div>

          {/* Animated beams - only show when steps are active or completed */}
          {(currentStep !== 'input') && (
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={inputRef}
              toRef={processingRef}
              curvature={-30}
              duration={2}
              gradientStartColor="hsl(var(--primary))"
              gradientStopColor="hsl(var(--primary)/0.8)"
            />
          )}
          
          {(currentStep !== 'input' && currentStep !== 'knowledge') && (
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={knowledgeRef}
              toRef={processingRef}
              curvature={30}
              duration={2}
              delay={0.5}
              gradientStartColor="hsl(var(--primary))"
              gradientStopColor="hsl(var(--primary)/0.8)"
            />
          )}
          
          {(currentStep === 'output' || currentStep === 'complete') && (
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={processingRef}
              toRef={outputRef}
              duration={2}
              delay={1}
              gradientStartColor="hsl(var(--primary))"
              gradientStopColor="hsl(var(--accent))"
              reverse
            />
          )}
        </div>

        <div className="text-center">
          <motion.p 
            className="text-sm text-muted-foreground"
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'input' && 'Processing your input...'}
            {currentStep === 'knowledge' && 'Analyzing selected knowledge...'}
            {currentStep === 'processing' && `Enhancing with ${selectedProvider === 'openai' ? 'OpenAI' : 'Claude'}...`}
            {currentStep === 'output' && 'Generating enhanced prompt...'}
            {currentStep === 'complete' && 'Enhancement complete!'}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}