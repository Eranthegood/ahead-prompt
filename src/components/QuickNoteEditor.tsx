import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save,
  X
} from 'lucide-react';
import { CreateNoteData } from '@/types/notes';
import { cn } from '@/lib/utils';

interface QuickNoteEditorProps {
  onSave: (data: CreateNoteData) => Promise<void>;
  onCancel: () => void;
  workspaceId: string;
  productId?: string;
  epicId?: string;
  className?: string;
}

export function QuickNoteEditor({ 
  onSave, 
  onCancel, 
  workspaceId, 
  productId, 
  epicId,
  className 
}: QuickNoteEditorProps) {
  const [title, setTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
      editorProps: {
        attributes: {
          class: 'focus:outline-none min-h-[200px] p-3 leading-relaxed prose prose-sm max-w-none',
          style: 'font-size: 11px !important; line-height: 1.5;',
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
      
      await onSave({
        workspace_id: workspaceId,
        product_id: productId,
        epic_id: epicId,
        title: title.trim(),
        content,
        tags: [],
        is_favorite: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Title Input */}
      <Input
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-3 text-sm border-border/50 focus:border-border"
        autoFocus
      />

      {/* Editor */}
      <div className="flex-1 border border-border/50 rounded-md bg-background">
        <EditorContent 
          editor={editor} 
          className="h-full [&_.ProseMirror]:text-[11px] [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_p]:text-[11px] [&_.ProseMirror_h1]:text-[13px] [&_.ProseMirror_h2]:text-[12px] [&_.ProseMirror_h3]:text-[11px]"
          style={{ fontSize: '11px' }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={saving}
          className="text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="text-xs"
        >
          <Save className="w-3 h-3 mr-1" />
          {saving ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
}