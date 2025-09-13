import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTabVisibility } from '@/hooks/useTabVisibility';
import { Workspace } from '@/types';

interface FetchOptions {
  background?: boolean;
  minIntervalMs?: number;
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { onBecomeVisible } = useTabVisibility();
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchOrCreateWorkspace();
  }, [user]); // fetchOrCreateWorkspace is stable, no need to add as dependency

  // Intelligent refetch when tab becomes visible after being hidden
  useEffect(() => {
    onBecomeVisible(() => {
      if (user && workspace) {
        console.log('Tab became visible, refreshing workspace data');
        fetchOrCreateWorkspace({ background: true });
      }
    });
  }, [user, workspace, onBecomeVisible]);

  const fetchOrCreateWorkspace = async (options: FetchOptions = {}) => {
    if (!user) return;

    const { background = false, minIntervalMs = 15000 } = options;
    const now = Date.now();

    // Throttle background fetches
    if (background && now - lastFetchRef.current < minIntervalMs) {
      return;
    }

    lastFetchRef.current = now;

    try {
      // Only show loading for initial (non-background) fetches
      if (!background) {
        setLoading(true);
      }
      
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
        
        // Only show toast for initial loads, not background refetches
        if (!background) {
          toast({
            title: 'Workspace created',
            description: 'Your workspace is ready for prompt planning!'
          });
        }
      }
    } catch (error: any) {
      console.error('Workspace error:', error);
      
      // Only show toast for initial loads, not background refetches
      if (!background) {
        toast({
          variant: 'destructive',
          title: 'Error loading workspace',
          description: error?.message || 'Failed to load workspace'
        });
      }
    } finally {
      // Only update loading state for initial (non-background) fetches
      if (!background) {
        setLoading(false);
      }
    }
  };

  return { workspace, loading };
}