-- Create user_secrets table for storing encrypted API tokens and secrets
CREATE TABLE user_secrets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key text NOT NULL,
    encrypted_value text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE user_secrets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own secrets" ON user_secrets
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX user_secrets_user_id_idx ON user_secrets(user_id);
CREATE INDEX user_secrets_key_idx ON user_secrets(key);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_secrets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_secrets_updated_at
    BEFORE UPDATE ON user_secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_secrets_updated_at();

-- Add comment
COMMENT ON TABLE user_secrets IS 'Store encrypted API tokens and secrets for users';