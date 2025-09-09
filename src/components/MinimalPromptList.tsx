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
import { MinimalistPromptCard } from '@/components/MinimalistPromptCard';
import { LinearPromptItem } from '@/components/LinearPromptItem';
import { CursorConfigDialog } from '@/components/CursorConfigDialog';
import { Workspace, Prompt, PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS } from '@/types';
import { isPromptUsable } from '@/lib/utils';
import { searchPrompts, SearchablePrompt } from '@/lib/searchUtils';
import { useUserPreferences } from '@/hooks/useUserPreferences';

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
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { toast } = useToast();
  const { preferences } = useUserPreferences();
  
  console.debug('[MinimalPromptList] Render with props:', { 
    selectedProductId, 
    selectedEpicId, 
    searchQuery,
    promptCount: prompts?.length, 
    loading 
  });
  console.debug('[MinimalPromptList] Products loaded:', products.map(p => ({ id: p.id, name: p.name })));
  console.debug('[MinimalPromptList] Title calculation:', {
    selectedProductId,
    selectedEpicId,
    hasEpic: !!selectedEpicId,
    isAllProducts: selectedProductId === 'all' || !selectedProductId,
    foundProduct: selectedProductId ? products.find(p => p.id === selectedProductId) : null
  });
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showCursorDialog, setShowCursorDialog] = useState(false);
  const [cursorPrompt, setCursorPrompt] = useState<Prompt | null>(null);

  // Derive effective product when only epic is selected
  const effectiveProductId = useMemo(() => {
    if (selectedProductId && selectedProductId !== 'all') return selectedProductId;
    if (selectedEpicId) {
      const epic = epics.find(e => e.id === selectedEpicId);
      return epic?.product_id;
    }
    return undefined;
  }, [selectedProductId, selectedEpicId, epics]);

  // Track prompts that are in completion animation
  const [completingPrompts, setCompletingPrompts] = useState<Set<string>>(new Set());

  // Enhanced search with fuzzy matching and multi-field search
  const searchResults = useMemo(() => {
    // First apply basic filters (product/epic/completion status)
    const basicFilteredPrompts = prompts.filter(prompt => {
      const matchesProduct = !selectedProductId || selectedProductId === 'all' || prompt.product_id === selectedProductId;
      const matchesEpic = !selectedEpicId || prompt.epic_id === selectedEpicId;
      // Keep prompts that are animating completion temporarily visible
      const includeByCompletion = showCompletedItems ? true : (prompt.status !== 'done' || completingPrompts.has(prompt.id));
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
      // Define status priority order - Cursor workflows and in_progress come first
      const cursorWorkflowStatuses = ['sent_to_cursor', 'cursor_working', 'pr_created', 'pr_review', 'pr_ready', 'pr_merged'];
      const isACursorWorkflow = cursorWorkflowStatuses.includes(a.status);
      const isBCursorWorkflow = cursorWorkflowStatuses.includes(b.status);
      
      // Cursor workflow prompts always come first
      if (isACursorWorkflow && !isBCursorWorkflow) {
        return -1;
      }
      if (isBCursorWorkflow && !isACursorWorkflow) {
        return 1;
      }
      
      // Within Cursor workflows, maintain their workflow order
      if (isACursorWorkflow && isBCursorWorkflow) {
        const aIndex = cursorWorkflowStatuses.indexOf(a.status);
        const bIndex = cursorWorkflowStatuses.indexOf(b.status);
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
      }
      
      // Then in_progress prompts come next
      if (a.status === 'in_progress' && b.status !== 'in_progress' && !isBCursorWorkflow) {
        return -1;
      }
      if (b.status === 'in_progress' && a.status !== 'in_progress' && !isACursorWorkflow) {
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

  // Group prompts by epic when viewing a specific product (no epic selected)
  const promptsByEpic = useMemo(() => {
    // Only group by epic if we have a product selected but no specific epic
    if (!selectedProductId || selectedProductId === 'all' || selectedEpicId) {
      return null;
    }

    const groups = new Map<string | null, Prompt[]>();
    
    promptsWithInfo.forEach(prompt => {
      const epicId = prompt.epic_id || null;
      if (!groups.has(epicId)) {
        groups.set(epicId, []);
      }
      groups.get(epicId)!.push(prompt);
    });

    return groups;
  }, [promptsWithInfo, selectedProductId, selectedEpicId]);

  // No longer grouping by priority - all prompts shown in one sorted list

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
    
    if (newStatus === 'done') {
      // Add to completing prompts to keep visible during animation
      setCompletingPrompts(prev => new Set(prev).add(prompt.id));
      // Remove from completing prompts after animation completes
      setTimeout(() => {
        setCompletingPrompts(prev => {
          const newSet = new Set(prev);
          newSet.delete(prompt.id);
          return newSet;
        });
      }, 600); // Total animation time (300ms slide + 200ms fade + buffer)
    }
    
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

  const handleMoreActions = (prompt: Prompt) => {
    // This could open a context menu with duplicate, delete, edit options
    // For now, let's just show a simple alert with available actions
    console.log('More actions for prompt:', prompt.id);
    // TODO: Implement context menu or dropdown with options
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
      <div className="space-y-4 sm:space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center py-2 px-3">
            <div className="w-8 h-8 flex-shrink-0 mr-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 mr-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" style={{width: `${60 + i * 8}%`}} />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{width: `${40 + i * 6}%`}} />
            </div>
            <div className="w-30 mr-4 hidden sm:block">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{width: '60%'}} />
            </div>
            <div className="w-20 mr-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{width: '80%'}} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (promptsWithInfo.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-lg mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div 
              className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => {
                console.log('[MinimalPromptList] Dispatching open-quick-prompt event');
                const event = new CustomEvent('open-quick-prompt');
                window.dispatchEvent(event);
              }}
            >
              <Plus className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                {searchQuery ? 'No prompts found' : 'No prompts yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm text-center mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search query to find what you\'re looking for'
                  : 'Create your first prompt to get started with your AI-powered workflow'
                }
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700">Q</kbd> for quick task or <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-700">T</kbd> for bugs
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <nav className="mb-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="font-medium">All prompts</span>
              {effectiveProductId && (
                <>
                  <span className="mx-2">›</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {products.find(p => p.id === effectiveProductId)?.name || 'Unknown Product'}
                  </span>
                </>
              )}
              {selectedEpicId && (
                <>
                  <span className="mx-2">›</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {epics.find(e => e.id === selectedEpicId)?.name || 'Unknown Epic'}
                  </span>
                </>
              )}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {promptsWithInfo.length} prompt{promptsWithInfo.length !== 1 ? 's' : ''}
            </div>
          </div>
        </nav>
        {searchQuery && (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Search: "{searchQuery}"
            {searchResults.length > 0 && searchResults[0].matchedFields.length > 0 && (
              <span className="text-xs ml-1 hidden sm:inline">
                (found in: {searchResults.slice(0, 3).map(r => r.matchedFields).flat().filter((field, index, arr) => arr.indexOf(field) === index).join(', ')})
              </span>
            )}
          </p>
        )}
      </div>

      {/* Linear-style Table Header */}
      <div className="flex items-center py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 mb-2">
        <div className="w-8 mr-3">Pri</div>
        <div className="flex-1 mr-4">Title</div>
        <div className="w-30 mr-4 hidden sm:block">Context</div>
        <div className="w-20 mr-4">Status</div>
        <div className="w-20">Actions</div>
      </div>

      {/* Prompt List */}
      <div>
        {/* Epic Breakdown View */}
        {promptsByEpic ? (
          Array.from(promptsByEpic.entries()).map(([epicId, epicPrompts]) => {
            const epic = epics.find(e => e.id === epicId);
            const epicName = epic?.name || 'Unassigned';
            
            return (
              <div key={epicId || 'unassigned'} className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-full">
                    {epicName} • {epicPrompts.length} prompts
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
                </div>
                <div className="space-y-px">
                  {epicPrompts.map((prompt) => (
                    <LinearPromptItem
                      key={prompt.id}
                      prompt={prompt}
                      onPromptClick={handlePromptClick}
                      onCopyGenerated={handleCopyGenerated}
                      onShowCursorDialog={() => {
                        setCursorPrompt(prompt);
                        setShowCursorDialog(true);
                      }}
                      onPriorityChange={handlePriorityChangeWrapper}
                      onStatusChange={handleStatusChangeWrapper}
                      onMoreActions={handleMoreActions}
                      isHovered={hoveredPromptId === prompt.id}
                      onHover={onPromptHover}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          /* Single List View */
          <div className="space-y-px">
            {promptsWithInfo.map((prompt) => (
              <LinearPromptItem
                key={prompt.id}
                prompt={prompt}
                onPromptClick={handlePromptClick}
                onCopyGenerated={handleCopyGenerated}
                onShowCursorDialog={() => {
                  setCursorPrompt(prompt);
                  setShowCursorDialog(true);
                }}
                onPriorityChange={handlePriorityChangeWrapper}
                onStatusChange={handleStatusChangeWrapper}
                onMoreActions={handleMoreActions}
                isHovered={hoveredPromptId === prompt.id}
                onHover={onPromptHover}
              />
            ))}
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

      {/* Cursor Config Dialog */}
      {cursorPrompt && (
        <CursorConfigDialog
          isOpen={showCursorDialog}
          onClose={() => setShowCursorDialog(false)}
          prompt={cursorPrompt}
        />
      )}
    </div>
  );
}