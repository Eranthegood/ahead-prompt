-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view products in their workspaces"
ON public.products
FOR SELECT
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can create products in their workspaces"
ON public.products
FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can update products in their workspaces"
ON public.products
FOR UPDATE
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can delete products in their workspaces"
ON public.products
FOR DELETE
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

-- Add product_id to epics table
ALTER TABLE public.epics ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE CASCADE;

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_workspace_id ON public.products(workspace_id);
CREATE INDEX idx_epics_product_id ON public.epics(product_id);

-- Insert sample products for existing workspaces (optional)
INSERT INTO public.products (workspace_id, name, description, color)
SELECT 
  id as workspace_id,
  'Produit Principal' as name,
  'Premier produit de ce workspace' as description,
  '#3B82F6' as color
FROM public.workspaces;