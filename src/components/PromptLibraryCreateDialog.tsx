import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { useSubscription, canCreatePromptLibraryItem } from '@/hooks/useSubscription';
import { UsageLimitIndicator } from '@/components/UsageLimitIndicator';
import { AI_MODELS, PROMPT_CATEGORIES, type PromptLibraryItem } from '@/types/prompt-library';
import { X, Plus, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptLibraryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: PromptLibraryItem | null;
  onEditComplete?: () => void;
}

export function PromptLibraryCreateDialog({ 
  open, 
  onOpenChange, 
  editItem,
  onEditComplete 
}: PromptLibraryCreateDialogProps) {
  const { createItem, updateItem, items } = usePromptLibrary();
  const { tier } = useSubscription();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [aiModel, setAiModel] = useState<string>(AI_MODELS[0].value);
  const [category, setCategory] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canCreate = canCreatePromptLibraryItem(tier, items?.length || 0);

  const isEditing = !!editItem;

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setBody(editItem.body);
      setAiModel(editItem.ai_model);
      setCategory(editItem.category || 'none');
      setTags(editItem.tags);
    } else {
      resetForm();
    }
  }, [editItem, open]);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setAiModel(AI_MODELS[0].value);
    setCategory('none');
    setTags([]);
    setNewTag('');
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide both a title and body for your prompt.',
      });
      return;
    }

    // Check limits before creating (not editing)
    if (!isEditing && !canCreate) {
      toast({
        title: "Prompt library limit reached",
        description: `You've reached the maximum number of prompt library items for the ${tier} plan. Upgrade to create more items.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editItem) {
        await updateItem(editItem.id, {
          title: title.trim(),
          body: body.trim(),
          ai_model: aiModel,
          category: category === 'none' ? undefined : category,
          tags,
        });
        onEditComplete?.();
      } else {
        await createItem({
          title: title.trim(),
          body: body.trim(),
          ai_model: aiModel,
          category: category === 'none' ? undefined : category,
          tags,
        });
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onEditComplete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <UsageLimitIndicator 
            type="promptLibrary" 
            currentCount={items?.length || 0}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your prompt..."
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Prompt Body *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your prompt here. Be specific and clear about what you want the AI to do..."
              rows={6}
              required
            />
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select value={aiModel} onValueChange={(value: string) => setAiModel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {PROMPT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Context Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add tags to help categorize and search your prompts (e.g., react, typescript, database)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isEditing && !canCreate)}>
              {loading ? 'Saving...' : 
               !isEditing && !canCreate ? (
                 <div className="flex items-center gap-2">
                   <Lock className="w-4 h-4" />
                   Limit Reached
                 </div>
               ) : (isEditing ? 'Update Prompt' : 'Save Prompt')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}