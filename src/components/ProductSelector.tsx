import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProducts } from '@/hooks/useProducts';
import { Package, Plus, Palette, BookOpen } from 'lucide-react';
// Removed KnowledgeModal import - using event-based approach
import type { Product, Workspace } from '@/types';

interface ProductSelectorProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductChange: (productId: string) => void;
  showAllOption?: boolean;
}

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
];

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  workspace,
  selectedProductId,
  onProductChange,
  showAllOption = true,
}) => {
  const { products, createProduct } = useProducts(workspace.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductColor, setNewProductColor] = useState('#3B82F6');
  // Remove knowledge modal states - using event system instead
  const [createKnowledge, setCreateKnowledge] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;

    setIsCreating(true);
    try {
      const newProduct = await createProduct({
        name: newProductName.trim(),
        description: newProductDescription.trim() || undefined,
        color: newProductColor,
      });

      if (newProduct) {
        onProductChange(newProduct.id);
        setCreatedProduct(newProduct);
        
        if (createKnowledge) {
          setIsCreateDialogOpen(false);
          // Open Knowledge Box Modal through event system
          window.dispatchEvent(new CustomEvent('open-knowledge-dialog'));
        } else {
          handleCloseDialogs();
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setNewProductName('');
    setNewProductDescription('');
    setNewProductColor('#3B82F6');
    setCreateKnowledge(false);
    setCreatedProduct(null);
  };

  // Remove knowledge modal close handler - using event system

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProductId || 'all'} onValueChange={onProductChange}>
        <SelectTrigger className="w-64">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <SelectValue>
              {selectedProduct ? (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: selectedProduct.color }}
                  />
                  {selectedProduct.name}
                </div>
              ) : (
                showAllOption ? 'All products' : 'Select a product'
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                All products
              </div>
            </SelectItem>
          )}
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: product.color }}
                />
                <span>{product.name}</span>
                {product.description && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {product.description}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              New Product
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ex: Mobile App, Website..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description (optional)</Label>
              <Textarea
                id="product-description"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                placeholder="Briefly describe this product..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-2 mt-2">
                {PRODUCT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewProductColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newProductColor === color.value 
                        ? 'border-primary scale-110' 
                        : 'border-muted hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="color"
                    value={newProductColor}
                    onChange={(e) => setNewProductColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="create-knowledge"
                checked={createKnowledge}
                onCheckedChange={setCreateKnowledge}
              />
              <Label htmlFor="create-knowledge" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Add initial knowledge after creating product
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialogs}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProduct}
                disabled={!newProductName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : createKnowledge ? 'Create & Add Knowledge' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};