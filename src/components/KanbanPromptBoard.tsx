import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DraggablePromptCard } from '@/components/DraggablePromptCard';
import { PromptCard } from '@/components/PromptCard';
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { Workspace, Prompt, PromptStatus, Product, Epic } from '@/types';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KanbanPromptBoardProps {
  workspace: Workspace;
  selectedProductId?: string;
  selectedEpicId?: string;
  searchQuery: string;
  hoveredPromptId?: string;
  onPromptHover: (promptId: string | undefined) => void;
  onCopy: (prompt: Prompt) => void;
  showCompletedItems?: boolean;
}

const COLUMNS: { status: PromptStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { status: 'in_progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-950' },
  { status: 'generating', title: 'Generating', color: 'bg-amber-50 dark:bg-amber-950' },
  { status: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-950' },
];

export function KanbanPromptBoard({
  workspace,
  selectedProductId,
  selectedEpicId,
  searchQuery,
  hoveredPromptId,
  onPromptHover,
  onCopy,
  showCompletedItems,
}: KanbanPromptBoardProps) {
  const promptsContext = usePromptsContext();
  const { prompts = [], loading = false, createPrompt, updatePromptStatus, updatePromptPriority, duplicatePrompt, deletePrompt } = promptsContext || {};
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { toast } = useToast();
  
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter prompts based on selection and search
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesProduct = !selectedProductId || selectedProductId === 'all' || prompt.product_id === selectedProductId;
      const matchesEpic = !selectedEpicId || prompt.epic_id === selectedEpicId;
      const includeByCompletion = showCompletedItems ? true : prompt.status !== 'done';
      
      // Basic search filtering
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesProduct && matchesEpic && includeByCompletion && matchesSearch;
    });

    // Add product and epic info to prompts
    return filtered.map(prompt => ({
      ...prompt,
      product: products.find(p => p.id === prompt.product_id),
      epic: epics.find(e => e.id === prompt.epic_id)
    }));
  }, [prompts, selectedProductId, selectedEpicId, showCompletedItems, searchQuery, products, epics]);

  const getPromptsByStatus = (status: PromptStatus) => {
    return filteredPrompts.filter(prompt => prompt.status === status);
  };

  const handleCreatePrompt = async (status: PromptStatus) => {
    if (!createPrompt) return;
    
    await createPrompt({
      title: 'New Prompt',
      description: '',
      status,
      product_id: selectedProductId && selectedProductId !== 'all' ? selectedProductId : undefined,
      epic_id: selectedEpicId,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activePrompt = filteredPrompts.find(p => p.id === event.active.id);
    setActivePrompt(activePrompt || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActivePrompt(null);
    
    if (!over) return;
    
    const activePrompt = filteredPrompts.find(p => p.id === active.id);
    if (!activePrompt) return;

    // Determine new status based on drop zone
    let newStatus: PromptStatus | null = null;
    
    // Check if dropped on a column
    for (const column of COLUMNS) {
      if (over.id === `column-${column.status}`) {
        newStatus = column.status;
        break;
      }
    }
    
    // If dropped on another prompt, get its status
    if (!newStatus) {
      const targetPrompt = filteredPrompts.find(p => p.id === over.id);
      if (targetPrompt) {
        newStatus = targetPrompt.status;
      }
    }
    
    // Update status if it changed
    if (newStatus && newStatus !== activePrompt.status && updatePromptStatus) {
      updatePromptStatus(activePrompt.id, newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Prompt moved to ${COLUMNS.find(c => c.status === newStatus)?.title}`,
      });
    }
  };

  // Shared prompt handlers
  const handlePromptClick = (prompt: Prompt) => {
    // Could open detail dialog or navigate
  };

  const handleEdit = (prompt: Prompt) => {
    // Handle edit
  };

  const handleStatusChange = (prompt: Prompt, status: PromptStatus) => {
    if (updatePromptStatus) {
      updatePromptStatus(prompt.id, status);
    }
  };

  const handlePriorityChange = (prompt: Prompt, priority: number) => {
    if (updatePromptPriority) {
      updatePromptPriority(prompt.id, priority);
    }
  };

  const handleDuplicate = (prompt: Prompt) => {
    if (duplicatePrompt) {
      duplicatePrompt(prompt);
    }
  };

  const handleDelete = (prompt: Prompt) => {
    if (deletePrompt) {
      deletePrompt(prompt.id);
    }
  };

  const handleCopy = (prompt: Prompt) => {
    onCopy(prompt);
  };

  const handleCopyGenerated = (prompt: Prompt) => {
    onCopy(prompt);
  };

  if (loading) {
    return (
      <div className="flex gap-6 p-6">
        {COLUMNS.map((column) => (
          <div key={column.status} className="flex-1">
            <Card className="h-32 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <main 
      className="flex-1 p-4 sm:p-6" 
      role="main"
      aria-label="Kanban board for prompt management"
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) => `Started dragging prompt ${active.id}`,
            onDragOver: ({ active, over }) => over ? `Dragging prompt ${active.id} over ${over.id}` : '',
            onDragEnd: ({ active, over }) => over ? `Dropped prompt ${active.id} on ${over.id}` : `Cancelled dragging prompt ${active.id}`,
            onDragCancel: ({ active }) => `Cancelled dragging prompt ${active.id}`,
          },
        }}
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pb-6"
          role="application"
          aria-label="Drag and drop kanban board"
        >
          {COLUMNS.map((column) => {
            const columnPrompts = getPromptsByStatus(column.status);
            
            return (
              <section 
                key={column.status} 
                className="flex flex-col min-h-[400px]"
                aria-labelledby={`column-title-${column.status}`}
                role="region"
              >
                <Card className={`h-full ${column.color} border-border shadow-sm hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3 px-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 
                          id={`column-title-${column.status}`}
                          className="font-semibold text-foreground text-sm"
                        >
                          {column.title}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-1 font-medium"
                          aria-label={`${columnPrompts.length} prompts in ${column.title} column`}
                        >
                          {columnPrompts.length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreatePrompt(column.status)}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8 w-8 p-0 rounded-md transition-colors"
                        aria-label={`Add new prompt to ${column.title} column`}
                        title={`Add new prompt to ${column.title}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-4 pb-4 flex-1">
                    <div 
                      className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scroll-smooth"
                      role="list"
                      aria-label={`${column.title} prompts`}
                    >
                      <SortableContext
                        items={columnPrompts.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                        id={`column-${column.status}`}
                      >
                        {columnPrompts.map((prompt) => (
                          <div key={prompt.id} role="listitem">
                            <DraggablePromptCard
                              prompt={prompt}
                              onPromptClick={handlePromptClick}
                              onEdit={handleEdit}
                              onStatusChange={handleStatusChange}
                              onPriorityChange={handlePriorityChange}
                              onDuplicate={handleDuplicate}
                              onDelete={handleDelete}
                              onCopy={handleCopy}
                              onCopyGenerated={handleCopyGenerated}
                              isHovered={hoveredPromptId === prompt.id}
                              onHover={onPromptHover}
                            />
                          </div>
                        ))}
                      </SortableContext>
                      
                      {columnPrompts.length === 0 && (
                        <div 
                          className="text-center py-12 text-muted-foreground"
                          role="status"
                          aria-label={`No prompts in ${column.title} column`}
                        >
                          <p className="text-sm mb-3">No prompts yet</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreatePrompt(column.status)}
                            className="mt-2 hover:bg-accent/50 transition-colors"
                            aria-label={`Add first prompt to ${column.title} column`}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add prompt
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>

        <DragOverlay>
          {activePrompt ? (
            <div role="dialog" aria-label="Dragging prompt preview">
              <PromptCard
                prompt={activePrompt}
                onPromptClick={handlePromptClick}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onCopyGenerated={handleCopyGenerated}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}