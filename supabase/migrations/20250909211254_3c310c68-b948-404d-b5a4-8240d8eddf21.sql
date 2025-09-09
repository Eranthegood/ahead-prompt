-- Fix security vulnerability: Restrict system prompt enhancers to authenticated users only
-- Current policy allows anonymous access to system enhancers which exposes proprietary AI templates

-- Drop the existing policy that allows public access to system enhancers
DROP POLICY IF EXISTS "Users can view enhancers in their workspaces or system enhancer" ON prompt_enhancers;

-- Create new secure policy that requires authentication for system enhancers
CREATE POLICY "Users can view enhancers in their workspaces or authenticated system access" 
ON prompt_enhancers 
FOR SELECT 
USING (
  -- Require authentication for all access
  auth.uid() IS NOT NULL 
  AND (
    -- Allow access to system enhancers only for authenticated users
    (type = 'system'::enhancer_type) 
    OR 
    -- Allow access to workspace enhancers for workspace owners
    (workspace_id IN (
      SELECT workspaces.id
      FROM workspaces
      WHERE workspaces.owner_id = auth.uid()
    ))
  )
);