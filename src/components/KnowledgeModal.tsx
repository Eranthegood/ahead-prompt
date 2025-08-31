import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Lightbulb } from "lucide-react";
import { useKnowledge, KNOWLEDGE_CATEGORIES, KnowledgeCategory } from "@/hooks/useKnowledge";
import type { Workspace, KnowledgeItem, Product } from "@/types";

interface KnowledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  workspace: Workspace;
  product?: Product;
  editingItem?: KnowledgeItem | null;
}

const CATEGORY_TEMPLATES = {
  technical: {
    title: "Technical Stack Documentation",
    content: `# Technical Stack

## Frontend
- Framework: 
- Language: 
- UI Library: 

## Backend
- Framework: 
- Database: 
- Authentication: 

## Key Dependencies
- 

## Environment Setup
1. 
2. 
3. `
  },
  design: {
    title: "Design Guidelines",
    content: `# Design Guidelines

## Color Palette
- Primary: 
- Secondary: 
- Accent: 

## Typography
- Headings: 
- Body: 

## Component Standards
- Button styles: 
- Form patterns: 

## Spacing & Layout
- Grid system: 
- Breakpoints: `
  },
  business: {
    title: "Business Context",
    content: `# Business Context

## Objectives
- 

## Target Audience
- 

## Key Performance Indicators
- 

## Success Metrics
- 

## Constraints
- `
  },
  api: {
    title: "API Documentation",
    content: `# API Documentation

## Base URL
\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication
- Method: 
- Headers: 

## Key Endpoints
### GET /endpoint
- Purpose: 
- Parameters: 
- Response: 

### POST /endpoint
- Purpose: 
- Body: 
- Response: `
  },
  practices: {
    title: "Best Practices",
    content: `# Best Practices

## Code Standards
- Naming conventions: 
- File structure: 
- Testing approach: 

## Git Workflow
- Branch naming: 
- Commit messages: 
- Review process: 

## Quality Guidelines
- Code review checklist: 
- Performance standards: 
- Security requirements: `
  }
} as const;

export function KnowledgeModal({
  open,
  onOpenChange,
  onClose,
  workspace,
  product,
  editingItem,
}: KnowledgeModalProps) {
  const { createKnowledgeItem, updateKnowledgeItem } = useKnowledge(workspace.id, product?.id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("general");
  const [isProductSpecific, setIsProductSpecific] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setContent(editingItem.content);
      setTags(editingItem.tags || []);
      setCategory((editingItem as any).category || "general");
      setIsProductSpecific(!!(editingItem as any).product_id);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setNewTag("");
      setCategory("general");
      setIsProductSpecific(!!product);
    }
  }, [editingItem, open, product]);

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const saveKnowledgeItem = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        category,
        product_id: isProductSpecific && product ? product.id : undefined,
      };

      if (editingItem) {
        await updateKnowledgeItem({
          id: editingItem.id,
          ...itemData,
        });
      } else {
        await createKnowledgeItem(itemData);
      }

      handleClose();
    } catch (error) {
      console.error("Error saving knowledge item:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (templateCategory: KnowledgeCategory) => {
    const template = CATEGORY_TEMPLATES[templateCategory];
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setCategory(templateCategory);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setNewTag("");
    setCategory("general");
    setIsProductSpecific(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit Knowledge Item" : "Add Knowledge Item"}
          </DialogTitle>
          <DialogDescription>
            {editingItem ? "Edit" : "Add"} knowledge item to help you create better prompts with context.
            {product && " This will be specific to the " + product.name + " product."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter knowledge item title..."
              />
            </div>
            <div className="w-48">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as KnowledgeCategory)}>
                <SelectTrigger>
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
            </div>
          </div>

          {/* Template suggestions */}
          {!editingItem && category !== "general" && CATEGORY_TEMPLATES[category] && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Quick Template</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyTemplate(category)}
                  disabled={title.trim() !== "" || content.trim() !== ""}
                >
                  Use Template
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {KNOWLEDGE_CATEGORIES[category].description}
              </p>
            </div>
          )}

          {/* Product-specific toggle */}
          {!editingItem && product && (
            <div className="flex items-center space-x-2">
              <Switch
                id="product-specific"
                checked={isProductSpecific}
                onCheckedChange={setIsProductSpecific}
              />
              <Label htmlFor="product-specific">
                Make this specific to {product.name} only
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter detailed knowledge content..."
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
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
              )}
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
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={saveKnowledgeItem} 
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? "Saving..." : editingItem ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}