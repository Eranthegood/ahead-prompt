-- Add RLS (Row Level Security) policy to restrict knowledge_items access for free users
-- This provides database-level protection in addition to frontend restrictions

-- Add policy to prevent free users from creating knowledge items
CREATE POLICY "Free users cannot create knowledge items" 
ON public.knowledge_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_tier IN ('basic', 'pro')
  )
);

-- Add policy to prevent free users from accessing knowledge items  
CREATE POLICY "Free users cannot access knowledge items"
ON public.knowledge_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_tier IN ('basic', 'pro')
  )
);

-- Add policy to prevent free users from updating knowledge items
CREATE POLICY "Free users cannot update knowledge items"
ON public.knowledge_items  
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_tier IN ('basic', 'pro')
  )
);

-- Add policy to prevent free users from deleting knowledge items
CREATE POLICY "Free users cannot delete knowledge items"
ON public.knowledge_items
FOR DELETE  
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND subscription_tier IN ('basic', 'pro')
  )
);