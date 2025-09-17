import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceInvitation } from '@/types/workspace';
import { invitationErrorService } from '@/services/invitationErrorService';
import { toast } from 'sonner';

export function useWorkspaceInvitations(workspaceId?: string) {
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();
  const { toast: legacyToast } = useToast();

  useEffect(() => {
    if (!user || !workspaceId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    fetchInvitations();
    setupRealtimeSubscription();
  }, [user, workspaceId]);

  const fetchInvitations = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      
      const { data: invitationsData, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get workspace and profile data for each invitation
      const invitationsWithData = await Promise.all(
        (invitationsData || []).map(async (invitation) => {
          const [workspaceData, profileData] = await Promise.all([
        supabase
          .from('workspaces')
          .select('name')
          .eq('id', invitation.workspace_id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', invitation.invited_by)
          .maybeSingle()
          ]);

          return {
            ...invitation,
            role: invitation.role as 'admin' | 'user',
            workspaces: workspaceData.data,
            invited_by_profile: profileData.data
          };
        })
      );

      setInvitations(invitationsWithData);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Error fetching workspace invitations:', error);
      setError(error);
      
      // Use the enhanced error service
      const userFriendlyError = await invitationErrorService.handleError(
        error,
        'FETCH_INVITATIONS',
        { workspaceId },
        () => fetchInvitations() // Retry callback
      );

      // Show enhanced toast notification
      toast.error(userFriendlyError.title, {
        description: userFriendlyError.message,
        duration: 6000,
        action: userFriendlyError.actionCallback ? {
          label: userFriendlyError.actionText || 'Retry',
          onClick: userFriendlyError.actionCallback
        } : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`workspace-invitations-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_invitations',
          filter: `workspace_id=eq.${workspaceId}`
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createInvitation = async (email: string, role: 'admin' | 'user' = 'user') => {
    if (!workspaceId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email: email.toLowerCase().trim(),
          role,
          invited_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      legacyToast({
        title: 'Invitation created',
        description: `Invitation sent to ${email}`
      });
      
      fetchInvitations();
      return data;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      setError(error);
      
      const userFriendlyError = await invitationErrorService.handleError(
        error,
        'CREATE_INVITATION',
        { workspaceId }
      );

      toast.error(userFriendlyError.title, {
        description: userFriendlyError.message,
        duration: 5000
      });
      return null;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      legacyToast({
        title: 'Invitation cancelled',
        description: 'Invitation has been cancelled'
      });
      
      fetchInvitations();
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      setError(error);
      
      const userFriendlyError = await invitationErrorService.handleError(
        error,
        'CANCEL_INVITATION',
        { workspaceId, invitationId }
      );

      toast.error(userFriendlyError.title, {
        description: userFriendlyError.message,
        duration: 5000
      });
    }
  };

  const getInvitationByToken = async (token: string) => {
    try {
      // Use the secure RPC function instead of direct table access
      const { data, error } = await supabase
        .rpc('get_invitation_by_token', { 
          token: token 
        });

      if (error) throw error;

      // The RPC returns an array, get first result
      const invitation = data?.[0];
      if (!invitation) return null;

      // Get additional workspace and profile data
      const [workspaceData, profileData] = await Promise.all([
        supabase
          .from('workspaces')
          .select('name')
          .eq('id', invitation.workspace_id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', invitation.invited_by)
          .maybeSingle()
      ]);

      // Transform the RPC result to match the expected interface
      return {
        id: invitation.id,
        workspace_id: invitation.workspace_id,
        email: invitation.email,
        role: invitation.role as 'admin' | 'user',
        invited_by: invitation.invited_by,
        expires_at: invitation.expires_at,
        accepted_at: null, // Always null for active invitations
        // Security: Don't expose the actual token after validation
        invitation_token: '',
        created_at: invitation.created_at,
        updated_at: invitation.created_at,
        // Add nested objects for UI compatibility
        workspaces: workspaceData.data,
        invited_by_profile: profileData.data
      };
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      setError(error);
      
      await invitationErrorService.handleError(
        error,
        'GET_BY_TOKEN',
        { invitationToken: token }
      );
      return null;
    }
  };

  const acceptInvitation = async (token: string, userId: string) => {
    try {
      // Use the secure RPC function to handle invitation acceptance
      const { data: workspaceId, error } = await supabase
        .rpc('accept_workspace_invitation', {
          invitation_token_param: token,
          user_id_param: userId
        });

      if (error) throw error;

      return workspaceId;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error);
      
      await invitationErrorService.handleError(
        error,
        'ACCEPT_INVITATION',
        { invitationToken: token, userId }
      );
      throw error;
    }
  };

  return {
    invitations,
    loading,
    error,
    createInvitation,
    cancelInvitation,
    getInvitationByToken,
    acceptInvitation,
    refetch: fetchInvitations,
    clearError: () => setError(null)
  };
}