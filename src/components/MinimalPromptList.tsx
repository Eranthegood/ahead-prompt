import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useToast } from '@/hooks/use-toast';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { PromptTransformService } from '@/services/promptTransformService';
import { PromptCard } from '@/components/PromptCard';
import { Workspace, Prompt, PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS } from '@/types';
import { isPromptUsable } from '@/lib/utils';
import { searchPrompts, SearchablePrompt } from '@/lib/searchUtils';

interface MinimalPromptListProps {
  workspace: Workspace;
  selectedProductId?: string;
  selectedEpicId?: string;
  searchQuery: string;
  hoveredPromptId?: string;
  onPromptHover: (promptId: string | undefined) => void;
  onCopy: (prompt: Prompt) => void;
  showCompletedItems?: boolean;
}

export function MinimalPromptList({ 
  workspace, 
  selectedProductId, 
  selectedEpicId, 
  searchQuery, 
  hoveredPromptId, 
  onPromptHover,
  onCopy,
  showCompletedItems
}: MinimalPromptListProps) {
  const promptsContext = usePromptsContext();
  const { prompts = [], loading = false, updatePromptStatus, updatePromptPriority, duplicatePrompt, deletePrompt } = promptsContext || {};
  console.debug('[MinimalPromptList] Render with props:', { 
    selectedProductId, 
    selectedEpicId, 
    searchQuery,
    promptCount: prompts?.length, 
    loading 
  });
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { toast } = useToast();
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Enhanced search with fuzzy matching and multi-field search
  const searchResults = useMemo(() => {
    // First apply basic filters (product/epic/completion status)
    const basicFilteredPrompts = prompts.filter(prompt => {
      const matchesProduct = !selectedProductId || selectedProductId === 'all' || prompt.product_id === selectedProductId;
      const matchesEpic = !selectedEpicId || prompt.epic_id === selectedEpicId;
      const includeByCompletion = showCompletedItems ? true : prompt.status !== 'done';
      return matchesProduct && matchesEpic && includeByCompletion;
    });

    // Add product and epic info for search
    const searchablePrompts: SearchablePrompt[] = basicFilteredPrompts.map(prompt => ({
      ...prompt,
      product: products.find(p => p.id === prompt.product_id),
      epic: epics.find(e => e.id === prompt.epic_id)
    }));

    // Apply enhanced search
    return searchPrompts(searchablePrompts, searchQuery, {
      minScore: searchQuery ? 0.1 : 0,
      maxResults: 200
    });
  }, [prompts, selectedProductId, selectedEpicId, showCompletedItems, searchQuery, products, epics]);

  const filteredPrompts = searchResults.map(result => result.prompt);

  // Sort prompts with search relevance consideration
  const promptsWithInfo = useMemo(() => {
    return filteredPrompts.sort((a, b) => {
      // If we have search results, use search score for initial sorting
      if (searchQuery) {
        const scoreA = searchResults.find(r => r.prompt.id === a.id)?.score || 0;
        const scoreB = searchResults.find(r => r.prompt.id === b.id)?.score || 0;
        if (Math.abs(scoreA - scoreB) > 0.1) { // Only use search score if there's a meaningful difference
          return scoreB - scoreA;
        }
      }
      // First, sort by status - in_progress prompts always come first
      if (a.status === 'in_progress' && b.status !== 'in_progress') {
        return -1;
      }
      if (b.status === 'in_progress' && a.status !== 'in_progress') {
        return 1;
      }
      
      // Then sort by priority (1 = High, 2 = Normal, 3 = Low)
      const priorityA = a.priority || 3;
      const priorityB = b.priority || 3;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredPrompts, searchResults, searchQuery]);

  // Group prompts by priority and status
  const highPriorityPrompts = promptsWithInfo.filter(p => (p.priority || 3) === 1);
  const normalLowPriorityInProgress = promptsWithInfo.filter(p => p.status === 'in_progress' && (p.priority || 3) > 1);
  const normalLowPriorityTodo = promptsWithInfo.filter(p => p.status === 'todo' && (p.priority || 3) > 1);
  const generatingPrompts = promptsWithInfo.filter(p => p.status === 'generating');

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

  // Wrapper functions to match PromptCard interface
  const handleStatusChangeWrapper = (prompt: Prompt, newStatus: PromptStatus) => {
    if (newStatus === prompt.status) return;
    updatePromptStatus(prompt.id, newStatus);
  };

  const handlePriorityChangeWrapper = (prompt: Prompt, newPriority: number) => {
    if (newPriority === prompt.priority) return;
    updatePromptPriority(prompt.id, newPriority);
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
      
      // Auto-change status from todo to in_progress when copied
      if (prompt.status === 'todo') {
        await updatePromptStatus(prompt.id, 'in_progress');
      }
      
      toast({
        title: 'Copied to clipboard',
        description: prompt.status === 'todo' ? 'Prompt copied and moved to In Progress' : 'Prompt content has been copied'
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
      // Check if prompt is usable before proceeding
      if (!isPromptUsable(prompt)) {
        toast({
          title: 'Prompt non exploitable',
          description: prompt.status === 'generating' 
            ? 'Attendez la fin de la génération' 
            : 'Description trop courte pour générer un prompt',
          variant: 'destructive'
        });
        return;
      }

      // If a generated prompt already exists, use it directly
      if (prompt.generated_prompt) {
        await navigator.clipboard.writeText(prompt.generated_prompt);
        
        // Auto-change status from todo to in_progress when copied
        if (prompt.status === 'todo') {
          await updatePromptStatus(prompt.id, 'in_progress');
        }
        
        toast({
          title: 'Generated prompt copied',
          description: prompt.status === 'todo' ? 'AI prompt copied and moved to In Progress' : 'AI-generated prompt has been copied to clipboard'
        });
        return;
      }

      // If no generated prompt exists, generate a new one
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
        
        // Auto-change status from todo to in_progress when copied
        if (prompt.status === 'todo') {
          await updatePromptStatus(prompt.id, 'in_progress');
        }
        
        toast({
          title: 'Generated prompt copied',
          description: prompt.status === 'todo' ? 'AI prompt copied and moved to In Progress' : 'AI-generated prompt has been copied to clipboard'
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
        
        // Auto-change status from todo to in_progress when copied (even in fallback)
        if (prompt.status === 'todo') {
          await updatePromptStatus(prompt.id, 'in_progress');
        }
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          {selectedEpicId ? 
            `Epic: ${epics.find(e => e.id === selectedEpicId)?.name || 'Unknown'}` :
            selectedProductId === 'all' || !selectedProductId ? 'All Prompts' : 
            products.find(p => p.id === selectedProductId)?.name || 'Prompts'}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {promptsWithInfo.length} prompt{promptsWithInfo.length !== 1 ? 's' : ''}
          {searchQuery && (
            <span className="ml-2 text-primary">
              • Search: "{searchQuery}"
              {searchResults.length > 0 && searchResults[0].matchedFields.length > 0 && (
                <span className="text-xs ml-1 hidden sm:inline">
                  (found in: {searchResults.slice(0, 3).map(r => r.matchedFields).flat().filter((field, index, arr) => arr.indexOf(field) === index).join(', ')})
                </span>
              )}
            </span>
          )}
        </p>
      </div>

      {/* Prompt List */}
      <div className="space-y-4 sm:space-y-6">
        {/* High Priority Section */}
        {highPriorityPrompts.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-destructive flex-1" />
              <Badge variant="destructive" className="bg-destructive/20 text-destructive-foreground">
                🔥 High priority ({highPriorityPrompts.length})
              </Badge>
              <div className="h-px bg-destructive flex-1" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {highPriorityPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onPromptClick={handlePromptClick}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChangeWrapper}
                  onPriorityChange={handlePriorityChangeWrapper}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onCopyGenerated={handleCopyGenerated}
                  isHovered={hoveredPromptId === prompt.id}
                  onHover={onPromptHover}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generating Section */}
        {generatingPrompts.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-primary flex-1" />
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Generating... ({generatingPrompts.length})
              </Badge>
              <div className="h-px bg-primary flex-1" />
            </div>
            <div className="space-y-3">
              {generatingPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onPromptClick={handlePromptClick}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChangeWrapper}
                  onPriorityChange={handlePriorityChangeWrapper}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onCopyGenerated={handleCopyGenerated}
                  isHovered={hoveredPromptId === prompt.id}
                  onHover={onPromptHover}
                />
              ))}
            </div>
          </div>
        )}

        {/* Normal/Low Priority In Progress Section */}
        {normalLowPriorityInProgress.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-warning flex-1" />
              <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">
                In Progress ({normalLowPriorityInProgress.length})
              </Badge>
              <div className="h-px bg-warning flex-1" />
            </div>
            <div className="space-y-3">
              {normalLowPriorityInProgress.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onPromptClick={handlePromptClick}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChangeWrapper}
                  onPriorityChange={handlePriorityChangeWrapper}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onCopyGenerated={handleCopyGenerated}
                  isHovered={hoveredPromptId === prompt.id}
                  onHover={onPromptHover}
                />
              ))}
            </div>
          </div>
        )}

        {/* Normal/Low Priority To Do Section */}
        {normalLowPriorityTodo.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px bg-muted flex-1" />
              <Badge variant="outline">
                To Do ({normalLowPriorityTodo.length})
              </Badge>
              <div className="h-px bg-muted flex-1" />
            </div>
            <div className="space-y-3">
              {normalLowPriorityTodo.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onPromptClick={handlePromptClick}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChangeWrapper}
                  onPriorityChange={handlePriorityChangeWrapper}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onCopyGenerated={handleCopyGenerated}
                  isHovered={hoveredPromptId === prompt.id}
                  onHover={onPromptHover}
                />
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