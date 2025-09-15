-- SECURITY FIX: Remove ALL existing vulnerable policies and recreate secure ones

-- Drop all existing policies first
DROP POLICY IF EXISTS "Workspace admins can view invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can view workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can manage workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can delete workspace invitations" ON public.workspace_invitations;
DROP POLICY IF EXISTS "Admins can update workspace invitations" ON public.workspace_invitations;