-- Add product_id and category columns to knowledge_items table
ALTER TABLE public.knowledge_items 
ADD COLUMN product_id UUID,
ADD COLUMN category TEXT DEFAULT 'general';

-- Add index for better performance on product-specific queries
CREATE INDEX idx_knowledge_items_product_id ON public.knowledge_items(product_id);
CREATE INDEX idx_knowledge_items_category ON public.knowledge_items(category);

-- Create check constraint for valid categories
ALTER TABLE public.knowledge_items 
ADD CONSTRAINT check_valid_category 
CHECK (category IN ('general', 'technical', 'design', 'business', 'api', 'practices'));

-- Update RLS policies to include product access
DROP POLICY IF EXISTS "Users can view knowledge items in their workspaces" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can create knowledge items in their workspaces" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can update knowledge items in their workspaces" ON public.knowledge_items;
DROP POLICY IF EXISTS "Users can delete knowledge items in their workspaces" ON public.knowledge_items;

-- Recreate policies with product support
CREATE POLICY "Users can view knowledge items in their workspaces" 
ON public.knowledge_items 
FOR SELECT 
USING (workspace_id IN ( 
  SELECT workspaces.id FROM workspaces WHERE (workspaces.owner_id = auth.uid())
));

CREATE POLICY "Users can create knowledge items in their workspaces" 
ON public.knowledge_items 
FOR INSERT 
WITH CHECK (workspace_id IN ( 
  SELECT workspaces.id FROM workspaces WHERE (workspaces.owner_id = auth.uid())
));

CREATE POLICY "Users can update knowledge items in their workspaces" 
ON public.knowledge_items 
FOR UPDATE 
USING (workspace_id IN ( 
  SELECT workspaces.id FROM workspaces WHERE (workspaces.owner_id = auth.uid())
));

CREATE POLICY "Users can delete knowledge items in their workspaces" 
ON public.knowledge_items 
FOR DELETE 
USING (workspace_id IN ( 
  SELECT workspaces.id FROM workspaces WHERE (workspaces.owner_id = auth.uid())
));