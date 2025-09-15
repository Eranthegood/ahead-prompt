import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useToast } from '@/hooks/use-toast';
import { useWorkspacePremiumAccess } from '@/hooks/useWorkspacePremiumAccess';
import { PLAN_LIMITS } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { ToastAction } from '@/components/ui/toast';
import type { PromptLibraryItem, CreatePromptLibraryItemData } from '@/types/prompt-library';

export function usePromptLibrary() {
  const [userItems, setUserItems] = useState<PromptLibraryItem[]>([]);
  const [systemItems, setSystemItems] = useState<PromptLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const { hasPremiumAccess } = useWorkspacePremiumAccess();
  const navigate = useNavigate();

  // Combine user items with system prompts
  const items = useMemo(() => {
    return [...systemItems, ...userItems];
  }, [systemItems, userItems]);

  const fetchItems = async () => {
    if (!user || !workspace) return;

    setLoading(true);
    try {
      // Fetch user-specific prompts
      const { data: userData, error: userError } = await supabase
        .from('prompt_library' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Fetch system prompts
      const { data: systemData, error: systemError } = await supabase
        .from('prompt_library' as any)
        .select('*')
        .eq('is_system_prompt', true)
        .order('created_at', { ascending: false });

      if (systemError) throw systemError;

      setUserItems((userData || []) as unknown as PromptLibraryItem[]);
      setSystemItems((systemData || []) as unknown as PromptLibraryItem[]);
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

    // ⚠️ Check subscription limits before creating
    const maxItems = hasPremiumAccess ? PLAN_LIMITS.pro.promptLibraryItems : PLAN_LIMITS.free.promptLibraryItems;
    const canCreate = maxItems === -1 || userItems.length < maxItems;
    if (!canCreate) {
      const planType = hasPremiumAccess ? 'premium' : 'free';
      console.error('[usePromptLibrary] Prompt library item creation blocked: limit reached for plan', planType);
      toast({
        title: "Prompt library limit reached",
        description: `You've reached the maximum number of prompt library items for the ${planType} plan.`,
        variant: "destructive",
        action: !hasPremiumAccess ? (
          <ToastAction 
            altText="Upgrade plan"
            onClick={() => navigate('/pricing')}
          >
            Upgrade
          </ToastAction>
        ) : undefined
      });
      throw new Error(`You've reached the maximum number of prompt library items for the ${planType} plan. ${!hasPremiumAccess ? 'Upgrade to create more items.' : ''}`);
    }

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

      setUserItems(prev => [newItem as unknown as PromptLibraryItem, ...prev]);
      toast({
        title: 'Prompt saved to library',
        description: `"${data.title}" has been added to your prompt library.`,
      });

      return newItem as unknown as PromptLibraryItem;
    } catch (error: any) {
      console.error('Error creating prompt library item:', error);
      
      // Handle database-level limit enforcement
      if (error.message?.includes('Prompt library limit reached')) {
        toast({
          title: "Prompt library limit reached",
          description: error.message,
          variant: "destructive",
          action: (
            <ToastAction 
              altText="Upgrade plan"
              onClick={() => navigate('/pricing')}
            >
              Upgrade
            </ToastAction>
          )
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error saving prompt',
          description: error.message,
        });
      }
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<PromptLibraryItem>): Promise<void> => {
    // Check if this is a system prompt
    const isSystemPrompt = systemItems.some(item => item.id === id);
    
    if (isSystemPrompt) {
      toast({
        variant: 'destructive',
        title: 'Cannot edit system prompts',
        description: 'System prompts cannot be modified. Copy it to your library to customize.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prompt_library' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setUserItems(prev => prev.map(item => 
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
    // Check if this is a system prompt
    const isSystemPrompt = systemItems.some(item => item.id === id);
    
    if (isSystemPrompt) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete system prompts',
        description: 'System prompts are built-in and cannot be deleted.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prompt_library' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserItems(prev => prev.filter(item => item.id !== id));
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
    // Don't track usage for system prompts in database
    const isSystemPrompt = systemItems.some(item => item.id === id);
    
    if (isSystemPrompt) {
      return;
    }

    try {
      const item = userItems.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('prompt_library' as any)
        .update({ usage_count: item.usage_count + 1 })
        .eq('id', id);

      if (error) throw error;

      setUserItems(prev => prev.map(item => 
        item.id === id ? { ...item, usage_count: item.usage_count + 1 } : item
      ));
    } catch (error: any) {
      console.error('Error incrementing usage count:', error);
    }
  };

  const toggleFavorite = async (id: string): Promise<void> => {
    // Don't allow favoriting system prompts
    const isSystemPrompt = systemItems.some(item => item.id === id);
    
    if (isSystemPrompt) {
      toast({
        variant: 'destructive',
        title: 'Cannot favorite system prompts',
        description: 'Copy the system prompt to your library to favorite it.',
      });
      return;
    }

    try {
      const item = userItems.find(i => i.id === id);
      if (!item) return;

      const { error } = await supabase
        .from('prompt_library' as any)
        .update({ is_favorite: !item.is_favorite })
        .eq('id', id);

      if (error) throw error;

      setUserItems(prev => prev.map(item => 
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

  // Copy system prompt to user library
  const copySystemPrompt = async (systemPrompt: PromptLibraryItem): Promise<void> => {
    const data: CreatePromptLibraryItemData = {
      title: `${systemPrompt.title} (Copy)`,
      body: systemPrompt.body,
      ai_model: systemPrompt.ai_model,
      tags: systemPrompt.tags,
      category: systemPrompt.category,
    };

    await createItem(data);
  };

  useEffect(() => {
    fetchItems();
  }, [user, workspace]);

  return {
    items,
    userItems, // Exposer les userItems pour les vérifications de limites
    loading,
    createItem,
    updateItem,
    deleteItem,
    incrementUsage,
    toggleFavorite,
    copySystemPrompt,
    refetch: fetchItems,
  };
}