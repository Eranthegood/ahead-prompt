-- Add Git/Cursor configuration fields to products table
ALTER TABLE public.products 
ADD COLUMN github_repo_url TEXT,
ADD COLUMN default_branch TEXT DEFAULT 'main',
ADD COLUMN cursor_enabled BOOLEAN DEFAULT false;

-- Add Git configuration fields to epics table  
ALTER TABLE public.epics
ADD COLUMN git_branch_name TEXT,
ADD COLUMN auto_create_pr BOOLEAN DEFAULT true,
ADD COLUMN base_branch_override TEXT;