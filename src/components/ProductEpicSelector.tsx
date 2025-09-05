import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Hash } from 'lucide-react';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import type { Product, Epic } from '@/types';

interface ProductEpicSelectorProps {
  products: Product[];
  epics: Epic[];
  selectedProductId?: string | null;
  selectedEpicId?: string | null;
  onProductChange: (productId: string | null) => void;
  onEpicChange: (epicId: string | null) => void;
  className?: string;
}

export const ProductEpicSelector: React.FC<ProductEpicSelectorProps> = ({
  products = [],
  epics = [],
  selectedProductId,
  selectedEpicId,
  onProductChange,
  onEpicChange,
  className = "",
}) => {
  const { trackAllocation } = usePromptMetrics();
  
  // Debug logging
  console.info('[ProductEpicSelector] Rendering with data:', {
    productsCount: products.length,
    epicsCount: epics.length,
    selectedProductId,
    selectedEpicId,
    products: products.map(p => ({ id: p.id, name: p.name })),
    epics: epics.map(e => ({ id: e.id, name: e.name, product_id: e.product_id }))
  });

  // Filter epics based on selected product
  const filteredEpics = useMemo(() => {
    return selectedProductId 
      ? epics.filter(epic => epic.product_id === selectedProductId)
      : epics;
  }, [epics, selectedProductId]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Product Selector */}
      {products.length > 0 ? (
        <div>
          <Select 
            value={selectedProductId || 'none'} 
            onValueChange={(value) => {
              const productId = value === 'none' ? null : value;
              onProductChange(productId);
              if (productId) {
                trackAllocation('product', { productId, productName: products.find(p => p.id === productId)?.name });
              }
            }}
          >
            <SelectTrigger className="h-9">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select a product (optional)" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="none">
                <span className="text-muted-foreground">No product</span>
              </SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: product.color }}
                    />
                    {product.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="p-3 border rounded-md bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="text-sm font-medium">Product Organization</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create products from the sidebar to organize your prompts
          </p>
        </div>
      )}
      
      {/* Epic Selector */}
      {products.length > 0 && (
        <>
          {filteredEpics.length > 0 ? (
            <div>
              <Select 
                value={selectedEpicId || 'none'} 
                onValueChange={(value) => {
                  const epicId = value === 'none' ? null : value;
                  onEpicChange(epicId);
                  if (epicId) {
                    trackAllocation('epic', { epicId, epicName: epics.find(e => e.id === epicId)?.name });
                  }
                }}
              >
                <SelectTrigger className="h-9">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select an epic (optional)" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No epic</span>
                  </SelectItem>
                  {filteredEpics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: epic.color }}
                        />
                        {epic.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProductId && filteredEpics.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  No epics available for this product
                </p>
              )}
            </div>
          ) : selectedProductId ? (
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-medium">Epic Organization</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Create epics within this product to further organize your prompts
              </p>
            </div>
          ) : (
            <div className="p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-sm font-medium">Epic Organization</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select a product first to see available epics
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};