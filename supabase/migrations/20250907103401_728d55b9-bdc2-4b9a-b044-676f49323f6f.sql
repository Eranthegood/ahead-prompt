-- Add original_description column to preserve user's initial input
ALTER TABLE public.prompts 
ADD COLUMN original_description TEXT;

-- Backfill existing prompts with their current description
UPDATE public.prompts 
SET original_description = description 
WHERE description IS NOT NULL AND description != '';

-- For prompts with no description but with generated_prompt, use generated_prompt as fallback
UPDATE public.prompts 
SET original_description = generated_prompt 
WHERE (original_description IS NULL OR original_description = '') 
  AND generated_prompt IS NOT NULL 
  AND generated_prompt != '';

-- For prompts with neither, use title as fallback
UPDATE public.prompts 
SET original_description = '<h1>' || title || '</h1>'
WHERE (original_description IS NULL OR original_description = '');