import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useToast } from '@/hooks/use-toast';
import type { PromptLibraryItem, CreatePromptLibraryItemData } from '@/types/prompt-library';

export function usePromptLibrary() {
  const [items, setItems] = useState<PromptLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const fetchItems = async () => {
    if (!user || !workspace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prompt_library' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data || []) as unknown as PromptLibraryItem[]);
    } catch (error: any) {
      console.error('Error fetching prompt library:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading prompt library',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: CreatePromptLibraryItemData): Promise<PromptLibraryItem | null> => {
    if (!user || !workspace) return null;

    try {
      const { data: newItem, error } = await supabase
        .from('prompt_library' as any)
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          title: data.title,
          body: data.body,
          ai_model: data.ai_model,
          tags: data.tags,
          category: data.category,
          is_favorite: false,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [newItem as unknown as PromptLibraryItem, ...prev]);
      toast({
        title: 'Prompt saved to library',
        description: `"${data.title}" has been added to your prompt library.`,
      });

      return newItem as unknown as PromptLibraryItem;
    } catch (error: any) {
      console.error('Error creating prompt library item:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving prompt',
        description: error.message,
      });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<PromptLibraryItem>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('prompt_library' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));

      toast({
        title: 'Prompt updated',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      console.error('Error updating prompt library item:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating prompt',
        description: error.message,
      });
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('prompt_library' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Prompt deleted',
        description: 'The prompt has been removed from your library.',
      });
    } catch (error: any) {
      console.error('Error deleting prompt library item:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting prompt',
        description: error.message,
      });
    }
  };

  const incrementUsage = async (id: string): Promise<void> => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('prompt_library' as any)
        .update({ usage_count: item.usage_count + 1 })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, usage_count: item.usage_count + 1 } : item
      ));
    } catch (error: any) {
      console.error('Error incrementing usage count:', error);
    }
  };

  const toggleFavorite = async (id: string): Promise<void> => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('prompt_library' as any)
        .update({ is_favorite: !item.is_favorite })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
      ));
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating favorite',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user, workspace]);

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    incrementUsage,
    toggleFavorite,
    refetch: fetchItems,
  };
}