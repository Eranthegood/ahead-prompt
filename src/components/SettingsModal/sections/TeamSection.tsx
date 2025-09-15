import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspaceInvitations } from '@/hooks/useWorkspaceInvitations';
import { useWorkspacePremiumAccess } from '@/hooks/useWorkspacePremiumAccess';
import { PLAN_LIMITS } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Copy, Trash2, MoreHorizontal, Crown, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TeamSection() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { members, loading: membersLoading, updateMemberRole, removeMember, transferOwnership, claimOwnership } = useWorkspaceMembers(workspace?.id);
  const { invitations, createInvitation, cancelInvitation } = useWorkspaceInvitations(workspace?.id);
  const { hasPremiumAccess, accessSource, loading: premiumLoading } = useWorkspacePremiumAccess();
  const { toast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !workspace) return;

    // Check member limits based on workspace plan
    const maxMembers = hasPremiumAccess && accessSource === 'workspace' ? PLAN_LIMITS.pro.maxWorkspaceMembers : PLAN_LIMITS.free.maxWorkspaceMembers;
    const currentMemberCount = members.length + invitations.length;
    
    if (currentMemberCount >= maxMembers) {
      toast({
        title: "Member limit reached",
        description: `You've reached the maximum of ${maxMembers} members for your current plan.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setInviting(true);
      const invitation = await createInvitation(inviteEmail.trim(), inviteRole);
      
      // Copy the invitation link to clipboard
      if (invitation?.invitation_token) {
        const link = `${window.location.origin}/join-workspace?token=${invitation.invitation_token}`;
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link created and copied",
          description: `Invitation link copied to clipboard for ${inviteEmail}`,
        });
      } else {
        toast({
          title: "Link created",
          description: `Invitation created for ${inviteEmail}`,
        });
      }
      
      setInviteEmail('');
      setInviteRole('user');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const link = `${window.location.origin}/join-workspace?token=${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Lien copié",
        description: "Le lien d'invitation a été copié dans le presse-papier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateMemberRole(userId, newRole);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberRecordId: string) => {
    try {
      await removeMember(memberRecordId);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!workspace) return;
    
    try {
      await transferOwnership(workspace.id, newOwnerId);
    } catch (error) {
      console.error('Error transferring ownership:', error);
    }
  };

  const handleClaimOwnership = async () => {
    if (!workspace) return;
    
    try {
      await claimOwnership(workspace.id);
    } catch (error) {
      console.error('Error claiming ownership:', error);
    }
  };

  // Check if current user is the owner
  const isCurrentUserOwner = user?.id === workspace?.owner_id;
  
  // Check if current owner is not a member (meaning they're "stuck")
  const ownerIsMember = members.some(member => member.user_id === workspace?.owner_id);
  const canClaimOwnership = !isCurrentUserOwner && !ownerIsMember && members.some(member => member.user_id === user?.id && member.role === 'admin');

  if (!workspace) {
    return <div>Aucun workspace sélectionné</div>;
  }

  return (
    <div className="space-y-6">
      {/* Plan Info and Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un membre
            {hasPremiumAccess && accessSource === 'workspace' && (
              <Badge variant="default" className="ml-auto">
                <Crown className="w-3 h-3 mr-1" />
                Pro Plan
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="space-y-2">
            <div>Ajoutez de nouveaux membres à votre équipe.</div>
            {!premiumLoading && (
              <div className="flex items-center gap-2 text-sm">
                <span>
                  Membres: {members.length + invitations.length}/
                  {hasPremiumAccess && accessSource === 'workspace' ? PLAN_LIMITS.pro.maxWorkspaceMembers : PLAN_LIMITS.free.maxWorkspaceMembers}
                </span>
                {hasPremiumAccess && accessSource === 'workspace' && (
                  <span className="text-muted-foreground">• Accès premium partagé</span>
                )}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="invite-email">Adresse email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="nom@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Rôle</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleInvite} 
            disabled={!inviteEmail.trim() || inviting || (members.length + invitations.length >= (hasPremiumAccess && accessSource === 'workspace' ? PLAN_LIMITS.pro.maxWorkspaceMembers : PLAN_LIMITS.free.maxWorkspaceMembers))}
            className="w-full md:w-auto"
          >
            {inviting ? 'Creating...' : 
             (members.length + invitations.length >= (hasPremiumAccess && accessSource === 'workspace' ? PLAN_LIMITS.pro.maxWorkspaceMembers : PLAN_LIMITS.free.maxWorkspaceMembers)) ? 'Limit Reached' : 'Create Link'}
          </Button>
          
          {hasPremiumAccess && accessSource === 'workspace' && (
            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Pro Workspace Benefits</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tous les membres ont accès aux fonctionnalités premium grâce au plan Pro de ce workspace.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ownership Issues Alert */}
      {canClaimOwnership && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Workspace Ownership Issue
            </CardTitle>
            <CardDescription className="text-orange-700">
              The current workspace owner is no longer a member. As an admin, you can claim ownership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleClaimOwnership} variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
              <Crown className="mr-2 h-4 w-4" />
              Claim Ownership
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>Membres de l'équipe</CardTitle>
          <CardDescription>
            Gérez les membres actuels de votre équipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div>Chargement...</div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {member.profiles?.full_name?.charAt(0) || 
                         member.profiles?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.profiles?.full_name || 'Utilisateur'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.profiles?.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {workspace.owner_id === member.user_id && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Crown className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </Badge>
                    
                    {workspace.owner_id !== member.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem
                            onClick={() => handleRoleChange(
                              member.id, 
                              member.role === 'admin' ? 'user' : 'admin'
                            )}
                          >
                            {member.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                          </DropdownMenuItem>
                          {isCurrentUserOwner && member.role === 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleTransferOwnership(member.user_id)}
                              className="text-primary"
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Transfer Ownership
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente</CardTitle>
            <CardDescription>
              Invitations envoyées qui n'ont pas encore été acceptées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Rôle: {invitation.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInvitationLink(invitation.invitation_token)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copier le lien
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelInvitation(invitation.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Annuler
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