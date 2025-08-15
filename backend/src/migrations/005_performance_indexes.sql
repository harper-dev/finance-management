-- Migration 005: Additional Performance Indexes
-- This migration adds additional indexes for optimal query performance based on expected usage patterns

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_settings_user_notifications 
ON user_settings(user_id, email_notifications, push_notifications, budget_alerts, goal_reminders);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_type 
ON workspaces(owner_id, type);

CREATE INDEX IF NOT EXISTS idx_transactions_workspace_date_type 
ON transactions(workspace_id, transaction_date DESC, type);

CREATE INDEX IF NOT EXISTS idx_transactions_category_date 
ON transactions(category, transaction_date DESC) 
WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_budgets_workspace_active_period 
ON budgets(workspace_id, is_active, period) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_savings_goals_workspace_active 
ON savings_goals(workspace_id, is_active) 
WHERE is_active = true;

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_accounts_active_workspace 
ON accounts(workspace_id, type) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_workspace_members_active 
ON workspace_members(workspace_id, user_id, role);

-- Indexes for analytics queries (monthly aggregations)
CREATE INDEX IF NOT EXISTS idx_transactions_monthly_analytics 
ON transactions(workspace_id, date_trunc('month', transaction_date), type, amount);

-- Index for user settings lookup by timezone (for batch operations)
CREATE INDEX IF NOT EXISTS idx_user_settings_timezone_notifications 
ON user_settings(timezone, email_notifications, weekly_reports) 
WHERE email_notifications = true OR weekly_reports = true;

-- Comments for documentation
COMMENT ON INDEX idx_user_settings_user_notifications IS 'Optimizes user notification preference queries';
COMMENT ON INDEX idx_workspaces_owner_type IS 'Optimizes workspace filtering by owner and type';
COMMENT ON INDEX idx_transactions_workspace_date_type IS 'Optimizes transaction queries with date ordering';
COMMENT ON INDEX idx_transactions_category_date IS 'Optimizes category-based transaction analysis';
COMMENT ON INDEX idx_budgets_workspace_active_period IS 'Optimizes active budget queries';
COMMENT ON INDEX idx_savings_goals_workspace_active IS 'Optimizes active savings goal queries';
COMMENT ON INDEX idx_accounts_active_workspace IS 'Optimizes active account queries';
COMMENT ON INDEX idx_workspace_members_active IS 'Optimizes workspace member lookups';
COMMENT ON INDEX idx_transactions_monthly_analytics IS 'Optimizes monthly analytics aggregations';
COMMENT ON INDEX idx_user_settings_timezone_notifications IS 'Optimizes timezone-based notification batching';