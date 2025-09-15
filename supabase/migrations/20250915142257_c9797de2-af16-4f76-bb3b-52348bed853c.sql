-- Create workspace_invitations table
CREATE TABLE public.workspace_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    invited_by UUID NOT NULL,
    invitation_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(invitation_token),
    UNIQUE(workspace_id, email) -- Prevent duplicate invitations for same email/workspace
);

-- Enable Row Level Security
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for workspace_invitations
CREATE POLICY "Users can view invitations for their workspaces" 
ON public.workspace_invitations 
FOR SELECT 
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION 
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create invitations for their workspaces" 
ON public.workspace_invitations 
FOR INSERT 
WITH CHECK (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION 
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin'
    )
    AND invited_by = auth.uid()
);

CREATE POLICY "Users can update invitations for their workspaces" 
ON public.workspace_invitations 
FOR UPDATE 
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION 
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can delete invitations for their workspaces" 
ON public.workspace_invitations 
FOR DELETE 
USING (
    workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
        UNION 
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workspace_invitations_updated_at
BEFORE UPDATE ON public.workspace_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(invitation_token);
CREATE INDEX idx_workspace_invitations_expires ON public.workspace_invitations(expires_at) WHERE accepted_at IS NULL;