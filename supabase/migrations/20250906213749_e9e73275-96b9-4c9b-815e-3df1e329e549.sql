-- Create AI Agents infrastructure tables (fixed)

-- AI Agents configuration table
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('prompt_optimizer', 'workflow_automation', 'knowledge_curator', 'code_review', 'analytics')),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Agent activities log table
CREATE TABLE public.agent_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT, -- 'prompt', 'epic', 'product', etc.
  entity_id UUID,
  action_taken TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Agent rules configuration table
CREATE TABLE public.agent_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents (corrected to use owner_id)
CREATE POLICY "Users can view their workspace agents" 
ON public.ai_agents 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create agents in their workspace" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their workspace agents" 
ON public.ai_agents 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their workspace agents" 
ON public.ai_agents 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for agent_activities (corrected to use owner_id)
CREATE POLICY "Users can view their workspace agent activities" 
ON public.agent_activities 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System can create agent activities" 
ON public.agent_activities 
FOR INSERT 
WITH CHECK (true); -- Allow system to create activities

-- RLS Policies for agent_rules (corrected to use owner_id)
CREATE POLICY "Users can manage their workspace agent rules" 
ON public.agent_rules 
FOR ALL 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces 
    WHERE owner_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_ai_agents_workspace_id ON public.ai_agents(workspace_id);
CREATE INDEX idx_ai_agents_type_active ON public.ai_agents(agent_type, is_active);
CREATE INDEX idx_agent_activities_agent_id ON public.agent_activities(agent_id);
CREATE INDEX idx_agent_activities_workspace_created ON public.agent_activities(workspace_id, created_at);
CREATE INDEX idx_agent_rules_agent_id ON public.agent_rules(agent_id, is_active);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_ai_agent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_agent_updated_at();

CREATE TRIGGER update_agent_rules_updated_at
  BEFORE UPDATE ON public.agent_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_agent_updated_at();