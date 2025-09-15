-- Create function to enforce prompt library limits for free users
CREATE OR REPLACE FUNCTION public.enforce_prompt_library_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_prompt_count INTEGER;
    user_tier subscription_tier_type;
BEGIN
    -- Only check on INSERT for non-system prompts
    IF TG_OP = 'INSERT' AND NEW.is_system_prompt = false THEN
        -- Get user's subscription tier from profiles
        SELECT subscription_tier INTO user_tier
        FROM profiles 
        WHERE id = NEW.user_id;
        
        -- Only enforce limits for free tier users
        IF user_tier = 'free' THEN
            -- Count existing non-system prompts for this user and workspace
            SELECT COUNT(*) INTO user_prompt_count
            FROM prompt_library
            WHERE user_id = NEW.user_id 
                AND workspace_id = NEW.workspace_id
                AND is_system_prompt = false;
            
            -- Check if user would exceed limit (10 for free tier)
            IF user_prompt_count >= 10 THEN
                RAISE EXCEPTION 'Prompt library limit reached. Free users can create up to 10 prompt library items. Upgrade your plan to create more.'
                USING ERRCODE = 'P0001';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on prompt_library table
DROP TRIGGER IF EXISTS enforce_prompt_library_limit_trigger ON prompt_library;
CREATE TRIGGER enforce_prompt_library_limit_trigger
    BEFORE INSERT ON prompt_library
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_prompt_library_limit();