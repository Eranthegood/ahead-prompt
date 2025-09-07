-- Create prompt_library table for storing user prompt templates
CREATE TABLE public.prompt_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ai_model TEXT NOT NULL DEFAULT 'openai-gpt-4',
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompt_library ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own prompt library items" 
ON public.prompt_library 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own prompt library items" 
ON public.prompt_library 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own prompt library items" 
ON public.prompt_library 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own prompt library items" 
ON public.prompt_library 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_prompt_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prompt_library_updated_at
BEFORE UPDATE ON public.prompt_library
FOR EACH ROW
EXECUTE FUNCTION public.update_prompt_library_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_prompt_library_workspace_user ON public.prompt_library(workspace_id, user_id);
CREATE INDEX idx_prompt_library_category ON public.prompt_library(category);
CREATE INDEX idx_prompt_library_is_favorite ON public.prompt_library(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_prompt_library_usage_count ON public.prompt_library(usage_count DESC);
CREATE INDEX idx_prompt_library_tags ON public.prompt_library USING GIN(tags);