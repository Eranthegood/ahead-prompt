import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
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
  Zap,
  Lightbulb
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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-background">
          {/* Minimal Header */}
          <DialogHeader className="px-6 py-3 border-b border-border/20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-normal text-muted-foreground">
                Prompt Library
              </DialogTitle>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded border">⌘K</kbd>
              </div>
            </div>
          </DialogHeader>

          {/* Search Bar */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Recherchez ou tapez un"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-muted/30 focus:bg-muted/50 transition-colors h-10"
              />
            </div>
          </div>

          {/* Category Filters - Minimal */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory('favorites')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                    selectedCategory === 'favorites'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  Favorites
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Library className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <h3 className="font-medium text-foreground mb-2">
                  {items.length === 0 ? 'No prompts yet' : 'No matching prompts'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {items.length === 0 
                    ? 'Create your first prompt to get started'
                    : 'Try adjusting your search or filter'
                  }
                </p>
                {items.length === 0 && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)} 
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Prompt
                  </Button>
                )}
              </div>
            ) : (
              <EnhancedScrollArea className="prompt-library-scroll" showIndicators={false}>
                <div className="space-y-1">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/30 transition-all duration-150 cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm truncate">
                            {item.title}
                          </h3>
                          {item.is_favorite && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.body}
                        </p>
                        {item.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            {item.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-5">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions & Shortcuts */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(item);
                          }}
                          className="w-7 h-7 p-0 hover:bg-muted/60"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="w-7 h-7 p-0 hover:bg-muted/60"
                        >
                          {item.is_favorite ? (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ) : (
                            <Star className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item);
                          }}
                          className="w-7 h-7 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      {/* Usage count */}
                      <div className="text-xs text-muted-foreground/60 min-w-0">
                        {item.usage_count > 0 && `${item.usage_count}x`}
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedScrollArea>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="px-6 py-4 border-t border-border/20 bg-muted/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {filteredItems.length} prompt{filteredItems.length !== 1 ? 's' : ''}
              </span>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                size="sm"
                className="gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                New Prompt
                <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 text-primary-foreground rounded">L</kbd>
              </Button>
            </div>
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