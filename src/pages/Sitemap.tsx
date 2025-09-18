import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SitemapPage = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('Fetching sitemap from edge function...');
        
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET',
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(`Function error: ${error.message}`);
        }

        if (typeof data === 'string') {
          setSitemapXml(data);
        } else {
          console.error('Unexpected data type from sitemap function:', typeof data);
          throw new Error('Invalid sitemap format received');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching sitemap:', errorMessage);
        setError(errorMessage);
        
        // Fallback minimal sitemap
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ahead.love</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ahead.love/pricing</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://ahead.love/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
        setSitemapXml(fallbackSitemap);
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  // Set proper XML headers
  useEffect(() => {
    if (!loading && sitemapXml) {
      // Set the content type header for XML
      const response = new Response(sitemapXml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        }
      });
      
      // Replace the current page content with XML
      document.open();
      document.write(sitemapXml);
      document.close();
      
      // Set content type meta tag
      const metaContentType = document.createElement('meta');
      metaContentType.httpEquiv = 'Content-Type';
      metaContentType.content = 'application/xml; charset=utf-8';
      document.head.appendChild(metaContentType);
    }
  }, [loading, sitemapXml]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating sitemap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Sitemap generation failed, serving fallback:', error);
  }

  // For development/debugging, show a preview
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Sitemap XML</h1>
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded mb-4">
            <p><strong>Warning:</strong> {error}</p>
            <p>Serving fallback sitemap.</p>
          </div>
        )}
        <pre className="bg-muted p-4 rounded overflow-auto text-sm">
          <code>{sitemapXml}</code>
        </pre>
        <p className="text-muted-foreground mt-4 text-sm">
          In production, this will be served as pure XML with proper headers.
        </p>
      </div>
    );
  }

  // In production, this will be replaced by the XML content
  return null;
};

export default SitemapPage;