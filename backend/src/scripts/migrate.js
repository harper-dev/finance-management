#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

class MigrationRunner {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.migrationsDir = path.join(__dirname, '../migrations')
  }

  async createMigrationsTable() {
    console.log('Creating migrations table if it doesn\'t exist...')
    
    const { error } = await this.supabase
      .from('_migrations')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, create it
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS _migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT NOW()
        );
      `
      
      console.log('Migrations table does not exist, please create it manually in Supabase SQL Editor:')
      console.log(createTableSql)
      console.log('\nOr run this command if you have direct database access.')
      return false
    }
    
    return true
  }

  async getExecutedMigrations() {
    try {
      const { data, error } = await this.supabase
        .from('_migrations')
        .select('id')

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Migrations table does not exist yet.')
          return new Set()
        }
        throw error
      }

      return new Set((data || []).map(row => row.id))
    } catch (error) {
      console.error('Error getting executed migrations:', error)
      return new Set()
    }
  }

  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()

      return files.map(file => {
        const id = file.replace('.sql', '')
        return {
          id,
          name: file,
          path: path.join(this.migrationsDir, file)
        }
      })
    } catch (error) {
      console.error('Error reading migrations directory:', error)
      throw error
    }
  }

  async recordMigration(migration) {
    const { error } = await this.supabase
      .from('_migrations')
      .insert([{
        id: migration.id,
        name: migration.name
      }])

    if (error) {
      console.error('Error recording migration:', error)
      throw error
    }
  }

  async runMigrations() {
    console.log('🚀 Starting database migrations...\n')

    try {
      // Check/create migrations table
      const tableExists = await this.createMigrationsTable()
      if (!tableExists) {
        console.log('❌ Please create the migrations table first.')
        return
      }

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations()

      // Get all migration files
      const migrationFiles = this.getMigrationFiles()

      if (migrationFiles.length === 0) {
        console.log('ℹ️  No migration files found.')
        return
      }

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        migration => !executedMigrations.has(migration.id)
      )

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.')
        return
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migration(s):\n`)
      pendingMigrations.forEach((migration, index) => {
        console.log(`   ${index + 1}. ${migration.name}`)
      })

      console.log('\n' + '='.repeat(60))
      console.log('📋 MIGRATION INSTRUCTIONS')
      console.log('='.repeat(60))
      console.log('\nFor each migration below, please:')
      console.log('1. Copy the SQL content')
      console.log('2. Go to your Supabase Dashboard > SQL Editor')
      console.log('3. Paste and execute the SQL')
      console.log('4. Mark as completed using: npm run migrate:mark <migration_id>')
      console.log('\n' + '='.repeat(60) + '\n')

      // Show each pending migration
      for (let i = 0; i < pendingMigrations.length; i++) {
        const migration = pendingMigrations[i]
        console.log(`\n📄 MIGRATION ${i + 1}: ${migration.name}`)
        console.log('-'.repeat(40))
        
        try {
          const sql = fs.readFileSync(migration.path, 'utf-8')
          console.log(sql)
          console.log('-'.repeat(40))
          console.log(`To mark as completed: npm run migrate:mark ${migration.id}`)
        } catch (error) {
          console.error(`Error reading migration file ${migration.name}:`, error)
        }
      }

      console.log('\n✨ After executing all migrations in Supabase, your database will be up to date!')
    } catch (error) {
      console.error('❌ Migration process failed:', error)
      process.exit(1)
    }
  }

  async markMigrationAsCompleted(migrationId) {
    const migrationFiles = this.getMigrationFiles()
    const migration = migrationFiles.find(m => m.id === migrationId)

    if (!migration) {
      console.error(`❌ Migration with ID '${migrationId}' not found.`)
      process.exit(1)
    }

    try {
      await this.recordMigration(migration)
      console.log(`✅ Migration ${migration.name} marked as completed.`)
    } catch (error) {
      console.error(`❌ Failed to mark migration as completed:`, error)
      process.exit(1)
    }
  }

  async showStatus() {
    try {
      const executedMigrations = await this.getExecutedMigrations()
      const migrationFiles = this.getMigrationFiles()
      
      console.log('\n📊 MIGRATION STATUS')
      console.log('='.repeat(50))
      
      if (migrationFiles.length === 0) {
        console.log('ℹ️  No migration files found.')
        return
      }

      migrationFiles.forEach(migration => {
        const status = executedMigrations.has(migration.id) ? '✅ Executed' : '⏳ Pending'
        console.log(`  ${status} - ${migration.name}`)
      })

      const pendingCount = migrationFiles.filter(m => !executedMigrations.has(m.id)).length
      console.log(`\n📈 Total: ${migrationFiles.length} migrations`)
      console.log(`✅ Executed: ${migrationFiles.length - pendingCount}`)
      console.log(`⏳ Pending: ${pendingCount}`)
    } catch (error) {
      console.error('❌ Error showing status:', error)
      process.exit(1)
    }
  }

  async rollbackLastMigration() {
    console.log('⏪ Rolling back last migration...')

    try {
      const { data, error } = await this.supabase
        .from('_migrations')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching last migration:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('ℹ️  No migrations to rollback.')
        return
      }

      const lastMigration = data[0]
      console.log(`📄 Last migration: ${lastMigration.name}`)

      // Check if rollback file exists
      const rollbackFile = path.join(this.migrationsDir, `rollback_${lastMigration.id}.sql`)
      
      if (fs.existsSync(rollbackFile)) {
        const rollbackSql = fs.readFileSync(rollbackFile, 'utf-8')
        console.log('\n📋 ROLLBACK SQL TO EXECUTE:')
        console.log('-'.repeat(40))
        console.log(rollbackSql)
        console.log('-'.repeat(40))
        console.log('\n1. Execute the above SQL in your Supabase Dashboard > SQL Editor')
        console.log('2. Then run: npm run migrate:unmark ' + lastMigration.id)
      } else {
        console.log(`⚠️  No rollback file found for ${lastMigration.name}`)
        console.log('Manual rollback required. To unmark this migration:')
        console.log(`npm run migrate:unmark ${lastMigration.id}`)
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      process.exit(1)
    }
  }

  async unmarkMigration(migrationId) {
    try {
      const { error } = await this.supabase
        .from('_migrations')
        .delete()
        .eq('id', migrationId)

      if (error) {
        console.error('Error unmarking migration:', error)
        throw error
      }

      console.log(`✅ Migration ${migrationId} unmarked successfully.`)
    } catch (error) {
      console.error('❌ Failed to unmark migration:', error)
      process.exit(1)
    }
  }
}

// Main execution
async function main() {
  const [,, command, migrationId] = process.argv
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)')
    console.error('\nPlease set these in your .env file or environment.')
    process.exit(1)
  }

  if (supabaseUrl.includes('your-project.supabase.co') || supabaseKey.includes('your-supabase')) {
    console.error('❌ Please update your .env file with actual Supabase credentials.')
    console.error('\nYour .env file contains placeholder values. Please:')
    console.error('1. Go to your Supabase project dashboard')
    console.error('2. Copy your project URL and service key')
    console.error('3. Update the values in backend/.env file')
    console.error('\nExample:')
    console.error('SUPABASE_URL=https://abcdefghijklmnop.supabase.co')
    console.error('SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
    process.exit(1)
  }

  const runner = new MigrationRunner(supabaseUrl, supabaseKey)

  switch (command) {
    case 'up':
    case undefined:
      await runner.runMigrations()
      break
    case 'status':
      await runner.showStatus()
      break
    case 'rollback':
      await runner.rollbackLastMigration()
      break
    case 'mark':
      if (!migrationId) {
        console.error('❌ Migration ID required. Usage: npm run migrate:mark <migration_id>')
        process.exit(1)
      }
      await runner.markMigrationAsCompleted(migrationId)
      break
    case 'unmark':
      if (!migrationId) {
        console.error('❌ Migration ID required. Usage: npm run migrate:unmark <migration_id>')
        process.exit(1)
      }
      await runner.unmarkMigration(migrationId)
      break
    default:
      console.log(`
🚀 Finance Management - Database Migration Tool

Usage: npm run migrate [command] [options]

Commands:
  up (default)     Show pending migrations and SQL to execute
  status           Show migration status
  rollback         Show rollback instructions for last migration
  mark <id>        Mark a migration as completed
  unmark <id>      Unmark a migration (for rollbacks)

Examples:
  npm run migrate                    # Show pending migrations
  npm run migrate status             # Show all migration status
  npm run migrate mark 001_initial   # Mark migration as completed
  npm run migrate rollback           # Show rollback instructions

Environment Variables Required:
  SUPABASE_URL                       # Your Supabase project URL
  SUPABASE_SERVICE_KEY               # Your Supabase service key
      `)
      break
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { MigrationRunner }