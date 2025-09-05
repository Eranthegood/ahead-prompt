import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Flame, RotateCcw, BookOpen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProductEpicSelector } from '@/components/ProductEpicSelector';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { ProviderSelector, ProviderConfig } from '@/components/ProviderSelector';
import { KnowledgeBase } from '@/components/KnowledgeBase';
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
  // Form state
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

  // Reset form when dialog opens
  const resetForm = () => {
    if (!editor) return;
    console.info('[QuickPromptDialog] resetForm start', {
      selectedEpicId,
      selectedProductId,
      epicsCount: epics.length,
    });
    
    clearDraft();
    editor.commands.setContent('');
    
    // Handle epic selection and auto-select parent product
    if (selectedEpicId) {
      const selectedEpicData = epics.find(epic => epic.id === selectedEpicId);
      console.info('[QuickPromptDialog] found epic', { exists: !!selectedEpicData, productId: selectedEpicData?.product_id });
      if (selectedEpicData) {
        setSelectedEpic(selectedEpicId);
        // Auto-select the parent product
        setSelectedProduct(selectedEpicData.product_id);
      } else {
        setSelectedEpic(null);
        setSelectedProduct(selectedProductId || null);
      }
    } else {
      setSelectedEpic(null);
      setSelectedProduct(selectedProductId || null);
    }
    
    setSelectedPriority(2);
    setHasContent(false);
    setDraftRestored(false);
    
    // Reset knowledge selection but keep useKnowledge enabled
    setSelectedKnowledgeIds([]);
    
    // Focus editor after a brief delay to ensure DOM is ready
    if (editor && editor.view && editor.view.dom) {
      setTimeout(() => {
        editor.commands.focus();
      }, 150);
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

  // Create prompt data object from form state
  const createPromptData = (content: string): CreatePromptData => {
    const inferredProductId = selectedProduct || (selectedEpic ? epics.find(e => e.id === selectedEpic)?.product_id || null : null);
    
    // Include knowledge context if enabled and items selected
    const knowledgeContext = enableKnowledge && selectedKnowledgeIds.length > 0 
      ? selectedKnowledgeIds 
      : undefined;
    
    console.log('Creating prompt with data:', {
      epic_id: selectedEpic,
      product_id: inferredProductId,
      priority: selectedPriority,
      knowledge_context: knowledgeContext,
      ai_provider: providerConfig.provider,
      ai_model: providerConfig.model,
    });
    
    return {
      title: generateTitleFromContent(content),
      description: content,
      epic_id: selectedEpic || undefined,
      product_id: inferredProductId || undefined,
      priority: selectedPriority,
      knowledge_context: knowledgeContext,
      ai_provider: providerConfig.provider,
      ai_model: providerConfig.model,
    };
  };


  // Main save handler - creates prompt and lets usePrompts handle generation
  const handleSave = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;

    setIsLoading(true);
    
    try {
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
      
      console.log(`Prompt creation completed in ${responseTime}ms`);
      
      // Clear draft and show success
      clearDraft();
      toast({
        title: 'Prompt created!',
        description: 'Your prompt will be generated automatically.',
        variant: 'default'
      });
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle product and epic selection
  const handleProductChange = (productId: string | null) => {
    setSelectedProduct(productId);
    console.log('Product selected:', productId ? products.find(p => p.id === productId)?.name : 'none');
  };

  const handleEpicChange = (epicId: string | null) => {
    setSelectedEpic(epicId);
    console.log('Epic selected:', epicId ? epics.find(e => e.id === epicId)?.name : 'none');
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(resetForm, 100);
    }
  }, [isOpen, editor, selectedProductId, selectedEpicId, products, epics, clearDraft]);

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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasContent || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
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
    </>
  );
};