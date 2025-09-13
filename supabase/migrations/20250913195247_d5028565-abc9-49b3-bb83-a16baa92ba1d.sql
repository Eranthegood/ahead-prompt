-- Fix infinite recursion in workspace policies
-- Step 1: Drop the problematic policy that causes circular dependency
DROP POLICY IF EXISTS "Users can view their workspaces or workspaces they are members" ON public.workspaces;

-- Step 2: Create a security definer function to safely check workspace access
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

-- Step 3: Create simple policies for workspaces table
CREATE POLICY "Users can view workspaces they own or are members of" 
ON public.workspaces 
FOR SELECT 
USING (public.can_access_workspace(id, auth.uid()));

-- Step 4: Update workspace_members policies to use the security definer function
DROP POLICY IF EXISTS "Users can view workspace members in accessible workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can create workspace members in accessible workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can update workspace members in accessible workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can delete workspace members in accessible workspaces" ON public.workspace_members;

CREATE POLICY "Users can view workspace members in accessible workspaces" 
ON public.workspace_members 
FOR SELECT 
USING (public.can_access_workspace(workspace_id, auth.uid()));

CREATE POLICY "Users can create workspace members in accessible workspaces" 
ON public.workspace_members 
FOR INSERT 
WITH CHECK (public.can_access_workspace(workspace_id, auth.uid()));

CREATE POLICY "Users can update workspace members in accessible workspaces" 
ON public.workspace_members 
FOR UPDATE 
USING (public.can_access_workspace(workspace_id, auth.uid()));

CREATE POLICY "Users can delete workspace members in accessible workspaces" 
ON public.workspace_members 
FOR DELETE 
USING (public.can_access_workspace(workspace_id, auth.uid()));