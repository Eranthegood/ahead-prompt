import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Crown,
  User,
  Mail
} from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers';
import { useWorkspaceInvitations } from '@/hooks/useWorkspaceInvitations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceMembersModal({ open, onOpenChange }: WorkspaceMembersModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user');
  const [isInviting, setIsInviting] = useState(false);
  
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { members, loading: membersLoading, updateMemberRole, removeMember } = useWorkspaceMembers(workspace?.id);
  const { invitations, createInvitation, cancelInvitation } = useWorkspaceInvitations(open ? workspace?.id : undefined);
  const { toast } = useToast();

  const isOwner = workspace?.owner_id === user?.id;
  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isAdmin = isOwner || currentUserMember?.role === 'admin';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const invitation = await createInvitation(inviteEmail, inviteRole);
      if (invitation) {
        setInviteEmail('');
        setInviteRole('user');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/join-workspace/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Lien d\'invitation généré',
      description: 'Copiez-collez ce lien pour inviter cette personne'
    });
  };

  const getUserInitials = (email?: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (email?: string, name?: string) => {
    return name || email || 'Unknown User';
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People in {workspace.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section */}
          {isAdmin && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Invite team members</h3>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="invite-email" className="sr-only">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={isInviting}>
                    <Plus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-3">
            <h3 className="font-medium">Members ({members.length + 1})</h3>
            
            {/* Workspace Owner */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback className="text-xs">
                    {workspace.owner_id === user?.id ? getUserInitials(user?.email) : 'OW'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">
                    {workspace.owner_id === user?.id ? getUserDisplayName(user?.email) : 'Workspace Owner'}
                    {workspace.owner_id === user?.id && <span className="text-muted-foreground ml-1">(You)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {workspace.owner_id === user?.id ? user?.email : 'Owner'}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Owner
              </Badge>
            </div>

            {/* Regular Members */}
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profiles?.avatar_url || ''} alt="" />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(member.profiles?.email, member.profiles?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {getUserDisplayName(member.profiles?.email, member.profiles?.full_name)}
                      {member.user_id === user?.id && <span className="text-muted-foreground ml-1">(You)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.profiles?.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {member.role === 'admin' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {member.role}
                  </Badge>
                  
                  {isOwner && member.user_id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => updateMemberRole(member.id, member.role === 'admin' ? 'user' : 'admin')}
                        >
                          {member.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeMember(member.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Pending invitations ({invitations.length})</h3>
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{invitation.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.invitation_token)}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier le lien
                      </Button>
                      
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => cancelInvitation(invitation.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Annuler
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}