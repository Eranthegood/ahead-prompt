import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Loader2 } from 'lucide-react';
import { PromptTransformService } from '@/services/promptTransformService';
import { useToast } from '@/hooks/use-toast';
import type { Workspace, Epic } from '@/types';

interface CreatePromptData {
  title?: string;
  description?: string;
  epic_id?: string;
  product_id?: string;
}

interface QuickPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  workspace: Workspace;
  epics?: Epic[];
  selectedProductId?: string;
}

export const QuickPromptDialog: React.FC<QuickPromptDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  selectedProductId,
}) => {
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Rich text editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  // Filter epics by selected product
  const filteredEpics = selectedProductId 
    ? epics.filter(epic => epic.product_id === selectedProductId)
    : epics;

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && editor) {
      editor.commands.setContent('');
      setSelectedEpic('none');
      setTimeout(() => editor?.commands.focus(), 100);
    }
  }, [isOpen, editor]);

  // Handle save with automatic prompt generation
  const handleSave = async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    if (!content || content === '<p></p>') return;

    setIsGenerating(true);
    try {
      // Extract raw text from editor (without HTML tags)
      const rawText = editor.getText();
      
      // Generate prompt using AI
      const response = await PromptTransformService.transformPrompt(rawText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Replace editor content with generated prompt
      if (response.transformedPrompt) {
        editor.commands.setContent(response.transformedPrompt);
      }

      setIsGenerating(false);
      setIsLoading(true);

      const promptData: CreatePromptData = {
        title: 'Nouvelle idée', // Default title
        description: response.transformedPrompt || content,
        epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
        product_id: selectedEpic === 'none' && selectedProductId ? selectedProductId : undefined,
      };

      await onSave(promptData);
      onClose();
    } catch (error) {
      console.error('Error generating or saving prompt:', error);
      toast({
        title: 'Erreur de génération',
        description: 'Impossible de générer le prompt. Sauvegarde du contenu original.',
        variant: 'destructive'
      });
      
      // Save original content if generation fails
      setIsGenerating(false);
      setIsLoading(true);
      try {
        const promptData: CreatePromptData = {
          title: 'Nouvelle idée',
          description: content,
          epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
          product_id: selectedEpic === 'none' && selectedProductId ? selectedProductId : undefined,
        };

        await onSave(promptData);
        onClose();
      } catch (saveError) {
        console.error('Error saving original prompt:', saveError);
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
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
        className="sm:max-w-[800px] max-h-[80vh] overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Your Idea
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex flex-col">
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

          {/* Epic assignment */}
          {filteredEpics.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Assigner à un epic (optionnel)
              </label>
              <Select value={selectedEpic} onValueChange={setSelectedEpic}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un epic..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="none">
                    <span className="text-muted-foreground">Aucun epic</span>
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isGenerating || !editor.getHTML() || editor.getHTML() === '<p></p>'}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : isLoading ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};