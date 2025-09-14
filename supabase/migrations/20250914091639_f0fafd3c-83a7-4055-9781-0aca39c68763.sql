-- Create favorite_links table for user bookmarks
CREATE TABLE public.favorite_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.favorite_links ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorite links" 
ON public.favorite_links 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite links" 
ON public.favorite_links 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite links" 
ON public.favorite_links 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite links" 
ON public.favorite_links 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_favorite_links_updated_at
BEFORE UPDATE ON public.favorite_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();