import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EpicCard } from "./EpicCard";
import { Epic } from "@/types";

interface DraggableEpicCardProps {
  epic: Epic;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (epic: Epic) => void;
  onDelete?: (epicId: string) => void;
  onDuplicate?: (epic: Epic) => void;
}

export function DraggableEpicCard({
  epic,
  promptCount,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: DraggableEpicCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: epic.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <EpicCard
        epic={epic}
        promptCount={promptCount}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        isDragging={isDragging}
      />
    </div>
  );
}