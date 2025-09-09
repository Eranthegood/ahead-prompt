-- Add price and inventory_count fields to products table
ALTER TABLE public.products 
ADD COLUMN price DECIMAL(10,2) NULL,
ADD COLUMN inventory_count INTEGER NULL DEFAULT 0;