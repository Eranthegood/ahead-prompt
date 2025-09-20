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

interface OutrankWebhookPayload {
  event_type: string;
  timestamp: string;
  data: {
    articles: OutrankArticle[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`Outrank webhook received: ${req.method} ${req.url}`);

  if (req.method !== 'POST') {
    console.log('Invalid method, expected POST');
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Validate access token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Invalid access token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.split(' ')[1];
    const expectedToken = Deno.env.get('OUTRANK_ACCESS_TOKEN');
    
    if (!expectedToken || token !== expectedToken) {
      console.log('Access token validation failed');
      return new Response(
        JSON.stringify({ error: 'Invalid access token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse webhook payload
    const payload: OutrankWebhookPayload = await req.json();
    console.log('Webhook payload received:', JSON.stringify(payload, null, 2));

    // Validate event type
    if (payload.event_type !== 'publish_articles') {
      console.log(`Unsupported event type: ${payload.event_type}`);
      return new Response(
        JSON.stringify({ error: 'Unsupported event type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const processedArticles = [];
    const errors = [];

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

    // Process each article
    for (const article of payload.data.articles) {
      try {
        console.log(`Processing article: ${article.title} (ID: ${article.id})`);

        // Store article in seo_articles table with all fields
        const { data: seoArticle, error: seoError } = await supabase
          .from('seo_articles')
          .upsert({
            external_id: article.id,
            title: article.title,
            content_markdown: article.content_markdown,
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
            status: 'published', // Auto-publish Outrank articles
            published_at: new Date().toISOString(),
            author_id: workspace.owner_id,
            workspace_id: workspace.id,
            seo_article_id: seoArticle.id,
            meta_description: article.meta_description,
            keywords: article.tags || [],
            created_at: article.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'slug,workspace_id',
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

    // Log the webhook activity
    await supabase
      .from('webhook_logs')
      .insert({
        source: 'outrank',
        event_type: payload.event_type,
        payload: payload,
        status: errors.length === 0 ? 'success' : 'partial_success',
        processed_count: processedArticles.length,
        error_count: errors.length,
        errors: errors.length > 0 ? errors : null,
        created_at: new Date().toISOString()
      });

    console.log(`Webhook processing complete. Processed: ${processedArticles.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'Webhook processed successfully',
        processed_articles: processedArticles.length,
        errors: errors.length,
        details: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    
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