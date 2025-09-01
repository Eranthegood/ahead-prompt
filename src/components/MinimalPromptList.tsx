import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hash, Package, Calendar, User, MoreHorizontal, Plus, Edit, Copy, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { usePrompts } from '@/hooks/usePrompts';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { PromptContextMenu } from '@/components/PromptContextMenu';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { PromptTransformService } from '@/services/promptTransformService';
import { Workspace, Prompt, PromptStatus } from '@/types';

interface MinimalPromptListProps {
  workspace: Workspace;
  selectedProductId?: string;
  selectedEpicId?: string;
  searchQuery: string;
  onQuickAdd: () => void;
}

export function MinimalPromptList({ workspace, selectedProductId, selectedEpicId, searchQuery, onQuickAdd }: MinimalPromptListProps) {
  const { prompts, loading, updatePromptStatus, duplicatePrompt, deletePrompt } = usePrompts(workspace.id);
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { toast } = useToast();
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter prompts (exclude done prompts and apply epic filter)
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProduct = !selectedProductId || selectedProductId === 'all' || 
      prompt.product_id === selectedProductId;

    const matchesEpic = !selectedEpicId || prompt.epic_id === selectedEpicId;

    const isNotDone = prompt.status !== 'done';

    return matchesSearch && matchesProduct && matchesEpic && isNotDone;
  });

  // Get product and epic info for each prompt and group by status
  const promptsWithInfo = filteredPrompts.map(prompt => {
    const product = products.find(p => p.id === prompt.product_id);
    const epic = epics.find(e => e.id === prompt.epic_id);
    
    return {
      ...prompt,
      product,
      epic
    };
  });

  // Group prompts by status for display
  const inProgressPrompts = promptsWithInfo.filter(p => p.status === 'in_progress');
  const todoPrompts = promptsWithInfo.filter(p => p.status === 'todo');

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDetailDialogOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDetailDialogOpen(true);
  };

  const statusOptions = [
    { value: 'todo', label: 'Todo', variant: 'outline' as const },
    { value: 'in_progress', label: 'In Progress', variant: 'secondary' as const },
    { value: 'done', label: 'Done', variant: 'success' as const }
  ];

  const handleStatusChange = async (prompt: Prompt, newStatus: PromptStatus) => {
    if (newStatus === prompt.status) return;
    await updatePromptStatus(prompt.id, newStatus);
  };

  const handleDuplicate = async (prompt: Prompt) => {
    await duplicatePrompt(prompt);
  };

  const handleDelete = async (prompt: Prompt) => {
    await deletePrompt(prompt.id);
  };

  const handleCopy = async (prompt: Prompt) => {
    try {
      const content = `${prompt.title}\n\n${prompt.description || ''}`.trim();
      await navigator.clipboard.writeText(content);
      
      toast({
        title: 'Copied to clipboard',
        description: 'Prompt content has been copied'
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleCopyGenerated = async (prompt: Prompt) => {
    try {
      const rawText = `${prompt.title}\n\n${prompt.description || ''}`.trim();
      
      toast({
        title: 'Generating prompt...',
        description: 'Please wait while we generate your prompt'
      });

      const response = await PromptTransformService.transformPrompt(rawText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        await navigator.clipboard.writeText(response.transformedPrompt);
        
        toast({
          title: 'Generated prompt copied',
          description: 'AI-generated prompt has been copied to clipboard'
        });
      } else {
        throw new Error('No generated prompt received');
      }
    } catch (error) {
      console.error('Error generating and copying prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate prompt. Copying original content instead.',
        variant: 'destructive'
      });
      
      // Fallback to copying original content
      try {
        const content = `${prompt.title}\n\n${prompt.description || ''}`.trim();
        await navigator.clipboard.writeText(content);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (promptsWithInfo.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'No prompts found' : 'No prompts yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Create your first prompt to get started'
            }
          </p>
          {!searchQuery && (
            <Button onClick={onQuickAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          {selectedEpicId ? 
            `Epic: ${epics.find(e => e.id === selectedEpicId)?.name || 'Unknown'}` :
            selectedProductId === 'all' || !selectedProductId ? 'All Prompts' : 
            products.find(p => p.id === selectedProductId)?.name || 'Prompts'}
        </h2>
        <p className="text-muted-foreground">
          {promptsWithInfo.length} prompt{promptsWithInfo.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Prompt List */}
      <div className="space-y-6">
        {/* In Progress Section */}
        {inProgressPrompts.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-warning flex-1" />
              <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
                In Progress ({inProgressPrompts.length})
              </Badge>
              <div className="h-px bg-warning flex-1" />
            </div>
            <div className="space-y-3">
              {inProgressPrompts.map((prompt) => (
          <PromptContextMenu
            key={prompt.id}
            prompt={prompt}
            onEdit={() => handleEdit(prompt)}
            onUpdate={() => {}}
          >
            <Card className="hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div 
                  className="flex items-start justify-between"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <div className="flex-1 min-w-0">
                    <TruncatedTitle 
                      title={prompt.title}
                      maxLength={60}
                      className="font-medium text-foreground mb-2 group"
                      showCopyButton={false}
                      variant="inline"
                    />
                    
                    {prompt.description && (
                      <div 
                        className="text-sm text-muted-foreground mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: prompt.description }}
                      />
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {prompt.product && (
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{prompt.product.name}</span>
                        </div>
                      )}
                      
                      {prompt.epic && (
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{prompt.epic.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(prompt.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Status Badge - Click to cycle through statuses */}
                    <Badge 
                      variant={
                        prompt.status === 'done' ? 'success' : 
                        prompt.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = statusOptions.findIndex(s => s.value === prompt.status);
                        const nextIndex = (currentIndex + 1) % statusOptions.length;
                        const nextStatus = statusOptions[nextIndex].value as PromptStatus;
                        handleStatusChange(prompt, nextStatus);
                      }}
                    >
                      {prompt.status === 'in_progress' ? 'In Progress' : 
                       prompt.status === 'done' ? 'Done' : 'Todo'}
                    </Badge>
                    
                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          handleEdit(prompt);
                        }} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit prompt
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleCopy(prompt)} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy content
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCopyGenerated(prompt);
                        }} className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Copy generated prompt
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          handleDuplicate(prompt);
                        }} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Change status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-48">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleStatusChange(prompt, option.value as PromptStatus);
                                }}
                                disabled={option.value === prompt.status}
                                className="flex items-center justify-between"
                              >
                                <span>{option.label}</span>
                                <Badge variant={option.variant} className="text-xs">
                                  {option.value === prompt.status ? 'Current' : ''}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(prompt);
                          }}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete prompt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PromptContextMenu>
              ))}
            </div>
          </div>
        )}

        {/* To Do Section */}
        {todoPrompts.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-muted flex-1" />
              <Badge variant="outline">
                To Do ({todoPrompts.length})
              </Badge>
              <div className="h-px bg-muted flex-1" />
            </div>
            <div className="space-y-3">
              {todoPrompts.map((prompt) => (
          <PromptContextMenu
            key={prompt.id}
            prompt={prompt}
            onEdit={() => handleEdit(prompt)}
            onUpdate={() => {}}
          >
            <Card className="hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div 
                  className="flex items-start justify-between"
                  onClick={() => handlePromptClick(prompt)}
                >
                  <div className="flex-1 min-w-0">
                    <TruncatedTitle 
                      title={prompt.title}
                      maxLength={60}
                      className="font-medium text-foreground mb-2 group"
                      showCopyButton={false}
                      variant="inline"
                    />
                    
                    {prompt.description && (
                      <div 
                        className="text-sm text-muted-foreground mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: prompt.description }}
                      />
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {prompt.product && (
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{prompt.product.name}</span>
                        </div>
                      )}
                      
                      {prompt.epic && (
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{prompt.epic.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(prompt.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Status Badge - Click to cycle through statuses */}
                    <Badge 
                      variant={
                        prompt.status === 'done' ? 'success' : 
                        prompt.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = statusOptions.findIndex(s => s.value === prompt.status);
                        const nextIndex = (currentIndex + 1) % statusOptions.length;
                        const nextStatus = statusOptions[nextIndex].value as PromptStatus;
                        handleStatusChange(prompt, nextStatus);
                      }}
                    >
                      {prompt.status === 'in_progress' ? 'In Progress' : 
                       prompt.status === 'done' ? 'Done' : 'Todo'}
                    </Badge>
                    
                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          handleEdit(prompt);
                        }} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit prompt
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleCopy(prompt)} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy content
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCopyGenerated(prompt);
                        }} className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Copy generated prompt
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={(e) => {
                          e.preventDefault();
                          handleDuplicate(prompt);
                        }} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Change status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-48">
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleStatusChange(prompt, option.value as PromptStatus);
                                }}
                                disabled={option.value === prompt.status}
                                className="flex items-center justify-between"
                              >
                                <span>{option.label}</span>
                                <Badge variant={option.variant} className="text-xs">
                                  {option.value === prompt.status ? 'Current' : ''}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(prompt);
                          }}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete prompt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PromptContextMenu>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        products={products}
        epics={epics}
      />
    </div>
  );
}