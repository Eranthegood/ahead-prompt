-- Fix security warnings by setting search_path on functions
DROP FUNCTION IF EXISTS public.calculate_level(INTEGER);
DROP FUNCTION IF EXISTS public.ensure_user_stats(UUID);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(1, (xp / 100) + 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_stats(p_user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;