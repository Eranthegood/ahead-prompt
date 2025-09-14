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