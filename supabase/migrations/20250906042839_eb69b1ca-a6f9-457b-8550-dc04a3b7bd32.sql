-- Fix user_roles table infinite recursion issue
-- The current policy is causing infinite recursion by querying user_roles within its own policy
-- We'll use the existing is_admin function to prevent this

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Create new policies using the existing is_admin security definer function
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Keep the existing policy for users to view their own roles
-- This one is fine as it doesn't cause recursion