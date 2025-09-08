import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Calendar, Package, Hash, Clock, Copy, RefreshCw, Loader2, AlertTriangle, RotateCcw, Save, Zap, Flame, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePrompts } from '@/hooks/usePrompts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { PromptTransformService, stripHtmlAndNormalize } from '@/services/promptTransformService';
import { generateTitleFromContent } from '@/lib/titleUtils';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AIAgentManager } from '@/services/aiAgentManager';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Prompt, Product, Epic, PRIORITY_OPTIONS } from '@/types';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  epics: Epic[];
}

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  products,
  epics
}: PromptDetailDialogProps) {
  const [productId, setProductId] = useState<string>('none');
  const [epicId, setEpicId] = useState<string>('none');
  const [priority, setPriority] = useState<number>(3);
  const [saving, setSaving] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [textLength, setTextLength] = useState(0);
  const [draftRestored, setDraftRestored] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const { toast } = useToast();
  const { updatePrompt, updatePromptSilently } = usePrompts();
  const { preferences } = useUserPreferences();
  const { workspace } = useWorkspace();

  // Rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4'
      }
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const cleanText = stripHtmlAndNormalize(htmlContent);
      setTextLength(cleanText.length);
      setHasUnsavedChanges(true);
    }
  });

  // Smart auto-save handler for blur events
  const handleBlurSave = useCallback(async (content: string) => {
    if (!prompt || !preferences.autoSaveEnabled) return;
    const cleanText = stripHtmlAndNormalize(content);
    if (!cleanText.trim() || content === '<p></p>') {
      return;
    }
    try {
      await updatePromptSilently(prompt.id, {
        description: content
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error auto-saving on blur:', error);
    }
  }, [prompt, preferences.autoSaveEnabled, updatePromptSilently]);

  // Auto-save hook with smart blur save
  const { saveDraft, clearDraft } = useAutoSave({
    key: prompt ? `prompt-${prompt.id}` : '',
    editor: editor,
    isOpen: open,
    onBlur: handleBlurSave
  });

  // Load prompt data when prompt changes
  useEffect(() => {
    if (!prompt || !editor) return;

    // Set form fields
    setProductId(prompt.product_id || 'none');
    setEpicId(prompt.epic_id || 'none');
    setPriority(prompt.priority || 3);
    setActiveTab('edit');
    setHasUnsavedChanges(false);
    setDraftRestored(false);
    setGeneratedPrompt(prompt.generated_prompt || '');

    // Load content with draft restoration
    const originalContent = prompt.original_description || prompt.description || prompt.generated_prompt || `<p>${prompt.title}</p>`;
    setOriginalHtml(originalContent);

    const draftKey = `prompt-${prompt.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft && savedDraft !== originalContent && savedDraft !== '<p></p>') {
      editor.commands.setContent(savedDraft);
      setDraftRestored(true);
    } else {
      editor.commands.setContent(originalContent);
    }

    // Load the AI-generated prompt separately for the preview panel
    setGeneratedPrompt(prompt.generated_prompt || '');
  }, [prompt, editor]);

  const handleRegeneratePrompt = async () => {
    if (!prompt || !editor) return;
    
    setIsRegenerating(true);
    try {
      const content = editor.getHTML();
      const cleanText = stripHtmlAndNormalize(content);
      
      if (!cleanText.trim()) {
        // Try to regenerate from original content if editor is empty
        const fallbackText = stripHtmlAndNormalize(originalHtml);
        if (!fallbackText.trim()) {
          toast({
            title: 'Unable to regenerate',
            description: 'Please add content to your prompt first',
            variant: 'destructive'
          });
          return;
        }
        
        const response = await PromptTransformService.transformPrompt(fallbackText);
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (response.transformedPrompt) {
          setGeneratedPrompt(response.transformedPrompt);
          
          // Update in database
          await updatePromptSilently(prompt.id, {
            generated_prompt: response.transformedPrompt,
            generated_at: new Date().toISOString()
          });
          
          toast({
            title: 'Prompt regenerated',
            description: 'Generated from original content'
          });
        }
        return;
      }

      const response = await PromptTransformService.transformPrompt(cleanText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        setGeneratedPrompt(response.transformedPrompt);
        
        // Update in database
        await updatePromptSilently(prompt.id, {
          generated_prompt: response.transformedPrompt,
          generated_at: new Date().toISOString()
        });
        
        toast({
          title: 'Prompt regenerated',
          description: 'AI prompt has been updated'
        });
      }
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      toast({
        title: 'Generation failed',
        description: 'Unable to regenerate prompt from original text',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!workspace || !prompt || !editor) {
      toast({
        title: 'Impossible d\'optimiser',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
      return;
    }
    const content = editor.getHTML();
    const cleanText = stripHtmlAndNormalize(content);
    if (!cleanText.trim()) {
      toast({
        title: 'Impossible d\'optimiser',
        description: 'Le prompt doit avoir du contenu pour être optimisé',
        variant: 'destructive'
      });
      return;
    }
    setIsOptimizing(true);
    try {
      // Save current content first
      await updatePromptSilently(prompt.id, {
        description: content
      });

      // Then optimize
      await AIAgentManager.executePromptOptimization(prompt.id, workspace.id);
      toast({
        title: 'Prompt optimisé',
        description: 'Votre prompt a été amélioré par l\'IA avec un titre plus descriptif et une meilleure structure.',
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      toast({
        title: 'Erreur d\'optimisation',
        description: 'Impossible d\'optimiser le prompt pour le moment',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
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
    
    setSaving(true);
    try {
      const content = editor.getHTML();
      
      await updatePrompt(prompt.id, {
        product_id: productId === 'none' ? null : productId,
        epic_id: epicId === 'none' ? null : epicId,
        priority,
        description: content,
        updated_at: new Date().toISOString()
      });

      // Clear draft and unsaved changes after successful save
      clearDraft();
      setHasUnsavedChanges(false);
      toast({
        title: 'Sauvegardé',
        description: 'Vos modifications ont été sauvegardées avec succès'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  const handleClose = () => {
    if (hasUnsavedChanges && editor) {
      const content = editor.getHTML();
      if (content && content !== '<p></p>' && prompt) {
        updatePromptSilently(prompt.id, {
          description: content
        }).catch(console.error);
      }
    }
    onOpenChange(false);
  };

  const filteredEpics = epics.filter(epic => productId === 'none' || !productId || epic.product_id === productId);
  
  if (!prompt || !editor) return null;

  return (
    <Dialog open={open} onOpenChange={next => {
      if (next) {
        onOpenChange(true);
      } else {
        handleClose();
      }
    }}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[600px] lg:max-h-[85vh] p-0 flex flex-col" onKeyDown={handleKeyDown}>
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Edit Idea
            {draftRestored && (
              <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <RotateCcw className="h-4 w-4" />
                <span>Draft restored</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <Save className="h-4 w-4" />
                <span>Unsaved changes</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleOptimizePrompt} disabled={isOptimizing || textLength === 0} className="ml-auto">
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Optimisation...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimiser avec IA
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Edit prompt details with rich text formatting, product and epic assignment. Press Ctrl+S to save.
          </DialogDescription>
        </DialogHeader>

        {/* Mobile: Tab Navigation */}
        <div className="lg:hidden border-b flex-shrink-0">
          <div className="flex">
            <Button variant={activeTab === 'edit' ? 'default' : 'ghost'} onClick={() => setActiveTab('edit')} className="flex-1 rounded-none h-12" size="sm">
              Edit
            </Button>
            <Button variant={activeTab === 'preview' ? 'default' : 'ghost'} onClick={() => setActiveTab('preview')} className="flex-1 rounded-none h-12" size="sm">
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
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted' : ''}`}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted' : ''}`}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Idea/Description</Label>
                    <span className="text-xs text-muted-foreground">
                      {!prompt.original_description && !prompt.description && !!prompt.generated_prompt ? 'Displaying generated prompt (original idea empty)' : 'Your original input'}
                    </span>
                  </div>
                  <div className="border rounded-md min-h-[200px] bg-background">
                    <EditorContent key={`editor-${prompt.id}-${prompt.updated_at || ''}`} editor={editor} className="w-full p-4 prose prose-sm max-w-none focus-within:outline-none" />
                    {editor.getText().trim().length === 0 && originalHtml && (
                      <div className="p-4 border-t bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-2">Showing original input</div>
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: originalHtml }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={productId} onValueChange={value => {
                      setProductId(value);
                      if (value === 'none') setEpicId('none');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No product</SelectItem>
                        {products.map(product => (
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
                        {filteredEpics.map(epic => (
                          <SelectItem key={epic.id} value={epic.id}>
                            {epic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority.toString()} onValueChange={value => setPriority(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            <div className="flex items-center gap-2">
                              {option.value === 1 && <Flame className="h-4 w-4 text-destructive" />}
                              {option.value === 2 && <Minus className="h-4 w-4 text-orange-500" />}
                              {option.value === 3 && <Clock className="h-4 w-4 text-muted-foreground" />}
                              {option.label}
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
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving || !editor.getHTML() || editor.getHTML() === '<p></p>'} className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save {hasUnsavedChanges && '(Ctrl+S)'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Preview Tab Content */
              <div className="space-y-4">
                <div className="border rounded-lg bg-muted p-4 max-h-[500px] overflow-y-auto">
                  <div className="relative">
                    <div className="absolute top-0 right-0 text-xs text-muted-foreground bg-muted-foreground/10 px-2 py-1 rounded-bl text-mono">
                      AI Prompt Preview
                    </div>
                    <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed pt-6">
                      {generatedPrompt ? generatedPrompt.replace(/<[^>]*>/g, '') : 'No prompt generated. Click the regenerate button to generate a prompt based on your content.'}
                    </pre>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRegeneratePrompt} disabled={isRegenerating || textLength === 0} className="flex-1">
                    {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyPrompt} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right Panel - Generated Prompt Preview */}
        <div className="hidden lg:block w-80 border-l pl-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Prompt</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRegeneratePrompt} disabled={isRegenerating || textLength === 0} title={textLength === 0 ? "Add content to regenerate" : "Regenerate prompt"}>
                {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
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
                {generatedPrompt ? generatedPrompt.replace(/<[^>]*>/g, '') : 'No prompt generated. Click the button to generate a prompt based on your content.'}
              </pre>
            </div>
          </div>
          
          {prompt.generated_at && (
            <p className="text-xs text-muted-foreground">
              Generated on {format(new Date(prompt.generated_at), 'MM/dd/yyyy at HH:mm')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}