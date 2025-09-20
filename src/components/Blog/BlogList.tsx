import React, { useState, useEffect } from 'react';
import { BlogPostCard, BlogPost } from './BlogPost';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BlogListProps {
  featured?: boolean;
  limit?: number;
  category?: string;
}

export function BlogList({ featured = false, limit, category }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const POSTS_PER_PAGE = limit || 9;

  useEffect(() => {
    fetchCategories();
    fetchPosts(true);
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      let query = supabase
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
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Filter by category if selected
      if (selectedCategory) {
        query = query.eq('blog_post_categories.blog_categories.slug', selectedCategory);
      }

      // Search functionality
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        ...post,
        categories: post.blog_post_categories?.map((bpc: any) => bpc.blog_categories) || [],
        author: undefined // Pas d'info auteur pour le moment
      })) || [];

      if (reset) {
        setPosts(formattedPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
        setPage(prev => prev + 1);
      }

      setHasMore(formattedPosts.length === POSTS_PER_PAGE);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts();
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
    setPage(1);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-48 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="bg-muted h-4 rounded w-3/4"></div>
              <div className="bg-muted h-4 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || selectedCategory 
              ? "No articles found for these criteria"
              : "No published articles yet"
            }
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      {!limit && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === '' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCategoryFilter('')}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer"
                style={{
                  backgroundColor: selectedCategory === category.slug ? category.color : 'transparent',
                  borderColor: category.color,
                  color: selectedCategory === category.slug ? 'white' : category.color
                }}
                onClick={() => handleCategoryFilter(category.slug)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <BlogPostCard
            key={post.id}
            post={post}
            variant={featured && index === 0 ? 'featured' : 'default'}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && !limit && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? "Loading..." : "Load more articles"}
          </Button>
        </div>
      )}
    </div>
  );
}