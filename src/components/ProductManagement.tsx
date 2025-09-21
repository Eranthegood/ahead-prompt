import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSubscription, canCreateProduct } from '@/hooks/useSubscription';
import { UsageLimitIndicator } from '@/components/UsageLimitIndicator';
import { Package, Edit, Trash2, Plus, Palette, MoreVertical, BookOpen, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// Removed KnowledgeModal import - using event-based approach
import { useToast } from '@/hooks/use-toast';
import type { Product, Workspace } from '@/types';
import { useEventEmitter } from '@/hooks/useEventManager';

interface ProductManagementProps {
  workspace: Workspace;
  products: Product[];
  loading: boolean;
  createProduct: (data: { name: string; description?: string; color?: string; order_index?: number }) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<{ name: string; description?: string; color?: string; order_index?: number }>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
];

export const ProductManagement: React.FC<ProductManagementProps> = ({ 
  workspace, 
  products, 
  loading, 
  createProduct, 
  updateProduct, 
  deleteProduct 
}) => {
  const { tier } = useSubscription();
  const { toast } = useToast();
  const emit = useEventEmitter();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const canCreate = canCreateProduct(tier, products?.length || 0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  // Remove knowledge modal states - using event system instead
  const [createKnowledge, setCreateKnowledge] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
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
    setCreateKnowledge(false);
    setCreatedProduct(null);
  };

  // Remove knowledge modal close handler - using event system

  const handleOpenCreate = () => {
    if (!canCreate) {
      toast({
        title: "Product limit reached",
        description: `You've reached the maximum number of products for the ${tier} plan. Upgrade to create more products.`,
        variant: "destructive"
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    // Check limits again before creating (not editing)
    if (!editingProduct && !canCreate) {
      toast({
        title: "Product limit reached",
        description: `You've reached the maximum number of products for the ${tier} plan.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
        handleCloseDialog();
      } else {
        console.log('[ProductManagement] Creating product:', formData.name);
        console.log('[ProductManagement] Current products before create:', products.length);
        
        const newProduct = await createProduct({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
        });
        
        if (newProduct) {
          console.log('[ProductManagement] Product created successfully:', newProduct.id);
          console.log('[ProductManagement] Products now available:', products.length + 1);

          // Dispatch global event so other UIs can update instantly (local echo)
          emit('product:created', { product: newProduct });
          
          if (createKnowledge) {
            setCreatedProduct(newProduct);
            setIsCreateDialogOpen(false);
            // Open Knowledge Box Modal through event system
            emit('open-knowledge-dialog');
          } else {
            handleCloseDialog();
          }
        } else {
          console.error('[ProductManagement] Product creation returned null');
          toast({
            title: 'Creation failed',
            description: 'Failed to create product. Please check your connection and try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('[ProductManagement] Error in handleSubmit:', error);
      
      // Handle specific authentication errors
      if (error?.message?.includes('session') || error?.message?.includes('auth')) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in again to continue.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'An unexpected error occurred while creating the product.',
          variant: 'destructive',
        });
      }
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
        <Button onClick={handleOpenCreate} disabled={!canCreate}>
          {canCreate ? (
            <Plus className="w-4 h-4 mr-2" />
          ) : (
            <Lock className="w-4 h-4 mr-2" />
          )}
          New Product
        </Button>
      </div>

      <UsageLimitIndicator 
        type="products" 
        currentCount={products?.length || 0}
        className="mb-6"
      />

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
              <Button onClick={handleOpenCreate} disabled={!canCreate}>
                {canCreate ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
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

            {/* Knowledge creation option - only show when creating new product */}
            {!editingProduct && (
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
            )}

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
                  : (editingProduct ? 'Update' : createKnowledge ? 'Create & Add Knowledge' : 'Create')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};