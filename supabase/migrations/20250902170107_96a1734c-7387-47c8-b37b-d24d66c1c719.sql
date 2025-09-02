-- Remove the existing constraint that blocks unassigned prompts
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_association_check;

-- Add a new constraint that allows unassigned prompts (both epic_id and product_id can be null)
-- but still prevents a prompt from belonging to both an epic AND a product
ALTER TABLE prompts ADD CONSTRAINT prompts_association_check 
CHECK (
  -- Allow unassigned prompts (both null)
  (epic_id IS NULL AND product_id IS NULL) OR
  -- Allow prompt assigned to epic only
  (epic_id IS NOT NULL AND product_id IS NULL) OR  
  -- Allow prompt assigned to product only
  (epic_id IS NULL AND product_id IS NOT NULL)
);