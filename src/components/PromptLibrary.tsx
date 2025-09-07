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
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border/40">
            <DialogTitle className="text-lg font-medium text-foreground flex items-center gap-2">
              <Library className="w-5 h-5 text-muted-foreground" />
              Prompt Library
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {/* Search and Actions Bar */}
            <div className="px-6 py-4 border-b border-border/30">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-border/40 bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="px-4 gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  New Prompt
                  <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-primary-foreground/20 text-primary-foreground rounded border">L</kbd>
                </Button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-6 py-3 border-b border-border/20">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="bg-muted/30 h-9">
                  <TabsTrigger value="all" className="text-sm px-4">All</TabsTrigger>
                  <TabsTrigger value="favorites" className="text-sm px-4 gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    Favorites
                  </TabsTrigger>
                  {PROMPT_CATEGORIES.slice(0, 4).map(category => (
                    <TabsTrigger key={category} value={category} className="text-sm px-4">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Items Grid with Enhanced Scroll */}
            <div className="flex-1 px-6 pt-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/60"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                    <Library className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2 text-lg">
                    {items.length === 0 ? 'No prompts yet' : 'No matching prompts'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {items.length === 0 
                      ? 'Create your first prompt to get started with your library'
                      : 'Try adjusting your search or filter to find what you\'re looking for'
                    }
                  </p>
                  {items.length === 0 && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)} 
                      className="gap-2 px-6"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Prompt
                    </Button>
                  )}
                </div>
              ) : (
                <EnhancedScrollArea className="prompt-library-scroll" showIndicators={true}>
                  <div className="space-y-2 pb-6 pr-2">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className="group p-4 rounded-lg border border-border/40 hover:border-border/80 hover:shadow-sm transition-all duration-200 bg-card/30 hover:bg-card/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-foreground text-base leading-tight">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/40">
                                  {item.ai_model}
                                </Badge>
                                {item.category && item.category !== 'General' && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                              {item.body}
                            </p>
                            
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {item.tags.slice(0, 4).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 bg-muted/20">
                                    #{tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 4 && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted/20">
                                    +{item.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Used {item.usage_count} times</span>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(item.id)}
                              className="w-8 h-8 p-0 hover:bg-muted/60"
                            >
                              {item.is_favorite ? (
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ) : (
                                <Star className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyPrompt(item)}
                              className="w-8 h-8 p-0 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                              className="w-8 h-8 p-0 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              className="w-8 h-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </EnhancedScrollArea>
              )}
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