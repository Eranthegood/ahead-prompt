-- Fix search_path security warnings for database functions
-- Set proper search_path for all functions to improve security

-- Fix generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[àáâãäå]', 'a', 'g'),
        '[èéêë]', 'e', 'g'
      ),
      '[^a-z0-9\s-]', '', 'g'
    )
  );
END;
$function$;

-- Fix calculate_reading_time function
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  word_count INTEGER;
  reading_speed INTEGER := 200; -- words per minute
BEGIN
  -- Count words (approximate)
  word_count := array_length(string_to_array(trim(content), ' '), 1);
  RETURN GREATEST(1, ROUND(word_count::NUMERIC / reading_speed));
END;
$function$;

-- Fix calculate_level function (already has search_path but ensure consistency)
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN GREATEST(1, (xp / 100) + 1);
END;
$function$;

-- Fix ensure_user_stats function (already has search_path but ensure consistency)
CREATE OR REPLACE FUNCTION public.ensure_user_stats(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;