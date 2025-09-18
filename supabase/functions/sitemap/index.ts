import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sitemap...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Static pages with their priorities and change frequencies
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
      { url: 'pricing', priority: '0.9', changefreq: 'weekly' },
      { url: 'blog', priority: '0.8', changefreq: 'daily' },
      { url: 'faq', priority: '0.7', changefreq: 'monthly' },
      { url: 'contact', priority: '0.6', changefreq: 'monthly' },
      { url: 'keyboard-shortcuts', priority: '0.5', changefreq: 'monthly' },
      { url: 'refund-policy', priority: '0.4', changefreq: 'yearly' },
      { url: 'integrations', priority: '0.7', changefreq: 'weekly' },
      { url: 'integrations/cursor', priority: '0.8', changefreq: 'weekly' },
      { url: 'integrations/github', priority: '0.7', changefreq: 'weekly' },
      { url: 'integrations/figma', priority: '0.7', changefreq: 'weekly' },
      { url: 'integrations/lovable', priority: '0.7', changefreq: 'weekly' },
    ];

    // Fetch published blog posts
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
    }

    // Base URL for the site
    const baseUrl = 'https://ahead.love';
    const currentDate = new Date().toISOString();

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    for (const page of staticPages) {
      const url = page.url ? `${baseUrl}/${page.url}` : baseUrl;
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Add blog posts
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at || post.created_at;
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    console.log(`Generated sitemap with ${staticPages.length} static pages and ${blogPosts?.length || 0} blog posts`);

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a minimal sitemap on error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ahead.love</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(errorSitemap, {
      headers: corsHeaders,
      status: 200,
    });
  }
});