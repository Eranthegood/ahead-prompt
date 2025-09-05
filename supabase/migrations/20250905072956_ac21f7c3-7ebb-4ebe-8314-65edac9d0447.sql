-- Create enum for prompt enhancer types
CREATE TYPE public.enhancer_type AS ENUM ('system', 'user');

-- Create prompt enhancers table (base templates)
CREATE TABLE public.prompt_enhancers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type enhancer_type NOT NULL DEFAULT 'system',
  system_message TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prompt enhancer versions table
CREATE TABLE public.prompt_enhancer_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enhancer_id UUID NOT NULL REFERENCES public.prompt_enhancers(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  system_message TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  commit_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(enhancer_id, version_number)
);

-- Create prompt test runs table
CREATE TABLE public.prompt_test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enhancer_version_id UUID NOT NULL REFERENCES public.prompt_enhancer_versions(id) ON DELETE CASCADE,
  test_input TEXT NOT NULL,
  test_output TEXT,
  model_used TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  max_tokens INTEGER DEFAULT 1000,
  temperature DECIMAL(2,1) DEFAULT 0.7,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  execution_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.prompt_enhancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_enhancer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_test_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies for prompt_enhancers
CREATE POLICY "Users can view enhancers in their workspaces or system enhancers"
  ON public.prompt_enhancers FOR SELECT
  USING (
    type = 'system' OR 
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create enhancers in their workspaces"
  ON public.prompt_enhancers FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own enhancers"
  ON public.prompt_enhancers FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own enhancers"
  ON public.prompt_enhancers FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- RLS policies for prompt_enhancer_versions
CREATE POLICY "Users can view versions of accessible enhancers"
  ON public.prompt_enhancer_versions FOR SELECT
  USING (
    enhancer_id IN (
      SELECT id FROM public.prompt_enhancers 
      WHERE type = 'system' OR workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create versions for their enhancers"
  ON public.prompt_enhancer_versions FOR INSERT
  WITH CHECK (
    enhancer_id IN (
      SELECT id FROM public.prompt_enhancers 
      WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      ) AND created_by = auth.uid()
    ) AND created_by = auth.uid()
  );

-- RLS policies for prompt_test_runs
CREATE POLICY "Users can view test runs in their workspaces"
  ON public.prompt_test_runs FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create test runs in their workspaces"
  ON public.prompt_test_runs FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_prompt_enhancers_updated_at
  BEFORE UPDATE ON public.prompt_enhancers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the default "Ahead CLEAR" enhancer
INSERT INTO public.prompt_enhancers (
  name, 
  description, 
  type, 
  system_message, 
  prompt_template
) VALUES (
  'Ahead CLEAR',
  'The standard CLEAR framework prompt for structured AI interactions',
  'system',
  'You are an expert prompt engineer. Transform the user''s raw idea into a well-structured prompt following the CLEAR framework: Context, Length, Examples, Audience, Role.',
  'Transform this raw idea into a clear, structured prompt following the CLEAR framework:

Raw idea: {raw_idea}

{knowledge_context}

Please create a prompt that:
- Provides clear CONTEXT for what needs to be done
- Specifies appropriate LENGTH/scope for the response  
- Includes relevant EXAMPLES when helpful
- Defines the target AUDIENCE and use case
- Establishes the AI''s ROLE and expertise level

Output only the final structured prompt, ready to use.'
);