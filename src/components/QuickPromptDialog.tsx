import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Flame, RotateCcw, BookOpen, X, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProductEpicSelector } from '@/components/ProductEpicSelector';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { ProviderSelector, ProviderConfig } from '@/components/ProviderSelector';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { RedditPixelService } from '@/services/redditPixelService';
import { PromptGenerationAnimation } from '@/components/PromptGenerationAnimation';
import type { Workspace, Epic, Product, PromptPriority, KnowledgeItem } from '@/types';
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

interface QuickPromptDialogProps {
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
}

// Formatting toolbar component for rich text editor
const FormattingToolbar: React.FC<{ editor: any }> = ({ editor }) => {
  const toolbarButtons = [
    // Heading buttons
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
    // Separator
    null,
    // Format buttons
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    // Separator
    null,
    // List buttons
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
  ];

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
      {toolbarButtons.map((button, index) => 
        button === null ? (
          <div key={`separator-${index}`} className="w-px h-6 bg-border mx-2" />
        ) : (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            className={button.isActive ? 'bg-muted' : ''}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  );
};

export const QuickPromptDialog: React.FC<QuickPromptDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  products = [],
  selectedProductId,
  selectedEpicId,
  onCreateProduct,
  onCreateEpic,
}) => {
  // Form state - maintains user selections for product/epic assignment
  const [selectedEpic, setSelectedEpic] = useState<string | null>(selectedEpicId || null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(selectedProductId || null);
  const [selectedPriority, setSelectedPriority] = useState<PromptPriority>(2);
  
  // AI Provider state
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'openai',
    model: 'gpt-4o'
  });
  
  // Knowledge state
  const [enableKnowledge, setEnableKnowledge] = useState(true); // Default enabled
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>([]);
  
  // Knowledge modal state
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  
  // Load knowledge items
  const productIdForKnowledge = selectedProduct || selectedProductId;
  const { knowledgeItems } = useKnowledge(workspace.id, productIdForKnowledge || undefined);
  
  // Performance tracking
  const [startTime] = useState(Date.now());
  const { trackPromptCreation, trackError } = usePromptMetrics();
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  
  // Animation state for prompt generation
  const [showAnimation, setShowAnimation] = useState(false);
  const [generationStep, setGenerationStep] = useState<'input' | 'knowledge' | 'processing' | 'output' | 'complete'>('input');
  
  const { toast } = useToast();

  // Initialize rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      setHasContent(!editor.isEmpty);
    },
  });

  // Auto-save functionality
  const { clearDraft } = useAutoSave({
    key: 'quick_prompt',
    editor,
    isOpen,
    onRestore: (content) => {
      setDraftRestored(true);
      setHasContent(true);
      // Hide draft restored indicator after 3 seconds
      setTimeout(() => setDraftRestored(false), 3000);
    },
  });

  // Filter epics based on selected product
  const getFilteredEpics = () => {
    const activeProductId = selectedProductId || (selectedProduct !== 'none' ? selectedProduct : undefined);
    return activeProductId 
      ? epics.filter(epic => epic.product_id === activeProductId)
      : epics;
  };

  /**
   * CRITICAL: Product/Epic assignment logic
   * This function handles the core functionality of auto-assigning prompts to products/epics
   * when the dialog opens. This logic is essential for the product/epic workflow.
   */
  const resetForm = () => {
    if (!editor) {
      console.error('Editor not available for resetForm');
      return;
    }
    
    // Clear previous form state
    clearDraft();
    editor.commands.setContent('');
    
    // CRITICAL LOGIC: Handle epic selection with automatic parent product selection
    if (selectedEpicId) {
      // Find the epic and validate it exists
      const selectedEpicData = epics.find(epic => epic.id === selectedEpicId);
      
      if (selectedEpicData) {
        // Epic found - set both epic and its parent product
        setSelectedEpic(selectedEpicId);
        setSelectedProduct(selectedEpicData.product_id);
        
        // Validate epic belongs to a valid product
        const parentProduct = products.find(p => p.id === selectedEpicData.product_id);
        if (!parentProduct) {
          console.warn('Epic found but parent product missing:', {
            epicId: selectedEpicId,
            missingProductId: selectedEpicData.product_id
          });
        }
      } else {
        // Epic not found - fallback to product-only selection
        console.warn('Selected epic not found in available epics:', {
          selectedEpicId,
          availableEpicIds: epics.map(e => e.id)
        });
        setSelectedEpic(null);
        setSelectedProduct(selectedProductId || null);
      }
    } else {
      // No epic selected - use only product selection
      setSelectedEpic(null);
      setSelectedProduct(selectedProductId || null);
    }
    
    // Reset other form state
    setSelectedPriority(2);
    setHasContent(false);
    setDraftRestored(false);
    setSelectedKnowledgeIds([]);
    
    // Focus editor - removed timeout delay for better performance
    if (editor && editor.view && editor.view.dom) {
      editor.commands.focus();
    }
  };
  // Handle knowledge selection
  const handleKnowledgeToggle = (knowledgeId: string) => {
    setSelectedKnowledgeIds(prev => 
      prev.includes(knowledgeId) 
        ? prev.filter(id => id !== knowledgeId)
        : [...prev, knowledgeId]
    );
  };

  // Handle opening knowledge modal
  const handleOpenKnowledge = () => {
    setIsKnowledgeModalOpen(true);
  };

  const handleCloseKnowledge = () => {
    setIsKnowledgeModalOpen(false);
  };

  // Get selected knowledge items
  const selectedKnowledgeItems = knowledgeItems.filter(item => 
    selectedKnowledgeIds.includes(item.id)
  );

  /**
   * Creates prompt data with proper product/epic assignment validation
   * This ensures prompts are correctly associated with selected products/epics
   */
  const createPromptData = (content: string): CreatePromptData => {
    // Validate epic-product relationship
    let finalProductId = selectedProduct;
    let finalEpicId = selectedEpic;
    
    if (selectedEpic) {
      const epic = epics.find(e => e.id === selectedEpic);
      if (epic) {
        // Ensure epic's parent product matches selected product
        finalProductId = epic.product_id;
        if (selectedProduct && selectedProduct !== epic.product_id) {
          console.warn('Epic-Product mismatch corrected:', {
            selectedProduct,
            epicProductId: epic.product_id
          });
        }
      } else {
        // Epic not found - remove invalid selection
        console.warn('Invalid epic selection removed:', selectedEpic);
        finalEpicId = null;
      }
    }
    
    // Include knowledge context if enabled and items selected
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


  // Main save handler - creates prompt with enhanced AI animation
  const handleSave = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;

    setIsLoading(true);
    
    try {
      // Show animation if knowledge is enabled and items are selected
      const shouldShowAnimation = enableKnowledge && selectedKnowledgeIds.length > 0;
      
      if (shouldShowAnimation) {
        // Start animation sequence
        setShowAnimation(true);
        setGenerationStep('input');
        
        // Simulate processing steps
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationStep('knowledge');
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        setGenerationStep('processing');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGenerationStep('output');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationStep('complete');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowAnimation(false);
      }

      // Create prompt data and save
      const promptData = createPromptData(content);
      await onSave(promptData);
      
      // Track performance metrics
      const responseTime = Date.now() - startTime;
      trackPromptCreation(responseTime, {
        hasProduct: !!selectedProduct,
        hasEpic: !!selectedEpic,
        priority: selectedPriority,
        contentLength: content.length,
      });
      
      // Clear draft and show success
      clearDraft();
      toast({
        title: 'Prompt created!',
        description: shouldShowAnimation ? 'Your enhanced prompt has been generated!' : 'Your prompt will be generated automatically.',
        variant: 'default'
      });
      
      // Track general prompt creation with Reddit Pixel
      if (workspace.owner_id) {
        RedditPixelService.trackPromptCreated(
          Math.random().toString(36).substr(2, 9), // temporary ID
          workspace.owner_id
        );
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error saving prompt:', error);
      trackError(error as Error, {
        hasProduct: !!selectedProduct,
        hasEpic: !!selectedEpic,
        contentLength: content.length,
      });
      toast({
        title: 'Error',
        description: 'Failed to create prompt. Please try again.',
        variant: 'destructive'
      });
      setShowAnimation(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Check if focus is on an editable element (input, textarea, contenteditable)
      const activeElement = document.activeElement as HTMLElement;
      const isEditableElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.closest('[contenteditable="true"]')
      );

      // Save if Enter is pressed and no editable element is focused
      if (!isEditableElement) {
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  /**
   * Handle product selection with validation
   * When product changes, clear epic if it doesn't belong to the new product
   */
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

  /**
   * Handle epic selection with automatic parent product selection
   * This ensures epic-product relationship consistency
   */
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

  /**
   * CRITICAL: Dialog lifecycle management
   * This effect handles form reset when dialog opens or product/epic props change
   * The resetForm function is the core of product/epic assignment functionality
   */
  useEffect(() => {
    if (isOpen && editor) {
      // Immediate form reset for better UX - no delay needed
      resetForm();
    }
  }, [isOpen, selectedProductId, selectedEpicId]);

  if (!editor) return null;

  const filteredEpics = getFilteredEpics();

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Capture Your Next AI Move
            {draftRestored && (
              <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <RotateCcw className="h-4 w-4" />
                <span>Draft restored</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new prompt idea with rich text formatting and optional epic or product assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex flex-col lg:flex-row lg:gap-6 flex-1 overflow-y-auto">
          {/* Editor section */}
          <div className="space-y-4 flex-1 min-h-0">
            {/* Formatting toolbar */}
            <FormattingToolbar editor={editor} />

            {/* Rich text editor */}
            <div className="border rounded-md bg-background flex-1 overflow-y-auto max-h-[400px]">
              <EditorContent 
                editor={editor}
                className="w-full h-full"
              />
            </div>

            {/* Form controls */}
            <div className="space-y-4">
              {/* Priority selector */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Priority
                </label>
                <Select value={selectedPriority.toString()} onValueChange={(value) => setSelectedPriority(parseInt(value) as PromptPriority)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a priority..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          {option.value === 1 && <Flame className="h-3 w-3 text-red-500" />}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Product/Epic Selector */}
              <ProductEpicSelector
                products={products}
                epics={epics}
                selectedProductId={selectedProduct}
                selectedEpicId={selectedEpic}
                onProductChange={handleProductChange}
                onEpicChange={handleEpicChange}
              />

              {/* AI Provider Selection */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">
                  AI Provider
                </div>
                <ProviderSelector
                  value={providerConfig}
                  onChange={setProviderConfig}
                />
              </div>

              {/* Knowledge Integration Section */}
              <div className="space-y-3 p-3 border rounded-md bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Use knowledge
                    </label>
                  </div>
                  <Switch 
                    checked={enableKnowledge} 
                    onCheckedChange={setEnableKnowledge}
                    aria-label="Toggle knowledge usage"
                  />
                </div>

                {enableKnowledge && knowledgeItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Select knowledge to include ({knowledgeItems.length} available)
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {knowledgeItems.map(item => (
                        <div 
                          key={item.id}
                          className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                            selectedKnowledgeIds.includes(item.id) 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-background hover:bg-muted border border-border'
                          }`}
                          onClick={() => handleKnowledgeToggle(item.id)}
                        >
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-muted-foreground truncate">{item.category}</div>
                        </div>
                      ))}
                    </div>
                    {selectedKnowledgeIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedKnowledgeItems.map(item => (
                          <Badge 
                            key={item.id} 
                            variant="secondary" 
                            className="text-xs flex items-center gap-1"
                          >
                            {item.title}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => handleKnowledgeToggle(item.id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {enableKnowledge && knowledgeItems.length === 0 && (
                  <button 
                    onClick={handleOpenKnowledge}
                    className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer"
                  >
                    No knowledge available for this product. Click to add some →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-auto flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
            Cancel
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Keyboard className="h-3 w-3" />
              <span>Esc</span>
            </div>
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasContent || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              showAnimation ? 'Enhancing with AI...' : 'Saving...'
            ) : (
              <>
                Save
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <Keyboard className="h-3 w-3" />
                  <span>Enter</span>
                </div>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Knowledge Modal */}
    <Dialog open={isKnowledgeModalOpen} onOpenChange={setIsKnowledgeModalOpen}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Knowledge for {products?.find(p => p.id === selectedProduct)?.name || 'Product'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <KnowledgeBase 
            workspace={workspace} 
            product={products?.find(p => p.id === selectedProduct)} 
          />
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Prompt Generation Animation */}
    <PromptGenerationAnimation
      isVisible={showAnimation}
      currentStep={generationStep}
      selectedProvider={providerConfig.provider}
    />
    </>
  );
};