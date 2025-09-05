import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Calendar, Package, Hash, Clock, Copy, RefreshCw, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePrompts } from '@/hooks/usePrompts';
import { PromptTransformService, stripHtmlAndNormalize } from '@/services/promptTransformService';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Prompt, Product, Epic } from '@/types';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  epics: Epic[];
}

export function PromptDetailDialog({ prompt, open, onOpenChange, products, epics }: PromptDetailDialogProps) {
  const [productId, setProductId] = useState<string>('none');
  const [epicId, setEpicId] = useState<string>('none');
  const [saving, setSaving] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [textLength, setTextLength] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [localDescription, setLocalDescription] = useState(prompt?.description || '');
  const [localTitle, setLocalTitle] = useState(prompt?.title || '');
  const [descriptionSaving, setDescriptionSaving] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const { toast } = useToast();
  const { updatePrompt, updatePromptSilently } = usePrompts();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout>();

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
      const htmlContent = editor.getHTML();
      const cleanText = stripHtmlAndNormalize(htmlContent);
      setTextLength(cleanText.length);
    },
  });

  // Auto-save hook
  const { clearDraft } = useAutoSave({
    key: prompt ? `prompt_${prompt.id}` : 'prompt_edit',
    editor,
    isOpen: open,
    onRestore: (content) => {
      setDraftRestored(true);
      setTimeout(() => setDraftRestored(false), 3000); // Hide indicator after 3s
    },
  });

  // Debounced save function for description
  const debouncedSave = useCallback(async (description: string) => {
    if (!prompt) return;
    
    setDescriptionSaving(true);
    try {
      await updatePromptSilently(prompt.id, { description });
    } catch (error) {
      console.error('Error saving description:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde de la description',
        variant: 'destructive'
      });
    } finally {
      setDescriptionSaving(false);
    }
  }, [prompt, updatePromptSilently, toast]);

  // Debounced save function for title
  const debouncedSaveTitle = useCallback(async (title: string) => {
    if (!prompt) return;
    
    setTitleSaving(true);
    try {
      await updatePromptSilently(prompt.id, { title });
    } catch (error) {
      console.error('Error saving title:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde du titre',
        variant: 'destructive'
      });
    } finally {
      setTitleSaving(false);
    }
  }, [prompt, updatePromptSilently, toast]);

  // Reset form when prompt changes (but preserve draft if one exists)
  useEffect(() => {
    if (prompt && editor && !draftRestored) {
      // Load the original user content (description) into the editor
      const originalContent = prompt.description || `<h1>${prompt.title}</h1>`;
      
      console.log('PromptDetailDialog: Loading prompt content', {
        promptId: prompt.id,
        title: prompt.title,
        hasDescription: !!prompt.description,
        descriptionLength: prompt.description?.length || 0,
        descriptionPreview: prompt.description?.substring(0, 100) || 'No description',
        originalContentLength: originalContent.length
      });
      
      editor.commands.setContent(originalContent);
      setLocalDescription(prompt.description || '');
      setLocalTitle(prompt.title || '');
      setProductId(prompt.product_id || 'none');
      setEpicId(prompt.epic_id || 'none');
      
      // Load the AI-generated prompt separately for the preview panel
      setGeneratedPrompt(prompt.generated_prompt || '');
      
      // Calculate initial text length from original content
      const cleanText = stripHtmlAndNormalize(originalContent);
      setTextLength(cleanText.length);
    }
  }, [prompt, editor, draftRestored]);

  // Cleanup timeouts when component unmounts or prompt changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
    };
  }, [prompt?.id]);

  const handleRegeneratePrompt = async () => {
    if (!editor || !prompt) return;
    
    setIsRegenerating(true);
    try {
      const htmlContent = editor.getHTML();
      const response = await PromptTransformService.transformPrompt(htmlContent);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        setGeneratedPrompt(response.transformedPrompt);
        
        // Persist to database immediately
        await updatePrompt(prompt.id, {
          generated_prompt: response.transformedPrompt,
          generated_at: new Date().toISOString(),
        });
      }

      toast({
        title: 'Prompt Regenerated',
        description: 'Prompt has been regenerated and saved successfully'
      });
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      toast({
        title: 'Error',
        description: 'Unable to regenerate prompt',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateFromOriginal = async () => {
    if (!prompt || !prompt.description?.trim()) return;
    
    setIsRegenerating(true);
    try {
      const response = await PromptTransformService.transformPrompt(prompt.description);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        setGeneratedPrompt(response.transformedPrompt);
        
        // Persist to database immediately
        await updatePrompt(prompt.id, {
          generated_prompt: response.transformedPrompt,
          generated_at: new Date().toISOString(),
        });
      }

      toast({
        title: 'Prompt regenerated from original text',
        description: 'Prompt has been regenerated and saved successfully'
      });
    } catch (error) {
      console.error('Error regenerating prompt from original:', error);
      toast({
        title: 'Error',
        description: 'Unable to regenerate prompt from original text',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: 'Copied',
        description: 'Prompt has been copied to clipboard'
      });
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast({
        title: 'Error',
        description: 'Unable to copy prompt',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    if (!prompt || !editor) return;

    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;

    setSaving(true);
    try {
      // Generate descriptive title from content  
      const updatedTitle = generateTitleFromContent(content);
      
      await updatePrompt(prompt.id, {
        title: updatedTitle, // Auto-generated descriptive title
        description: content,
        product_id: productId === 'none' ? null : productId,
        epic_id: epicId === 'none' ? null : epicId,
      });

      // Clear draft after successful save
      clearDraft();
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const filteredEpics = epics.filter(epic => productId === 'none' || !productId || epic.product_id === productId);

  if (!prompt || !editor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-4xl h-[90vh] max-h-[600px] lg:max-h-[85vh] p-0 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Edit Idea
            {draftRestored && (
              <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <RotateCcw className="h-4 w-4" />
                <span>Draft restored</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Edit prompt details with rich text formatting, product and epic assignment.
          </DialogDescription>
        </DialogHeader>

        {/* Mobile: Tab Navigation */}
        <div className="lg:hidden border-b flex-shrink-0">
          <div className="flex">
            <Button
              variant={activeTab === 'edit' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('edit')}
              className="flex-1 rounded-none h-12"
              size="sm"
            >
              Edit
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="flex-1 rounded-none h-12"
              size="sm"
            >
              Preview
            </Button>
          </div>
        </div>

        {/* Mobile Content - Tab based */}
        <div className="lg:hidden flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'edit' ? (
              <div className="space-y-4">
                {/* Metadata */}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created on {format(new Date(prompt.created_at), 'MM/dd/yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Modified on {format(new Date(prompt.updated_at), 'MM/dd/yyyy')}</span>
                  </div>
                </div>

                <Separator />

                {/* Context Warning */}
                {textLength < 20 && textLength > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      Add more context for better AI generation.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Compact toolbar */}
                <div className="flex items-center gap-1 p-2 border rounded-md bg-muted/30 overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editor */}
                <div className="border rounded-md min-h-[200px]">
                  <EditorContent 
                    editor={editor}
                    className="w-full h-full"
                  />
                </div>

                {/* Assignment - Stacked */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={productId} onValueChange={(value) => {
                      setProductId(value);
                      if (value === 'none') setEpicId('none');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No product</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Epic</Label>
                    <Select value={epicId} onValueChange={setEpicId} disabled={productId === 'none'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No epic</SelectItem>
                        {filteredEpics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id}>
                            {epic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Generated Prompt</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegeneratePrompt}
                      disabled={isRegenerating || textLength === 0}
                    >
                      {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPrompt}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md bg-muted/20 p-4 max-h-[300px] overflow-y-auto">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedPrompt || 'No prompt generated. Use the button above to generate a prompt based on your content.' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="border-t p-4 flex gap-3 flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !editor?.getHTML() || editor?.getHTML() === '<p></p>'}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-6 h-full flex-1 overflow-y-auto p-6">
          {/* Desktop Left Panel - Editor */}
          <div className="flex-1 space-y-4 min-h-0 p-6">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created on {format(new Date(prompt.created_at), 'MM/dd/yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Modified on {format(new Date(prompt.updated_at), 'MM/dd/yyyy')}</span>
              </div>
            </div>

            <Separator />

            {/* Context Warning */}
            {textLength < 20 && textLength > 0 && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Add more context for better AI generation.
                </AlertDescription>
              </Alert>
            )}

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

            {/* Original Text Edit */}
            {prompt && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Original Text</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Prompt title"
                      value={localTitle}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setLocalTitle(newValue);
                        
                        // Clear existing timeout
                        if (titleSaveTimeoutRef.current) {
                          clearTimeout(titleSaveTimeoutRef.current);
                        }
                        
                        // Set new timeout for debounced save
                        titleSaveTimeoutRef.current = setTimeout(() => {
                          debouncedSaveTitle(newValue);
                        }, 500);
                      }}
                      className="text-sm"
                      disabled={titleSaving}
                    />
                    {titleSaving && (
                      <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                        Sauvegarde...
                      </div>
                    )}
                  </div>
                   <div className="relative">
                     <Textarea
                       placeholder="Prompt description"
                       value={localDescription}
                       onChange={(e) => {
                         const newValue = e.target.value;
                         setLocalDescription(newValue);
                         
                         // Clear existing timeout
                         if (saveTimeoutRef.current) {
                           clearTimeout(saveTimeoutRef.current);
                         }
                         
                         // Set new timeout for debounced save
                         saveTimeoutRef.current = setTimeout(() => {
                           debouncedSave(newValue);
                         }, 500);
                       }}
                       className="text-sm min-h-[100px]"
                       disabled={descriptionSaving}
                     />
                     {descriptionSaving && (
                       <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                         Sauvegarde...
                       </div>
                     )}
                   </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateFromOriginal}
                    disabled={isRegenerating || !prompt.description?.trim()}
                    className="w-full"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate from original text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Rich text editor */}
            <div className="border rounded-md bg-background flex-1 overflow-y-auto max-h-[400px]">
              <EditorContent 
                editor={editor}
                className="w-full h-full"
              />
            </div>

            {/* Product and Epic assignment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={productId} onValueChange={(value) => {
                  setProductId(value);
                  if (value === 'none') {
                    setEpicId('none');
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="none">No product</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {product.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Epic</Label>
                <Select value={epicId} onValueChange={setEpicId} disabled={productId === 'none'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="none">No epic</SelectItem>
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
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || !editor.getHTML() || editor.getHTML() === '<p></p>'}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Desktop Right Panel - Generated Prompt Preview */}
          <div className="w-80 border-l pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Prompt</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegeneratePrompt}
                  disabled={isRegenerating || textLength === 0}
                  title={textLength === 0 ? "Add content to regenerate" : "Regenerate prompt"}
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrompt}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg bg-muted p-4 max-h-[500px] overflow-y-auto">
              <div className="relative">
                <div className="absolute top-0 right-0 text-xs text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded-bl text-mono">
                  AI Prompt
                </div>
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed pt-6">
                  {generatedPrompt ? 
                    generatedPrompt.replace(/<[^>]*>/g, '') : 
                    'No prompt generated. Click the button to generate a prompt based on your content.'
                  }
                </pre>
              </div>
            </div>
            
            {prompt.generated_at && (
              <p className="text-xs text-muted-foreground">
                Generated on {format(new Date(prompt.generated_at), 'MM/dd/yyyy at HH:mm')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}