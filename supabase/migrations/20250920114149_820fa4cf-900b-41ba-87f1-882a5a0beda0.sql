-- Add content_html field to blog_posts table to store rendered HTML
ALTER TABLE public.blog_posts 
ADD COLUMN content_html TEXT;