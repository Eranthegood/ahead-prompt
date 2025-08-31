import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { Package, Plus, Palette } from 'lucide-react';
import type { Product, Workspace } from '@/types';

interface ProductSelectorProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductChange: (productId: string) => void;
  showAllOption?: boolean;
}

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#6B7280', label: 'Gris' },
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
        setIsCreateDialogOpen(false);
        setNewProductName('');
        setNewProductDescription('');
        setNewProductColor('#3B82F6');
      }
    } finally {
      setIsCreating(false);
    }
  };

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
                showAllOption ? 'Tous les produits' : 'Sélectionner un produit'
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tous les produits
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
            Nouveau
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Nouveau Produit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Nom du produit</Label>
              <Input
                id="product-name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ex: Application Mobile, Site Web..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description (optionnel)</Label>
              <Textarea
                id="product-description"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                placeholder="Décrivez brièvement ce produit..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Couleur</Label>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateProduct}
                disabled={!newProductName.trim() || isCreating}
              >
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};