-- Remove duplicate SEO articles, keeping only the first one for each external_id

-- First, let's create a temporary table with the IDs to keep
WITH posts_to_keep AS (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE sa.external_id IS NOT NULL
  AND bp.id IN (
    SELECT MIN(bp2.id)
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id = sa.external_id
    GROUP BY sa2.external_id
  )
),
posts_to_delete AS (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE sa.external_id IS NOT NULL
  AND bp.id NOT IN (SELECT id FROM posts_to_keep)
)

-- Delete blog post categories for duplicate posts first
DELETE FROM blog_post_categories 
WHERE post_id IN (SELECT id FROM posts_to_delete);

-- Delete duplicate blog posts
WITH posts_to_keep AS (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE sa.external_id IS NOT NULL
  AND bp.id IN (
    SELECT MIN(bp2.id)
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id = sa.external_id
    GROUP BY sa2.external_id
  )
)
DELETE FROM blog_posts 
WHERE seo_article_id IS NOT NULL 
AND id NOT IN (SELECT id FROM posts_to_keep);