import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { Package, Edit, Trash2, Plus, MoreVertical, BookOpen, DollarSign, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { KnowledgeModal } from '@/components/KnowledgeModal';
import { ModernProductCreator } from '@/components/ModernProductCreator';
import type { Product, Workspace } from '@/types';

interface ProductManagementProps {
  workspace: Workspace;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ workspace }) => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts(workspace.id);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setIsCreateDialogOpen(false);
  };

  const handleKnowledgeModalClose = () => {
    setIsKnowledgeModalOpen(false);
    setCreatedProduct(null);
    handleCloseDialog();
  };

  const handleSave = async (productData: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      handleCloseDialog();
      return editingProduct;
    } else {
      const newProduct = await createProduct(productData);
      handleCloseDialog();
      return newProduct;
    }
  };

  const handleCreateKnowledge = (product: Product) => {
    setCreatedProduct(product);
    setIsKnowledgeModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? All associated epics will also be deleted.')) {
      await deleteProduct(productId);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: product.color }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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

            <CardContent className="space-y-3">
              {/* Price and Inventory */}
              {(product.price !== null || product.inventory_count !== null) && (
                <div className="flex items-center gap-4 text-sm">
                  {product.price !== null && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{formatPrice(product.price)}</span>
                    </div>
                  )}
                  {product.inventory_count !== null && (
                    <div className="flex items-center gap-1">
                      <Archive className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{product.inventory_count} in stock</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Created {new Date(product.created_at).toLocaleDateString()}</span>
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

      {/* Modern Product Creator */}
      <ModernProductCreator
        isOpen={isCreateDialogOpen || !!editingProduct}
        onClose={handleCloseDialog}
        onSave={handleSave}
        workspace={workspace}
        editingProduct={editingProduct}
        onCreateKnowledge={handleCreateKnowledge}
      />

      {/* Knowledge Modal */}
      {createdProduct && (
        <KnowledgeModal
          open={isKnowledgeModalOpen}
          onOpenChange={setIsKnowledgeModalOpen}
          onClose={handleKnowledgeModalClose}
          workspace={workspace}
          product={createdProduct}
        />
      )}
    </div>
  );
};