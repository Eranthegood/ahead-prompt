import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Copy, Tag, Filter, BookOpen } from "lucide-react";
import { toast } from "sonner";
// Removed KnowledgeModal import - using event-based approach
import { QuickKnowledgeForm } from "./QuickKnowledgeForm";
import { format } from "date-fns";
import { useKnowledge, KNOWLEDGE_CATEGORIES, KnowledgeCategory } from "@/hooks/useKnowledge";
import type { Workspace, KnowledgeItem, Product } from "@/types";
import { copyText } from '@/lib/clipboard';
import { useEventEmitter } from '@/hooks/useEventManager';

interface KnowledgeBaseProps {
  workspace: Workspace;
  product?: Product;
}

export function KnowledgeBase({ workspace, product }: KnowledgeBaseProps) {
  const { knowledgeItems, loading, deleteKnowledgeItem: deleteItem } = useKnowledge(
    workspace.id, 
    product?.id
  );
  // States - removing modal states as we use event system
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const deleteKnowledgeItem = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (!success) {
      toast.error("Failed to delete knowledge item");
    }
  };

  const copyToClipboard = async (item: KnowledgeItem) => {
    try {
      const textToCopy = `${item.title}\n\n${item.content}`;
      const ok = await copyText(textToCopy);
      if (ok) {
        toast.success("Copied to clipboard");
      } else {
        toast.error("Failed to copy to clipboard");
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Get all unique tags from knowledge items
  const getAllTags = () => {
    const allTags = knowledgeItems.flatMap((item) => item.tags || []);
    return [...new Set(allTags)];
  };

  // Filter knowledge items based on search query, selected tags, and category
  const filteredItems = knowledgeItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => item.tags?.includes(tag));

    const matchesCategory =
      !selectedCategory || selectedCategory === "all" ||
      (item as any).category === selectedCategory;

    return matchesSearch && matchesTags && matchesCategory;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const emit = useEventEmitter();

  const handleEdit = (item: KnowledgeItem) => {
    // Open Knowledge Box Modal through event system
    emit('open-knowledge-dialog');
  };

  const handleCreate = () => {
    // Open Knowledge Box Modal through event system
    emit('open-knowledge-dialog');
  };

  // Remove handleModalClose function as we no longer use modal

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              {product ? `${product.name} Knowledge` : 'Knowledge Base'}
            </h2>
            <p className="text-muted-foreground">
              {product 
                ? `Product-specific knowledge and documentation for ${product.name}`
                : 'Workspace knowledge and documentation'
              }
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, category]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag filters */}
        {getAllTags().length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>Filter by tags:</span>
            </div>
            {getAllTags().map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-auto p-1 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Items */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group relative">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(item)}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteKnowledgeItem(item.id)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {(item as any).category && (
                        <Badge variant="secondary" className="text-xs">
                          {KNOWLEDGE_CATEGORIES[(item as any).category as KnowledgeCategory]?.icon} {KNOWLEDGE_CATEGORIES[(item as any).category as KnowledgeCategory]?.label}
                        </Badge>
                      )}
                      {(item as any).product_id && !product && (
                        <Badge variant="outline" className="text-xs">
                          Product Specific
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {item.content.length > 150
                        ? `${item.content.substring(0, 150)}...`
                        : item.content}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(item.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 max-w-2xl mx-auto">
          {/* Empty state with catchline */}
          <div className="mb-8">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {product ? `Supercharge ${product.name} with AI Context` : "Build Your AI Knowledge Arsenal"}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {product
                ? `Transform your prompts with ${product.name}-specific context. Add code snippets, design guidelines, APIs, and best practices to make every AI interaction smarter.`
                : "Store reusable context, code snippets, and guidelines that will make your AI prompts 10x more effective across all projects."
              }
            </p>
          </div>

          {/* Quick add knowledge form */}
          <div className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border border-primary/10 rounded-2xl p-8 mb-6">
            <h4 className="text-lg font-semibold mb-4 text-left">✨ Add your first knowledge item</h4>
            <QuickKnowledgeForm 
              workspace={workspace}
              product={product}
              onSuccess={() => {
                toast.success("Knowledge item created successfully!");
              }}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            💡 Pro tip: Knowledge items are automatically included in your prompt context to give AI better understanding of your project
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeBase;