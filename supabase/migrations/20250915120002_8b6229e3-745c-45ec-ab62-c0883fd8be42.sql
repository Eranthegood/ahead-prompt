-- Create a secure function to validate invitation tokens without exposing sensitive data
-- This function bypasses RLS to safely validate tokens and return necessary invitation data

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(token_param text)
RETURNS TABLE (
  id uuid,
  workspace_id uuid,
  email text,
  role text,
  invited_by uuid,
  expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  workspace_name text,
  invited_by_name text,
  invited_by_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate token format and check if invitation exists and is valid
  IF token_param IS NULL OR length(token_param) < 10 THEN
    RETURN;
  END IF;

  -- Return invitation details with workspace and inviter info
  -- Only return non-expired, non-accepted invitations
  RETURN QUERY
  SELECT 
    wi.id,
    wi.workspace_id,
    wi.email,
    wi.role,
    wi.invited_by,
    wi.expires_at,
    wi.accepted_at,
    w.name as workspace_name,
    p.full_name as invited_by_name,
    p.email as invited_by_email
  FROM workspace_invitations wi
  JOIN workspaces w ON wi.workspace_id = w.id
  LEFT JOIN profiles p ON wi.invited_by = p.id
  WHERE wi.invitation_token = token_param
    AND wi.accepted_at IS NULL
    AND wi.expires_at > now();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO authenticated;

-- Create RLS policy to allow the token-based function access
-- Remove the problematic policy that used current_setting
DROP POLICY IF EXISTS "Access invitation by exact token match" ON public.workspace_invitations;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_invitation_by_token(text) IS 'Securely validates invitation tokens and returns invitation details without exposing sensitive data';