-- Créer manuellement le blog post à partir de l'article SEO existant
INSERT INTO public.blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  meta_description, 
  keywords, 
  status, 
  author_id, 
  workspace_id,
  seo_article_id
)
SELECT 
  sa.title,
  LOWER(REGEXP_REPLACE(REGEXP_REPLACE(sa.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as slug,
  COALESCE(sa.meta_description, 'Article SEO importé depuis String.com') as excerpt,
  sa.content,
  sa.meta_description,
  sa.keywords,
  'draft' as status,
  w.owner_id as author_id,
  w.id as workspace_id,
  sa.id as seo_article_id
FROM seo_articles sa
CROSS JOIN (
  SELECT id, owner_id 
  FROM workspaces 
  WHERE owner_id = 'c6626a43-6d65-4ad4-bc80-ab41680854c4' 
  LIMIT 1
) w
WHERE sa.external_id = 'string-1757410858994-master-prompt-management-in-generative-ai'
AND NOT EXISTS (
  SELECT 1 FROM blog_posts bp WHERE bp.seo_article_id = sa.id
);

-- Créer la catégorie SEO si elle n'existe pas
INSERT INTO public.blog_categories (name, slug, description, color, workspace_id)
SELECT 
  'SEO',
  'seo',
  'Articles SEO importés depuis String.com',
  '#10B981',
  w.id
FROM (
  SELECT id 
  FROM workspaces 
  WHERE owner_id = 'c6626a43-6d65-4ad4-bc80-ab41680854c4' 
  LIMIT 1
) w
WHERE NOT EXISTS (
  SELECT 1 FROM blog_categories bc 
  WHERE bc.slug = 'seo' AND bc.workspace_id = w.id
);

-- Associer le blog post à la catégorie SEO
INSERT INTO public.blog_post_categories (post_id, category_id)
SELECT bp.id, bc.id
FROM blog_posts bp
JOIN blog_categories bc ON bc.slug = 'seo' AND bc.workspace_id = bp.workspace_id
JOIN seo_articles sa ON sa.id = bp.seo_article_id
WHERE sa.external_id = 'string-1757410858994-master-prompt-management-in-generative-ai'
AND NOT EXISTS (
  SELECT 1 FROM blog_post_categories bpc 
  WHERE bpc.post_id = bp.id AND bpc.category_id = bc.id
);