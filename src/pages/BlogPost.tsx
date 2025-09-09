import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BlogPostCard, BlogPost } from '@/components/Blog/BlogPost';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);

      // Fetch the post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories(
            category_id,
            blog_categories(
              id,
              name,
              slug,
              color
            )
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (postError) throw postError;

      const formattedPost = {
        ...postData,
        categories: postData.blog_post_categories?.map((bpc: any) => bpc.blog_categories) || [],
        author: undefined // Pas d'info auteur pour le moment
      };

      setPost(formattedPost);

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: postData.view_count + 1 })
        .eq('id', postData.id);

      // Fetch related posts
      if (postData.blog_post_categories?.length > 0) {
        const categoryIds = postData.blog_post_categories.map((bpc: any) => bpc.category_id);
        
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_post_categories!inner(
              category_id,
              blog_categories(
                id,
                name,
                slug,
                color
              )
            )
          `)
          .eq('status', 'published')
          .neq('id', postData.id)
          .in('blog_post_categories.category_id', categoryIds)
          .order('published_at', { ascending: false })
          .limit(3);

        if (relatedData) {
          const formattedRelated = relatedData.map(post => ({
            ...post,
            categories: post.blog_post_categories?.map((bpc: any) => bpc.blog_categories) || [],
            author: undefined // Pas d'info auteur pour le moment
          }));
          setRelatedPosts(formattedRelated);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Article not found",
        variant: "destructive"
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
          try {
            await navigator.clipboard.writeText(url);
            toast({ title: "Link copied", description: "The link has been copied to clipboard" });
            return;
          } catch (error) {
            toast({ title: "Error", description: "Unable to copy link", variant: "destructive" });
            return;
          }
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-muted h-8 w-32 rounded"></div>
            <div className="bg-muted h-12 w-3/4 rounded"></div>
            <div className="bg-muted h-64 w-full rounded"></div>
            <div className="space-y-4">
              <div className="bg-muted h-4 w-full rounded"></div>
              <div className="bg-muted h-4 w-full rounded"></div>
              <div className="bg-muted h-4 w-3/4 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Article not found</h1>
          <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>

        {/* Header */}
        <header className="mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories?.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                className="border-0"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-white mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'd MMMM yyyy', { locale: fr })}
                </time>
              </div>
              {post.reading_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.reading_time_minutes} min read</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.view_count + 1} views</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBookmarked(!bookmarked)}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sharePost('twitter')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sharePost('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sharePost('copy')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-12">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-16 text-white">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Author Info */}
        {post.author && (
          <div className="bg-muted/30 p-6 rounded-lg mb-16">
            <div className="flex items-center gap-4">
              {post.author.avatar_url && (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.full_name || 'Auteur'}
                  className="w-16 h-16 rounded-full"
                />
              )}
               <div>
                <h4 className="font-semibold text-lg text-white">
                  {post.author.full_name || 'Author'}
                </h4>
                <p className="text-white">
                  Blog contributor
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-16" />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-8 text-white">Related Articles</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  variant="compact"
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}