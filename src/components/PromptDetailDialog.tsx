import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Calendar, Package, Hash, Clock, Copy, RefreshCw, Loader2, AlertTriangle, RotateCcw, Save, Zap, Flame, Minus, Edit3 } from 'lucide-react';
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

export function PromptDetailDialog({ prompt, open, onOpenChange, products, epics }: PromptDetailDialogProps) {
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
  const [editedOriginalIdea, setEditedOriginalIdea] = useState<string>('');
  const [originalIdeaHasChanges, setOriginalIdeaHasChanges] = useState(false);
  const [isSavingOriginalIdea, setIsSavingOriginalIdea] = useState(false);
  const { toast } = useToast();
  const { updatePrompt, updatePromptSilently } = usePrompts();
  const { preferences } = useUserPreferences();
  const { workspace } = useWorkspace();

  // Rich text editor for main content
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
      setHasUnsavedChanges(true);
    },
  });

  // Rich text editor for original idea
  const originalIdeaEditor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 bg-blue-50/50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
      },
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      const cleanText = stripHtmlAndNormalize(htmlContent);
      setEditedOriginalIdea(cleanText);
      const storedContent = stripHtmlAndNormalize(prompt?.original_description || '');
      setOriginalIdeaHasChanges(cleanText !== storedContent);
    },
  });

  // Smart auto-save handler for blur events
  const handleBlurSave = useCallback(async (content: string) => {
    if (!prompt || !preferences.autoSaveEnabled) return;

    const cleanText = stripHtmlAndNormalize(content);
    if (!cleanText.trim() || content === '<p></p>') {
      // Avoid overwriting existing description with empty content
      return;
    }

    try {
      await updatePromptSilently(prompt.id, { description: content });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error auto-saving on blur:', error);
    }
  }, [prompt, preferences.autoSaveEnabled, updatePromptSilently]);

  // Auto-save hook with smart blur save
  const { clearDraft } = useAutoSave({
    key: prompt ? `prompt_${prompt.id}` : 'prompt_edit',
    editor: originalIdeaEditor,
    isOpen: open,
    onRestore: (content) => {
      setDraftRestored(true);
      setHasUnsavedChanges(true);
      setTimeout(() => setDraftRestored(false), 3000); // Hide indicator after 3s
    },
    onBlurSave: handleBlurSave,
  });

  // Reset form when prompt changes - always load original content first
  useEffect(() => {
    if (prompt && originalIdeaEditor && !originalIdeaEditor.isDestroyed) {
       // Load the original user content into the original idea editor
       const editorContent = prompt.original_description || prompt.description || `<p>${prompt.title}</p>`;
      
       console.log('PromptDetailDialog: Loading prompt content', {
         promptId: prompt.id,
         title: prompt.title,
         hasOriginalDescription: !!prompt.original_description,
         hasDescription: !!prompt.description,
         originalDescriptionLength: prompt.original_description?.length || 0,
         descriptionLength: prompt.description?.length || 0,
         originalDescriptionPreview: prompt.original_description?.substring(0, 100) || 'No original description',
         descriptionPreview: prompt.description?.substring(0, 100) || 'No description',
         originalContentLength: editorContent.length,
         editorReady: !!originalIdeaEditor,
         editorDestroyed: originalIdeaEditor.isDestroyed
       });
      
       // Set content with a small delay to ensure editor is ready
       setOriginalHtml(editorContent);
       setTimeout(() => {
         if (originalIdeaEditor && !originalIdeaEditor.isDestroyed) {
           originalIdeaEditor.commands.setContent(editorContent);
           const afterText = originalIdeaEditor.getText();
           console.log('PromptDetailDialog: after setContent text length', afterText?.length || 0);
           // Calculate initial text length from original content
           const cleanText = stripHtmlAndNormalize(editorContent);
           setTextLength(cleanText.length);
           setEditedOriginalIdea(cleanText);
         }
       }, 10);

      setProductId(prompt.product_id || 'none');
      setEpicId(prompt.epic_id || 'none');
      setPriority(prompt.priority || 3);
      setHasUnsavedChanges(false);
      
      // Load the AI-generated prompt separately for the preview panel
      setGeneratedPrompt(prompt.generated_prompt || '');
      
      // Initialize the editable original idea
      setOriginalIdeaHasChanges(false);
    }
  }, [prompt, originalIdeaEditor]);

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
    if (!prompt) return;

    // Use the currently edited original idea from the editor
    const sourceText = originalIdeaEditor ? stripHtmlAndNormalize(originalIdeaEditor.getHTML()) : editedOriginalIdea.trim();
    if (!sourceText.trim()) return;
    
    setIsRegenerating(true);
    try {
      // Save the edited original idea if it has changes
      if (originalIdeaHasChanges && originalIdeaEditor) {
        const htmlContent = originalIdeaEditor.getHTML();
        await updatePrompt(prompt.id, {
          original_description: htmlContent
        });
        setOriginalIdeaHasChanges(false);
      }
      
      const response = await PromptTransformService.transformPrompt(sourceText);
      
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
        title: 'Prompt regenerated from original idea',
        description: originalIdeaHasChanges ? 'Original idea updated and prompt regenerated' : 'Prompt regenerated from your original idea'
      });
    } catch (error) {
      console.error('Error regenerating prompt from original:', error);
      toast({
        title: 'Error',
        description: 'Unable to regenerate prompt from original idea',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveOriginalIdea = async () => {
    if (!prompt || !originalIdeaHasChanges || !originalIdeaEditor) return;
    
    setIsSavingOriginalIdea(true);
    try {
      const htmlContent = originalIdeaEditor.getHTML();
      await updatePrompt(prompt.id, {
        original_description: htmlContent
      });
      setOriginalIdeaHasChanges(false);
      toast({
        title: 'Original idea saved',
        description: 'Your original idea has been updated successfully'
      });
    } catch (error) {
      console.error('Error saving original idea:', error);
      toast({
        title: 'Error',
        description: 'Unable to save original idea',
        variant: 'destructive'
      });
    } finally {
      setIsSavingOriginalIdea(false);
    }
  };

  const handleResetOriginalIdea = () => {
    if (!prompt || !originalIdeaEditor) return;
    const resetContent = prompt.original_description || '';
    originalIdeaEditor.commands.setContent(resetContent);
    setEditedOriginalIdea(stripHtmlAndNormalize(resetContent));
    setOriginalIdeaHasChanges(false);
  };

  const handleOriginalIdeaChange = (htmlContent: string) => {
    const cleanText = stripHtmlAndNormalize(htmlContent);
    setEditedOriginalIdea(cleanText);
    const storedContent = stripHtmlAndNormalize(prompt?.original_description || '');
    setOriginalIdeaHasChanges(cleanText !== storedContent);
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
      await updatePromptSilently(prompt.id, { description: content });
      
      // Then optimize
      await AIAgentManager.executePromptOptimization(prompt.id, workspace.id);
      
      toast({
        title: 'Prompt optimisé',
        description: 'Votre prompt a été amélioré par l\'IA. Rechargez pour voir les modifications.',
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
    if (!prompt || !originalIdeaEditor) return;

    const content = originalIdeaEditor.getHTML();
    if (!content || content === '<p></p>') return;

    setSaving(true);
    try {
      // Generate descriptive title from content  
      const updatedTitle = generateTitleFromContent(content);
      
      await updatePrompt(prompt.id, {
        title: updatedTitle, // Auto-generated descriptive title
        original_description: content, // Save the rich content to original_description
        product_id: productId === 'none' ? null : productId,
        epic_id: epicId === 'none' ? null : epicId,
        priority,
      });

      // Clear draft and unsaved changes after successful save
      clearDraft();
      setHasUnsavedChanges(false);
      setOriginalIdeaHasChanges(false);
      
      toast({
        title: 'Sauvegardé',
        description: 'Vos modifications ont été sauvegardées avec succès',
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

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRegenerateFromOriginal();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  // Save before closing if there are unsaved changes
  const handleClose = () => {
    if (hasUnsavedChanges && preferences.autoSaveEnabled && editor) {
      const content = editor.getHTML();
      if (content && content !== '<p></p>' && prompt) {
        updatePromptSilently(prompt.id, { description: content }).catch(console.error);
      }
    }
    
    // Also save original idea changes
    if (originalIdeaHasChanges && preferences.autoSaveEnabled && prompt) {
      updatePromptSilently(prompt.id, { original_description: editedOriginalIdea }).catch(console.error);
    }
    
    onOpenChange(false);
  };

  const filteredEpics = epics.filter(epic => productId === 'none' || !productId || epic.product_id === productId);

  if (!prompt || !editor) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true);
        } else {
          handleClose();
        }
      }}
    >
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
            {hasUnsavedChanges && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                      <Save className="h-4 w-4" />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOptimizePrompt}
                    disabled={isOptimizing || textLength === 0}
                    className="ml-auto"
                  >
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
            Edit prompt details with rich text formatting, product and epic assignment. Press Ctrl+S to save, Ctrl+R to regenerate from original idea.
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

                {/* Editable Original Idea with Rich Editor */}
                {(prompt.original_description?.trim() || editedOriginalIdea.trim()) && (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                          <Edit3 className="h-4 w-4" />
                          <span className="text-sm font-medium">Your Original Idea</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {originalIdeaHasChanges && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveOriginalIdea}
                              disabled={isSavingOriginalIdea}
                              className="h-7 px-2 text-xs text-blue-700 dark:text-blue-300"
                            >
                              {isSavingOriginalIdea ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetOriginalIdea}
                            disabled={!originalIdeaHasChanges}
                            className="h-7 px-2 text-xs text-blue-700 dark:text-blue-300"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Formatting toolbar for original idea */}
                      <div className="flex items-center gap-1 p-2 border rounded-md bg-blue-100/50 dark:bg-blue-900/50 mb-3 overflow-x-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleBold().run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('bold') ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleItalic().run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('italic') ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('heading', { level: 1 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <Heading1 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('heading', { level: 2 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <Heading2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('heading', { level: 3 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <Heading3 className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleBulletList().run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('bulletList') ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => originalIdeaEditor?.chain().focus().toggleOrderedList().run()}
                          className={`h-8 w-8 p-0 ${originalIdeaEditor?.isActive('orderedList') ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Rich text editor for original idea */}
                      <div className="border rounded-md bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 min-h-[120px]">
                        <EditorContent 
                          key={`original-editor-${prompt.id}-${prompt.updated_at || ''}`}
                          editor={originalIdeaEditor}
                          className="w-full prose prose-sm max-w-none focus-within:outline-none"
                        />
                      </div>
                      
                      {originalIdeaHasChanges && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Unsaved changes to original idea</span>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Context Warning */}
                {textLength < 20 && textLength > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      Add more context for better AI generation.
                    </AlertDescription>
                  </Alert>
                )}

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

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
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
                      onClick={handleOptimizePrompt}
                      disabled={isOptimizing || textLength === 0}
                      title="Optimiser avec IA"
                    >
                      {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegeneratePrompt}
                      disabled={isRegenerating || textLength === 0}
                      title="Regenerate from current content"
                    >
                      {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRegenerateFromOriginal}
                      disabled={isRegenerating || (!editedOriginalIdea.trim() && !prompt.original_description?.trim())}
                      title="Regenerate from original idea (Ctrl+R)"
                    >
                      {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
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

            {/* Editable Original Idea with Rich Editor */}
            {(prompt.original_description?.trim() || editedOriginalIdea.trim()) && (
              <>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                      <Edit3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Your Original Idea</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {originalIdeaHasChanges && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveOriginalIdea}
                          disabled={isSavingOriginalIdea}
                          className="h-7 px-2 text-xs text-blue-700 dark:text-blue-300"
                        >
                          {isSavingOriginalIdea ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetOriginalIdea}
                        disabled={!originalIdeaHasChanges}
                        className="h-7 px-2 text-xs text-blue-700 dark:text-blue-300"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Formatting toolbar for original idea */}
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-blue-100/50 dark:bg-blue-900/50 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 1 }).run()}
                      className={originalIdeaEditor?.isActive('heading', { level: 1 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      className={originalIdeaEditor?.isActive('heading', { level: 2 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleHeading({ level: 3 }).run()}
                      className={originalIdeaEditor?.isActive('heading', { level: 3 }) ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleBold().run()}
                      className={originalIdeaEditor?.isActive('bold') ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleItalic().run()}
                      className={originalIdeaEditor?.isActive('italic') ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleBulletList().run()}
                      className={originalIdeaEditor?.isActive('bulletList') ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => originalIdeaEditor?.chain().focus().toggleOrderedList().run()}
                      className={originalIdeaEditor?.isActive('orderedList') ? 'bg-blue-200 dark:bg-blue-800' : ''}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Rich text editor for original idea */}
                  <div className="border rounded-md bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 min-h-[120px] max-h-[400px] overflow-y-auto">
                    <EditorContent 
                      key={`desktop-original-editor-${prompt.id}-${prompt.updated_at || ''}`}
                      editor={originalIdeaEditor}
                      className="w-full prose prose-sm max-w-none focus-within:outline-none"
                    />
                  </div>
                  
                  {originalIdeaHasChanges && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Unsaved changes to original idea</span>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Context Warning */}
            {textLength < 20 && textLength > 0 && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Add more context for better AI generation.
                </AlertDescription>
              </Alert>
            )}

            {/* Product, Epic and Priority assignment */}
            <div className="grid grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {PRIORITY_OPTIONS.map((option) => (
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
              <Button 
                onClick={handleSave} 
                disabled={saving || !editor.getHTML() || editor.getHTML() === '<p></p>'}
                className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
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
                  title={textLength === 0 ? "Add content to regenerate" : "Regenerate from current content"}
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
                  onClick={handleRegenerateFromOriginal}
                  disabled={isRegenerating || (!editedOriginalIdea.trim() && !prompt.original_description?.trim())}
                  title="Regenerate from original idea (Ctrl+R)"
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flame className="h-4 w-4" />
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
                {generatedPrompt && (
                  <div className="absolute top-0 left-0 text-xs text-muted-foreground bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-br">
                    Basé sur: {prompt.original_description ? 'Description originale' : prompt.description ? 'Description éditée' : 'Titre uniquement'}
                  </div>
                )}
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