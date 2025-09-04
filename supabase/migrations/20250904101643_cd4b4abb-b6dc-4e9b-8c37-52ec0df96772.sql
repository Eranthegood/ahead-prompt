-- Add order_index column to products table for drag and drop ordering
ALTER TABLE public.products 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing products to have sequential order_index values based on created_at
UPDATE public.products 
SET order_index = row_number() OVER (PARTITION BY workspace_id ORDER BY created_at ASC) - 1
WHERE order_index = 0;

-- Create index for better performance when ordering
CREATE INDEX idx_products_workspace_order ON public.products(workspace_id, order_index);