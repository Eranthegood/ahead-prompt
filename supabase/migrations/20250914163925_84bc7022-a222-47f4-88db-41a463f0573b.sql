-- Allow workspace members to view profiles of other members in the same workspace
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles of workspace members"
ON public.profiles
FOR SELECT
TO public
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM workspace_members wm1
    INNER JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() AND wm2.user_id = profiles.id
  )
);