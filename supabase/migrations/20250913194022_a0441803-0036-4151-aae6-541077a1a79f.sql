-- Create workspace members table
CREATE TABLE public.workspace_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create workspace invitations table
CREATE TABLE public.workspace_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  invitation_token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspace_members
CREATE POLICY "Users can view members in their workspaces" 
ON public.workspace_members 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Workspace owners and admins can insert members" 
ON public.workspace_members 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

CREATE POLICY "Workspace owners and admins can update members" 
ON public.workspace_members 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

CREATE POLICY "Workspace owners and admins can delete members" 
ON public.workspace_members 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

-- RLS policies for workspace_invitations
CREATE POLICY "Users can view invitations for their workspaces" 
ON public.workspace_invitations 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

CREATE POLICY "Workspace owners and admins can create invitations" 
ON public.workspace_invitations 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
  AND invited_by = auth.uid()
);

CREATE POLICY "Workspace owners and admins can update invitations" 
ON public.workspace_invitations 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

CREATE POLICY "Workspace owners and admins can delete invitations" 
ON public.workspace_invitations 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT wm.workspace_id FROM public.workspace_members wm WHERE wm.user_id = auth.uid() AND wm.role = 'admin'
  )
);

-- Policy to allow anyone to view invitation by token (for joining)
CREATE POLICY "Anyone can view invitation by token" 
ON public.workspace_invitations 
FOR SELECT 
USING (invitation_token IS NOT NULL);

-- Update existing RLS policies to include workspace members
-- Update workspaces policies to include members
DROP POLICY IF EXISTS "Users can view their workspaces" ON public.workspaces;
CREATE POLICY "Users can view their workspaces or workspaces they are members of" 
ON public.workspaces 
FOR SELECT 
USING (
  owner_id = auth.uid()
  OR id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

-- Update other tables to allow workspace members access
-- Update prompts policies
DROP POLICY IF EXISTS "Users can view prompts in their workspaces" ON public.prompts;
CREATE POLICY "Users can view prompts in accessible workspaces" 
ON public.prompts 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create prompts in their workspaces" ON public.prompts;
CREATE POLICY "Users can create prompts in accessible workspaces" 
ON public.prompts 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update prompts in their workspaces" ON public.prompts;
CREATE POLICY "Users can update prompts in accessible workspaces" 
ON public.prompts 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete prompts in their workspaces" ON public.prompts;
CREATE POLICY "Users can delete prompts in accessible workspaces" 
ON public.prompts 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- Update epics policies
DROP POLICY IF EXISTS "Users can view epics in their workspaces" ON public.epics;
CREATE POLICY "Users can view epics in accessible workspaces" 
ON public.epics 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create epics in their workspaces" ON public.epics;
CREATE POLICY "Users can create epics in accessible workspaces" 
ON public.epics 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update epics in their workspaces" ON public.epics;
CREATE POLICY "Users can update epics in accessible workspaces" 
ON public.epics 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete epics in their workspaces" ON public.epics;
CREATE POLICY "Users can delete epics in accessible workspaces" 
ON public.epics 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- Update products policies
DROP POLICY IF EXISTS "Users can view products in their workspaces" ON public.products;
CREATE POLICY "Users can view products in accessible workspaces" 
ON public.products 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create products in their workspaces" ON public.products;
CREATE POLICY "Users can create products in accessible workspaces" 
ON public.products 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update products in their workspaces" ON public.products;
CREATE POLICY "Users can update products in accessible workspaces" 
ON public.products 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete products in their workspaces" ON public.products;
CREATE POLICY "Users can delete products in accessible workspaces" 
ON public.products 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- Update knowledge_items policies
DROP POLICY IF EXISTS "Users can view knowledge items in their workspaces" ON public.knowledge_items;
CREATE POLICY "Users can view knowledge items in accessible workspaces" 
ON public.knowledge_items 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create knowledge items in their workspaces" ON public.knowledge_items;
CREATE POLICY "Users can create knowledge items in accessible workspaces" 
ON public.knowledge_items 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update knowledge items in their workspaces" ON public.knowledge_items;
CREATE POLICY "Users can update knowledge items in accessible workspaces" 
ON public.knowledge_items 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete knowledge items in their workspaces" ON public.knowledge_items;
CREATE POLICY "Users can delete knowledge items in accessible workspaces" 
ON public.knowledge_items 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- Update notes policies
DROP POLICY IF EXISTS "Users can view notes in their workspaces" ON public.notes;
CREATE POLICY "Users can view notes in accessible workspaces" 
ON public.notes 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create notes in their workspaces" ON public.notes;
CREATE POLICY "Users can create notes in accessible workspaces" 
ON public.notes 
FOR INSERT 
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update notes in their workspaces" ON public.notes;
CREATE POLICY "Users can update notes in accessible workspaces" 
ON public.notes 
FOR UPDATE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete notes in their workspaces" ON public.notes;
CREATE POLICY "Users can delete notes in accessible workspaces" 
ON public.notes 
FOR DELETE 
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    UNION
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- Create function to check if user is workspace admin or owner
CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = user_id
    UNION
    SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = workspace_id AND wm.user_id = user_id AND wm.role = 'admin'
  );
$$;

-- Add trigger for updating timestamps
CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_invitations_updated_at
  BEFORE UPDATE ON public.workspace_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for workspace_members and workspace_invitations
ALTER TABLE public.workspace_members REPLICA IDENTITY FULL;
ALTER TABLE public.workspace_invitations REPLICA IDENTITY FULL;

-- Add workspace_members and workspace_invitations to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_invitations;