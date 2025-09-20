-- Fix seo_articles table schema by adding missing columns
ALTER TABLE public.seo_articles 
ADD COLUMN IF NOT EXISTS content_html TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create webhook_logs table for tracking webhook activities
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  processed_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for webhook_logs (only admins can view)
CREATE POLICY "Only admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (is_admin());

-- Create policy for webhook_logs (system can insert)  
CREATE POLICY "System can create webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (true);

-- Create a function to generate unique slug for blog posts
CREATE OR REPLACE FUNCTION public.generate_unique_blog_slug(base_title TEXT, workspace_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from title
  base_slug := lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(base_title, '[àáâãäå]', 'a', 'g'),
          '[èéêë]', 'e', 'g'
        ),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  WHILE EXISTS (
    SELECT 1 FROM blog_posts 
    WHERE slug = final_slug AND workspace_id = workspace_uuid
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;