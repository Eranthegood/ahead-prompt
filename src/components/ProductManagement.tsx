import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useProducts } from '@/hooks/useProducts';
import { Package, Edit, Trash2, Plus, Palette, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Product, Workspace } from '@/types';

interface ProductManagementProps {
  workspace: Workspace;
}

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
];

export const ProductManagement: React.FC<ProductManagementProps> = ({ workspace }) => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts(workspace.id);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      color: product.color,
    });
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
      } else {
        await createProduct({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
      }
      handleCloseDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? All associated epics will also be deleted.')) {
      await deleteProduct(productId);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Product Management</h2>
          <p className="text-muted-foreground">
            Organize your prompts by product for better structure
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: product.color }}
                />
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created on {new Date(product.created_at).toLocaleDateString()}</span>
                <Badge variant="outline">
                  <Package className="w-3 h-3 mr-1" />
                  Product
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No products</h3>
              <p className="text-muted-foreground mb-4">
                Create your first product to organize your prompts
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={isCreateDialogOpen || !!editingProduct} 
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingProduct ? 'Edit product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Mobile App, Website..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description (optional)</Label>
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value 
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
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim() || isSubmitting}
              >
                {isSubmitting 
                  ? (editingProduct ? 'Updating...' : 'Creating...')
                  : (editingProduct ? 'Update' : 'Create')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};