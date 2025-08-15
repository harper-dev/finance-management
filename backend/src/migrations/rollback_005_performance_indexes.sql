-- Rollback Migration 005: Remove Performance Indexes
-- This script removes the additional performance indexes added in migration 005

-- Drop composite indexes
DROP INDEX IF EXISTS idx_user_settings_user_notifications;
DROP INDEX IF EXISTS idx_workspaces_owner_type;
DROP INDEX IF EXISTS idx_transactions_workspace_date_type;
DROP INDEX IF EXISTS idx_transactions_category_date;
DROP INDEX IF EXISTS idx_budgets_workspace_active_period;
DROP INDEX IF EXISTS idx_savings_goals_workspace_active;

-- Drop partial indexes
DROP INDEX IF EXISTS idx_accounts_active_workspace;
DROP INDEX IF EXISTS idx_workspace_members_active;

-- Drop analytics indexes
DROP INDEX IF EXISTS idx_transactions_monthly_analytics;

-- Drop notification batch indexes
DROP INDEX IF EXISTS idx_user_settings_timezone_notifications;