# Database Migration Execution Guide

## Overview

This guide provides step-by-step instructions for executing the database schema updates for P0 Critical Features.

## Prerequisites

1. **Environment Setup**: Ensure your `.env` file contains valid Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

2. **Database Access**: Ensure you have access to your Supabase project dashboard

3. **Backup**: Consider creating a database backup before applying migrations

## Migration Files Created

### Primary Migrations:
- `004_user_settings_and_workspace_enhancements.sql` - Creates user_settings table and enhances workspaces
- `005_performance_indexes.sql` - Adds performance optimization indexes

### Rollback Scripts:
- `rollback_004_user_settings_and_workspace_enhancements.sql` - Rollback for migration 004
- `rollback_005_performance_indexes.sql` - Rollback for migration 005

## Execution Steps

### Step 1: Check Migration Status

```bash
cd backend
npm run migrate:status
```

This will show you all pending migrations including our new ones.

### Step 2: Execute Migration 004 (User Settings)

1. **Get the SQL**:
   ```bash
   npm run migrate
   ```
   This will display the SQL for migration 004.

2. **Execute in Supabase**:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy and paste the SQL from migration 004
   - Execute the SQL

3. **Mark as Completed**:
   ```bash
   npm run migrate:mark 004_user_settings_and_workspace_enhancements
   ```

### Step 3: Execute Migration 005 (Performance Indexes)

1. **Get the SQL**:
   ```bash
   npm run migrate
   ```
   This will now display the SQL for migration 005.

2. **Execute in Supabase**:
   - Copy and paste the SQL from migration 005
   - Execute the SQL

3. **Mark as Completed**:
   ```bash
   npm run migrate:mark 005_performance_indexes
   ```

### Step 4: Verify Completion

```bash
npm run migrate:status
```

You should see both migrations marked as executed.

## Validation

### Test the Migrations

Run the automated tests to ensure everything is working:

```bash
npm test -- --run src/tests/migrations.test.ts
```

### Manual Verification

Connect to your database and verify:

1. **User Settings Table**:
   ```sql
   SELECT * FROM user_settings LIMIT 1;
   \d user_settings
   ```

2. **Workspace Enhancements**:
   ```sql
   \d workspaces
   ```

3. **Indexes**:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename IN ('user_settings', 'workspaces', 'transactions', 'budgets', 'savings_goals', 'accounts');
   ```

## Rollback Procedure

If you need to rollback the changes:

### Rollback Migration 005 (Performance Indexes)

1. **Get Rollback SQL**:
   ```bash
   npm run migrate:rollback
   ```

2. **Execute Rollback**:
   - Copy the rollback SQL for migration 005
   - Execute in Supabase SQL Editor

3. **Unmark Migration**:
   ```bash
   npm run migrate:unmark 005_performance_indexes
   ```

### Rollback Migration 004 (User Settings)

1. **Get Rollback SQL**:
   ```bash
   npm run migrate:rollback
   ```

2. **Execute Rollback**:
   - Copy the rollback SQL for migration 004
   - Execute in Supabase SQL Editor

3. **Unmark Migration**:
   ```bash
   npm run migrate:unmark 004_user_settings_and_workspace_enhancements
   ```

## Expected Results

After successful execution, you will have:

### New Database Objects:

1. **user_settings table** with:
   - User preference fields (currency, timezone, language, date format)
   - Notification preference fields (email, push, reports, alerts, reminders)
   - Proper constraints and validation
   - Row Level Security policies

2. **Enhanced workspaces table** with:
   - timezone column
   - date_format column
   - Validation constraints

3. **Performance indexes** for:
   - User settings queries
   - Workspace filtering
   - Transaction analytics
   - Budget and savings goal lookups
   - Notification batching

### Data Migration:
- Existing user_profiles data automatically migrated to user_settings
- Default values applied for new fields
- No data loss or corruption

## Troubleshooting

### Common Issues:

1. **Permission Errors**:
   - Ensure you're using the service key, not the anon key
   - Verify your Supabase project permissions

2. **Constraint Violations**:
   - Check for existing data that might violate new constraints
   - Review the migration SQL for any data conflicts

3. **Index Creation Failures**:
   - Ensure sufficient database resources
   - Check for existing indexes with similar names

4. **RLS Policy Conflicts**:
   - Verify no conflicting policies exist
   - Check user authentication setup

### Getting Help:

1. Check the migration logs in your terminal
2. Review Supabase dashboard error messages
3. Verify environment variables are correct
4. Run the test suite to identify specific issues

## Post-Migration Tasks

After successful migration:

1. **Update Application Code**:
   - Implement UserSettingsService
   - Update API endpoints
   - Modify frontend components

2. **Test Application**:
   - Verify user settings functionality
   - Test workspace timezone handling
   - Validate notification preferences

3. **Monitor Performance**:
   - Check query performance improvements
   - Monitor index usage
   - Validate database resource usage

## Security Considerations

The migrations include:
- Row Level Security policies for user_settings
- Proper foreign key constraints
- Data validation constraints
- Secure default values

Ensure your application code respects these security measures when implementing the new features.