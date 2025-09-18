import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StringArticle {
  id: string
  title: string
  content?: string
  html_content?: string
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
        // Generate external_id from title if not provided
        const externalId = article.id || `string-${Date.now()}-${article.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`
        
        // Store article in knowledge base or dedicated table
        const content = article.html_content || article.content || ''
        const articleData = {
          external_id: externalId,
          title: article.title,
          content: content,
          meta_description: article.meta_description,
          keywords: article.keywords || [],
          url: article.url,
          published_at: article.published_at ? new Date(article.published_at).toISOString() : null,
          status: article.status || 'draft',
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
          .maybeSingle()

        if (seoError) {
          console.error('Error storing SEO article:', seoError)
          throw seoError
        }

        console.log('SEO article stored successfully:', seoArticle?.id)

        // Auto-create blog post from SEO article with enhanced error handling
        if (seoArticle) {
          try {
            console.log('Starting blog post creation process...')
            
            // Get the first available workspace
            const { data: workspaces, error: workspaceError } = await supabase
              .from('workspaces')
              .select('id, name, owner_id')
              .limit(1)

            if (workspaceError) {
              console.error('Error fetching workspaces:', workspaceError)
              throw new Error(`Failed to fetch workspace: ${workspaceError.message}`)
            }

            let workspace = workspaces?.[0]

            // If no workspace exists, create a default one (this should rarely happen)
            if (!workspace) {
              console.log('No workspace found, creating default workspace')
              const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1)

              if (profileError) {
                console.error('Error fetching profiles:', profileError)
                throw new Error(`Failed to fetch profiles: ${profileError.message}`)
              }

              if (profiles?.[0]) {
                const { data: newWorkspace, error: createWorkspaceError } = await supabase
                  .from('workspaces')
                  .insert({
                    name: 'Default Workspace',
                    owner_id: profiles[0].id
                  })
                  .select()
                  .single()
                
                if (createWorkspaceError) {
                  console.error('Error creating workspace:', createWorkspaceError)
                  throw new Error(`Failed to create workspace: ${createWorkspaceError.message}`)
                }
                
                workspace = newWorkspace
                console.log('Default workspace created:', workspace.id)
              } else {
                throw new Error('No profiles available to create workspace')
              }
            }

            if (!workspace) {
              throw new Error('No workspace available for blog post creation')
            }

            console.log(`Using workspace: ${workspace.name} (${workspace.id}) with owner ${workspace.owner_id}`)
            
            // Create blog post
            const blogPostData = {
              title: article.title,
              slug: null, // Will be auto-generated
              excerpt: article.meta_description || `Article SEO importé depuis String.com`,
              content: content,
              featured_image_url: null,
              meta_description: article.meta_description,
              keywords: article.keywords || [],
              status: 'draft', // Start as draft for review
              author_id: workspace.owner_id,
              seo_article_id: seoArticle.id,
              workspace_id: workspace.id
            }

            console.log('Creating blog post with data:', { 
              title: blogPostData.title, 
              workspace_id: blogPostData.workspace_id,
              author_id: blogPostData.author_id,
              seo_article_id: blogPostData.seo_article_id
            })

            const { data: blogPost, error: blogError } = await supabase
              .from('blog_posts')
              .upsert(blogPostData, {
                onConflict: 'seo_article_id',
                ignoreDuplicates: false
              })
              .select()
              .maybeSingle()

            if (blogError) {
              console.error('Error creating blog post:', blogError)
              console.error('Blog post data that failed:', JSON.stringify(blogPostData, null, 2))
              
              // Log detailed error to webhook logs
              await supabase
                .from('webhook_logs')
                .insert({
                  source: 'string.com',
                  event_type: 'blog_post_creation_failed',
                  payload: { 
                    article_id: article.id, 
                    seo_article_id: seoArticle.id,
                    blog_post_data: blogPostData,
                    error: blogError.message 
                  },
                  status: 'error',
                  error_message: `Blog post creation failed: ${blogError.message}`,
                  created_at: new Date().toISOString()
                })
              
              // Still continue processing since SEO article was saved
            } else if (blogPost) {
              console.log(`Blog post created successfully: ${blogPost.title} (ID: ${blogPost.id})`)
              
              // Try to assign to a "SEO" category if it exists, or create it
              let { data: seoCategory } = await supabase
                .from('blog_categories')
                .select('id')
                .eq('slug', 'seo')
                .eq('workspace_id', workspace.id)
                .maybeSingle()

              // Create SEO category if it doesn't exist
              if (!seoCategory) {
                const { data: newCategory } = await supabase
                  .from('blog_categories')
                  .insert({
                    name: 'SEO',
                    slug: 'seo',
                    description: 'Articles SEO importés depuis String.com',
                    color: '#10B981',
                    workspace_id: workspace.id
                  })
                  .select()
                  .single()
                
                seoCategory = newCategory
              }

              // Assign blog post to SEO category
              if (seoCategory) {
                await supabase
                  .from('blog_post_categories')
                  .upsert({
                    post_id: blogPost.id,
                    category_id: seoCategory.id
                  }, {
                    onConflict: 'post_id,category_id',
                    ignoreDuplicates: true
                  })
                
                console.log(`Blog post assigned to SEO category`)
              }
            } else {
              console.log('Blog post upsert returned no data (possibly already exists)')
            }
            
          } catch (blogPostError) {
            console.error('Blog post creation process failed:', blogPostError)
            
            // Log blog post creation failure
            await supabase
              .from('webhook_logs')
              .insert({
                source: 'string.com',
                event_type: 'blog_post_creation_error',
                payload: { 
                  article_id: article.id,
                  seo_article_id: seoArticle?.id,
                  error_details: blogPostError.message,
                  stack_trace: blogPostError.stack
                },
                status: 'error',
                error_message: `Blog post creation failed: ${blogPostError.message}`,
                created_at: new Date().toISOString()
              })
            
            // Don't fail the entire webhook since SEO article was stored successfully
            console.log('Continuing despite blog post creation failure...')
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