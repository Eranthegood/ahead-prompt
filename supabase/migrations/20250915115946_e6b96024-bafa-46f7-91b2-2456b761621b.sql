-- SECURITY FIX: Remove vulnerable workspace invitation policies and implement secure ones

-- First, drop the existing vulnerable policies
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can view workspace invitations" ON public.workspace_invitations;

-- Create secure policies that only allow proper access

-- 1. Workspace admins can view invitations for their workspace
CREATE POLICY "Workspace admins can view invitations" ON public.workspace_invitations
FOR SELECT 
USING (is_workspace_admin(workspace_id, auth.uid()));

-- 2. Invited users can view their own invitation by email match
CREATE POLICY "Invited users can view their own invitation" ON public.workspace_invitations
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- 3. Allow access by specific invitation token for accepting invitations
-- This is needed for the invitation acceptance flow but limits exposure
CREATE POLICY "Access invitation by exact token match" ON public.workspace_invitations
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND invitation_token = current_setting('request.invitation_token', true)
);

-- Update the existing admin policies to be more explicit
DROP POLICY IF EXISTS "Admins can manage workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can delete workspace invitations" ON public.workspace_invitations;  
DROP POLICY IF EXISTS "Admins can update workspace invitations" ON public.workspace_invitations;

-- Recreate admin management policies with clear permissions
CREATE POLICY "Workspace admins can create invitations" ON public.workspace_invitations
FOR INSERT
WITH CHECK (
  is_workspace_admin(workspace_id, auth.uid()) 
  AND invited_by = auth.uid()
);

CREATE POLICY "Workspace admins can update invitations" ON public.workspace_invitations
FOR UPDATE
USING (is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Workspace admins can delete invitations" ON public.workspace_invitations
FOR DELETE
USING (is_workspace_admin(workspace_id, auth.uid()));