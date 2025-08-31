-- Add the constraint now that data is properly set
ALTER TABLE prompts ADD CONSTRAINT prompts_association_check 
CHECK (
    (epic_id IS NOT NULL AND product_id IS NULL) OR 
    (epic_id IS NULL AND product_id IS NOT NULL)
);