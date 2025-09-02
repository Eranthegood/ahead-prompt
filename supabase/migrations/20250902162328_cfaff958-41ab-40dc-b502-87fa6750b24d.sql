-- Update the handle_new_user function to sync with Loops
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_profile_record public.profiles%ROWTYPE;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    provider
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_app_meta_data ->> 'provider'
  )
  RETURNING * INTO new_profile_record;

  -- Async call to sync with Loops (using pg_net extension)
  -- This will not block the signup process if it fails
  PERFORM net.http_post(
    url := 'https://fkpbdzluddeqsfvacozw.supabase.co/functions/v1/sync-to-loops',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGJkemx1ZGRlcXNmdmFjb3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjYzOTYsImV4cCI6MjA3MjI0MjM5Nn0.-qO_uoXr6elt06BLqj6r5zmprCKHF043TdMZOeOWxxA"}'::jsonb,
    body := json_build_object(
      'user', row_to_json(NEW),
      'profile', row_to_json(new_profile_record)
    )::jsonb
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;