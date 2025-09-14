-- Fix function parameter conflict
DROP FUNCTION IF EXISTS public.is_workspace_admin(uuid, uuid);

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
DROP POLICY IF EXISTS "Users can view members in their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can insert members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can update members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can delete members" ON public.workspace_members;

CREATE POLICY "Members can view workspace members" 
ON public.workspace_members 
FOR SELECT
USING (public.can_access_workspace(workspace_id, auth.uid()));

CREATE POLICY "Admins can manage workspace members" 
ON public.workspace_members 
FOR INSERT
WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can update workspace members" 
ON public.workspace_members 
FOR UPDATE
USING (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace members" 
ON public.workspace_members 
FOR DELETE
USING (public.is_workspace_admin(workspace_id, auth.uid()));

-- Fix workspace_invitations policies to use SECURITY DEFINER functions
DROP POLICY IF EXISTS "Users can view invitations for their workspaces" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners and admins can create invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners and admins can update invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Workspace owners and admins can delete invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.workspace_invitations;

CREATE POLICY "Anyone can view invitation by token"
ON public.workspace_invitations
FOR SELECT
USING (invitation_token IS NOT NULL);

CREATE POLICY "Admins can manage workspace invitations" 
ON public.workspace_invitations 
FOR INSERT
WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()) AND invited_by = auth.uid());

CREATE POLICY "Admins can update workspace invitations" 
ON public.workspace_invitations 
FOR UPDATE
USING (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can delete workspace invitations" 
ON public.workspace_invitations 
FOR DELETE
USING (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can view workspace invitations" 
ON public.workspace_invitations 
FOR SELECT
USING (public.is_workspace_admin(workspace_id, auth.uid()) OR invitation_token IS NOT NULL);