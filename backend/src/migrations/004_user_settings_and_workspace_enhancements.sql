-- Migration 004: User Settings and Workspace Enhancements
-- This migration creates the user_settings table and enhances workspaces table

-- Create user_settings table with all required fields
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    language VARCHAR(10) DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT true,
    budget_alerts BOOLEAN DEFAULT true,
    goal_reminders BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add timezone and date_format columns to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';

-- Create indexes for performance optimization
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_timezone ON user_settings(timezone);
CREATE INDEX idx_user_settings_currency ON user_settings(preferred_currency);
CREATE INDEX idx_workspaces_timezone ON workspaces(timezone);

-- Create updated_at trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Add constraints for data validation
ALTER TABLE user_settings 
ADD CONSTRAINT check_preferred_currency 
CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD', 'AUD', 'CAD'));

ALTER TABLE user_settings 
ADD CONSTRAINT check_date_format 
CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'));

ALTER TABLE user_settings 
ADD CONSTRAINT check_language 
CHECK (language IN ('en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'));

-- Add similar constraints to workspaces for new columns
ALTER TABLE workspaces 
ADD CONSTRAINT check_workspace_date_format 
CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'));

-- Create function to migrate existing user_profiles data to user_settings
CREATE OR REPLACE FUNCTION migrate_user_profiles_to_settings()
RETURNS void AS $$
BEGIN
    -- Insert existing user profile data into user_settings
    INSERT INTO user_settings (
        user_id, 
        display_name, 
        preferred_currency, 
        timezone, 
        language,
        created_at,
        updated_at
    )
    SELECT 
        user_id,
        display_name,
        preferred_currency,
        timezone,
        language,
        created_at,
        updated_at
    FROM user_profiles
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_user_profiles_to_settings();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_user_profiles_to_settings();