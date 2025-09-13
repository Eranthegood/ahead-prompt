import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMixpanelContext } from '@/components/MixpanelProvider';
import type { Product } from '@/types';

export interface CreateProductData {
  name: string;
  description?: string;
  color?: string;
  order_index?: number;
}

export const useProducts = (workspaceId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { trackProductCreated } = useMixpanelContext();

  // Fetch products
  const fetchProducts = async () => {
    if (!workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erreur',
        description: 'Unable to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create product with optimistic update
  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    if (!workspaceId) return null;

    // 🚀 1. Optimistic update
    const optimisticProduct: Product = {
      id: `temp-${Date.now()}`,
      workspace_id: workspaceId,
      name: productData.name.trim(),
      description: productData.description?.trim() || null,
      color: productData.color || '#3B82F6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts(prev => [optimisticProduct, ...prev]);

    try {
      const payload = {
        workspace_id: workspaceId,
        name: productData.name.trim(),
        description: productData.description?.trim() || undefined,
        color: productData.color || '#3B82F6',
      };

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // Rollback on error
        setProducts(prev => prev.filter(p => p.id !== optimisticProduct.id));
        
        toast({
        title: 'Error',
        description: 'Unable to create product. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }

      // Replace with real data
      setProducts(prev => prev.map(p => p.id === optimisticProduct.id ? data : p));

      // Track product creation
      trackProductCreated({
        productId: data.id,
        color: data.color || undefined
      });

      toast({
        title: 'Product created',
        description: `"${productData.name}" has been created successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  };

  // Update product
  const updateProduct = async (productId: string, updates: Partial<CreateProductData>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ));

      toast({
        title: 'Product updated',
        description: 'Changes have been saved',
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Unable to update product',
        variant: 'destructive',
      });
    }
  };

  // Reorder products
  const reorderProducts = async (reorderedProducts: Product[]): Promise<void> => {
    if (!workspaceId) return;

    try {
      // Update order_index for each product using individual UPDATE queries
      for (let i = 0; i < reorderedProducts.length; i++) {
        const product = reorderedProducts[i];
        const { error } = await supabase
          .from('products')
          .update({ order_index: i })
          .eq('id', product.id);
        
        if (error) throw error;
      }

      // Update local state to reflect new order
      setProducts(reorderedProducts);
    } catch (error: any) {
      console.error('Error reordering products:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder products',
        variant: 'destructive',
      });
      // Refetch to restore correct order
      fetchProducts();
    }
  };

  // Delete product
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));

      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Unable to delete product',
        variant: 'destructive',
      });
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchProducts();

    if (!workspaceId) return;

    const channel = supabase
      .channel('products')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setProducts(prevProducts => {
          switch (eventType) {
            case 'INSERT':
              if (newRecord && !prevProducts.find(p => p.id === newRecord.id)) {
                return [newRecord as Product, ...prevProducts];
              }
              break;

            case 'UPDATE':
              return prevProducts.map(product =>
                product.id === newRecord.id ? newRecord as Product : product
              );

            case 'DELETE':
              return prevProducts.filter(p => p.id !== oldRecord.id);
          }
          return prevProducts;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    reorderProducts,
    deleteProduct,
    refetch: fetchProducts,
  };
};