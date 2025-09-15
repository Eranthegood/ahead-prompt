import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceInvitation } from '@/types/workspace';

export function useWorkspaceInvitations(workspaceId?: string) {
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
    } catch (error: any) {
      console.error('Error fetching workspace invitations:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading invitations',
        description: error?.message || 'Failed to load workspace invitations'
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

      toast({
        title: 'Invitation created',
        description: `Invitation sent to ${email}`
      });
      
      fetchInvitations();
      return data;
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating invitation',
        description: error?.message || 'Failed to create invitation'
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

      toast({
        title: 'Invitation cancelled',
        description: 'Invitation has been cancelled'
      });
      
      fetchInvitations();
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast({
        variant: 'destructive',
        title: 'Error cancelling invitation',
        description: error?.message || 'Failed to cancel invitation'
      });
    }
  };

  const getInvitationByToken = async (token: string) => {
    try {
      // Use the secure RPC function instead of direct table access
      const { data, error } = await supabase
        .rpc('get_invitation_by_token', { 
          token_param: token 
        });

      if (error) throw error;

      // The RPC returns an array, get first result
      const invitation = data?.[0];
      if (!invitation) return null;

      // Transform the RPC result to match the expected interface
      return {
        id: invitation.id,
        workspace_id: invitation.workspace_id,
        email: invitation.email,
        role: invitation.role as 'admin' | 'user',
        invited_by: invitation.invited_by,
        expires_at: invitation.expires_at,
        accepted_at: invitation.accepted_at,
        // Security: Don't expose the actual token after validation
        invitation_token: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add nested objects for UI compatibility
        workspaces: {
          name: invitation.workspace_name
        },
        invited_by_profile: {
          full_name: invitation.invited_by_name,
          email: invitation.invited_by_email
        }
      };
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
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
      throw error;
    }
  };

  return {
    invitations,
    loading,
    createInvitation,
    cancelInvitation,
    getInvitationByToken,
    acceptInvitation,
    refetch: fetchInvitations
  };
}