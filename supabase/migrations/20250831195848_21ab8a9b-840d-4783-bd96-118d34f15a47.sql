-- Step 1: Create default products for workspaces that have epics without product_id
DO $$
DECLARE
    default_product_id UUID;
    workspace_record RECORD;
BEGIN
    FOR workspace_record IN 
        SELECT DISTINCT workspace_id 
        FROM epics 
        WHERE product_id IS NULL
    LOOP
        INSERT INTO products (workspace_id, name, description, color)
        VALUES (workspace_record.workspace_id, 'Produit par défaut', 'Produit créé automatiquement pour les epics existants', '#6B7280')
        RETURNING id INTO default_product_id;
        
        UPDATE epics 
        SET product_id = default_product_id 
        WHERE workspace_id = workspace_record.workspace_id AND product_id IS NULL;
    END LOOP;
END $$;

-- Step 2: Make product_id NOT NULL in epics
ALTER TABLE epics ALTER COLUMN product_id SET NOT NULL;

-- Step 3: Add product_id column to prompts
ALTER TABLE prompts ADD COLUMN product_id UUID;

-- Step 4: Update prompts without epic_id to have a product_id
UPDATE prompts 
SET product_id = (
    SELECT p.id 
    FROM products p 
    WHERE p.workspace_id = prompts.workspace_id 
    LIMIT 1
)
WHERE epic_id IS NULL;