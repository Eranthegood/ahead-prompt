import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { DraggableEpicCard } from "./DraggableEpicCard";
import { KanbanColumnData } from "./KanbanView";

interface KanbanColumnProps {
  column: KanbanColumnData;
  epicPromptCounts: Map<string, number>;
  onEpicClick?: (epic: any) => void;
  onEpicEdit?: (epic: any) => void;
  onEpicDelete?: (epicId: string) => void;
  onEpicDuplicate?: (epic: any) => void;
  onCreateEpic?: () => void;
}

export function KanbanColumn({
  column,
  epicPromptCounts,
  onEpicClick,
  onEpicEdit,
  onEpicDelete,
  onEpicDuplicate,
  onCreateEpic,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.productId,
  });

  const epicIds = column.epics.map(epic => epic.id);

  return (
    <Card 
      className={`
        w-80 flex-shrink-0 h-fit max-h-[calc(100vh-12rem)]
        ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}
        transition-all duration-200
      `}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: column.productColor }}
            />
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold truncate">{column.productName}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {column.epics.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div 
          ref={setNodeRef}
          className="space-y-3 min-h-[200px] max-h-[calc(100vh-20rem)] overflow-y-auto"
        >
          <SortableContext items={epicIds} strategy={verticalListSortingStrategy}>
            {column.epics.map((epic) => (
              <DraggableEpicCard
                key={epic.id}
                epic={epic}
                promptCount={epicPromptCounts.get(epic.id) || 0}
                onClick={() => onEpicClick?.(epic)}
                onEdit={onEpicEdit}
                onDelete={onEpicDelete}
                onDuplicate={onEpicDuplicate}
              />
            ))}
          </SortableContext>

          {/* Empty State for Column */}
          {column.epics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No epics yet</p>
            </div>
          )}
        </div>

        {/* Add Epic Button */}
        <div className="mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onCreateEpic}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Epic
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}