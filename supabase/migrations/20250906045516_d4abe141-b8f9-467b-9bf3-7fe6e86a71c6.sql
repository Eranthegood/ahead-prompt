-- Add new status values to prompt status enum
-- This will update the database to support the new Cursor workflow statuses

-- First, add the new status values to the existing enum
ALTER TYPE prompt_status ADD VALUE IF NOT EXISTS 'sending_to_cursor';
ALTER TYPE prompt_status ADD VALUE IF NOT EXISTS 'error';

-- Update any existing prompts that might be in an invalid state
UPDATE prompts 
SET status = 'todo' 
WHERE status NOT IN ('todo', 'generating', 'in_progress', 'done', 'sending_to_cursor', 'sent_to_cursor', 'cursor_working', 'pr_created', 'pr_review', 'pr_ready', 'pr_merged', 'error');