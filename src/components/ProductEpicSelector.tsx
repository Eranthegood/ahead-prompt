import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Hash, Plus, X, TrendingUp } from 'lucide-react';
import { usePromptMetrics } from '@/hooks/usePromptMetrics';
import type { Product, Epic } from '@/types';

interface ProductEpicSelectorProps {
  products: Product[];
  epics: Epic[];
  selectedProductId?: string | null;
  selectedEpicId?: string | null;
  onProductChange: (productId: string | null) => void;
  onEpicChange: (epicId: string | null) => void;
  showCreateButtons?: boolean;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  className?: string;
}

export const ProductEpicSelector: React.FC<ProductEpicSelectorProps> = ({
  products = [],
  epics = [],
  selectedProductId,
  selectedEpicId,
  onProductChange,
  onEpicChange,
  showCreateButtons = false,
  onCreateProduct,
  onCreateEpic,
  className = "",
}) => {
  const [mode, setMode] = useState<'none' | 'product' | 'epic' | 'both'>('none');
  const { trackAllocation } = usePromptMetrics();

  // Filter epics based on selected product
  const filteredEpics = useMemo(() => {
    return selectedProductId 
      ? epics.filter(epic => epic.product_id === selectedProductId)
      : epics;
  }, [epics, selectedProductId]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedEpic = epics.find(e => e.id === selectedEpicId);

  // Reset selections when mode changes
  const handleModeChange = (newMode: typeof mode) => {
    if (newMode !== mode) {
      // Clear selections when switching modes
      if (newMode === 'none') {
        onProductChange(null);
        onEpicChange(null);
      } else if (newMode === 'product') {      
        onEpicChange(null);
      } else if (newMode === 'epic') {
        onProductChange(null);
      }
      setMode(newMode);
    }
  };

  // Auto-detect mode based on selections
  React.useEffect(() => {
    if (selectedProductId && selectedEpicId) {
      setMode('both');
    } else if (selectedProductId) {
      setMode('product');
    } else if (selectedEpicId) {
      setMode('epic');
    } else {
      setMode('none');
    }
  }, [selectedProductId, selectedEpicId]);

  return (
    <Card className={`border-dashed border-2 hover:border-primary/50 transition-colors ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Allocation du prompt
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Type d'allocation
          </label>
          <Select value={mode} onValueChange={(value: typeof mode) => handleModeChange(value)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Choisir le type d'allocation..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="none">
                <span>Aucune allocation</span>
              </SelectItem>
              <SelectItem value="product" disabled={products.length === 0}>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  <span>Produit uniquement</span>
                </div>
              </SelectItem>
              <SelectItem value="epic" disabled={epics.length === 0}>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <span>Épique uniquement</span>
                </div>
              </SelectItem>
              <SelectItem value="both" disabled={products.length === 0}>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 mr-1" />
                  <Hash className="h-3 w-3" />
                  <span>Produit + Épique</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Selection */}
        {(mode === 'product' || mode === 'both') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Produit
              </label>
              {showCreateButtons && onCreateProduct && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateProduct}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nouveau
                </Button>
              )}
            </div>
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
                <SelectValue placeholder="Sélectionner un produit..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: product.color }}
                      />
                      <span>{product.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Epic Selection */}
        {(mode === 'epic' || mode === 'both') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Épique
                {mode === 'both' && selectedProduct && (
                  <span className="text-xs opacity-60 ml-1">
                    (dans {selectedProduct.name})
                  </span>
                )}
              </label>
              {showCreateButtons && onCreateEpic && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateEpic}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nouvelle
                </Button>
              )}
            </div>
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
                <SelectValue placeholder="Sélectionner une épique..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {filteredEpics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: epic.color }}
                      />
                      <span>{epic.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {mode === 'both' && selectedProductId && filteredEpics.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Aucune épique disponible pour ce produit
              </p>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {mode !== 'none' && (selectedProduct || selectedEpic) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {selectedProduct && (
              <Badge variant="secondary" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                {selectedProduct.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onProductChange(null)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedEpic && (
              <Badge variant="outline" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {selectedEpic.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEpicChange(null)}
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};