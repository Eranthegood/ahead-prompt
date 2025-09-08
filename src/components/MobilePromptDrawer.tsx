import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Flame, Zap, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { ProductEpicSelector } from '@/components/ProductEpicSelector';
import { useKnowledge } from '@/hooks/useKnowledge';
import { ProviderSelector, ProviderConfig } from '@/components/ProviderSelector';
import type { Workspace, Epic, Product, PromptPriority } from '@/types';
import { PRIORITY_OPTIONS } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  epic_id?: string;
  product_id?: string;
  priority?: PromptPriority;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

interface MobilePromptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  workspace: Workspace;
  epics?: Epic[];
  products?: Product[];
  selectedProductId?: string;
  selectedEpicId?: string;
}

const PRIORITY_ICONS = {
  1: AlertCircle,
  2: Flame,
  3: Zap,
} as const;

const PRIORITY_COLORS = {
  1: 'text-destructive',
  2: 'text-orange-500',
  3: 'text-primary',
} as const;

export function MobilePromptDrawer({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  products = [],
  selectedProductId,
  selectedEpicId,
}: MobilePromptDrawerProps) {
  const [content, setContent] = useState('');
  const [selectedEpic, setSelectedEpic] = useState<string | null>(selectedEpicId || null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(selectedProductId || null);
  const [selectedPriority, setSelectedPriority] = useState<PromptPriority>(2);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mobile-specific refs and state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState<number | null>(null);
  
  // AI Provider state
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'openai',
    model: 'gpt-4o'
  });
  
  // Knowledge state
  const [enableKnowledge, setEnableKnowledge] = useState(true);
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  
  const { toast } = useToast();
  
  // Load knowledge items
  const productIdForKnowledge = selectedProduct || selectedProductId;
  const { knowledgeItems } = useKnowledge(workspace.id, productIdForKnowledge || undefined);

  // Mobile focus management
  const focusTextarea = useCallback(() => {
    if (textareaRef.current && isOpen) {
      // Use setTimeout to ensure the drawer animation has completed
      setTimeout(() => {
        textareaRef.current?.focus();
        // For iOS Safari, we need to trigger the focus after a longer delay
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }, 300);
    }
  }, [isOpen]);

  // Handle viewport changes (mobile keyboard)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleViewportChange = () => {
      if (initialViewportHeight === null) {
        setInitialViewportHeight(window.innerHeight);
      }
    };

    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [initialViewportHeight]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setSelectedEpic(selectedEpicId || null);
      setSelectedProduct(selectedProductId || null);
      setSelectedPriority(2);
      setSelectedKnowledgeIds([]);
      setIsFocused(false);
      // Focus textarea after opening
      focusTextarea();
    }
  }, [isOpen, selectedProductId, selectedEpicId, focusTextarea]);

  // Handle knowledge selection
  const handleKnowledgeToggle = (knowledgeId: string) => {
    setSelectedKnowledgeIds(prev => 
      prev.includes(knowledgeId) 
        ? prev.filter(id => id !== knowledgeId)
        : [...prev, knowledgeId]
    );
  };

  // Get selected knowledge items
  const selectedKnowledgeItems = knowledgeItems.filter(item => 
    selectedKnowledgeIds.includes(item.id)
  );

  // Handle product change
  const handleProductChange = (productId: string | null) => {
    setSelectedProduct(productId);
    
    // Clear epic if it doesn't belong to the newly selected product
    if (selectedEpic && productId) {
      const epic = epics.find(e => e.id === selectedEpic);
      if (epic && epic.product_id !== productId) {
        setSelectedEpic(null);
      }
    }
  };

  // Handle epic change
  const handleEpicChange = (epicId: string | null) => {
    setSelectedEpic(epicId);
    
    // Auto-select parent product when epic is selected
    if (epicId) {
      const epic = epics.find(e => e.id === epicId);
      if (epic) {
        setSelectedProduct(epic.product_id);
      }
    }
  };

  // Create prompt data
  const createPromptData = (content: string): CreatePromptData => {
    let finalProductId = selectedProduct;
    let finalEpicId = selectedEpic;
    
    if (selectedEpic) {
      const epic = epics.find(e => e.id === selectedEpic);
      if (epic) {
        finalProductId = epic.product_id;
      } else {
        finalEpicId = null;
      }
    }
    
    const knowledgeContext = enableKnowledge && selectedKnowledgeIds.length > 0 
      ? selectedKnowledgeIds 
      : undefined;
    
    return {
      title: generateTitleFromContent(content),
      description: content,
      epic_id: finalEpicId || undefined,
      product_id: finalProductId || undefined,
      priority: selectedPriority,
      knowledge_context: knowledgeContext,
      ai_provider: providerConfig.provider,
      ai_model: providerConfig.model,
    };
  };

  // Enhanced mobile input handling
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleTextareaFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleTextareaBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter your prompt idea.',
        variant: 'destructive'
      });
      // Refocus textarea on mobile
      focusTextarea();
      return;
    }

    setIsLoading(true);
    
    try {
      const promptData = createPromptData(content);
      await onSave(promptData);
      
      toast({
        title: 'Prompt created!',
        description: 'Your prompt will be generated automatically.',
        variant: 'default'
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to create prompt. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PriorityIcon = PRIORITY_ICONS[selectedPriority];

  // Calculate dynamic height based on keyboard state
  const drawerHeight = isFocused 
    ? 'max-h-[90vh] sm:max-h-[85vh]' 
    : 'max-h-[85vh]';

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className={`${drawerHeight} focus-within:max-h-[90vh]`}>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Prompt
          </DrawerTitle>
          <DrawerDescription>
            Capture your AI prompt idea while you wait
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {/* Prompt Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Idea</label>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
              placeholder="Type your prompt idea here..."
              className="min-h-[120px] resize-none text-base bg-card text-card-foreground border-border focus:ring-primary focus:border-primary touch-manipulation"
              style={{
                WebkitAppearance: 'none',
                fontSize: '16px', // Prevents zoom on iOS
              }}
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_OPTIONS.map((priority) => {
                const Icon = PRIORITY_ICONS[priority.value];
                const isSelected = selectedPriority === priority.value;
                return (
                  <Button
                    key={priority.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriority(priority.value)}
                    className={`justify-start gap-2 transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-card-foreground border-border hover:bg-muted'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? '' : PRIORITY_COLORS[priority.value]}`} />
                    {priority.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product/Epic Assignment */}
          <div className="space-y-2">
            <ProductEpicSelector
              products={products}
              epics={epics}
              selectedProductId={selectedProduct}
              selectedEpicId={selectedEpic}
              onProductChange={handleProductChange}
              onEpicChange={handleEpicChange}
            />
          </div>

          {/* AI Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">AI Provider</label>
            <ProviderSelector
              value={providerConfig}
              onChange={setProviderConfig}
            />
          </div>

          {/* Knowledge Enhancement */}
          {knowledgeItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Use Knowledge Base</label>
                <Switch
                  checked={enableKnowledge}
                  onCheckedChange={setEnableKnowledge}
                />
              </div>
              
              {enableKnowledge && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Select knowledge items to enhance your prompt:
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-thin">
                    {knowledgeItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-card border border-border"
                      >
                        <input
                          type="checkbox"
                          id={`kb-${item.id}`}
                          checked={selectedKnowledgeIds.includes(item.id)}
                          onChange={() => handleKnowledgeToggle(item.id)}
                          className="rounded border-border accent-primary"
                        />
                        <label 
                          htmlFor={`kb-${item.id}`} 
                          className="truncate flex-1 text-card-foreground cursor-pointer"
                        >
                          {item.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {selectedKnowledgeItems.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                      {selectedKnowledgeItems.map((item) => (
                        <Badge 
                          key={item.id} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary border border-primary/20"
                        >
                          {item.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!content.trim() || isLoading}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Prompt
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}