-- Create the missing blog post from September 13th SEO article
DO $$
DECLARE
    workspace_uuid uuid;
    seo_category_uuid uuid;
    seo_article_uuid uuid := '0f7a6b53-9cb3-4792-9ba9-d22bc7151847';
    article_content text;
    article_title text;
BEGIN
    -- Get the first workspace (assuming single user setup)
    SELECT id INTO workspace_uuid FROM workspaces LIMIT 1;
    
    -- Create SEO category if it doesn't exist
    INSERT INTO blog_categories (name, slug, description, workspace_id, color)
    VALUES ('SEO', 'seo', 'Articles générés automatiquement par SEO', workspace_uuid, '#10B981')
    ON CONFLICT DO NOTHING;
    
    -- Get the SEO category ID
    SELECT id INTO seo_category_uuid FROM blog_categories WHERE slug = 'seo' AND workspace_id = workspace_uuid;
    
    -- Get the SEO article content and title
    SELECT content INTO article_content FROM seo_articles WHERE id = seo_article_uuid;
    
    -- Extract title from content (between <h1> tags)
    article_title := substring(article_content from '<h1>(.*?)</h1>');
    IF article_title IS NULL THEN
        article_title := 'Prompt Management Mastery: How to Optimize AI Interactions for Maximum Business Value';
    END IF;
    
    -- Create the blog post
    INSERT INTO blog_posts (
        title,
        slug,
        content,
        excerpt,
        status,
        workspace_id,
        author_id,
        seo_article_id,
        meta_description,
        keywords
    ) VALUES (
        article_title,
        'prompt-management-mastery-optimize-ai-interactions-business-value',
        article_content,
        'Découvrez comment optimiser vos interactions IA pour maximiser la valeur business. Guide complet sur la gestion des prompts, techniques avancées et meilleures pratiques.',
        'published',
        workspace_uuid,
        (SELECT owner_id FROM workspaces WHERE id = workspace_uuid),
        seo_article_uuid,
        'Guide complet sur la gestion des prompts IA : techniques d''optimisation, meilleures pratiques et stratégies pour maximiser le ROI de vos interactions avec les LLM.',
        ARRAY['prompt management', 'IA', 'LLM', 'optimisation', 'business value', 'GPT-4', 'Claude', 'intelligence artificielle']
    );
    
    -- Link the blog post to the SEO category
    INSERT INTO blog_post_categories (post_id, category_id)
    SELECT bp.id, seo_category_uuid
    FROM blog_posts bp
    WHERE bp.seo_article_id = seo_article_uuid;
    
    RAISE NOTICE 'Blog post created successfully from SEO article';
    
END $$;