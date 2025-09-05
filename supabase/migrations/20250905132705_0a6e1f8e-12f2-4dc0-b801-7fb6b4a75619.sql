-- Create a table to store user pricing feedback and subscription interests
CREATE TABLE public.pricing_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  price_point TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'pricing_interest', -- 'pricing_interest', 'subscription_request', etc.
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pricing_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for pricing feedback
CREATE POLICY "Anyone can submit pricing feedback" 
ON public.pricing_feedback 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own feedback" 
ON public.pricing_feedback 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND email IS NOT NULL)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pricing_feedback_updated_at
BEFORE UPDATE ON public.pricing_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create an index for better performance
CREATE INDEX idx_pricing_feedback_user_id ON public.pricing_feedback(user_id);
CREATE INDEX idx_pricing_feedback_email ON public.pricing_feedback(email);
CREATE INDEX idx_pricing_feedback_created_at ON public.pricing_feedback(created_at);