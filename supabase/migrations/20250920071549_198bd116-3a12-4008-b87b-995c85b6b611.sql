-- Create SEO category for Outrank articles
INSERT INTO blog_categories (name, slug, description, color, workspace_id)
SELECT 'SEO', 'seo', 'Articles optimisés pour le référencement', '#10B981', id
FROM workspaces 
WHERE owner_id IN (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT (slug, workspace_id) DO NOTHING;