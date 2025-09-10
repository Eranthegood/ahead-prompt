import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLinearEpicCreator } from '@/hooks/useLinearEpicCreator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { EpicProgressIndicator } from '@/components/EpicProgressIndicator';
import { EpicActionButtons } from '@/components/EpicActionButtons';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface LinearEpicCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductId?: string;
  products?: Product[];
}

export function LinearEpicCreator({
  isOpen,
  onClose,
  selectedProductId,
  products = []
}: LinearEpicCreatorProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { workspace } = useWorkspace();
  const { createEpic } = useEpics();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
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
    resetForm,
    getEpicData,
  } = useLinearEpicCreator({ selectedProductId, onClose });

  // Auto-save functionality (simplified without restore for now)
  const { clearDraft } = useAutoSave({
    key: 'epic-creator',
    editor: null,
    isOpen,
  });

  // Focus name input when dialog opens
  useEffect(() => {
    if (isOpen && currentStep === 'basic') {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, currentStep]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (isLastStep && canProceed()) {
              handleSave();
            } else if (canProceed()) {
              nextStep();
            }
            break;
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
        }
      }
      
      if (e.key === 'ArrowRight' && !isLastStep && canProceed()) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        previousStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canProceed, isFirstStep, isLastStep, nextStep, previousStep]);

  const handleSave = async () => {
    if (!workspace || !canProceed()) return;

    setIsLoading(true);
    try {
      const epicData = getEpicData();
      
      await createEpic({
        name: epicData.name,
        description: epicData.description,
        color: epicData.color,
        product_id: epicData.productId!,
      });

      clearDraft();
      
      if (createMore) {
        resetForm();
        toast({
          title: "Epic created successfully!",
          description: "Ready to create another epic.",
        });
      } else {
        onClose();
        toast({
          title: "Epic created successfully!",
          description: `"${epicData.name}" has been added to your workspace.`,
        });
      }
    } catch (error) {
      console.error('Error creating epic:', error);
      toast({
        title: "Error creating epic",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <Input
                ref={nameInputRef}
                placeholder="Epic name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-medium"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {name.length}/200 characters
              </div>
            </div>

            {isExpanded && (
              <div>
                <Textarea
                  placeholder="Add a description (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {description.length}/1000 characters
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm"
            >
              {isExpanded ? 'Hide' : 'Add'} description
            </Button>
          </div>
        );

      case 'product':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Associate with product (optional)</h3>
              <div className="space-y-2">
                <select
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value || undefined)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">No product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Epics can exist independently or be associated with a specific product for better organization.
            </p>
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">Customize appearance</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ backgroundColor: color + '20', borderColor: color }}
                >
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex-1">
                  <EpicActionButtons
                    color={color}
                    onColorChange={setColor}
                    priority={priority}
                    onPriorityChange={setPriority}
                    dueDate={dueDate}
                    onDueDateChange={setDueDate}
                    tags={tags}
                    onTagsChange={setTags}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Advanced options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">
                  <Badge variant={priority === 1 ? 'destructive' : 'secondary'}>
                    {priority === 1 ? 'High' : priority === 2 ? 'Medium' : priority === 3 ? 'Normal' : 'Low'}
                  </Badge>
                </div>
              </div>
              
              {dueDate && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {dueDate.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <div className="font-medium">
                      {selectedProduct 
                        ? products.find(p => p.id === selectedProduct)?.name || 'Unknown'
                        : 'No product'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <div className="font-medium">
                      {priority === 1 ? 'High' : priority === 2 ? 'Medium' : priority === 3 ? 'Normal' : 'Low'}
                    </div>
                  </div>
                  {dueDate && (
                    <div>
                      <span className="text-muted-foreground">Due date:</span>
                      <div className="font-medium">{dueDate.toLocaleDateString()}</div>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-more"
                checked={createMore}
                onChange={(e) => setCreateMore(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="create-more" className="text-sm">
                Create another epic after this one
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <EpicProgressIndicator
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!canProceed() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Create Epic
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}