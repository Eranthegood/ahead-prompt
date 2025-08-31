import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EpicItem } from "./EpicItem";
import { Epic, Product } from "@/types";

interface DraggableEpicItemProps {
  epic: Epic;
  product?: Product;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (epic: Epic) => void;
  onDelete?: (epicId: string) => void;
  onDuplicate?: (epic: Epic) => void;
  isDragDisabled?: boolean;
}

export function DraggableEpicItem({
  epic,
  product,
  promptCount,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  isDragDisabled = false,
}: DraggableEpicItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: epic.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        ${isDragging ? 'z-50' : ''}
        ${isDragDisabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <EpicItem
        epic={epic}
        product={product}
        promptCount={promptCount}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}