-- Create seo_articles table for storing String.com articles
CREATE TABLE public.seo_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  keywords TEXT[],
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  seo_score INTEGER,
  source TEXT NOT NULL DEFAULT 'string.com',
  webhook_received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_logs table for tracking webhook events
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on seo_articles
ALTER TABLE public.seo_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for seo_articles (allow all authenticated users to read, system to write)
CREATE POLICY "SEO articles are viewable by authenticated users" 
ON public.seo_articles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow service role to insert/update articles via webhook
CREATE POLICY "Service role can manage SEO articles" 
ON public.seo_articles 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_logs
CREATE POLICY "Webhook logs are viewable by authenticated users" 
ON public.webhook_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage webhook logs" 
ON public.webhook_logs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_seo_articles_external_id ON public.seo_articles(external_id);
CREATE INDEX idx_seo_articles_source ON public.seo_articles(source);
CREATE INDEX idx_seo_articles_status ON public.seo_articles(status);
CREATE INDEX idx_seo_articles_published_at ON public.seo_articles(published_at);
CREATE INDEX idx_webhook_logs_source_event ON public.webhook_logs(source, event_type);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_seo_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_seo_articles_updated_at
  BEFORE UPDATE ON public.seo_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seo_articles_updated_at();