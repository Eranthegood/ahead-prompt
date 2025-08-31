import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Prompt, PromptStatus } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  status?: PromptStatus;
  priority?: number;
  epic_id?: string;
}

export const usePrompts = (workspaceId?: string, selectedProductId?: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch prompts
  const fetchPrompts = async () => {
    if (!workspaceId) return;
    
    try {
      let query = supabase
        .from('prompts')
        .select(`
          *,
          epic:epics(id, name, color, product_id)
        `)
        .eq('workspace_id', workspaceId);

      // Filter by product if selectedProductId is specified
      if (selectedProductId) {
        query = query.eq('epic.product_id', selectedProductId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts((data || []).map(p => ({ ...p, status: p.status as PromptStatus })));
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create prompt with optimistic update
  const createPrompt = async (promptData: CreatePromptData): Promise<Prompt | null> => {
    if (!workspaceId) return null;

    // 🚀 1. Optimistic update - immediate UI response
    const optimisticPrompt: Prompt = {
      id: `temp-${Date.now()}`,
      workspace_id: workspaceId,
      title: promptData.title.trim(),
      description: promptData.description?.trim() || null,
      status: promptData.status || 'todo',
      priority: promptData.priority || 3,
      epic_id: promptData.epic_id || null,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add immediately to UI
    setPrompts(prev => [optimisticPrompt, ...prev]);

    try {
      // 📡 2. Send to database
      const payload = {
        workspace_id: workspaceId,
        title: promptData.title.trim(),
        description: promptData.description?.trim() || undefined,
        status: promptData.status || 'todo',
        priority: promptData.priority || 3,
        epic_id: promptData.epic_id || undefined,
        order_index: 0,
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // 🔴 Rollback on error
        setPrompts(prev => prev.filter(p => p.id !== optimisticPrompt.id));
        
        // Contextual error messages
        if (error.message?.includes('epic_id')) {
          toast({
            title: 'Erreur',
            description: 'L\'epic sélectionné n\'existe pas.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de créer le prompt. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        throw error;
      }

      // ✅ 3. Replace with real data
      const realPrompt = { ...data, status: data.status as PromptStatus };
      setPrompts(prev => prev.map(p => p.id === optimisticPrompt.id ? realPrompt : p));

      // 🎉 Success notification
      toast({
        title: 'Prompt créé',
        description: `"${promptData.title}" a été créé avec succès`,
      });

      return realPrompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      return null;
    }
  };

  // Update prompt status with optimistic update
  const updatePromptStatus = async (promptId: string, status: PromptStatus): Promise<void> => {
    // Optimistic update
    setPrompts(prev => prev.map(p => 
      p.id === promptId 
        ? { ...p, status, updated_at: new Date().toISOString() }
        : p
    ));

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ status })
        .eq('id', promptId);

      if (error) {
        // Rollback on error
        await fetchPrompts();
        throw error;
      }
    } catch (error) {
      console.error('Error updating prompt status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      });
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchPrompts();

    if (!workspaceId) return;

    const channel = supabase
      .channel('prompts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prompts',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setPrompts(prevPrompts => {
          switch (eventType) {
            case 'INSERT':
              // Add new prompt if not already present (avoid duplicates from optimistic updates)
              if (newRecord && !prevPrompts.find(p => p.id === newRecord.id)) {
                return [newRecord as Prompt, ...prevPrompts];
              }
              break;

            case 'UPDATE':
              // Update existing prompt
              return prevPrompts.map(prompt => {
                if (prompt.id === newRecord.id) {
                  return { ...prompt, ...newRecord, status: newRecord.status as PromptStatus };
                }
                return prompt;
              });

            case 'DELETE':
              // Remove deleted prompt
              return prevPrompts.filter(p => p.id !== oldRecord.id);
          }
          return prevPrompts;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, selectedProductId]);

  return {
    prompts,
    loading,
    createPrompt,
    updatePromptStatus,
    refetch: fetchPrompts,
  };
};