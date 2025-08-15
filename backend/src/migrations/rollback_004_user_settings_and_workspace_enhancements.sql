-- Rollback Migration 004: User Settings and Workspace Enhancements
-- This script reverses the changes made in migration 004

-- Drop Row Level Security policies for user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- Disable Row Level Security for user_settings
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Drop triggers
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_settings_user_id;
DROP INDEX IF EXISTS idx_user_settings_timezone;
DROP INDEX IF EXISTS idx_user_settings_currency;
DROP INDEX IF EXISTS idx_workspaces_timezone;

-- Remove constraints from workspaces
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS check_workspace_date_format;

-- Remove constraints from user_settings (will be dropped with table)
-- ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS check_preferred_currency;
-- ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS check_date_format;
-- ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS check_language;

-- Remove columns from workspaces table
ALTER TABLE workspaces DROP COLUMN IF EXISTS timezone;
ALTER TABLE workspaces DROP COLUMN IF EXISTS date_format;

-- Drop user_settings table
DROP TABLE IF EXISTS user_settings;