-- Remove duplicate SEO articles, keeping only the first one (oldest) for each external_id

-- Delete related blog_post_categories first
DELETE FROM blog_post_categories 
WHERE post_id IN (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE sa.external_id IS NOT NULL
  AND bp.created_at NOT IN (
    SELECT MIN(bp2.created_at)
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id = sa.external_id
    GROUP BY sa2.external_id
  )
);

-- Delete duplicate posts, keeping only the oldest one for each external_id
DELETE FROM blog_posts 
WHERE id IN (
  SELECT bp.id
  FROM blog_posts bp
  JOIN seo_articles sa ON bp.seo_article_id = sa.id
  WHERE sa.external_id IS NOT NULL
  AND bp.created_at NOT IN (
    SELECT MIN(bp2.created_at)
    FROM blog_posts bp2
    JOIN seo_articles sa2 ON bp2.seo_article_id = sa2.id
    WHERE sa2.external_id = sa.external_id
    GROUP BY sa2.external_id
  )
);