import { AppDataSource } from '../config/database'

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
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
      tablesResult.forEach((table: any) => {
        console.log(`  - ${table.table_name} (${table.table_type})`)
      })
      
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
      
      // Test a simple query on user_profiles table
      try {
        const userProfilesResult = await queryRunner.query('SELECT COUNT(*) as count FROM user_profiles')
        console.log(`\n👥 User profiles count: ${userProfilesResult[0].count}`)
      } catch (error) {
        console.log('❌ Could not query user_profiles table:', error.message)
      }
      
      // Test a simple query on workspaces table
      try {
        const workspacesResult = await queryRunner.query('SELECT COUNT(*) as count FROM workspaces')
        console.log(`🏢 Workspaces count: ${workspacesResult[0].count}`)
      } catch (error) {
        console.log('❌ Could not query workspaces table:', error.message)
      }
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    process.exit(1)
  }
}

// Run the test
testDatabaseConnection() 