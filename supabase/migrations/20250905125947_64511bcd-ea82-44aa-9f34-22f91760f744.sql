-- Create table for excluded users
CREATE TABLE public.mixpanel_excluded_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  excluded_by UUID NOT NULL,
  reason TEXT DEFAULT 'Admin exclusion',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mixpanel_excluded_users ENABLE ROW LEVEL SECURITY;

-- Create policies for excluded users table
CREATE POLICY "Admin can view excluded users" 
ON public.mixpanel_excluded_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert excluded users" 
ON public.mixpanel_excluded_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update excluded users" 
ON public.mixpanel_excluded_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete excluded users" 
ON public.mixpanel_excluded_users 
FOR DELETE 
USING (true);

-- Create audit log table
CREATE TABLE public.mixpanel_exclusion_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('exclude', 'include')),
  performed_by UUID NOT NULL,
  mixpanel_response TEXT,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for audit log
ALTER TABLE public.mixpanel_exclusion_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log table
CREATE POLICY "Admin can view audit logs" 
ON public.mixpanel_exclusion_audit_log 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert audit logs" 
ON public.mixpanel_exclusion_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mixpanel_excluded_users_updated_at
BEFORE UPDATE ON public.mixpanel_excluded_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add your UUID to exclusion list
INSERT INTO public.mixpanel_excluded_users (user_id, excluded_by, reason)
VALUES ('c6626a43-6d65-4ad4-bc80-ab41680854c4', 'c6626a43-6d65-4ad4-bc80-ab41680854c4', 'Self-exclusion request');