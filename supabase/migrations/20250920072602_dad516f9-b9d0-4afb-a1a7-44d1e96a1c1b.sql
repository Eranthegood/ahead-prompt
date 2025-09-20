-- Remove duplicate SEO articles, keeping only the first one for each external_id

-- Delete blog post categories for duplicate posts first
DELETE FROM blog_post_categories 
WHERE post_id IN (
  -- Keep the first blog post for each seo_article and delete the rest
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE bp.id NOT IN (
    -- Get the first blog post id for each external_id (oldest created_at)
    SELECT DISTINCT ON (sa.external_id) bp2.id
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id IS NOT NULL
    ORDER BY sa2.external_id, bp2.created_at ASC
  )
  AND sa.external_id IS NOT NULL
);

-- Delete duplicate blog posts, keeping only the first one for each external_id
DELETE FROM blog_posts 
WHERE id IN (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE bp.id NOT IN (
    -- Get the first blog post id for each external_id (oldest created_at)
    SELECT DISTINCT ON (sa.external_id) bp2.id
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id IS NOT NULL
    ORDER BY sa2.external_id, bp2.created_at ASC
  )
  AND sa.external_id IS NOT NULL
);