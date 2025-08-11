#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config()

const { MigrationRunner } = require('./migrate.js')

async function setupDatabase() {
  console.log('🚀 Finance Management - Database Setup')
  console.log('=' .repeat(50))
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY)')
    console.error('\nPlease set these in your .env file:')
    console.error('   SUPABASE_URL=https://your-project.supabase.co')
    console.error('   SUPABASE_SERVICE_KEY=your-service-key')
    process.exit(1)
  }

  const runner = new MigrationRunner(supabaseUrl, supabaseKey)

  console.log('\n📋 STEP 1: Create Migration Tracking Table')
  console.log('-'.repeat(50))
  console.log('Please execute the following SQL in your Supabase Dashboard > SQL Editor:\n')
  
  const createTableSql = `CREATE TABLE IF NOT EXISTS _migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);`
  
  console.log(createTableSql)
  console.log('\n✅ After executing this, press Enter to continue...')
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve())
  })

  console.log('\n📋 STEP 2: Check Migration Status')
  console.log('-'.repeat(50))
  await runner.showStatus()

  console.log('\n📋 STEP 3: Run Migrations')
  console.log('-'.repeat(50))
  await runner.runMigrations()

  console.log('\n✅ Database setup completed!')
  console.log('\nNext steps:')
  console.log('1. Execute the migration SQL shown above in Supabase')
  console.log('2. Mark each migration as completed using: npm run migrate:mark <migration_id>')
  console.log('3. Verify status with: npm run migrate:status')
}

if (require.main === module) {
  setupDatabase().catch(console.error)
}

module.exports = { setupDatabase }