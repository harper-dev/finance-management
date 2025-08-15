# Database Schema Changes - Migration 004

## Overview

This document describes the database schema changes implemented in migration `004_user_settings_and_workspace_enhancements.sql` to support P0 critical features.

## Changes Made

### 1. New User Settings Table

Created a new `user_settings` table to store user preferences and notification settings:

```sql
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
```

#### Key Features:
- **Unique user_id**: Each user can have only one settings record
- **Notification preferences**: Granular control over different notification types
- **Localization support**: Currency, timezone, date format, and language preferences
- **Audit trail**: Created and updated timestamps
- **Data validation**: Constraints for currency, date format, and language values

### 2. Enhanced Workspaces Table

Added new columns to the existing `workspaces` table:

```sql
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
```

#### Purpose:
- Allow workspace-level timezone and date format settings
- Override user preferences at the workspace level
- Support multi-timezone collaboration

### 3. Performance Indexes

Created indexes for optimal query performance:

```sql
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_timezone ON user_settings(timezone);
CREATE INDEX idx_user_settings_currency ON user_settings(preferred_currency);
CREATE INDEX idx_workspaces_timezone ON workspaces(timezone);
```

### 4. Data Validation Constraints

Added constraints to ensure data integrity:

```sql
-- Currency validation
ALTER TABLE user_settings 
ADD CONSTRAINT check_preferred_currency 
CHECK (preferred_currency IN ('USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD', 'AUD', 'CAD'));

-- Date format validation
ALTER TABLE user_settings 
ADD CONSTRAINT check_date_format 
CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'));

-- Language validation
ALTER TABLE user_settings 
ADD CONSTRAINT check_language 
CHECK (language IN ('en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'));
```

### 5. Row Level Security (RLS)

Implemented security policies for the new table:

```sql
-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);
```

### 6. Data Migration

Included automatic migration of existing `user_profiles` data:

```sql
-- Migrate existing data from user_profiles to user_settings
INSERT INTO user_settings (
    user_id, display_name, preferred_currency, timezone, language, created_at, updated_at
)
SELECT user_id, display_name, preferred_currency, timezone, language, created_at, updated_at
FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;
```

## Requirements Addressed

This migration addresses the following requirements from the P0 Critical Features spec:

- **Requirement 2.1**: User profile settings persistence
- **Requirement 2.2**: Notification preferences management
- **Requirement 2.3**: Workspace timezone and date format settings
- **Requirement 2.4**: Currency and localization preferences

## Rollback Strategy

A comprehensive rollback script is provided (`rollback_004_user_settings_and_workspace_enhancements.sql`) that:

1. Drops all RLS policies
2. Removes all indexes
3. Drops constraints
4. Removes added columns from workspaces
5. Drops the user_settings table

## Testing

The migration includes automated tests (`src/tests/migrations.test.ts`) that validate:

- SQL syntax correctness
- Required table structure
- Index creation
- Constraint definitions
- Rollback script validity

## Usage Instructions

### To Apply Migration:

1. Run migration status: `npm run migrate:status`
2. Execute the SQL in Supabase Dashboard
3. Mark as completed: `npm run migrate:mark 004_user_settings_and_workspace_enhancements`

### To Rollback:

1. Run rollback command: `npm run migrate:rollback`
2. Execute the rollback SQL in Supabase Dashboard
3. Unmark migration: `npm run migrate:unmark 004_user_settings_and_workspace_enhancements`

## Impact Assessment

### Performance Impact:
- **Minimal**: New indexes improve query performance
- **Storage**: Small increase due to new table and columns

### Application Impact:
- **Breaking Changes**: None - all changes are additive
- **Backward Compatibility**: Maintained through default values and optional columns

### Security Impact:
- **Enhanced**: RLS policies ensure users can only access their own settings
- **Data Protection**: Constraints prevent invalid data entry

## Next Steps

After applying this migration:

1. Update backend services to use the new user_settings table
2. Implement API endpoints for settings management
3. Update frontend to support new settings options
4. Test notification preferences functionality
5. Validate timezone and date format handling across the application