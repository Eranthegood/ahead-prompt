-- PHASE 1: Complete Fix for Infinite Recursion
-- Drop ALL existing policies that could cause recursion
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their workspaces or workspaces they are members" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view accessible workspaces" ON public.workspaces;

-- Ensure the function exists and is correct
CREATE OR REPLACE FUNCTION public.can_access_workspace(workspace_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the owner
    SELECT 1 FROM public.workspaces w WHERE w.id = workspace_uuid AND w.owner_id = user_uuid
    UNION
    -- User is a member
    SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_uuid AND wm.user_id = user_uuid
  );
$$;

-- Create the minimal, safe policies for workspaces
CREATE POLICY "Owner can manage workspace" 
ON public.workspaces 
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Members can view workspace" 
ON public.workspaces 
FOR SELECT
USING (public.can_access_workspace(id, auth.uid()));

-- PHASE 2: Create SECURITY DEFINER function for workspace admin check
CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the owner
    SELECT 1 FROM public.workspaces w WHERE w.id = workspace_uuid AND w.owner_id = user_uuid
    UNION
    -- User is an admin member
    SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_uuid AND wm.user_id = user_uuid AND wm.role = 'admin'
  );
$$;

-- Fix workspace_members policies to use SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can view their workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can create members in their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update members in their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can delete members in their workspaces" ON public.workspace_members;

CREATE POLICY "Members can view workspace members" 
ON public.workspace_members 
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can manage workspace members" 
ON public.workspace_members 
FOR ALL
USING (public.is_workspace_admin(workspace_id, auth.uid()))
WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()));

-- Fix workspace_invitations policies to use SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can view invitations in their workspaces" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Users can create invitations in their workspaces" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Users can update invitations in their workspaces" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Users can delete invitations in their workspaces" ON public.workspace_invitations;

CREATE POLICY "Admins can manage workspace invitations" 
ON public.workspace_invitations 
FOR ALL
USING (public.is_workspace_admin(workspace_id, auth.uid()))
WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()));

-- Create optimized function for getting user workspaces
CREATE OR REPLACE FUNCTION public.get_user_workspaces(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  user_role text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Owned workspaces
  SELECT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at, 'owner'::text as user_role
  FROM public.workspaces w
  WHERE w.owner_id = user_uuid
  
  UNION ALL
  
  -- Member workspaces
  SELECT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at, wm.role::text as user_role
  FROM public.workspaces w
  JOIN public.workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.user_id = user_uuid;
$$;