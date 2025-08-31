import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types';

interface CreateProductData {
  name: string;
  description?: string;
  color?: string;
}

export const useProducts = (workspaceId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products
  const fetchProducts = async () => {
    if (!workspaceId) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits',
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
          title: 'Erreur',
          description: 'Impossible de créer le produit. Veuillez réessayer.',
          variant: 'destructive',
        });
        throw error;
      }

      // Replace with real data
      setProducts(prev => prev.map(p => p.id === optimisticProduct.id ? data : p));

      toast({
        title: 'Produit créé',
        description: `"${productData.name}" a été créé avec succès`,
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
        title: 'Produit mis à jour',
        description: 'Les modifications ont été sauvegardées',
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le produit',
        variant: 'destructive',
      });
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
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit',
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
    deleteProduct,
    refetch: fetchProducts,
  };
};