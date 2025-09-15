-- Create trigger to automatically add workspace owner as admin member
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add the workspace owner as an admin member automatically
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    invited_by
  ) VALUES (
    NEW.id,
    NEW.owner_id,
    'admin',
    NEW.owner_id
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- Function to transfer workspace ownership (only current owner can call this)
CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(
  workspace_uuid uuid,
  new_owner_uuid uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  -- Check if the current user is the workspace owner
  IF NOT EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE id = workspace_uuid AND owner_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Only the workspace owner can transfer ownership';
  END IF;

  -- Check if the new owner is a member of the workspace
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid AND user_id = new_owner_uuid
  ) THEN
    RAISE EXCEPTION 'New owner must be a member of the workspace';
  END IF;

  -- Transfer ownership
  UPDATE public.workspaces 
  SET owner_id = new_owner_uuid, updated_at = now()
  WHERE id = workspace_uuid;

  -- Ensure new owner has admin role
  UPDATE public.workspace_members
  SET role = 'admin', updated_at = now()
  WHERE workspace_id = workspace_uuid AND user_id = new_owner_uuid;

  -- Keep old owner as admin member (don't remove them)
  UPDATE public.workspace_members
  SET role = 'admin', updated_at = now()
  WHERE workspace_id = workspace_uuid AND user_id = current_user_id;
END;
$$;

-- Function to claim workspace ownership (for admins when owner is invalid)
CREATE OR REPLACE FUNCTION public.claim_workspace_ownership(
  workspace_uuid uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_owner_id uuid;
BEGIN
  -- Get current owner
  SELECT owner_id INTO current_owner_id
  FROM public.workspaces
  WHERE id = workspace_uuid;

  -- Check if the current user is an admin member
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid 
    AND user_id = current_user_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admin members can claim workspace ownership';
  END IF;

  -- Check if current owner is not a member (meaning they're "stuck")
  IF EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid AND user_id = current_owner_id
  ) THEN
    RAISE EXCEPTION 'Current owner is still a valid member. Use transfer_ownership instead.';
  END IF;

  -- Claim ownership
  UPDATE public.workspaces 
  SET owner_id = current_user_id, updated_at = now()
  WHERE id = workspace_uuid;
END;
$$;

-- One-time migration: Add missing owner memberships
-- For workspaces where the owner is not a member, add them as admin
INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by)
SELECT 
  w.id as workspace_id,
  w.owner_id as user_id,
  'admin' as role,
  w.owner_id as invited_by
FROM public.workspaces w
WHERE NOT EXISTS (
  SELECT 1 FROM public.workspace_members wm 
  WHERE wm.workspace_id = w.id AND wm.user_id = w.owner_id
)
ON CONFLICT (workspace_id, user_id) DO NOTHING;