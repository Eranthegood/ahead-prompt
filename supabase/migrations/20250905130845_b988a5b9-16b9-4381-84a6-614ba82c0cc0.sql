-- Create table for Figma projects
CREATE TABLE public.figma_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  figma_file_key TEXT NOT NULL,
  figma_file_name TEXT NOT NULL,
  team_id TEXT,
  team_name TEXT,
  thumbnail_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.figma_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for figma_projects
CREATE POLICY "Users can view their own Figma projects" 
ON public.figma_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Figma projects" 
ON public.figma_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Figma projects" 
ON public.figma_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Figma projects" 
ON public.figma_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for Figma design elements
CREATE TABLE public.figma_design_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.figma_projects(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  element_type TEXT NOT NULL CHECK (element_type IN ('frame', 'component', 'style', 'text')),
  name TEXT NOT NULL,
  description TEXT,
  specs JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  figma_url TEXT,
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.figma_design_elements ENABLE ROW LEVEL SECURITY;

-- Create policies for figma_design_elements
CREATE POLICY "Users can view design elements in their workspaces" 
ON public.figma_design_elements 
FOR SELECT 
USING (workspace_id IN (SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()));

CREATE POLICY "Users can create design elements in their workspaces" 
ON public.figma_design_elements 
FOR INSERT 
WITH CHECK (workspace_id IN (SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()));

CREATE POLICY "Users can update design elements in their workspaces" 
ON public.figma_design_elements 
FOR UPDATE 
USING (workspace_id IN (SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()));

CREATE POLICY "Users can delete design elements in their workspaces" 
ON public.figma_design_elements 
FOR DELETE 
USING (workspace_id IN (SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_figma_projects_updated_at
BEFORE UPDATE ON public.figma_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_figma_design_elements_updated_at
BEFORE UPDATE ON public.figma_design_elements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_figma_projects_user_id ON public.figma_projects(user_id);
CREATE INDEX idx_figma_projects_file_key ON public.figma_projects(figma_file_key);
CREATE INDEX idx_figma_design_elements_project_id ON public.figma_design_elements(project_id);
CREATE INDEX idx_figma_design_elements_workspace_id ON public.figma_design_elements(workspace_id);
CREATE INDEX idx_figma_design_elements_type ON public.figma_design_elements(element_type);