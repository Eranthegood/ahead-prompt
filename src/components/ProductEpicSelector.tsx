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

  // Filter epics based on selected product
  const filteredEpics = useMemo(() => {
    return selectedProductId 
      ? epics.filter(epic => epic.product_id === selectedProductId)
      : epics;
  }, [epics, selectedProductId]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Product Selector */}
      {products.length > 0 && (
        <div>
          <Select 
            value={selectedProductId || ''} 
            onValueChange={(value) => {
              const productId = value || null;
              onProductChange(productId);
              if (productId) {
                trackAllocation('product', { productId, productName: products.find(p => p.id === productId)?.name });
              }
            }}
          >
            <SelectTrigger className="h-9">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sélectionner un produit (optionnel)" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="">
                <span className="text-muted-foreground">Aucun produit</span>
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
      )}
      
      {/* Epic Selector */}
      {filteredEpics.length > 0 && (
        <div>
          <Select 
            value={selectedEpicId || ''} 
            onValueChange={(value) => {
              const epicId = value || null;
              onEpicChange(epicId);
              if (epicId) {
                trackAllocation('epic', { epicId, epicName: epics.find(e => e.id === epicId)?.name });
              }
            }}
          >
            <SelectTrigger className="h-9">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sélectionner une épique (optionnel)" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="">
                <span className="text-muted-foreground">Aucune épique</span>
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
              Aucune épique disponible pour ce produit
            </p>
          )}
        </div>
      )}
    </div>
  );
};