-- Create an enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Create a security definer function to check if a user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  );
$$;

-- Drop existing overly permissive policies on mixpanel_excluded_users
DROP POLICY IF EXISTS "Admin can delete excluded users" ON public.mixpanel_excluded_users;
DROP POLICY IF EXISTS "Admin can insert excluded users" ON public.mixpanel_excluded_users;
DROP POLICY IF EXISTS "Admin can update excluded users" ON public.mixpanel_excluded_users;
DROP POLICY IF EXISTS "Admin can view excluded users" ON public.mixpanel_excluded_users;

-- Create secure policies for mixpanel_excluded_users (admin only)
CREATE POLICY "Only admins can view excluded users" 
ON public.mixpanel_excluded_users 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can insert excluded users" 
ON public.mixpanel_excluded_users 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update excluded users" 
ON public.mixpanel_excluded_users 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Only admins can delete excluded users" 
ON public.mixpanel_excluded_users 
FOR DELETE 
USING (public.is_admin());

-- Drop existing overly permissive policies on mixpanel_exclusion_audit_log
DROP POLICY IF EXISTS "Admin can insert audit logs" ON public.mixpanel_exclusion_audit_log;
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.mixpanel_exclusion_audit_log;

-- Create secure policies for mixpanel_exclusion_audit_log (admin only)
CREATE POLICY "Only admins can view audit logs" 
ON public.mixpanel_exclusion_audit_log 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can insert audit logs" 
ON public.mixpanel_exclusion_audit_log 
FOR INSERT 
WITH CHECK (public.is_admin());

-- Insert the first admin user (you'll need to replace this UUID with your actual user ID)
-- This is commented out - you'll need to run this manually with your user ID
-- INSERT INTO public.user_roles (user_id, role, created_by) 
-- VALUES ('your-user-id-here', 'admin', 'your-user-id-here');