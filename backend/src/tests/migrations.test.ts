import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Database Migrations', () => {
  const migrationsDir = join(__dirname, '../migrations')

  it('should have valid SQL syntax in migration 004', () => {
    const migrationPath = join(migrationsDir, '004_user_settings_and_workspace_enhancements.sql')
    
    expect(() => {
      const sql = readFileSync(migrationPath, 'utf-8')
      
      // Basic SQL syntax validation
      expect(sql).toContain('CREATE TABLE public.user_settings')
      expect(sql).toContain('ALTER TABLE public.workspaces')
      expect(sql).toContain('CREATE INDEX')
      expect(sql).toContain('CREATE TRIGGER')
      expect(sql).toContain('CREATE POLICY')
      
      // Check for required fields in user_settings table
      expect(sql).toContain('user_id UUID NOT NULL UNIQUE')
      expect(sql).toContain('display_name VARCHAR(100)')
      expect(sql).toContain('preferred_currency VARCHAR(3)')
      expect(sql).toContain('timezone VARCHAR(50)')
      expect(sql).toContain('date_format VARCHAR(20)')
      expect(sql).toContain('language VARCHAR(10)')
      expect(sql).toContain('email_notifications BOOLEAN')
      expect(sql).toContain('push_notifications BOOLEAN')
      expect(sql).toContain('weekly_reports BOOLEAN')
      expect(sql).toContain('budget_alerts BOOLEAN')
      expect(sql).toContain('goal_reminders BOOLEAN')
      
      // Check for workspace enhancements
      expect(sql).toContain('ADD COLUMN IF NOT EXISTS timezone')
      expect(sql).toContain('ADD COLUMN IF NOT EXISTS date_format')
      
      // Check for proper constraints
      expect(sql).toContain('check_preferred_currency')
      expect(sql).toContain('check_date_format')
      expect(sql).toContain('check_language')
      
      // Check for indexes
      expect(sql).toContain('idx_user_settings_user_id')
      expect(sql).toContain('idx_user_settings_timezone')
      expect(sql).toContain('idx_user_settings_currency')
      expect(sql).toContain('idx_workspaces_timezone')
      
    }).not.toThrow()
  })

  it('should have valid rollback SQL syntax', () => {
    const rollbackPath = join(migrationsDir, 'rollback_004_user_settings_and_workspace_enhancements.sql')
    
    expect(() => {
      const sql = readFileSync(rollbackPath, 'utf-8')
      
      // Basic rollback validation
      expect(sql).toContain('DROP POLICY')
      expect(sql).toContain('DROP TRIGGER')
      expect(sql).toContain('DROP INDEX')
      expect(sql).toContain('DROP TABLE IF EXISTS user_settings')
      expect(sql).toContain('ALTER TABLE workspaces DROP COLUMN')
      
    }).not.toThrow()
  })

  it('should have valid performance indexes migration SQL', () => {
    const migrationPath = join(migrationsDir, '005_performance_indexes.sql')
    
    expect(() => {
      const sql = readFileSync(migrationPath, 'utf-8')
      
      // Check for performance indexes
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_user_settings_user_notifications')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_workspaces_owner_type')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_transactions_workspace_date_type')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_transactions_category_date')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_budgets_workspace_active_period')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_savings_goals_workspace_active')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_accounts_active_workspace')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_workspace_members_active')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_transactions_monthly_analytics')
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_user_settings_timezone_notifications')
      
      // Check for comments
      expect(sql).toContain('COMMENT ON INDEX')
      
    }).not.toThrow()
  })

  it('should have valid performance indexes rollback SQL', () => {
    const rollbackPath = join(migrationsDir, 'rollback_005_performance_indexes.sql')
    
    expect(() => {
      const sql = readFileSync(rollbackPath, 'utf-8')
      
      // Check for index drops
      expect(sql).toContain('DROP INDEX IF EXISTS idx_user_settings_user_notifications')
      expect(sql).toContain('DROP INDEX IF EXISTS idx_workspaces_owner_type')
      expect(sql).toContain('DROP INDEX IF EXISTS idx_transactions_workspace_date_type')
      
    }).not.toThrow()
  })

  it('should have proper migration file naming', () => {
    const migration004Path = join(migrationsDir, '004_user_settings_and_workspace_enhancements.sql')
    const rollback004Path = join(migrationsDir, 'rollback_004_user_settings_and_workspace_enhancements.sql')
    const migration005Path = join(migrationsDir, '005_performance_indexes.sql')
    const rollback005Path = join(migrationsDir, 'rollback_005_performance_indexes.sql')
    
    expect(() => {
      readFileSync(migration004Path, 'utf-8')
      readFileSync(rollback004Path, 'utf-8')
      readFileSync(migration005Path, 'utf-8')
      readFileSync(rollback005Path, 'utf-8')
    }).not.toThrow()
  })
})