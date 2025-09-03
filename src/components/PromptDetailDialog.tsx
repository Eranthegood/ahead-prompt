import React, { useState, useEffect } from 'react';
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
  const { toast } = useToast();
  const { updatePrompt } = usePrompts();

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
      setProductId(prompt.product_id || 'none');
      setEpicId(prompt.epic_id || 'none');
      
      // Load the AI-generated prompt separately for the preview panel
      setGeneratedPrompt(prompt.generated_prompt || '');
      
      // Calculate initial text length from original content
      const cleanText = stripHtmlAndNormalize(originalContent);
      setTextLength(cleanText.length);
    }
  }, [prompt, editor, draftRestored]);

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
        title: 'Prompt régénéré',
        description: 'Le prompt a été régénéré et sauvegardé avec succès'
      });
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de régénérer le prompt',
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
        title: 'Copié',
        description: 'Le prompt a été copié dans le presse-papiers'
      });
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le prompt',
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
            Modifier l&apos;idée
            {draftRestored && (
              <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <RotateCcw className="h-4 w-4" />
                <span>Brouillon restauré</span>
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
              Édition
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="flex-1 rounded-none h-12"
              size="sm"
            >
              Aperçu
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
                    <span>Créé le {format(new Date(prompt.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Modifié le {format(new Date(prompt.updated_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                <Separator />

                {/* Context Warning */}
                {textLength < 20 && textLength > 0 && (
                  <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      Ajoutez un peu plus de contexte pour une meilleure génération IA.
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
                    <Label>Produit</Label>
                    <Select value={productId} onValueChange={(value) => {
                      setProductId(value);
                      if (value === 'none') setEpicId('none');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun produit</SelectItem>
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
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun epic</SelectItem>
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
                  <h3 className="font-medium">Prompt généré</h3>
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
                    dangerouslySetInnerHTML={{ __html: generatedPrompt || 'Aucun prompt généré. Utilisez le bouton ci-dessus pour générer un prompt basé sur votre contenu.' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="border-t p-4 flex gap-3 flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !editor?.getHTML() || editor?.getHTML() === '<p></p>'}
              className="flex-1"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
                <span>Créé le {format(new Date(prompt.created_at), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Modifié le {format(new Date(prompt.updated_at), 'dd/MM/yyyy')}</span>
              </div>
            </div>

            <Separator />

            {/* Context Warning */}
            {textLength < 20 && textLength > 0 && (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Ajoutez un peu plus de contexte pour une meilleure génération IA.
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
                <Label className="text-sm font-medium text-muted-foreground">Texte original</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Titre du prompt"
                    value={prompt.title || ''}
                    onChange={(e) => {
                      if (prompt) {
                        updatePrompt(prompt.id, { title: e.target.value });
                      }
                    }}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder="Description du prompt"
                    value={prompt.description || ''}
                    onChange={(e) => {
                      if (prompt) {
                        // Update the local prompt object
                        const updatedPrompt = { ...prompt, description: e.target.value };
                        // This would need to be handled by the parent component
                        // For now, we'll just update locally
                      }
                    }}
                    className="text-sm min-h-[100px]"
                  />
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
                <Label>Produit</Label>
                <Select value={productId} onValueChange={(value) => {
                  setProductId(value);
                  if (value === 'none') {
                    setEpicId('none');
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="none">Aucun produit</SelectItem>
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
                    <SelectValue placeholder="Sélectionner un epic..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="none">Aucun epic</SelectItem>
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
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || !editor.getHTML() || editor.getHTML() === '<p></p>'}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>

          {/* Desktop Right Panel - Generated Prompt Preview */}
          <div className="w-80 border-l pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prompt généré</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegeneratePrompt}
                  disabled={isRegenerating || textLength === 0}
                  title={textLength === 0 ? "Ajoutez du contenu pour régénérer" : "Régénérer le prompt"}
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

            <div className="border rounded-lg bg-slate-950 dark:bg-slate-900 p-4 max-h-[500px] overflow-y-auto">
              <div className="relative">
                <div className="absolute top-0 right-0 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-bl text-mono">
                  AI Prompt
                </div>
                <pre className="font-mono text-sm text-slate-100 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pt-6">
                  {generatedPrompt ? 
                    generatedPrompt.replace(/<[^>]*>/g, '') : 
                    'Aucun prompt généré. Cliquez sur le bouton pour générer un prompt basé sur votre contenu.'
                  }
                </pre>
              </div>
            </div>
            
            {prompt.generated_at && (
              <p className="text-xs text-muted-foreground">
                Généré le {format(new Date(prompt.generated_at), 'dd/MM/yyyy à HH:mm')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}