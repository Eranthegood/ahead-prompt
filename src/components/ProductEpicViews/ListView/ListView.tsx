import React from "react";
import { 
  DndContext, 
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { DraggableProductItem } from "./DraggableProductItem";
import { DraggableEpicItem } from "./DraggableEpicItem";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Product, Epic } from "@/types";
import { Package, Zap } from "lucide-react";

interface ListViewProps {
  products: Product[];
  epics: Epic[];
  productEpicCounts: Map<string, number>;
  productPromptCounts: Map<string, number>;
  epicPromptCounts: Map<string, number>;
  dragEnabled?: boolean;
  onProductClick?: (product: Product) => void;
  onEpicClick?: (epic: Epic) => void;
  onProductEdit?: (product: Product) => void;
  onEpicEdit?: (epic: Epic) => void;
  onProductDelete?: (productId: string) => void;
  onEpicDelete?: (epicId: string) => void;
  onProductDuplicate?: (product: Product) => void;
  onEpicDuplicate?: (epic: Epic) => void;
  onProductsReorder?: (products: Product[]) => void;
  onEpicsReorder?: (epics: Epic[]) => void;
}

export function ListView({
  products,
  epics,
  productEpicCounts,
  productPromptCounts,
  epicPromptCounts,
  dragEnabled = true,
  onProductClick,
  onEpicClick,
  onProductEdit,
  onEpicEdit,
  onProductDelete,
  onEpicDelete,
  onProductDuplicate,
  onEpicDuplicate,
  onProductsReorder,
  onEpicsReorder,
}: ListViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Check if we're dragging a product
    const draggedProduct = products.find(p => p.id === active.id);
    if (draggedProduct) {
      const oldIndex = products.findIndex(p => p.id === active.id);
      const newIndex = products.findIndex(p => p.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newProducts = [...products];
        const [removed] = newProducts.splice(oldIndex, 1);
        newProducts.splice(newIndex, 0, removed);
        onProductsReorder?.(newProducts);
      }
      return;
    }

    // Check if we're dragging an epic
    const draggedEpic = epics.find(e => e.id === active.id);
    if (draggedEpic) {
      const oldIndex = epics.findIndex(e => e.id === active.id);
      const newIndex = epics.findIndex(e => e.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newEpics = [...epics];
        const [removed] = newEpics.splice(oldIndex, 1);
        newEpics.splice(newIndex, 0, removed);
        onEpicsReorder?.(newEpics);
      }
    }
  };

  const productIds = products.map(p => p.id);
  const epicIds = epics.map(e => e.id);
  const allIds = [...productIds, ...epicIds];

  return (
    <div className="space-y-6 p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
          {/* Products Section */}
          {products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Products</h2>
                <Badge variant="secondary" className="text-xs">
                  {products.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {products.map((product) => (
                  <DraggableProductItem
                    key={product.id}
                    product={product}
                    epicCount={productEpicCounts.get(product.id) || 0}
                    promptCount={productPromptCounts.get(product.id) || 0}
                    onClick={() => onProductClick?.(product)}
                    onEdit={onProductEdit}
                    onDelete={onProductDelete}
                    onDuplicate={onProductDuplicate}
                    isDragDisabled={!dragEnabled}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          {products.length > 0 && epics.length > 0 && (
            <Separator className="my-8" />
          )}

          {/* Epics Section */}
          {epics.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Epics</h2>
                <Badge variant="secondary" className="text-xs">
                  {epics.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {epics.map((epic) => {
                  const product = products.find(p => p.id === epic.product_id);
                  return (
                    <DraggableEpicItem
                      key={epic.id}
                      epic={epic}
                      product={product}
                      promptCount={epicPromptCounts.get(epic.id) || 0}
                      onClick={() => onEpicClick?.(epic)}
                      onEdit={onEpicEdit}
                      onDelete={onEpicDelete}
                      onDuplicate={onEpicDuplicate}
                      isDragDisabled={!dragEnabled}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {products.length === 0 && epics.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first product or epic to get started.
          </p>
        </div>
      )}
    </div>
  );
}