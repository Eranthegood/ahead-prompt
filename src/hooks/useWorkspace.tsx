import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/types';
import { useSearchParams } from 'react-router-dom';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchOrCreateWorkspace();
  }, [user, searchParams]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchOrCreateWorkspace = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if a specific workspace is requested via URL parameter
      const requestedWorkspaceId = searchParams.get('workspace');
      
      if (requestedWorkspaceId) {
        console.log(`[useWorkspace] Loading specific workspace: ${requestedWorkspaceId}`);
        
        // First check if user has access to this workspace via workspace_members
        const { data: memberWorkspace, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspaces(*)')
          .eq('workspace_id', requestedWorkspaceId)
          .eq('user_id', user.id)
          .single();

        if (!memberError && memberWorkspace?.workspaces) {
          console.log('[useWorkspace] Successfully loaded requested workspace via membership');
          setWorkspace(memberWorkspace.workspaces as Workspace);
          setRetryCount(0);
          return;
        }

        // Fallback: check if user owns this workspace
        const { data: ownedWorkspace, error: ownedError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', requestedWorkspaceId)
          .eq('owner_id', user.id)
          .single();

        if (!ownedError && ownedWorkspace) {
          console.log('[useWorkspace] Successfully loaded requested workspace via ownership');
          setWorkspace(ownedWorkspace);
          setRetryCount(0);
          return;
        }

        // If neither worked, fall through to default workspace loading
        console.log('[useWorkspace] User does not have access to requested workspace, loading default');
      }
      
      console.log(`[useWorkspace] Fetching default workspace for user: ${user.id}, attempt: ${retryCount + 1}`);
      
      // Use the optimized function first
      try {
        const { data: workspaceData, error: functionError } = await supabase
          .rpc('get_user_workspaces')
          .limit(1)
          .single();

        if (!functionError && workspaceData) {
          console.log('[useWorkspace] Successfully fetched workspace using optimized function');
          setWorkspace(workspaceData as Workspace);
          setRetryCount(0);
          return;
        }
      } catch (optimizedError) {
        console.log('[useWorkspace] Optimized function failed, falling back to direct query');
      }

      // Fallback to direct query
      const { data: workspaces, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);

      if (fetchError) {
        console.error('[useWorkspace] Direct query error:', fetchError);
        
        // Check for specific errors that suggest policy issues
        if (fetchError.code === '42P17' || fetchError.message?.includes('infinite recursion')) {
          throw new Error('Problème de configuration de la base de données. Veuillez réessayer dans quelques instants.');
        }
        
        throw fetchError;
      }

      if (workspaces && workspaces.length > 0) {
        console.log('[useWorkspace] Found existing workspace:', workspaces[0].id);
        setWorkspace(workspaces[0]);
      } else {
        console.log('[useWorkspace] No workspace found, creating new one');
        
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

        if (createError) {
          console.error('[useWorkspace] Error creating workspace:', createError);
          throw createError;
        }
        
        setWorkspace(newWorkspace);
        console.log('[useWorkspace] Created new workspace:', newWorkspace.id);
        
        toast({
          title: 'Workspace created',
          description: 'Your workspace is ready for prompt planning!'
        });
      }

      setRetryCount(0);
      
    } catch (error: any) {
      console.error('[useWorkspace] Error:', error);
      
      // Check if we should retry
      if (retryCount < MAX_RETRIES && (
        error.code === '42P17' || 
        error.message?.includes('infinite recursion') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout')
      )) {
        console.log(`[useWorkspace] Retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        
        await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        
        setTimeout(() => {
          fetchOrCreateWorkspace();
        }, 100);
        
        return;
      }
      
      // Show error to user only after all retries failed
      const userMessage = error.code === '42P17' 
        ? 'Configuration de la base de données en cours. Veuillez actualiser la page dans quelques instants.'
        : error?.message || 'Failed to load workspace';
        
      toast({
        variant: 'destructive',
        title: 'Error loading workspace',
        description: userMessage
      });
      
      setRetryCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, retryCount, toast, searchParams]);

  return { 
    workspace, 
    loading, 
    refetch: fetchOrCreateWorkspace,
    retryCount 
  };
}