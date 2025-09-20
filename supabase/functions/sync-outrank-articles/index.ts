import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutrankArticle {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string;
  image_url: string;
  slug: string;
  tags: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`Sync Outrank articles: ${req.method} ${req.url}`);

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the first workspace and its owner for blog posts
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, owner_id')
      .limit(1)
      .single();

    if (!workspace) {
      console.error('No workspace found - cannot create blog posts');
      return new Response(
        JSON.stringify({ error: 'No workspace available for blog posts' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Using workspace: ${workspace.id} with owner: ${workspace.owner_id}`);

    // Mock articles data - simplified version
    const mockArticles: OutrankArticle[] = [
      {
        id: "65bb72af-1eb7-423d-98aa-8c3dbb27f423",
        title: "Create an Effective Design Document Template",
        content_markdown: "A design document template is your secret weapon for a successful project. Think of it as a standardized, reusable framework that your team fills out before a single line of code gets written. This establishes a single source of truth that aligns the entire team.",
        content_html: "<h1>Create an Effective Design Document Template</h1><p>A design document template is your secret weapon for a successful project. Think of it as a standardized, reusable framework that your team fills out before a single line of code gets written.</p><p>This establishes a single source of truth that aligns the entire team.</p>",
        meta_description: "Learn how to create an effective design document template that streamlines projects and prevents scope creep.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/design-document-template.jpg",
        slug: "create-effective-design-document-template",
        tags: ["project-management", "documentation", "team-collaboration"]
      },
      {
        id: "77654073-e79c-424e-b2df-fc17607c9a79",
        title: "Build a Powerful AI Prompt Library for Your Team",
        content_markdown: "Building an AI prompt library is one of the smartest investments your team can make in 2024. With AI tools becoming essential for everything from content creation to code generation, having a centralized collection of proven prompts can dramatically improve consistency, quality, and productivity.",
        content_html: "<h1>Build a Powerful AI Prompt Library for Your Team</h1><p>Building an AI prompt library is one of the smartest investments your team can make in 2024. With AI tools becoming essential for everything from content creation to code generation, having a centralized collection of proven prompts can dramatically improve consistency, quality, and productivity.</p>",
        meta_description: "Learn how to build and manage a powerful AI prompt library that improves team consistency and productivity.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/ai-prompt-library.jpg",
        slug: "build-powerful-ai-prompt-library-team",
        tags: ["artificial-intelligence", "prompt-engineering", "team-productivity"]
      },
      {
        id: "b357bbe6-d806-434c-80a7-6cb071d36c8b",
        title: "12 Best AI Workflow Automation Tools for 2025",
        content_markdown: "The AI workflow automation landscape is evolving rapidly, and 2025 brings unprecedented opportunities to streamline your business processes. Whether you're looking to automate repetitive tasks, enhance decision-making, or create sophisticated multi-step workflows, the right AI tools can transform how your team operates.",
        content_html: "<h1>12 Best AI Workflow Automation Tools for 2025</h1><p>The AI workflow automation landscape is evolving rapidly, and 2025 brings unprecedented opportunities to streamline your business processes. Whether you're looking to automate repetitive tasks, enhance decision-making, or create sophisticated multi-step workflows, the right AI tools can transform how your team operates.</p>",
        meta_description: "Discover the 12 best AI workflow automation tools for 2025. Compare features, pricing, and use cases.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/ai-workflow-automation.jpg",
        slug: "best-ai-workflow-automation-tools-2025",
        tags: ["workflow-automation", "artificial-intelligence", "productivity-tools"]
      },
      {
        id: "e3d790cf-d8a2-4793-b77d-07736cfb430f",
        title: "Your Guide to a Product Requirements Document Template",
        content_markdown: "A Product Requirements Document (PRD) template is the foundation of successful product development. It transforms abstract ideas into concrete specifications that engineers, designers, and stakeholders can rally behind. Without a solid PRD, even the most innovative product concepts can derail into confusion, scope creep, and missed deadlines.",
        content_html: "<h1>Your Guide to a Product Requirements Document Template</h1><p>A Product Requirements Document (PRD) template is the foundation of successful product development. It transforms abstract ideas into concrete specifications that engineers, designers, and stakeholders can rally behind.</p><p>Without a solid PRD, even the most innovative product concepts can derail into confusion, scope creep, and missed deadlines.</p>",
        meta_description: "Master product requirements documentation with our comprehensive PRD template guide and best practices.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/product-requirements-document.jpg",
        slug: "product-requirements-document-template-guide",
        tags: ["product-management", "requirements-documentation", "project-planning"]
      }
    ];

    const processedArticles = [];
    const errors = [];

    // Process each mock article
    for (const article of mockArticles) {
      try {
        console.log(`Processing article: ${article.title} (ID: ${article.id})`);

        // Store article in seo_articles table
        const { data: seoArticle, error: seoError } = await supabase
          .from('seo_articles')
          .upsert({
            external_id: article.id,
            title: article.title,
            content: article.content_markdown,
            content_html: article.content_html,
            meta_description: article.meta_description,
            image_url: article.image_url,
            slug: article.slug,
            tags: article.tags || [],
            source: 'outrank',
            created_at: article.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'external_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (seoError) {
          console.error('Error storing SEO article:', seoError);
          errors.push({
            article_id: article.id,
            error: `SEO article error: ${seoError.message}`
          });
          continue;
        }

        console.log(`SEO article stored successfully: ${seoArticle.id}`);

        // Generate unique slug for blog post
        const { data: uniqueSlug, error: slugError } = await supabase
          .rpc('generate_unique_blog_slug', {
            base_title: article.title,
            workspace_uuid: workspace.id
          });

        if (slugError || !uniqueSlug) {
          console.error('Error generating unique slug:', slugError);
          errors.push({
            article_id: article.id,
            error: `Slug generation error: ${slugError?.message || 'Unknown error'}`
          });
          continue;
        }

        console.log(`Generated unique slug: ${uniqueSlug}`);

        // Create blog post and auto-publish it
        const { data: blogPost, error: blogError } = await supabase
          .from('blog_posts')
          .upsert({
            title: article.title,
            slug: uniqueSlug,
            content: article.content_html,
            excerpt: article.meta_description || article.content_markdown?.substring(0, 160) || '',
            featured_image_url: article.image_url,
            status: 'published',
            published_at: new Date().toISOString(),
            author_id: workspace.owner_id,
            workspace_id: workspace.id,
            seo_article_id: seoArticle.id,
            meta_description: article.meta_description,
            keywords: article.tags || [],
            created_at: article.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'slug',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (blogError) {
          console.error('Error creating blog post:', blogError);
          errors.push({
            article_id: article.id,
            error: `Blog post error: ${blogError.message}`
          });
        } else {
          console.log(`Blog post published successfully: ${blogPost.title} (${blogPost.slug})`);
          
          // Assign SEO category to the blog post
          const { data: seoCategory } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'seo')
            .eq('workspace_id', workspace.id)
            .maybeSingle();

          if (seoCategory) {
            await supabase
              .from('blog_post_categories')
              .upsert({
                post_id: blogPost.id,
                category_id: seoCategory.id
              }, {
                onConflict: 'post_id,category_id',
                ignoreDuplicates: true
              });
          }
        }

        processedArticles.push({
          external_id: article.id,
          title: article.title,
          status: 'processed'
        });

        console.log(`Successfully processed article: ${article.title}`);

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        errors.push({
          article_id: article.id,
          error: articleError.message
        });
      }
    }

    console.log(`Sync complete. Processed: ${processedArticles.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'Articles synced successfully',
        processed_articles: processedArticles.length,
        errors: errors.length,
        articles: processedArticles,
        details: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Sync processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});