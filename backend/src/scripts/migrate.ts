#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

interface MigrationRecord {
  id: string
  name: string
  executed_at: string
}

class MigrationRunner {
  private supabase: any
  private migrationsDir: string

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get the directory of current script
    const currentDir = dirname(fileURLToPath(import.meta.url))
    this.migrationsDir = join(currentDir, '../migrations')
  }

  async createMigrationsTable(): Promise<void> {
    const { error } = await this.supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS _migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    if (error) {
      console.error('Error creating migrations table:', error)
      throw error
    }
  }

  async getExecutedMigrations(): Promise<Set<string>> {
    try {
      const { data, error } = await this.supabase
        .from('_migrations')
        .select('id')

      if (error && error.code !== 'PGRST116') { // Table doesn't exist
        return new Set()
      }

      return new Set((data || []).map((row: MigrationRecord) => row.id))
    } catch (error) {
      console.log('Migrations table does not exist yet, creating...')
      return new Set()
    }
  }

  async getMigrationFiles(): Promise<Array<{id: string, name: string, path: string}>> {
    try {
      const files = readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()

      return files.map(file => {
        const id = file.replace('.sql', '')
        return {
          id,
          name: file,
          path: join(this.migrationsDir, file)
        }
      })
    } catch (error) {
      console.error('Error reading migrations directory:', error)
      throw error
    }
  }

  async executeMigration(migration: {id: string, name: string, path: string}): Promise<void> {
    console.log(`Executing migration: ${migration.name}`)
    
    try {
      const sql = readFileSync(migration.path, 'utf-8')
      
      // Split SQL by statements and execute one by one
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await this.supabase.rpc('exec', {
            sql: statement
          })

          if (error) {
            console.error(`Error executing statement in ${migration.name}:`, error)
            throw error
          }
        }
      }

      // Record migration as executed
      const { error: recordError } = await this.supabase
        .from('_migrations')
        .insert([{
          id: migration.id,
          name: migration.name
        }])

      if (recordError) {
        console.error('Error recording migration:', recordError)
        throw recordError
      }

      console.log(`✅ Migration ${migration.name} executed successfully`)
    } catch (error) {
      console.error(`❌ Failed to execute migration ${migration.name}:`, error)
      throw error
    }
  }

  async runMigrations(): Promise<void> {
    console.log('Starting database migrations...')

    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable()

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations()

      // Get all migration files
      const migrationFiles = await this.getMigrationFiles()

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        migration => !executedMigrations.has(migration.id)
      )

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations found. Database is up to date.')
        return
      }

      console.log(`Found ${pendingMigrations.length} pending migration(s):`)
      pendingMigrations.forEach(migration => {
        console.log(`  - ${migration.name}`)
      })

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration)
      }

      console.log('✅ All migrations completed successfully!')
    } catch (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
  }

  async rollbackLastMigration(): Promise<void> {
    console.log('Rolling back last migration...')

    try {
      // Get the last executed migration
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
        console.log('No migrations to rollback.')
        return
      }

      const lastMigration = data[0]
      console.log(`Rolling back migration: ${lastMigration.name}`)

      // Check if rollback file exists
      const rollbackFile = join(this.migrationsDir, `rollback_${lastMigration.id}.sql`)
      
      try {
        const rollbackSql = readFileSync(rollbackFile, 'utf-8')
        
        // Execute rollback SQL
        const statements = rollbackSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0)

        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await this.supabase.rpc('exec', {
              sql: statement
            })

            if (error) {
              console.error(`Error executing rollback statement:`, error)
              throw error
            }
          }
        }

        // Remove migration record
        const { error: deleteError } = await this.supabase
          .from('_migrations')
          .delete()
          .eq('id', lastMigration.id)

        if (deleteError) {
          console.error('Error removing migration record:', deleteError)
          throw deleteError
        }

        console.log(`✅ Rollback completed for migration: ${lastMigration.name}`)
      } catch (fileError) {
        console.warn(`⚠️  No rollback file found for ${lastMigration.name}. Manual rollback required.`)
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      process.exit(1)
    }
  }
}

// Main execution
async function main() {
  const command = process.argv[2]
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY')
    process.exit(1)
  }

  const runner = new MigrationRunner(supabaseUrl, supabaseKey)

  switch (command) {
    case 'up':
    case undefined:
      await runner.runMigrations()
      break
    case 'rollback':
      await runner.rollbackLastMigration()
      break
    case 'status':
      await runner.getExecutedMigrations()
      const migrationFiles = await runner.getMigrationFiles()
      const executedMigrations = await runner.getExecutedMigrations()
      
      console.log('\nMigration Status:')
      migrationFiles.forEach(migration => {
        const status = executedMigrations.has(migration.id) ? '✅ Executed' : '⏳ Pending'
        console.log(`  ${status} - ${migration.name}`)
      })
      break
    default:
      console.log(`
Usage: npm run migrate [command]

Commands:
  up (default)  Run all pending migrations
  rollback      Rollback the last migration
  status        Show migration status

Examples:
  npm run migrate
  npm run migrate up
  npm run migrate rollback
  npm run migrate status
      `)
      break
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { MigrationRunner }