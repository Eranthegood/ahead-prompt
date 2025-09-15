-- Add back the missing workspace admin view policy
CREATE POLICY "Workspace admins can view invitations" ON public.workspace_invitations
FOR SELECT 
USING (is_workspace_admin(workspace_id, auth.uid()));