import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Expand, X, ChevronRight, Paperclip, Folder } from 'lucide-react';
import { ProductIcon } from '@/components/ui/product-icon';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent, extractTextFromHTML } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import { useKnowledge } from '@/hooks/useKnowledge';
import { RedditPixelService } from '@/services/redditPixelService';
import { PromptGenerationAnimation } from '@/components/PromptGenerationAnimation';
import { LinearActionButtons } from '@/components/ui/linear-buttons';
import { useLinearPromptCreator } from '@/hooks/useLinearPromptCreator';
import type { Workspace, Epic, Product, PromptPriority, KnowledgeItem } from '@/types';

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
}

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
}) => {
  const { toast } = useToast();
  const { trackPromptCreation } = usePromptMetrics();
  const { knowledgeItems } = useKnowledge(workspace.id, selectedProductId);
  
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
    isExpanded,
    setIsExpanded,
    resetForm,
  } = useLinearPromptCreator({ selectedProductId, selectedEpicId });

  // Force re-render when products list changes
  useEffect(() => {
    console.log('[LinearPromptCreator] Products updated:', products.length);
  }, [products]);

  const [showGenerationAnimation, setShowGenerationAnimation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Rich text editor for expanded mode
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Auto-save functionality  
  const { clearDraft } = useAutoSave({
    key: `linear-prompt-draft-${workspace.id}-${workspace.owner_id}`,
    editor,
    isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Filter epics based on selected product
  const filteredEpics = epics.filter(epic => 
    !selectedProduct || epic.product_id === selectedProduct
  );

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

    return {
      title: title.trim() || generateTitleFromContent(plainTextContent),
      description: plainTextContent,
      original_description: plainTextContent,
      epic_id: actualEpic,
      product_id: finalProductId,
      priority,
      knowledge_context: selectedKnowledge.length > 0 ? selectedKnowledge.map(k => k.id) : undefined,
      ai_provider: providerConfig.provider,
      ai_model: providerConfig.model,
    };
  };

  const handleSave = async () => {
    const content = isExpanded ? editor?.getHTML() || '' : title;
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a prompt title or description.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Show generation animation if knowledge items are selected
      if (selectedKnowledge.length > 0) {
        setShowGenerationAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowGenerationAnimation(false);
      }

      const promptData = createPromptData(content);
      await onSave(promptData);

      // 🚨 CRITICAL UX FLOW - DO NOT MODIFY WITHOUT READING PROMPT_GENERATION_CRITICAL.md
      // Dialog MUST close immediately (< 100ms) - this is the core UX of Ahead.love
      onClose();

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

      toast({
        title: "Prompt created",
        description: "Your prompt has been saved successfully.",
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isExpanded, handleSave, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {showGenerationAnimation && (
        <PromptGenerationAnimation
          isVisible={showGenerationAnimation}
          onComplete={() => setShowGenerationAnimation(false)}
          currentStep="processing"
        />
      )}
      
      <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div 
          className="border border-border rounded-lg w-full max-w-4xl mx-auto shadow-lg linear-prompt-creator max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#16161c' }}
        >
        {/* Header with breadcrumb */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <ProductIcon className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Workspace</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">New Prompt</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <Expand className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Title input */}
          <input 
            type="text" 
            placeholder="Prompt title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-medium bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
            autoFocus
          />
          
          {/* Expanded rich text editor */}
          {isExpanded && (
            <div className="space-y-4 border-t border-border pt-6">
              <div className="min-h-[200px] border border-border rounded-md">
                <EditorContent 
                  editor={editor} 
                  className="prose prose-sm max-w-none p-4 rounded-md"
                />
              </div>
            </div>
          )}
          
          {/* Linear action buttons */}
          <LinearActionButtons
            priority={priority}
            onPriorityChange={setPriority}
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
            selectedEpic={selectedEpic}
            onEpicChange={setSelectedEpic}
            providerConfig={providerConfig}
            onProviderChange={setProviderConfig}
            products={products}
            epics={filteredEpics}
            onCreateProduct={onCreateProduct}
            onCreateEpic={onCreateEpic}
            knowledgeItems={knowledgeItems}
            selectedKnowledge={selectedKnowledge}
            onKnowledgeChange={setSelectedKnowledge}
            onExpandToggle={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSave}
              disabled={isGenerating || (!title.trim() && !editor?.getHTML()?.trim())}
            >
              {isGenerating ? 'Creating...' : 'Create prompt'}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};