import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkspaceMember } from '@/types/workspace';

export function useWorkspaceMembers(workspaceId?: string) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !workspaceId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    fetchMembers();
    setupRealtimeSubscription();
  }, [user, workspaceId]);

  const fetchMembers = async () => {
    if (!workspaceId) return;

    try {
      setLoading(true);
      
      // Get workspace members with user profile data from auth.users via profiles table
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Get profile data for each member
      const membersWithProfiles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email, full_name, avatar_url')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            role: member.role as 'admin' | 'user',
            profiles: profileData
          };
        })
      );

      setMembers(membersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching workspace members:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading members',
        description: error?.message || 'Failed to load workspace members'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!workspaceId) return;

    const channel = supabase
      .channel(`workspace-members-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_members',
          filter: `workspace_id=eq.${workspaceId}`
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member role updated',
        description: `Member role has been updated to ${newRole}`
      });
      
      fetchMembers();
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating role',
        description: error?.message || 'Failed to update member role'
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'Member has been removed from the workspace'
      });
      
      fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        variant: 'destructive',
        title: 'Error removing member',
        description: error?.message || 'Failed to remove member'
      });
    }
  };

  return {
    members,
    loading,
    updateMemberRole,
    removeMember,
    refetch: fetchMembers
  };
}