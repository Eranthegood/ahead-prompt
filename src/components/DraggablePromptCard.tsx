import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PromptCard } from "./PromptCard";
import { Prompt, PromptStatus, Product, Epic } from "@/types";

interface DraggablePromptCardProps {
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptClick: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onStatusChange: (prompt: Prompt, status: PromptStatus) => void;
  onPriorityChange: (prompt: Prompt, priority: number) => void;
  onDuplicate: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt) => void;
  onCopyGenerated: (prompt: Prompt) => void;
  isHovered?: boolean;
  onHover?: (promptId: string | null) => void;
}

export function DraggablePromptCard({
  prompt,
  onPromptClick,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onDuplicate,
  onDelete,
  onCopy,
  onCopyGenerated,
  isHovered,
  onHover,
}: DraggablePromptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: prompt.id,
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
      className="cursor-grab active:cursor-grabbing"
    >
      <PromptCard
        prompt={prompt}
        onPromptClick={onPromptClick}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onCopy={onCopy}
        onCopyGenerated={onCopyGenerated}
        isHovered={isHovered}
        onHover={onHover}
      />
    </div>
  );
}