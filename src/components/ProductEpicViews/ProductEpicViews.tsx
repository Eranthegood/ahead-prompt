import React, { useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useProducts } from "@/hooks/useProducts";
import { useEpics } from "@/hooks/useEpics";
import { usePrompts } from "@/hooks/usePrompts";
import { useViewManager, ViewManagerConfig } from "@/hooks/useViewManager";
import { ViewToolbar } from "./ViewToolbar";
import { ListView } from "./ListView/ListView";
import { KanbanView, KanbanColumnData } from "./KanbanView/KanbanView";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Zap } from "lucide-react";
import { toast } from "sonner";
import { Product, Epic } from "@/types";

interface ProductEpicViewsProps {
  onProductCreate?: () => void;
  onEpicCreate?: (productId?: string) => void;
  onProductEdit?: (product: Product) => void;
  onEpicEdit?: (epic: Epic) => void;
  config?: Partial<ViewManagerConfig>;
}

export function ProductEpicViews({
  onProductCreate,
  onEpicCreate,
  onProductEdit,
  onEpicEdit,
  config = {},
}: ProductEpicViewsProps) {
  const { workspace, loading: workspaceLoading } = useWorkspace();
  const { products, loading: productsLoading, deleteProduct } = useProducts(workspace?.id);
  const { epics, loading: epicsLoading, deleteEpic, updateEpic } = useEpics(workspace?.id);
  const { prompts, loading: promptsLoading } = usePrompts(workspace?.id);

  const viewConfig: ViewManagerConfig = {
    enabledViews: ['list', 'kanban'],
    defaultView: 'list',
    defaultFilter: 'all',
    ...config,
  };

  const {
    viewState,
    setActiveView,
    setActiveFilter,
    setSearchQuery,
    setSelectedProductId,
    filteredProducts,
    filteredEpics,
    epicsByProduct,
    stats,
  } = useViewManager(products, epics, viewConfig);

  // Calculate counts for display
  const { productEpicCounts, productPromptCounts, epicPromptCounts } = useMemo(() => {
    const productEpicMap = new Map<string, number>();
    const productPromptMap = new Map<string, number>();
    const epicPromptMap = new Map<string, number>();

    // Count epics per product
    epics.forEach(epic => {
      if (epic.product_id) {
        productEpicMap.set(epic.product_id, (productEpicMap.get(epic.product_id) || 0) + 1);
      }
    });

    // Count prompts per product and epic
    prompts.forEach(prompt => {
      if (prompt.product_id) {
        productPromptMap.set(prompt.product_id, (productPromptMap.get(prompt.product_id) || 0) + 1);
      }
      if (prompt.epic_id) {
        epicPromptMap.set(prompt.epic_id, (epicPromptMap.get(prompt.epic_id) || 0) + 1);
      }
    });

    return {
      productEpicCounts: productEpicMap,
      productPromptCounts: productPromptMap,
      epicPromptCounts: epicPromptMap,
    };
  }, [epics, prompts]);

  // Prepare kanban columns
  const kanbanColumns: KanbanColumnData[] = useMemo(() => {
    return epicsByProduct.map(({ productId, productName, productColor, epics }) => ({
      productId,
      productName,
      productColor,
      epics,
    }));
  }, [epicsByProduct]);

  // Event handlers
  const handleProductClick = (product: Product) => {
    // Navigate to product page or open details
    window.location.href = `/product/${product.id}`;
  };

  const handleEpicClick = (epic: Epic) => {
    // Could open epic details modal or navigate
    console.log('Epic clicked:', epic);
  };

  const handleProductDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      await deleteProduct(productId);
    }
  };

  const handleEpicDelete = async (epicId: string) => {
    if (window.confirm('Are you sure you want to delete this epic? This action cannot be undone.')) {
      await deleteEpic(epicId);
    }
  };

  const handleProductDuplicate = (product: Product) => {
    // Implement product duplication
    console.log('Duplicate product:', product);
    toast.success('Product duplication feature coming soon!');
  };

  const handleEpicDuplicate = (epic: Epic) => {
    // Implement epic duplication
    console.log('Duplicate epic:', epic);
    toast.success('Epic duplication feature coming soon!');
  };

  const handleEpicProductChange = async (epicId: string, newProductId: string) => {
    await updateEpic(epicId, { product_id: newProductId });
    toast.success('Epic moved to new product');
  };

  const handleReorder = (items: any[]) => {
    // Implement reordering logic if needed
    console.log('Reorder items:', items);
  };

  if (workspaceLoading || productsLoading || epicsLoading || promptsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Workspace not found</h3>
        <p className="text-muted-foreground">Unable to load workspace data.</p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ViewToolbar
        viewState={viewState}
        products={products}
        stats={stats}
        enabledViews={viewConfig.enabledViews}
        onViewChange={setActiveView}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onProductSelect={setSelectedProductId}
        onCreateProduct={onProductCreate}
        onCreateEpic={onEpicCreate}
      />

      <div className="flex-1 overflow-hidden">
        {viewState.activeView === 'list' && (
          <ListView
            products={filteredProducts}
            epics={filteredEpics}
            productEpicCounts={productEpicCounts}
            productPromptCounts={productPromptCounts}
            epicPromptCounts={epicPromptCounts}
            dragEnabled={true}
            onProductClick={handleProductClick}
            onEpicClick={handleEpicClick}
            onProductEdit={onProductEdit}
            onEpicEdit={onEpicEdit}
            onProductDelete={handleProductDelete}
            onEpicDelete={handleEpicDelete}
            onProductDuplicate={handleProductDuplicate}
            onEpicDuplicate={handleEpicDuplicate}
            onProductsReorder={handleReorder}
            onEpicsReorder={handleReorder}
          />
        )}

        {viewState.activeView === 'kanban' && (
          <KanbanView
            columns={kanbanColumns}
            epicPromptCounts={epicPromptCounts}
            onEpicClick={handleEpicClick}
            onEpicEdit={onEpicEdit}
            onEpicDelete={handleEpicDelete}
            onEpicDuplicate={handleEpicDuplicate}
            onEpicProductChange={handleEpicProductChange}
            onEpicsReorder={handleReorder}
            onCreateEpic={onEpicCreate}
          />
        )}
      </div>
    </div>
  );
}