import React from "react";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  Active,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { EpicCard } from "./EpicCard";
import { Product, Epic } from "@/types";
import { useState } from "react";
import { Package } from "lucide-react";

export interface KanbanColumnData {
  productId: string;
  productName: string;
  productColor: string;
  epics: Epic[];
}

interface KanbanViewProps {
  columns: KanbanColumnData[];
  epicPromptCounts: Map<string, number>;
  onEpicClick?: (epic: Epic) => void;
  onEpicEdit?: (epic: Epic) => void;
  onEpicDelete?: (epicId: string) => void;
  onEpicDuplicate?: (epic: Epic) => void;
  onEpicProductChange?: (epicId: string, newProductId: string) => void;
  onEpicsReorder?: (epics: Epic[]) => void;
  onCreateEpic?: (productId?: string) => void;
}

export function KanbanView({
  columns,
  epicPromptCounts,
  onEpicClick,
  onEpicEdit,
  onEpicDelete,
  onEpicDuplicate,
  onEpicProductChange,
  onEpicsReorder,
  onCreateEpic,
}: KanbanViewProps) {
  const [activeEpic, setActiveEpic] = useState<Epic | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const allEpics = columns.flatMap(col => col.epics);
  const epicIds = allEpics.map(epic => epic.id);
  const columnIds = columns.map(col => col.productId);

  const handleDragStart = ({ active }: { active: Active }) => {
    const epic = allEpics.find(e => e.id === active.id);
    setActiveEpic(epic || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeEpic = allEpics.find(epic => epic.id === active.id);
    if (!activeEpic) return;

    // Check if we're over a column
    const overColumn = columns.find(col => col.productId === over.id);
    if (overColumn && activeEpic.product_id !== overColumn.productId) {
      // Epic is being moved to a different product
      onEpicProductChange?.(activeEpic.id, overColumn.productId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveEpic(null);

    if (!over || active.id === over.id) return;

    // Handle reordering within the same column
    const activeEpic = allEpics.find(epic => epic.id === active.id);
    const overEpic = allEpics.find(epic => epic.id === over.id);
    
    if (activeEpic && overEpic && activeEpic.product_id === overEpic.product_id) {
      // Both epics are in the same product column - reorder them
      const columnEpics = columns.find(col => col.productId === activeEpic.product_id)?.epics || [];
      const oldIndex = columnEpics.findIndex(epic => epic.id === active.id);
      const newIndex = columnEpics.findIndex(epic => epic.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newEpics = [...columnEpics];
        const [removed] = newEpics.splice(oldIndex, 1);
        newEpics.splice(newIndex, 0, removed);
        onEpicsReorder?.(newEpics);
      }
    }
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          <SortableContext items={[...columnIds, ...epicIds]} strategy={rectSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.productId}
                column={column}
                epicPromptCounts={epicPromptCounts}
                onEpicClick={onEpicClick}
                onEpicEdit={onEpicEdit}
                onEpicDelete={onEpicDelete}
                onEpicDuplicate={onEpicDuplicate}
                onCreateEpic={() => onCreateEpic?.(column.productId)}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeEpic && (
            <div className="rotate-3 opacity-90">
              <EpicCard
                epic={activeEpic}
                promptCount={epicPromptCounts.get(activeEpic.id) || 0}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {columns.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Create products first to organize your epics in the kanban view.
          </p>
        </div>
      )}
    </div>
  );
}