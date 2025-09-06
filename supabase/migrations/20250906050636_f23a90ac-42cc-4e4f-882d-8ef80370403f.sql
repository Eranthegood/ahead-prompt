-- Create tracking tables for Cursor integration audit trail

-- Cursor tracking events table
CREATE TABLE public.cursor_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}',
  duration_ms INTEGER,
  user_id UUID NOT NULL,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cursor audit logs table
CREATE TABLE public.cursor_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  error_details TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cursor_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursor_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cursor_tracking_events
CREATE POLICY "Users can create tracking events in their workspaces" 
ON public.cursor_tracking_events 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT workspaces.owner_id 
  FROM workspaces 
  WHERE workspaces.id = cursor_tracking_events.user_id
) OR user_id = auth.uid());

CREATE POLICY "Users can view tracking events in their workspaces" 
ON public.cursor_tracking_events 
FOR SELECT 
USING (user_id IN (
  SELECT workspaces.owner_id 
  FROM workspaces 
  WHERE workspaces.id = cursor_tracking_events.user_id
) OR user_id = auth.uid());

-- RLS Policies for cursor_audit_logs
CREATE POLICY "Users can create audit logs in their workspaces" 
ON public.cursor_audit_logs 
FOR INSERT 
WITH CHECK (prompt_id IN (
  SELECT prompts.id 
  FROM prompts 
  JOIN workspaces ON prompts.workspace_id = workspaces.id 
  WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can view audit logs in their workspaces" 
ON public.cursor_audit_logs 
FOR SELECT 
USING (prompt_id IN (
  SELECT prompts.id 
  FROM prompts 
  JOIN workspaces ON prompts.workspace_id = workspaces.id 
  WHERE workspaces.owner_id = auth.uid()
));

-- Add indexes for performance
CREATE INDEX idx_cursor_tracking_events_prompt_id ON public.cursor_tracking_events(prompt_id);
CREATE INDEX idx_cursor_tracking_events_user_id ON public.cursor_tracking_events(user_id);
CREATE INDEX idx_cursor_tracking_events_timestamp ON public.cursor_tracking_events(timestamp);

CREATE INDEX idx_cursor_audit_logs_prompt_id ON public.cursor_audit_logs(prompt_id);
CREATE INDEX idx_cursor_audit_logs_timestamp ON public.cursor_audit_logs(timestamp);

-- Add triggers for updated_at
CREATE TRIGGER update_cursor_tracking_events_updated_at
  BEFORE UPDATE ON public.cursor_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cursor_audit_logs_updated_at
  BEFORE UPDATE ON public.cursor_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();