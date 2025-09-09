-- Create blog_posts table for the public blog
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_description TEXT,
  keywords TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID NOT NULL,
  seo_article_id UUID REFERENCES public.seo_articles(id), -- Link to original SEO article
  view_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  workspace_id UUID NOT NULL
);

-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for blog posts and categories (many-to-many)
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Blog posts are viewable by everyone when published" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published' OR workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can create blog posts in their workspaces" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
) AND author_id = auth.uid());

CREATE POLICY "Users can update blog posts in their workspaces" 
ON public.blog_posts 
FOR UPDATE 
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

CREATE POLICY "Users can delete blog posts in their workspaces" 
ON public.blog_posts 
FOR DELETE 
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

-- Create policies for blog_categories
CREATE POLICY "Blog categories are viewable by everyone" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage categories in their workspaces" 
ON public.blog_categories 
FOR ALL 
USING (workspace_id IN (
  SELECT workspaces.id FROM workspaces WHERE workspaces.owner_id = auth.uid()
));

-- Create policies for blog_post_categories
CREATE POLICY "Blog post categories are viewable by everyone" 
ON public.blog_post_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage post categories in their workspaces" 
ON public.blog_post_categories 
FOR ALL 
USING (post_id IN (
  SELECT blog_posts.id FROM blog_posts 
  JOIN workspaces ON blog_posts.workspace_id = workspaces.id 
  WHERE workspaces.owner_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_workspace ON public.blog_posts(workspace_id);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_post_categories_post ON public.blog_post_categories(post_id);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[àáâãäå]', 'a', 'g'),
        '[èéêë]', 'e', 'g'
      ),
      '[^a-z0-9\s-]', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  reading_speed INTEGER := 200; -- words per minute
BEGIN
  -- Count words (approximate)
  word_count := array_length(string_to_array(trim(content), ' '), 1);
  RETURN GREATEST(1, ROUND(word_count::NUMERIC / reading_speed));
END;
$$ LANGUAGE plpgsql;

-- Create function to update blog post timestamps
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Auto-generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.title);
  END IF;
  
  -- Auto-calculate reading time
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time_minutes = calculate_reading_time(NEW.content);
  END IF;
  
  -- Set published_at when status changes to published
  IF OLD.status != 'published' AND NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic updates
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_posts_updated_at();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();