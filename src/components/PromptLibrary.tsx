import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedScrollArea } from '@/components/ui/enhanced-scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  Lightbulb,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PromptLibraryCreateDialog } from './PromptLibraryCreateDialog';
import type { PromptLibraryItem } from '@/types/prompt-library';
import { PROMPT_CATEGORIES } from '@/types/prompt-library';
import { copyText } from '@/lib/clipboard';

interface PromptLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoFocus?: boolean;
}

export function PromptLibrary({ open, onOpenChange, autoFocus = false }: PromptLibraryProps) {
  const { items, loading, deleteItem, toggleFavorite, incrementUsage } = usePromptLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PromptLibraryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PromptLibraryItem | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskTemplate, setTaskTemplate] = useState('');
  const [openedViaShortcut, setOpenedViaShortcut] = useState(false);
  const { toast } = useToast();

  // Handle opening via shortcut and auto-focus
  useEffect(() => {
    if (open) {
      // Clear search when opening via shortcut for fresh start
      if (autoFocus) {
        setSearchQuery('');
        setSelectedCategory('all');
        setOpenedViaShortcut(true);
        
        // Auto-focus the search input
        setTimeout(() => {
          const searchInput = document.querySelector('[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
        }, 100);
      }
    } else {
      setOpenedViaShortcut(false);
    }
  }, [open, autoFocus]);

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
      
      // Q key to create task from viewing prompt
      if (event.key.toLowerCase() === 'q' && viewingItem) {
        event.preventDefault();
        handleCreateTask();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, viewingItem]);

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
      const ok = await copyText(item.body);
      if (!ok) throw new Error('manual-copy');
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

  const handleCreateTask = () => {
    if (!viewingItem) return;
    
    const template = `Task: Implement "${viewingItem.title}"

Based on prompt:
${viewingItem.body}

Tags: ${viewingItem.tags.join(', ')}

TODO:
- [ ] Analyze requirements
- [ ] Plan implementation
- [ ] Execute
- [ ] Test
- [ ] Document`;
    
    setTaskTemplate(template);
    setShowTaskDialog(true);
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
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              {openedViaShortcut && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">/L</kbd>
                  <span className="text-muted-foreground">Quick search</span>
                </div>
              )}
              <DialogTitle className="text-lg font-medium text-foreground">
                {openedViaShortcut ? '' : 'Prompt Library'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Linear-style Search Bar */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-muted/30 text-foreground placeholder:text-muted-foreground focus:bg-muted/50 transition-colors h-11 text-base"
                autoFocus={openedViaShortcut}
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
                      className="group flex items-center gap-4 px-4 py-3 rounded-md hover:bg-muted/30 transition-all duration-150 cursor-pointer border border-transparent hover:border-border/50"
                      onClick={() => setViewingItem(item)}
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

      {/* View Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-medium">
              {viewingItem?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Tags */}
              {viewingItem?.tags && viewingItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingItem.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {viewingItem?.body}
                </div>
              </div>
              
              {/* Meta info */}
              <div className="pt-4 border-t border-border/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Category: {viewingItem?.category}</span>
                  <span>Used {viewingItem?.usage_count || 0} times</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t bg-muted/10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (viewingItem) toggleFavorite(viewingItem.id);
                }}
                className="gap-2"
              >
                {viewingItem?.is_favorite ? (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
                {viewingItem?.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCreateTask()}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Task
                <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground/20 text-primary-foreground rounded">Q</kbd>
              </Button>
              
              <div className="flex-1" />
              
              <Button
                onClick={() => {
                  if (viewingItem) handleCopyPrompt(viewingItem);
                }}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Creation Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-medium">
              Create Task from Prompt: {viewingItem?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Task Template (modify as needed)
                </label>
                <Textarea
                  value={taskTemplate}
                  onChange={(e) => setTaskTemplate(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Enter your task template..."
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t bg-muted/10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowTaskDialog(false)}
              >
                Cancel
              </Button>
              
              <Button
                onClick={async () => {
                  const ok = await copyText(taskTemplate);
                  if (ok) {
                    toast({
                      title: 'Task template copied',
                      description: 'The task template has been copied to your clipboard.',
                    });
                    setShowTaskDialog(false);
                  } else {
                    toast({
                      variant: 'destructive',
                      title: 'Failed to copy',
                      description: 'Could not copy task template to clipboard.',
                    });
                  }
                }}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Task Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}