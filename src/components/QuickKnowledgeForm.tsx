import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles, Send } from 'lucide-react';
import { useKnowledge, KNOWLEDGE_CATEGORIES, KnowledgeCategory } from '@/hooks/useKnowledge';
import type { Workspace, Product } from '@/types';

interface QuickKnowledgeFormProps {
  workspace: Workspace;
  product?: Product;
  onSuccess?: () => void;
}

export function QuickKnowledgeForm({ workspace, product, onSuccess }: QuickKnowledgeFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createKnowledgeItem } = useKnowledge(workspace.id, product?.id);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        addTag(newTag);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createKnowledgeItem({
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.length > 0 ? tags : undefined,
        ...(product && { product_id: product.id }),
      });

      if (success) {
        // Reset form
        setTitle('');
        setContent('');
        setCategory('general');
        setTags([]);
        setNewTag('');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating knowledge item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Title */}
      <div>
        <Input
          placeholder={`e.g., "${product?.name || 'Project'} API Guidelines" or "Code Style Rules"`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base font-medium"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div>
        <Textarea
          placeholder="Add your knowledge content here... This could be:&#10;• API endpoints and usage examples&#10;• Design system guidelines&#10;• Code snippets and patterns&#10;• Business rules and constraints&#10;• Best practices and conventions"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
          maxLength={2000}
        />
      </div>

      {/* Category and Tags Row */}
      <div className="flex gap-3 flex-wrap">
        <Select value={category} onValueChange={(value) => setCategory(value as KnowledgeCategory)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, cat]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-32">
          <Input
            placeholder="Add tags..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
            maxLength={20}
          />
        </div>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Knowledge Item
            </>
          )}
        </Button>
      </div>
    </form>
  );
}