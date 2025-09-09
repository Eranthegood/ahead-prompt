import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Eye, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  published_at: string;
  author_id: string;
  view_count: number;
  reading_time_minutes?: number;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

export function BlogPostCard({ post, variant = 'default' }: BlogPostCardProps) {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/blog/${post.slug}`);
  };

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleReadMore}>
        {post.featured_image_url && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
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
          
          <h2 className="text-2xl font-bold mb-3 line-clamp-2 text-white">{post.title}</h2>
          
          {post.excerpt && (
            <p className="text-white mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          
          <div className="flex items-center justify-between text-sm text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.published_at), 'd MMM yyyy', { locale: fr })}</span>
              </div>
              {post.reading_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.reading_time_minutes} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.view_count}</span>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="group">
              Read more
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200" onClick={handleReadMore}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {post.featured_image_url && (
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-2 line-clamp-2 text-white">{post.title}</h3>
              
              <div className="flex items-center gap-3 text-xs text-white">
                <span>{format(new Date(post.published_at), 'd MMM', { locale: fr })}</span>
                {post.reading_time_minutes && (
                  <span>{post.reading_time_minutes} min</span>
                )}
                <span>{post.view_count} views</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleReadMore}>
      {post.featured_image_url && (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
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
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2 text-white">{post.title}</h3>
        
        {post.excerpt && (
          <p className="text-white mb-4 line-clamp-2">{post.excerpt}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.published_at), 'd MMM yyyy', { locale: fr })}</span>
            </div>
            {post.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.reading_time_minutes} min</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.view_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}