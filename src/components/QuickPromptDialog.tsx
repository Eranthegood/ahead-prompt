import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Flame, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
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
}) => {
  // Form state
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [selectedProduct, setSelectedProduct] = useState<string>('none');
  const [selectedPriority, setSelectedPriority] = useState<PromptPriority>(2);
  
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
    
    clearDraft();
    editor.commands.setContent('');
    setSelectedEpic(selectedEpicId || 'none');
    setSelectedPriority(2);
    setHasContent(false);
    setSelectedProduct(selectedProductId || 'none');
    setDraftRestored(false);
    
    // Focus editor after a brief delay to ensure DOM is ready
    if (editor.view) {
      editor.commands.focus();
    }
  };

  // Create prompt data object from form state
  const createPromptData = (content: string): CreatePromptData => {
    const resolvedProductId = selectedEpic === 'none'
      ? (selectedProductId ?? (selectedProduct !== 'none' ? selectedProduct : undefined))
      : undefined;

    return {
      title: generateTitleFromContent(content),
      description: content,
      epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
      product_id: resolvedProductId,
      priority: selectedPriority,
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

  // Handle product selection and clear epic if product changes
  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
    if (value !== 'none') {
      setSelectedEpic('none');
    }
  };

  // Handle epic selection and clear product if epic changes
  const handleEpicChange = (value: string) => {
    setSelectedEpic(value);
    if (value !== 'none') {
      setSelectedProduct('none');
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(resetForm, 100);
    }
  }, [isOpen, editor, selectedProductId, selectedEpicId, products, clearDraft]);

  if (!editor) return null;

  const filteredEpics = getFilteredEpics();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Your Idea
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
                  Priorité
                </label>
                <Select value={selectedPriority.toString()} onValueChange={(value) => setSelectedPriority(parseInt(value) as PromptPriority)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Sélectionner une priorité..." />
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

              {/* Product selector */}
              {products.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Product (optional)
                  </label>
                  <Select value={selectedProduct} onValueChange={handleProductChange}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No product</span>
                      </SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: product.color }}
                            />
                            {product.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Epic selector */}
              {filteredEpics.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Epic (optional)
                  </label>
                  <Select value={selectedEpic} onValueChange={handleEpicChange}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select an epic..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No epic</span>
                      </SelectItem>
                      {filteredEpics.map((epic) => (
                        <SelectItem key={epic.id} value={epic.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: epic.color }}
                            />
                            {epic.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
  );
};