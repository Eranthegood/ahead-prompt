-- Add Cursor workflow tracking columns to prompts table
ALTER TABLE public.prompts 
ADD COLUMN cursor_agent_id text,
ADD COLUMN cursor_agent_status text,
ADD COLUMN github_pr_number integer,
ADD COLUMN github_pr_url text,
ADD COLUMN github_pr_status text,
ADD COLUMN cursor_branch_name text,
ADD COLUMN cursor_logs jsonb DEFAULT '{}'::jsonb,
ADD COLUMN workflow_metadata jsonb DEFAULT '{}'::jsonb;