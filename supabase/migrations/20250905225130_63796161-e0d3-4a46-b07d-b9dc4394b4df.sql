-- Secure the kv_store_bd163058 table by adding RLS policies
-- This table appears to be a key-value configuration store that should only be accessible to admins

-- Enable Row Level Security on the kv_store table
ALTER TABLE public.kv_store_bd163058 ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to view configuration data
CREATE POLICY "Only admins can view configuration data" 
ON public.kv_store_bd163058 
FOR SELECT 
USING (public.is_admin());

-- Create policy to allow only admins to insert configuration data
CREATE POLICY "Only admins can insert configuration data" 
ON public.kv_store_bd163058 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Create policy to allow only admins to update configuration data
CREATE POLICY "Only admins can update configuration data" 
ON public.kv_store_bd163058 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create policy to allow only admins to delete configuration data
CREATE POLICY "Only admins can delete configuration data" 
ON public.kv_store_bd163058 
FOR DELETE 
USING (public.is_admin());

-- Add a comment to document the table's purpose and security model
COMMENT ON TABLE public.kv_store_bd163058 IS 'Key-value configuration store. Access restricted to administrators only for security purposes.';