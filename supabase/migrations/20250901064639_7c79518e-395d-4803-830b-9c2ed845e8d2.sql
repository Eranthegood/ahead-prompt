-- Enable realtime for prompts table to ensure instant visibility
ALTER TABLE prompts REPLICA IDENTITY FULL;

-- Add prompts table to realtime publication for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE prompts;