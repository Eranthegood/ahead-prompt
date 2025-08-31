import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Workspace, KnowledgeItem } from '@/types';
import { Plus, X } from 'lucide-react';

interface KnowledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  workspace: Workspace;
  editingItem?: KnowledgeItem | null;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({
  open,
  onOpenChange,
  onClose,
  workspace,
  editingItem
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setContent(editingItem.content);
      setTags(editingItem.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
    setNewTag('');
  }, [editingItem, open]);

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const saveKnowledgeItem = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Title and content are required'
      });
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        workspace_id: workspace.id,
        title: title.trim(),
        content: content.trim(),
        tags: tags.length > 0 ? tags : null,
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('knowledge_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: 'Knowledge updated',
          description: 'Your knowledge item has been updated successfully'
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('knowledge_items')
          .insert(itemData);

        if (error) throw error;

        toast({
          title: 'Knowledge created',
          description: 'New knowledge item added to your base'
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: editingItem ? 'Error updating knowledge' : 'Error creating knowledge',
        description: error?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setNewTag('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
          </DialogTitle>
          <DialogDescription>
            Create reusable content to improve your prompts with context and best practices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., React Best Practices, API Guidelines..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Detailed information, guidelines, code examples, or any contextual knowledge that will help improve your prompts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This content can be copied and used as context in your Lovable prompts
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (press Enter or comma to add)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tags help organize and filter your knowledge base
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={saveKnowledgeItem} disabled={loading || !title.trim() || !content.trim()}>
            {loading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};