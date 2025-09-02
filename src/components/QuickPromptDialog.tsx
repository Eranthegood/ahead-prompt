import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Loader2, Flame, RotateCcw } from 'lucide-react';
import { PromptTransformService } from '@/services/promptTransformService';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
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
}

export const QuickPromptDialog: React.FC<QuickPromptDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  products = [],
  selectedProductId,
}) => {
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [selectedProduct, setSelectedProduct] = useState<string>('none');
  const [selectedPriority, setSelectedPriority] = useState<PromptPriority>(2); // Default to Normal priority
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [draftRestored, setDraftRestored] = useState(false);
  const { toast } = useToast();
  const { awardXP } = useGamification();

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

  // Auto-save hook
  const { clearDraft } = useAutoSave({
    key: 'quick_prompt',
    editor,
    isOpen,
    onRestore: (content) => {
      setDraftRestored(true);
      setHasContent(true);
      setTimeout(() => setDraftRestored(false), 3000); // Hide indicator after 3s
    },
  });

  // Filter epics by selected product (either from props or local selection)
  const activeProductId = selectedProductId || (selectedProduct !== 'none' ? selectedProduct : undefined);
  const filteredEpics = activeProductId 
    ? epics.filter(epic => epic.product_id === activeProductId)
    : epics;

  // Reset form when dialog opens - ALWAYS start fresh
  useEffect(() => {
    if (isOpen && editor) {
      // Always clear draft and reset form for a fresh start
      clearDraft();
      
      setTimeout(() => {
        editor.commands.setContent('');
        setSelectedEpic('none');
        setSelectedPriority(2);
        setHasContent(false);
        setGeneratedPrompt('');
        setSelectedProduct(selectedProductId || 'none');
        setDraftRestored(false);
        
        if (editor.view) {
          editor.commands.focus();
        }
      }, 100);
    }
  }, [isOpen, editor, selectedProductId, products, clearDraft]);

  // Handle save with immediate creation and background AI generation
  const handleSave = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;


    setIsLoading(true);
    
    try {
      const resolvedProductId = selectedEpic === 'none'
        ? (selectedProductId ?? (selectedProduct !== 'none' ? selectedProduct : undefined))
        : undefined;

      // Generate descriptive title from content
      const generatedTitle = generateTitleFromContent(content);

      // 🚀 Create prompt immediately without waiting for AI generation
      const promptData: CreatePromptData = {
        title: generatedTitle,
        description: content,
        epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
        product_id: resolvedProductId,
        priority: selectedPriority,
        // No generated_prompt yet - will be added later
      };

      // Save immediately for instant UI feedback
      const createdPrompt = await onSave(promptData);
      
      // Clear draft after successful save
      clearDraft();
      
      // Show success feedback immediately
      toast({
        title: 'Prompt created!',
        description: 'AI generation starting in background...',
        variant: 'default'
      });
      
      onClose();

      // 🔥 Generate AI prompt in background (non-blocking)
      if (createdPrompt?.id) {
        // Start background AI generation with HTML content
        generatePromptInBackground(createdPrompt.id, content);
      }

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

  // Background AI generation function
  const generatePromptInBackground = async (promptId: string, rawText: string) => {
    try {
      // Use the new edge function for background generation
      const { data, error } = await supabase.functions.invoke('generate-prompt-background', {
        body: { promptId, rawText }
      });
      
      if (data?.success) {
        awardXP('AI_GENERATION');
        
        // Optional: Show completion notification
        toast({
          title: 'AI generation complete!',
          description: 'Your prompt has been enhanced.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Background AI generation failed:', error);
      // Don't show error to user since prompt was already created successfully
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

  if (!editor) return null;

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
          {/* Left side - Editor */}
          <div className="space-y-4 flex-1 min-h-0">
            {/* Formatting toolbar */}
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            </div>

            {/* Rich text editor */}
            <div className="border rounded-md bg-background flex-1 overflow-y-auto max-h-[400px]">
              <EditorContent 
                editor={editor}
                className="w-full h-full"
              />
            </div>

            {/* Priority, Product and Epic assignment */}
            <div className="space-y-4">
              {/* Priority Selector */}
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

              {products.length > 0 && (
                <div>
                   <label className="text-sm font-medium text-muted-foreground mb-2 block">
                     Product (optional)
                   </label>
                  <Select value={selectedProduct} onValueChange={(value) => {
                    setSelectedProduct(value);
                    if (value !== 'none') {
                      setSelectedEpic('none');
                    }
                  }}>
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
              
              {filteredEpics.length > 0 && (
                <div>
                   <label className="text-sm font-medium text-muted-foreground mb-2 block">
                     Epic (optional)
                   </label>
                  <Select value={selectedEpic} onValueChange={(value) => {
                    setSelectedEpic(value);
                    if (value !== 'none') {
                      setSelectedProduct('none');
                    }
                  }}>
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

          {/* Right side - Generated Prompt */}
          {generatedPrompt && (
            <div className="lg:w-80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Generated Prompt</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPrompt);
                      toast({ title: 'Copied!', description: 'Prompt copied to clipboard.' });
                    }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="border rounded-md bg-muted/20 p-4 text-sm">
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: generatedPrompt.replace(/\n/g, '<br>') }} />
              </div>
               <p className="text-xs text-muted-foreground">
                 This prompt will be automatically saved and remain accessible after closing.
               </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-auto flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasContent || isLoading || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};