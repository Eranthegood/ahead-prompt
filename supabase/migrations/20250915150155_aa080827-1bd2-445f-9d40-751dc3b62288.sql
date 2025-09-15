-- Create secrets table for storing integration tokens securely
CREATE TABLE public.secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  secret_name TEXT NOT NULL,
  secret_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, secret_name)
);

-- Enable RLS on secrets table
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own secrets
CREATE POLICY "Users can only access their own secrets" ON public.secrets
  FOR ALL USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_secrets_updated_at 
  BEFORE UPDATE ON public.secrets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();