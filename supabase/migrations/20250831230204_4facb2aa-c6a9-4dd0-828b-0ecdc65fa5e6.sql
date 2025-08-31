-- Add is_debug_session column to prompts table to distinguish debug sessions
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS is_debug_session BOOLEAN DEFAULT FALSE;