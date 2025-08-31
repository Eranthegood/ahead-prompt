import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Epic } from '@/types';

interface CreateEpicData {
  name: string;
  description?: string;
  color?: string;
  product_id?: string;
}

export const useEpics = (workspaceId?: string, selectedProductId?: string) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch epics
  const fetchEpics = async () => {
    if (!workspaceId) return;
    
    try {
      let query = supabase
        .from('epics')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Filter by product if selectedProductId is specified
      if (selectedProductId) {
        query = query.eq('product_id', selectedProductId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEpics(data || []);
    } catch (error: any) {
      console.error('Error fetching epics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les épics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create epic with optimistic update
  const createEpic = async (epicData: CreateEpicData): Promise<Epic | null> => {
    if (!workspaceId) return null;

    // 🚀 1. Optimistic update - immediate UI response
    const optimisticEpic: Epic = {
      id: `temp-${Date.now()}`,
      workspace_id: workspaceId,
      product_id: epicData.product_id || null,
      name: epicData.name.trim(),
      description: epicData.description?.trim() || null,
      color: epicData.color || '#8B5CF6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add immediately to UI
    setEpics(prev => [optimisticEpic, ...prev]);

    try {
      // 📡 2. Send to database
      const payload = {
        workspace_id: workspaceId,
        product_id: epicData.product_id || undefined,
        name: epicData.name.trim(),
        description: epicData.description?.trim() || undefined,
        color: epicData.color || '#8B5CF6',
      };

      const { data, error } = await supabase
        .from('epics')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // 🔴 Rollback on error
        setEpics(prev => prev.filter(e => e.id !== optimisticEpic.id));
        
        // Contextual error messages
        if (error.message?.includes('product_id')) {
          toast({
            title: 'Erreur',
            description: 'Le produit sélectionné n\'existe pas.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de créer l\'épic. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        throw error;
      }

      // ✅ 3. Replace with real data
      const realEpic = { ...data, product_id: data.product_id || null };
      setEpics(prev => prev.map(e => e.id === optimisticEpic.id ? realEpic : e));

      // 🎉 Success notification
      toast({
        title: 'Épic créé',
        description: `"${epicData.name}" a été créé avec succès`,
      });

      return realEpic;
    } catch (error) {
      console.error('Error creating epic:', error);
      return null;
    }
  };

  // Update epic
  const updateEpic = async (epicId: string, updates: Partial<CreateEpicData>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('epics')
        .update(updates)
        .eq('id', epicId);

      if (error) throw error;

      // Update local state
      setEpics(prev => prev.map(e => 
        e.id === epicId ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      ));

      toast({
        title: 'Épic mis à jour',
        description: 'Les modifications ont été sauvegardées',
      });
    } catch (error: any) {
      console.error('Error updating epic:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'épic',
        variant: 'destructive',
      });
    }
  };

  // Delete epic
  const deleteEpic = async (epicId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('epics')
        .delete()
        .eq('id', epicId);

      if (error) throw error;

      setEpics(prev => prev.filter(e => e.id !== epicId));

      toast({
        title: 'Épic supprimé',
        description: 'L\'épic a été supprimé avec succès',
      });
    } catch (error: any) {
      console.error('Error deleting epic:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'épic',
        variant: 'destructive',
      });
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchEpics();

    if (!workspaceId) return;

    const channel = supabase
      .channel('epics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'epics',
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setEpics(prevEpics => {
          switch (eventType) {
            case 'INSERT':
              // Add new epic if not already present (avoid duplicates from optimistic updates)  
              if (newRecord && !prevEpics.find(e => e.id === newRecord.id)) {
                return [newRecord as Epic, ...prevEpics];
              }
              break;

            case 'UPDATE':
              // Update existing epic
              return prevEpics.map(epic => {
                if (epic.id === newRecord.id) {
                  return { ...epic, ...newRecord };
                }
                return epic;
              });

            case 'DELETE':
              // Remove deleted epic
              return prevEpics.filter(e => e.id !== oldRecord.id);
          }
          return prevEpics;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, selectedProductId]);

  return {
    epics,
    loading,
    createEpic,
    updateEpic,
    deleteEpic,
    refetch: fetchEpics,
  };
};