import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  User, 
  Copy,
  AlertTriangle
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspaceInvitations } from '@/hooks/useWorkspaceInvitations';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TeamManagement() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { members, loading, updateMemberRole, removeMember, transferOwnership, claimOwnership } = useWorkspaceMembers(workspace?.id);
  const { invitations, createInvitation, cancelInvitation } = useWorkspaceInvitations(workspace?.id);
  const { toast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address to send an invitation.'
      });
      return;
    }

    setIsInviting(true);
    try {
      const invitation = await createInvitation(inviteEmail, inviteRole);
      if (invitation) {
        const inviteLink = `${window.location.origin}/join-workspace/${invitation.invitation_token}`;
        await navigator.clipboard.writeText(inviteLink);
        
        toast({
          title: 'Invitation created',
          description: 'Invitation link has been copied to clipboard.'
        });
        
        setInviteEmail('');
        setInviteRole('user');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create invitation',
        description: error.message
      });
    } finally {
      setIsInviting(false);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/join-workspace/${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Link copied',
      description: 'Invitation link has been copied to clipboard.'
    });
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    await updateMemberRole(userId, newRole);
  };

  const handleRemoveMember = async (memberRecordId: string) => {
    await removeMember(memberRecordId);
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (workspace) {
      await transferOwnership(workspace.id, newOwnerId);
    }
  };

  const handleClaimOwnership = async () => {
    if (workspace) {
      await claimOwnership(workspace.id);
    }
  };

  const isOwner = workspace?.owner_id === user?.id;
  const currentUserMember = members.find(m => m.user_id === user?.id);
  const canClaimOwnership = currentUserMember?.role === 'admin' && 
    !members.some(m => m.user_id === workspace?.owner_id);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your workspace team members and permissions
          </p>
        </div>
      </div>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add a new member to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleInvite} 
                disabled={isInviting}
                className="w-full"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ownership Issues Alert */}
      {canClaimOwnership && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              The current workspace owner is not a member. As an admin, you can claim ownership.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClaimOwnership}
            >
              Claim Ownership
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>
            Manage existing team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const isCurrentUser = member.user_id === user?.id;
              const memberIsOwner = member.user_id === workspace?.owner_id;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {member.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                        </p>
                        {memberIsOwner && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          User
                        </>
                      )}
                    </Badge>
                    
                    {isOwner && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'user' : 'admin')}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Change to {member.role === 'admin' ? 'User' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTransferOwnership(member.user_id)}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Transfer Ownership
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Role: {invitation.role}</span>
                      <span>•</span>
                      <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation.invitation_token)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}