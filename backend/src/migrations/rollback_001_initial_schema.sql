-- Rollback for 001_initial_schema.sql
-- WARNING: This will delete all data and tables!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_savings_goals_workspace_id;
DROP INDEX IF EXISTS idx_budgets_workspace_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_account_id;
DROP INDEX IF EXISTS idx_transactions_workspace_id;
DROP INDEX IF EXISTS idx_accounts_workspace_id;
DROP INDEX IF EXISTS idx_workspace_members_user_id;
DROP INDEX IF EXISTS idx_workspace_members_workspace_id;
DROP INDEX IF EXISTS idx_workspaces_owner_id;
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- Drop tables in correct order (considering foreign key constraints)
DROP TABLE IF EXISTS savings_goals;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS user_profiles;

-- Drop UUID extension (optional, may be used by other parts of the system)
-- DROP EXTENSION IF EXISTS "uuid-ossp";