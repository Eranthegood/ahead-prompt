import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { 
  Search, 
  Plus, 
  Star, 
  StarOff, 
  Copy, 
  Edit2, 
  Trash2, 
  Filter,
  Library,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PromptLibraryCreateDialog } from './PromptLibraryCreateDialog';
import type { PromptLibraryItem } from '@/types/prompt-library';
import { PROMPT_CATEGORIES } from '@/types/prompt-library';

interface PromptLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PromptLibrary({ open, onOpenChange }: PromptLibraryProps) {
  const { items, loading, deleteItem, toggleFavorite, incrementUsage } = usePromptLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PromptLibraryItem | null>(null);
  const { toast } = useToast();

  // Add keyboard shortcut for creating prompt when library is open
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true')
      ) {
        return;
      }

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        setShowCreateDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'favorites') {
        filtered = filtered.filter(item => item.is_favorite);
      } else {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }
    }

    return filtered;
  }, [items, searchQuery, selectedCategory]);

  const handleCopyPrompt = async (item: PromptLibraryItem) => {
    try {
      await navigator.clipboard.writeText(item.body);
      await incrementUsage(item.id);
      toast({
        title: 'Prompt copied',
        description: 'The prompt has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy prompt to clipboard.',
      });
    }
  };

  const handleDeleteItem = async (item: PromptLibraryItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await deleteItem(item.id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Library className="w-5 h-5" />
              Prompt Library
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Prompt
              </Button>
            </div>

            {/* Category Filter */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites" className="gap-1">
                  <Star className="w-3 h-3" />
                  Favorites
                </TabsTrigger>
                {PROMPT_CATEGORIES.slice(0, 4).map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Items Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Library className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-foreground mb-2">
                    {items.length === 0 ? 'No prompts yet' : 'No matching prompts'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {items.length === 0 
                      ? 'Create your first prompt to get started'
                      : 'Try adjusting your search or filter'
                    }
                  </p>
                  {items.length === 0 && (
                    <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Prompt
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.ai_model}
                            </Badge>
                            {item.category && (
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.body}
                          </p>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(item.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {item.is_favorite ? (
                              <Star className="w-4 h-4 fill-current text-yellow-500" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPrompt(item)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Used {item.usage_count} times</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <PromptLibraryCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        editItem={selectedItem}
        onEditComplete={() => setSelectedItem(null)}
      />
    </>
  );
}