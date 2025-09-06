-- Fix profiles table RLS policies to ensure proper access control
-- Remove the overly restrictive policy that could cause issues
DROP POLICY IF EXISTS "Deny all anonymous access to profiles" ON public.profiles;

-- Ensure we have proper policies for authenticated users only
-- The existing "Authenticated users can view their own profile" policy should be sufficient
-- But let's make sure all policies are properly configured

-- Update the SELECT policy to be more explicit about authentication requirement
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Update the INSERT policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update the UPDATE policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Update the DELETE policy to be more explicit
DROP POLICY IF EXISTS "Authenticated users can delete their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- Add a restrictive policy that specifically blocks anonymous access
-- This is safer than the previous "ALL" policy
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false);