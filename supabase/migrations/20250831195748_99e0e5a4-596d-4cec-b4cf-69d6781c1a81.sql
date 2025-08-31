-- Create a default product for existing epics without product_id
DO $$
DECLARE
    default_product_id UUID;
    workspace_record RECORD;
BEGIN
    -- For each workspace that has epics without product_id, create a default product
    FOR workspace_record IN 
        SELECT DISTINCT workspace_id 
        FROM epics 
        WHERE product_id IS NULL
    LOOP
        -- Insert default product for this workspace
        INSERT INTO products (workspace_id, name, description, color)
        VALUES (workspace_record.workspace_id, 'Produit par défaut', 'Produit créé automatiquement pour les epics existants', '#6B7280')
        RETURNING id INTO default_product_id;
        
        -- Update epics without product_id to use the default product
        UPDATE epics 
        SET product_id = default_product_id 
        WHERE workspace_id = workspace_record.workspace_id AND product_id IS NULL;
    END LOOP;
END $$;

-- Make product_id NOT NULL in epics table
ALTER TABLE epics ALTER COLUMN product_id SET NOT NULL;

-- Add product_id column to prompts table
ALTER TABLE prompts ADD COLUMN product_id UUID;

-- Add constraint to ensure prompts have either epic_id or product_id (but not both)
ALTER TABLE prompts ADD CONSTRAINT prompts_association_check 
CHECK (
    (epic_id IS NOT NULL AND product_id IS NULL) OR 
    (epic_id IS NULL AND product_id IS NOT NULL)
);

-- Update existing prompts to have proper associations
-- If a prompt has no epic_id, associate it with a product from the same workspace
UPDATE prompts 
SET product_id = (
    SELECT p.id 
    FROM products p 
    WHERE p.workspace_id = prompts.workspace_id 
    LIMIT 1
)
WHERE epic_id IS NULL AND product_id IS NULL;