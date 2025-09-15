-- Fix the token-based access policy to work properly with the invitation flow
-- The current approach using current_setting is not suitable for this use case

-- Drop the problematic policy
DROP POLICY IF EXISTS "Access invitation by exact token match" ON public.workspace_invitations;

-- Create a function to safely validate invitation tokens
CREATE OR REPLACE FUNCTION public.validate_invitation_token(token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM workspace_invitations 
    WHERE invitation_token = token 
    AND expires_at > now()
    AND accepted_at IS NULL
  );
$$;

-- Create a function to get invitation by token for authenticated users
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token text)
RETURNS TABLE(
  id uuid,
  workspace_id uuid,
  email text,
  role text,
  invited_by uuid,
  expires_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE  
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wi.id,
    wi.workspace_id,
    wi.email,
    wi.role,
    wi.invited_by,
    wi.expires_at,
    wi.created_at
  FROM workspace_invitations wi
  WHERE wi.invitation_token = token 
  AND wi.expires_at > now()
  AND wi.accepted_at IS NULL
  AND auth.uid() IS NOT NULL;
$$;