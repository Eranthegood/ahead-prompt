-- Create subscription tier type for better type safety
CREATE TYPE public.subscription_tier_type AS ENUM ('free', 'basic', 'pro');

-- Add subscription_tier field to profiles table with enum type and default
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier subscription_tier_type NOT NULL DEFAULT 'free';