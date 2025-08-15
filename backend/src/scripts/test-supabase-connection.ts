import 'dotenv/config'
import { AppDataSource } from '../config/database'

async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase database connection...')
    
    // Check environment variables
    const requiredEnvVars = [
      'SUPABASE_HOST',
      'SUPABASE_USER', 
      'SUPABASE_PASSWORD',
      'SUPABASE_DB'
    ]
    
    console.log('📋 Environment variables:')
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName]
      if (value) {
        console.log(`  ✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value}`)
      } else {
        console.log(`  ❌ ${varName}: missing`)
      }
    })
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established to Supabase')
    
    // Test basic queries
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    try {
      // Check current schema
      const schemaResult = await queryRunner.query('SELECT current_schema()')
      console.log('📋 Current schema:', schemaResult[0].current_schema)
      
      // List all tables in public schema
      const tablesResult = await queryRunner.query(`
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      
      console.log('📊 Tables in public schema:')
      if (tablesResult.length === 0) {
        console.log('  ℹ️  No tables found - you may need to run migrations')
      } else {
        tablesResult.forEach((table: any) => {
          console.log(`  - ${table.table_name} (${table.table_type})`)
        })
      }
      
      // Check if our expected tables exist
      const expectedTables = [
        'user_profiles',
        'workspaces', 
        'workspace_members',
        'accounts',
        'transactions',
        'budgets',
        'savings_goals',
        'user_settings'
      ]
      
      const existingTables = tablesResult.map((t: any) => t.table_name)
      console.log('\n🔍 Checking expected tables:')
      
      expectedTables.forEach(table => {
        if (existingTables.includes(table)) {
          console.log(`  ✅ ${table} - exists`)
        } else {
          console.log(`  ❌ ${table} - missing`)
        }
      })
      
      // Test a simple query on user_profiles table if it exists
      if (existingTables.includes('user_profiles')) {
        try {
          const userProfilesResult = await queryRunner.query('SELECT COUNT(*) as count FROM user_profiles')
          console.log(`\n👥 User profiles count: ${userProfilesResult[0].count}`)
        } catch (error) {
          console.log('❌ Could not query user_profiles table:', error.message)
        }
      }
      
      // Test a simple query on workspaces table if it exists
      if (existingTables.includes('workspaces')) {
        try {
          const workspacesResult = await queryRunner.query('SELECT COUNT(*) as count FROM workspaces')
          console.log(`🏢 Workspaces count: ${workspacesResult[0].count}`)
        } catch (error) {
          console.log('❌ Could not query workspaces table:', error.message)
        }
      }
      
      if (existingTables.length === 0) {
        console.log('\n📝 Next steps:')
        console.log('1. Run migrations to create tables: npm run migrate up')
        console.log('2. Or manually execute SQL from src/migrations/001_initial_schema.sql')
        console.log('3. Then run this test again to verify tables exist')
      }
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection refused - check:')
      console.log('1. SUPABASE_HOST is correct (should be db.your-project.supabase.co)')
      console.log('2. SUPABASE_PORT is correct (should be 5432)')
      console.log('3. Network allows outbound connections to Supabase')
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Authentication failed - check:')
      console.log('1. SUPABASE_USER is correct (should be postgres)')
      console.log('2. SUPABASE_PASSWORD is correct')
      console.log('3. Database password from Supabase Dashboard > Settings > Database')
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Database does not exist - check:')
      console.log('1. SUPABASE_DB is correct (should be postgres)')
      console.log('2. Project is properly set up in Supabase')
    }
    
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection() 