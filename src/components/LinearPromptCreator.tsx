import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, RotateCcw, BookOpen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent, extractTextFromHTML } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProductEpicSelector } from '@/components/ProductEpicSelector';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { ProviderSelector, ProviderConfig as SelectorProviderConfig } from '@/components/ProviderSelector';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { RedditPixelService } from '@/services/redditPixelService';
import { PromptGenerationAnimation } from '@/components/PromptGenerationAnimation';
import { useEventSubscription } from '@/hooks/useEventManager';
import { useLinearPromptCreator } from '@/hooks/useLinearPromptCreator';
import type { Workspace, Epic, Product, PromptPriority, KnowledgeItem } from '@/types';
import { PRIORITY_OPTIONS } from '@/types';

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
    <div className="flex items-center gap-2 p-3 border rounded-md bg-card border-border">
      {toolbarButtons.map((button, index) => 
        button === null ? (
          <div key={`separator-${index}`} className="w-px h-6 bg-border mx-1" />
        ) : (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            className={`h-8 w-8 p-0 transition-colors ${
              button.isActive 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
            aria-label={`Toggle ${button.icon.name}`}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  );
};

export const LinearPromptCreator: React.FC<LinearPromptCreatorProps> = ({
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
  onProductsRefetch,
}) => {
  const { toast } = useToast();
  const { trackPromptCreation } = usePromptMetrics();
  
  const {
    title,
    setTitle,
    priority,
    setPriority,
    selectedProduct,
    setSelectedProduct,
    selectedEpic,
    setSelectedEpic,
    providerConfig,
    setProviderConfig,
    selectedKnowledge,
    setSelectedKnowledge,
    resetForm,
  } = useLinearPromptCreator({ selectedProductId, selectedEpicId });

  // Knowledge items depend on currently selected product (after hook init)
  const { knowledgeItems } = useKnowledge(workspace.id, selectedProduct || selectedProductId);

  // Local-echo product list for instant availability
  const [modalProducts, setModalProducts] = useState<Product[]>(products);
  useEffect(() => {
    setModalProducts(products);
  }, [products]);

  // Listen for product creation events using EventManager
  useEventSubscription('product:created', (data) => {
    const newProduct = data?.product || data;
    if (!newProduct?.id) return;
    setModalProducts(prev => (prev.some(p => p.id === newProduct.id) ? prev : [newProduct, ...prev]));
    setSelectedProduct(newProduct.id);
  }, [setSelectedProduct]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);
  const [generationStep, setGenerationStep] = useState<'input' | 'knowledge' | 'processing' | 'output' | 'complete'>('input');
  
  // Knowledge modal state
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  // Rich text editor
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
    key: `linear-prompt-draft-${workspace.id}-${workspace.owner_id}`,
    editor,
    isOpen,
    onRestore: (content) => {
      setDraftRestored(true);
      setHasContent(true);
      setTimeout(() => setDraftRestored(false), 3000);
    },
  });

  useEffect(() => {
    if (isOpen && editor) {
      resetForm();
      if (editor && editor.view && editor.view.dom) {
        editor.commands.focus();
      }
    }
  }, [isOpen, resetForm, editor]);

  // Filter epics based on selected product
  const filteredEpics = epics.filter(epic => 
    !selectedProduct || epic.product_id === selectedProduct
  );

  // Handle knowledge selection
  const handleKnowledgeToggle = (knowledgeId: string) => {
    const currentIds = selectedKnowledge.map(k => k.id);
    const newIds = currentIds.includes(knowledgeId) 
      ? currentIds.filter(id => id !== knowledgeId)
      : [...currentIds, knowledgeId];
    
    const newKnowledgeItems = knowledgeItems.filter(item => newIds.includes(item.id));
    setSelectedKnowledge(newKnowledgeItems);
  };

  const handleOpenKnowledge = () => {
    setIsKnowledgeModalOpen(true);
  };

  const handleCloseKnowledge = () => {
    setIsKnowledgeModalOpen(false);
  };

  const createPromptData = (content: string): CreatePromptData => {
    const actualProduct = selectedProduct || selectedProductId;
    const actualEpic = selectedEpic || selectedEpicId;

    // Auto-assign product if epic is selected but no product
    let finalProductId = actualProduct;
    if (actualEpic && !actualProduct) {
      const epic = epics.find(e => e.id === actualEpic);
      if (epic?.product_id) {
        finalProductId = epic.product_id;
      }
    }

    // Strip HTML from content for plain text description
    const plainTextContent = extractTextFromHTML(content);
    
    // Keep original content (HTML or title) for AI generation
    const originalContent = content.trim() || title.trim();

    console.log('🚀 Creating prompt data:', {
      originalContent: originalContent.substring(0, 100) + '...',
      plainTextContent: plainTextContent.substring(0, 100) + '...',
      hasKnowledge: selectedKnowledge.length > 0,
      provider: providerConfig.provider,
      model: providerConfig.model
    });

    return {
      title: title.trim() || generateTitleFromContent(plainTextContent),
      description: plainTextContent,
      original_description: originalContent, // 🔥 This is key for generation!
      epic_id: actualEpic,
      product_id: finalProductId,
      priority,
      knowledge_context: selectedKnowledge.length > 0 ? selectedKnowledge.map(k => k.id) : undefined,
      ai_provider: providerConfig.provider,
      ai_model: providerConfig.model,
    };
  };

  const handleSave = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;

    setIsLoading(true);
    
    try {
      // Show animation if knowledge is enabled and items are selected
      const shouldShowAnimation = selectedKnowledge.length > 0;
      
      if (shouldShowAnimation) {
        setShowGenerationAnimation(true);
        setGenerationStep('input');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationStep('knowledge');
        
        await new Promise(resolve => setTimeout(resolve, 1200));
        setGenerationStep('processing');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGenerationStep('output');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationStep('complete');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowGenerationAnimation(false);
      }

      const promptData = createPromptData(content);
      
      // 🚨 CRITICAL UX FLOW - DO NOT MODIFY WITHOUT READING PROMPT_GENERATION_CRITICAL.md
      // Dialog MUST close immediately (< 100ms) - this is the core UX of Ahead.love
      console.log('🚀 LinearPromptCreator: Closing dialog immediately for fluid UX');
      onClose();
      
      // Start background generation (DO NOT AWAIT!)
      onSave(promptData).catch(error => {
        console.error('Background prompt creation failed:', error);
      });

      // Track metrics
      trackPromptCreation(200, {
        hasKnowledgeContext: selectedKnowledge.length > 0,
        priority,
        hasEpic: !!selectedEpic,
        hasProduct: !!selectedProduct,
      });

      // Track Reddit Pixel conversion
      if (workspace.created_at) {
        const accountAge = Date.now() - new Date(workspace.created_at).getTime();
        const isFirstDay = accountAge < 24 * 60 * 60 * 1000;
        
        if (isFirstDay) {
          RedditPixelService.trackFirstPromptCreated(workspace.id);
        } else {
          RedditPixelService.trackPromptCreated(Date.now().toString(), workspace.id);
        }
      }

      // Clear draft and show success
      clearDraft();
      toast({
        title: 'Prompt created!',
        description: shouldShowAnimation ? 'Your enhanced prompt has been generated!' : 'Your prompt will be generated automatically.',
        variant: 'default'
      });

      // Reset form
      resetForm();
      editor?.commands.clearContent();
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast({
        title: "Error creating prompt",
        description: "Please try again.",
        variant: "destructive",
      });
      setShowGenerationAnimation(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement as HTMLElement;
      const isEditableElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.closest('[contenteditable="true"]')
      );

      if (!isEditableElement) {
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle product/epic selection
  const handleProductChange = (productId: string | null) => {
    setSelectedProduct(productId);
    
    if (selectedEpic && productId) {
      const epic = epics.find(e => e.id === selectedEpic);
      if (epic && epic.product_id !== productId) {
        setSelectedEpic(null);
      }
    }
  };

  const handleEpicChange = (epicId: string | null) => {
    setSelectedEpic(epicId);
    
    if (epicId) {
      const epic = epics.find(e => e.id === epicId);
      if (epic) {
        setSelectedProduct(epic.product_id);
      }
    }
  };

  if (!editor) return null;

  return (
    <>
      {showGenerationAnimation && (
        <PromptGenerationAnimation
          isVisible={showGenerationAnimation}
          onComplete={() => setShowGenerationAnimation(false)}
          currentStep={generationStep}
        />
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto flex flex-col"
          onKeyDown={handleKeyDown}
          data-dialog-content
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              Capture Your Next AI Move
              {draftRestored && (
                <div className="flex items-center gap-1 text-sm text-accent">
                  <RotateCcw className="h-4 w-4" />
                  <span>Draft restored</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6">
            {/* Rich text editor with formatting toolbar */}
            <div className="space-y-4">
              <FormattingToolbar editor={editor} />
              <div className="border rounded-md bg-card">
                <EditorContent 
                  editor={editor} 
                  className="prose prose-sm max-w-none p-4 rounded-md min-h-[300px] focus-within:outline-none"
                />
              </div>
            </div>

            {/* Product/Epic Selection */}
            <ProductEpicSelector
              products={modalProducts}
              epics={filteredEpics}
              selectedProductId={selectedProduct}
              selectedEpicId={selectedEpic}
              onProductChange={handleProductChange}
              onEpicChange={handleEpicChange}
            />

            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority?.toString()} onValueChange={(value) => setPriority(parseInt(value) as PromptPriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          option.variant === 'destructive' ? 'bg-red-500' :
                          option.variant === 'secondary' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Provider Selection */}
            <ProviderSelector
              value={providerConfig as SelectorProviderConfig}
              onChange={setProviderConfig}
            />

            {/* Knowledge Context */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Knowledge Context</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenKnowledge}
                  className="text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Browse ({selectedKnowledge.length} selected)
                </Button>
              </div>
              
              {selectedKnowledge.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedKnowledge.map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handleKnowledgeToggle(item.id)}
                    >
                      {item.title}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Press Enter to save • Esc to close
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading || !hasContent}
                className="min-w-[120px]"
              >
                {isLoading ? 'Creating...' : 'Create Prompt'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Knowledge Modal */}
      {isKnowledgeModalOpen && (
        <Dialog open={isKnowledgeModalOpen} onOpenChange={handleCloseKnowledge}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Knowledge Items</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {knowledgeItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No knowledge items found for this product.
                </div>
              ) : (
                <div className="grid gap-2">
                  {knowledgeItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedKnowledge.some(k => k.id === item.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleKnowledgeToggle(item.id)}
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {item.content.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};