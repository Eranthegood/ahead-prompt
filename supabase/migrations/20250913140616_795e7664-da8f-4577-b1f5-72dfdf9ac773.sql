-- Enable real-time updates for knowledge_items table
ALTER TABLE public.knowledge_items REPLICA IDENTITY FULL;

-- Add the table to the realtime publication if not already added
DO $$
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'knowledge_items'
    ) THEN
        -- Add the table to the publication
        ALTER PUBLICATION supabase_realtime ADD TABLE public.knowledge_items;
    END IF;
END $$;