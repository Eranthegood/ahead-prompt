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
    <div className="flex-1 p-3 sm:p-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6">
          {COLUMNS.map((column) => {
            const columnPrompts = getPromptsByStatus(column.status);
            
            return (
              <div key={column.status} className="flex-1 min-w-80">
                <Card className={`h-full ${column.color} border-border`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{column.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {columnPrompts.length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreatePrompt(column.status)}
                        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    <SortableContext
                      items={columnPrompts.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                      id={`column-${column.status}`}
                    >
                      {columnPrompts.map((prompt) => (
                        <DraggablePromptCard
                          key={prompt.id}
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
                      ))}
                    </SortableContext>
                    
                    {columnPrompts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No prompts yet</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreatePrompt(column.status)}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add prompt
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activePrompt ? (
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
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}