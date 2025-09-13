import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/types';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchOrCreateWorkspace();
  }, [user]); // fetchOrCreateWorkspace is stable, no need to add as dependency

  const fetchOrCreateWorkspace = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to get existing workspace
      const { data: workspaces, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      if (workspaces && workspaces.length > 0) {
        setWorkspace(workspaces[0]);
      } else {
        // Create default workspace
        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert({
            name: `${user.email?.split('@')[0]}'s Workspace`,
            description: 'Your prompt planning workspace',
            owner_id: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        
        setWorkspace(newWorkspace);
        toast({
          title: 'Workspace created',
          description: 'Your workspace is ready for prompt planning!'
        });
      }
    } catch (error: any) {
      console.error('Workspace error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading workspace',
        description: error?.message || 'Failed to load workspace'
      });
    } finally {
      setLoading(false);
    }
  };

  return { workspace, loading };
}