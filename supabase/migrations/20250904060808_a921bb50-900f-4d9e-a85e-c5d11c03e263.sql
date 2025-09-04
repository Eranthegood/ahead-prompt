-- Add user_id column to feedback table for authenticated users
ALTER TABLE public.feedback 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Make email optional when user_id is provided
ALTER TABLE public.feedback 
ALTER COLUMN email DROP NOT NULL;

-- Update RLS policy to allow authenticated users to view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add constraint to ensure either email or user_id is provided
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_contact_required 
CHECK (
  (user_id IS NOT NULL) OR 
  (email IS NOT NULL AND email != '')
);