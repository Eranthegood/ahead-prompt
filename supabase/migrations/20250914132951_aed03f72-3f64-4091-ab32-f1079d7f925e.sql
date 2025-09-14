-- Add subscription_tier field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free';

-- Create subscription tier type for better type safety
CREATE TYPE public.subscription_tier_type AS ENUM ('free', 'basic', 'pro');

-- Update the column to use the enum type
ALTER TABLE public.profiles 
ALTER COLUMN subscription_tier TYPE subscription_tier_type 
USING subscription_tier::subscription_tier_type;