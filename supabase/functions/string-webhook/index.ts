import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StringArticle {
  id: string
  title: string
  content: string
  meta_description?: string
  keywords?: string[]
  url?: string
  published_at?: string
  status: string
  seo_score?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('String.com webhook received:', req.method, req.url)

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse webhook payload
    const payload = await req.json()
    console.log('Webhook payload:', payload)

    // Validate webhook (you might want to add signature verification here)
    if (!payload.article && !payload.articles) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: missing article data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle single article or multiple articles
    const articles: StringArticle[] = payload.articles || [payload.article]
    const processedArticles = []

    for (const article of articles) {
      try {
        // Store article in knowledge base or dedicated table
        const articleData = {
          external_id: article.id,
          title: article.title,
          content: article.content,
          meta_description: article.meta_description,
          keywords: article.keywords || [],
          url: article.url,
          published_at: article.published_at ? new Date(article.published_at).toISOString() : null,
          status: article.status,
          seo_score: article.seo_score,
          source: 'string.com',
          webhook_received_at: new Date().toISOString(),
          metadata: {
            original_payload: article
          }
        }

        // Store SEO article first
        const { data: seoArticle, error: seoError } = await supabase
          .from('seo_articles')
          .upsert(articleData, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()
          .single()

        if (seoError) {
          console.error('Error storing SEO article:', seoError)
          throw seoError
        }

        // Auto-create blog post from SEO article if it's published
        if (article.status === 'published' && seoArticle) {
          // Get or create default workspace (you might want to customize this)
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('*')
            .limit(1)

          if (workspaces && workspaces.length > 0) {
            const workspace = workspaces[0]
            
            // Create blog post
            const blogPostData = {
              title: article.title,
              slug: null, // Will be auto-generated
              excerpt: article.meta_description,
              content: article.content,
              featured_image_url: null,
              meta_description: article.meta_description,
              keywords: article.keywords || [],
              status: 'draft', // Start as draft for review
              author_id: workspace.owner_id,
              seo_article_id: seoArticle.id,
              workspace_id: workspace.id
            }

            const { data: blogPost, error: blogError } = await supabase
              .from('blog_posts')
              .upsert(blogPostData, {
                onConflict: 'seo_article_id',
                ignoreDuplicates: false
              })
              .select()
              .single()

            if (blogError) {
              console.error('Error creating blog post:', blogError)
              // Don't throw here, SEO article creation was successful
            } else {
              console.log(`Blog post created: ${blogPost.title}`)
              
              // Try to assign to a "SEO" category if it exists
              const { data: seoCategory } = await supabase
                .from('blog_categories')
                .select('id')
                .eq('slug', 'seo')
                .eq('workspace_id', workspace.id)
                .single()

              if (seoCategory) {
                await supabase
                  .from('blog_post_categories')
                  .upsert({
                    post_id: blogPost.id,
                    category_id: seoCategory.id
                  })
              }
            }
          }
        }

        processedArticles.push(seoArticle)

        console.log(`Successfully processed article: ${article.title}`)

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError)
        // Continue processing other articles even if one fails
      }
    }

    // Log webhook activity
    await supabase
      .from('webhook_logs')
      .insert({
        source: 'string.com',
        event_type: 'article_received',
        payload: payload,
        processed_count: processedArticles.length,
        status: 'success',
        created_at: new Date().toISOString()
      })
      .select()

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_articles: processedArticles.length,
        message: `Successfully processed ${processedArticles.length} articles from String.com`
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)

    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('webhook_logs')
      .insert({
        source: 'string.com',
        event_type: 'article_received',
        payload: null,
        processed_count: 0,
        status: 'error',
        error_message: error.message,
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})