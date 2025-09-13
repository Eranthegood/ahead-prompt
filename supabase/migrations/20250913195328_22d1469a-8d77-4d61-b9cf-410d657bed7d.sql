-- Fix infinite recursion in workspace policies
-- Step 1: Drop ALL existing workspace policies to start clean
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their workspaces or workspaces they are members" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create their own workspace" ON public.workspaces;

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

-- Step 3: Create new simple policies for workspaces table using security definer function
CREATE POLICY "Users can view accessible workspaces" 
ON public.workspaces 
FOR SELECT 
USING (public.can_access_workspace(id, auth.uid()));

CREATE POLICY "Users can update their own workspace" 
ON public.workspaces 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own workspace" 
ON public.workspaces 
FOR DELETE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own workspace" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());