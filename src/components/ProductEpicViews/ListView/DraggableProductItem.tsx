import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductItem } from "./ProductItem";
import { Product } from "@/types";

interface DraggableProductItemProps {
  product: Product;
  epicCount?: number;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onDuplicate?: (product: Product) => void;
  isDragDisabled?: boolean;
}

export function DraggableProductItem({
  product,
  epicCount,
  promptCount,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  isDragDisabled = false,
}: DraggableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: product.id,
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
      <ProductItem
        product={product}
        epicCount={epicCount}
        promptCount={promptCount}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
}