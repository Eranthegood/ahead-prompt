-- Create a secure function to handle workspace invitation acceptance
CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(invitation_token_param text, user_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record record;
  workspace_uuid uuid;
BEGIN
  -- Get the invitation details
  SELECT * INTO invitation_record
  FROM workspace_invitations
  WHERE invitation_token = invitation_token_param
    AND accepted_at IS NULL
    AND expires_at > now();
    
  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Get the user's email to verify it matches the invitation
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id_param 
    AND email = invitation_record.email
  ) THEN
    RAISE EXCEPTION 'User email does not match invitation email';
  END IF;
  
  -- Check if user is already a member of this workspace
  IF EXISTS (
    SELECT 1 FROM workspace_members 
    WHERE workspace_id = invitation_record.workspace_id 
    AND user_id = user_id_param
  ) THEN
    -- User is already a member, just mark invitation as accepted
    UPDATE workspace_invitations 
    SET accepted_at = now()
    WHERE invitation_token = invitation_token_param;
    
    RETURN invitation_record.workspace_id;
  END IF;
  
  -- Accept the invitation
  UPDATE workspace_invitations 
  SET accepted_at = now()
  WHERE invitation_token = invitation_token_param;
  
  -- Add user to workspace members
  INSERT INTO workspace_members (
    workspace_id,
    user_id,
    role,
    invited_by
  ) VALUES (
    invitation_record.workspace_id,
    user_id_param,
    invitation_record.role,
    invitation_record.invited_by
  );
  
  RETURN invitation_record.workspace_id;
END;
$$;