import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';
import { 
  NotebookPen, 
  Save, 
  X, 
  Star, 
  StarOff,
  Plus,
  Hash,
  Sparkles
} from 'lucide-react';
import { CreateNoteData } from '@/types/notes';

interface QuickNotePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function QuickNotePanel({ isOpen, onToggle, className = '' }: QuickNotePanelProps) {
  const { workspace } = useWorkspace();
  const { createNote } = useNotes(workspace?.id);
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus content area when panel opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setTimeout(() => {
        contentRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!workspace?.id || (!title.trim() && !content.trim())) {
      toast({
        title: 'Nothing to save',
        description: 'Please add a title or content to save the note.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const noteData: CreateNoteData = {
        workspace_id: workspace.id,
        title: title.trim() || 'Quick Note',
        content: content.trim(),
        tags,
        is_favorite: isFavorite,
      };

      const newNote = await createNote(noteData);
      if (newNote) {
        // Clear form
        setTitle('');
        setContent('');
        setTags([]);
        setTagInput('');
        setIsFavorite(false);
        
        toast({
          title: 'Note saved',
          description: 'Your quick note has been saved successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save note. Please try again.',
        variant: 'destructive',
      });
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

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-card border border-border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Quick Note</span>
          <Sparkles className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-7 h-7 p-0 hover:bg-muted/60"
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ) : (
              <StarOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-7 h-7 p-0 hover:bg-muted/60"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3" onKeyDown={handleKeyDown}>
        {/* Title */}
        <Input
          placeholder="Note title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm border-0 bg-muted/30 focus:bg-muted/50 transition-colors"
        />

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="text-xs border-0 bg-muted/30 focus:bg-muted/50 transition-colors h-7"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={addTag}
              className="w-6 h-6 p-0 hover:bg-muted/60"
              disabled={!tagInput.trim()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0 h-5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content area with default font size 11 */}
        <Textarea
          ref={contentRef}
          placeholder="Start typing your note... (Cmd/Ctrl + Enter to save)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] text-xs leading-relaxed border-0 bg-muted/30 focus:bg-muted/50 transition-colors resize-none"
          style={{ fontSize: '11px' }} // Default font size of 11px as requested
        />

        {/* Save button */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {content.length > 0 && `${content.length} characters`}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || (!title.trim() && !content.trim())}
            size="sm"
            className="gap-2 h-7 px-3 text-xs"
          >
            <Save className="w-3 h-3" />
            {saving ? 'Saving...' : 'Save Note'}
            <kbd className="ml-1 px-1 py-0 text-xs bg-primary-foreground/20 text-primary-foreground rounded">⌘↵</kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}