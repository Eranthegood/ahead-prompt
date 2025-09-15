-- Create enum for Claude session status
CREATE TYPE claude_session_status AS ENUM (
  'initializing',
  'cloning_repo', 
  'executing_claude',
  'processing_files',
  'committing_changes',
  'creating_pr',
  'completed',
  'failed'
);

-- Create Claude sessions table
CREATE TABLE claude_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  status claude_session_status DEFAULT 'initializing',
  working_directory text,
  output_lines text[] DEFAULT '{}',
  config jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_claude_sessions_prompt_id ON claude_sessions(prompt_id);
CREATE INDEX idx_claude_sessions_status ON claude_sessions(status);
CREATE INDEX idx_claude_sessions_session_id ON claude_sessions(session_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_claude_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_claude_sessions_updated_at 
  BEFORE UPDATE ON claude_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_claude_sessions_updated_at();

-- Enable RLS
ALTER TABLE claude_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Claude sessions" ON claude_sessions
  FOR SELECT USING (
    prompt_id IN (
      SELECT id FROM prompts WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own Claude sessions" ON claude_sessions
  FOR INSERT WITH CHECK (
    prompt_id IN (
      SELECT id FROM prompts WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own Claude sessions" ON claude_sessions
  FOR UPDATE USING (
    prompt_id IN (
      SELECT id FROM prompts WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own Claude sessions" ON claude_sessions
  FOR DELETE USING (
    prompt_id IN (
      SELECT id FROM prompts WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );