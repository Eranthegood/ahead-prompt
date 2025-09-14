import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Prompt, PromptStatus } from '@/types';

export const usePromptsData = (
  workspaceId?: string, 
  selectedProductId?: string, 
  selectedEpicId?: string
) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Memoized filtered prompts to reduce re-renders
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    if (selectedProductId && selectedProductId !== 'all') {
      filtered = filtered.filter(p => p.product_id === selectedProductId);
    }

    if (selectedEpicId) {
      filtered = filtered.filter(p => p.epic_id === selectedEpicId);
    }

    return filtered;
  }, [prompts, selectedProductId, selectedEpicId]);

  // Clean up stuck prompts in 'generating' status
  const cleanupStuckGeneratingPrompts = async (prompts: Prompt[]) => {
    const stuckPrompts = prompts.filter(p => 
      p.status === 'generating' && 
      p.generated_prompt && 
      p.generated_prompt.trim().length > 0
    );

    if (stuckPrompts.length > 0) {
      console.log(`Found ${stuckPrompts.length} stuck prompts, fixing...`);
      
      for (const prompt of stuckPrompts) {
        try {
          const { error } = await supabase
            .from('prompts')
            .update({ 
              status: 'todo',
              updated_at: new Date().toISOString()
            })
            .eq('id', prompt.id);
          
          if (error) {
            console.error(`Failed to fix stuck prompt ${prompt.id}:`, error);
          }
        } catch (error) {
          console.error(`Error fixing stuck prompt ${prompt.id}:`, error);
        }
      }
      
      if (stuckPrompts.length > 0) {
        toast({
          title: "Prompts corrigés",
          description: `${stuckPrompts.length} prompt(s) bloqué(s) en génération ont été réparés.`,
        });
      }
    }
  };

  // Fetch prompts with server-side filtering
  const fetchPrompts = async () => {
    if (!workspaceId) return;
    
    try {
      let query = supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspaceId);

      // Server-side filtering for better performance
      if (selectedProductId && selectedProductId !== 'all') {
        query = query.eq('product_id', selectedProductId);
      }

      if (selectedEpicId) {
        query = query.eq('epic_id', selectedEpicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const processedPrompts = (data || []).map(p => ({ 
        ...p, 
        status: p.status as PromptStatus 
      }));
      
      setPrompts(processedPrompts);
      await cleanupStuckGeneratingPrompts(processedPrompts);
      
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prompts. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch when dependencies change
  useEffect(() => {
    fetchPrompts();
  }, [workspaceId, selectedProductId, selectedEpicId]);

  return {
    prompts: filteredPrompts,
    allPrompts: prompts,
    loading,
    refetch: () => Promise.resolve(fetchPrompts()),
    setPrompts
  };
};