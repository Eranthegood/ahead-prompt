-- Drop the existing status constraint that doesn't include 'generating'
ALTER TABLE public.prompts DROP CONSTRAINT IF EXISTS prompts_status_check;

-- Recreate the constraint to include all valid statuses including 'generating'
ALTER TABLE public.prompts ADD CONSTRAINT prompts_status_check 
CHECK (status IN ('todo', 'generating', 'in_progress', 'done'));