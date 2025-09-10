-- Create notes table with similar structure to prompts
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  product_id UUID NULL,
  epic_id UUID NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes (similar to prompts)
CREATE POLICY "Users can create notes in their workspaces" 
ON public.notes 
FOR INSERT 
WITH CHECK (workspace_id IN (
  SELECT workspaces.id
  FROM workspaces
  WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can view notes in their workspaces" 
ON public.notes 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspaces.id
  FROM workspaces
  WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can update notes in their workspaces" 
ON public.notes 
FOR UPDATE 
USING (workspace_id IN (
  SELECT workspaces.id
  FROM workspaces
  WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can delete notes in their workspaces" 
ON public.notes 
FOR DELETE 
USING (workspace_id IN (
  SELECT workspaces.id
  FROM workspaces
  WHERE workspaces.owner_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_notes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_notes_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_notes_workspace_id ON public.notes(workspace_id);
CREATE INDEX idx_notes_product_id ON public.notes(product_id);
CREATE INDEX idx_notes_epic_id ON public.notes(epic_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_notes_title_search ON public.notes USING gin(to_tsvector('english', title));
CREATE INDEX idx_notes_content_search ON public.notes USING gin(to_tsvector('english', content));