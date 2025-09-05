-- Fix feedback table RLS policies to prevent email harvesting
-- Drop existing SELECT policy and create a more restrictive one

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

-- Create a new SELECT policy that only allows users to view their own feedback
-- and ensures anonymous feedback (user_id IS NULL) cannot be viewed by any user
CREATE POLICY "Users can only view their own authenticated feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Ensure the INSERT policy remains unchanged to allow anonymous feedback submission
-- (The existing "Anyone can submit feedback" policy with "true" is fine for INSERT)