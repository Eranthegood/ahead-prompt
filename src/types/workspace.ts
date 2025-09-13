export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'user';
  joined_at: string;
  invited_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  profiles?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  invitation_token: string;
  role: 'admin' | 'user';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  workspaces?: {
    name: string;
  };
  invited_by_profile?: {
    email?: string;
    full_name?: string;
  };
}

export interface WorkspaceWithMembers {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  members?: WorkspaceMember[];
  member_count?: number;
  user_role?: 'owner' | 'admin' | 'user';
}