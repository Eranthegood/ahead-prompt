-- Fix published_at for existing published articles
UPDATE blog_posts 
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published' AND published_at IS NULL;