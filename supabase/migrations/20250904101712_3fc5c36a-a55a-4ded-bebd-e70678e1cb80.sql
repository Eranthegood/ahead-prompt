-- Add order_index column to products table for drag and drop ordering
ALTER TABLE public.products 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing products to have sequential order_index values based on created_at
-- Using a CTE to work around window function limitation in UPDATE
WITH ranked_products AS (
  SELECT id, 
         row_number() OVER (PARTITION BY workspace_id ORDER BY created_at ASC) - 1 AS new_order_index
  FROM public.products 
  WHERE order_index = 0
)
UPDATE public.products 
SET order_index = ranked_products.new_order_index
FROM ranked_products
WHERE products.id = ranked_products.id;

-- Create index for better performance when ordering
CREATE INDEX idx_products_workspace_order ON public.products(workspace_id, order_index);