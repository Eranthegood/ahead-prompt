-- Fix the prompts association constraint to allow prompts to be associated with both product and epic
-- The current constraint prevents prompts from having both epic_id and product_id, which is incorrect
-- A prompt should be able to belong to an epic within a product

-- First, drop the existing constraint
ALTER TABLE public.prompts 
DROP CONSTRAINT prompts_association_check;

-- Add a new, more permissive constraint that allows:
-- 1. No associations (both NULL)
-- 2. Product only (epic_id NULL, product_id NOT NULL)
-- 3. Epic only (epic_id NOT NULL, product_id NULL) 
-- 4. Both product and epic (both NOT NULL)
-- The constraint should just ensure we don't have orphaned data
ALTER TABLE public.prompts 
ADD CONSTRAINT prompts_association_check 
CHECK (
  -- Allow no associations
  (epic_id IS NULL AND product_id IS NULL) OR
  -- Allow product only
  (epic_id IS NULL AND product_id IS NOT NULL) OR
  -- Allow epic only 
  (epic_id IS NOT NULL AND product_id IS NULL) OR
  -- Allow both product and epic (this was missing before)
  (epic_id IS NOT NULL AND product_id IS NOT NULL)
);