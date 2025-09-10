import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  Heading1, 
  Heading2, 
  Heading3,
  X,
  Save,
  Star,
  StarOff
} from 'lucide-react';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/notes';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: Note;
  onSave: (data: CreateNoteData | UpdateNoteData) => Promise<void>;
  onCancel: () => void;
  workspaceId: string;
  productId?: string;
  epicId?: string;
  className?: string;
}

export function NoteEditor({ 
  note, 
  onSave, 
  onCancel, 
  workspaceId, 
  productId, 
  epicId,
  className 
}: NoteEditorProps) {
  const [title, setTitle] = React.useState(note?.title || '');
  const [tags, setTags] = React.useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = React.useState('');
  const [isFavorite, setIsFavorite] = React.useState(note?.is_favorite || false);
  const [saving, setSaving] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList.configure({
        HTMLAttributes: {
          class: 'prose-bullet-list',
        },
      }),
      ListItem,
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleSave = async () => {
    if (!title.trim() || !editor) return;

    setSaving(true);
    try {
      const content = editor.getHTML();
      
      if (note) {
        // Update existing note
        await onSave({
          title: title.trim(),
          content,
          tags,
          is_favorite: isFavorite,
        });
      } else {
        // Create new note
        await onSave({
          workspace_id: workspaceId,
          product_id: productId,
          epic_id: epicId,
          title: title.trim(),
          content,
          tags,
          is_favorite: isFavorite,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!editor) return null;

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border rounded-lg bg-muted/20">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-muted' : ''}
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
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
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                } else {
                  handleKeyDown(e);
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={addTag}>
              Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Editor */}
        <div className="border rounded-lg min-h-[200px]">
          <EditorContent editor={editor} />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim() || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : (note ? 'Update Note' : 'Save Note')}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Ctrl+Enter</kbd> to save, <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Esc</kbd> to cancel
        </div>
      </CardContent>
    </Card>
  );
}