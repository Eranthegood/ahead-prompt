-- Update function to enforce prompt library limits for both free (10) and pro (50) users
CREATE OR REPLACE FUNCTION public.enforce_prompt_library_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_prompt_count INTEGER;
    user_tier subscription_tier_type;
    limit_count INTEGER;
BEGIN
    -- Only check on INSERT for non-system prompts
    IF TG_OP = 'INSERT' AND NEW.is_system_prompt = false THEN
        -- Get user's subscription tier from profiles
        SELECT subscription_tier INTO user_tier
        FROM profiles 
        WHERE id = NEW.user_id;
        
        -- Set limits based on tier
        IF user_tier = 'free' THEN
            limit_count := 10;
        ELSIF user_tier = 'pro' THEN
            limit_count := 50;
        ELSE
            -- Basic tier or any other tier - no limit enforcement
            RETURN NEW;
        END IF;
        
        -- Count existing non-system prompts for this user and workspace
        SELECT COUNT(*) INTO user_prompt_count
        FROM prompt_library
        WHERE user_id = NEW.user_id 
            AND workspace_id = NEW.workspace_id
            AND is_system_prompt = false;
        
        -- Check if user would exceed limit
        IF user_prompt_count >= limit_count THEN
            RAISE EXCEPTION 'Prompt library limit reached. % users can create up to % prompt library items. Upgrade your plan to create more.', 
                CASE user_tier 
                    WHEN 'free' THEN 'Free'
                    WHEN 'pro' THEN 'Pro'
                END,
                limit_count
            USING ERRCODE = 'P0001';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;