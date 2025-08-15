import 'dotenv/config'
import { AppDataSource } from '../config/database'

async function fixForeignKeys() {
  try {
    console.log('🔧 Fixing foreign key constraints for local development...')
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    try {
      // Drop foreign key constraints that reference auth.users
      console.log('📋 Dropping foreign key constraints...')
      
      // Drop user_profiles.user_id foreign key
      await queryRunner.query(`
        ALTER TABLE user_profiles 
        DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey
      `)
      console.log('✅ Dropped user_profiles.user_id foreign key')
      
      // Drop workspaces.owner_id foreign key
      await queryRunner.query(`
        ALTER TABLE workspaces 
        DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey
      `)
      console.log('✅ Dropped workspaces.owner_id foreign key')
      
      // Drop workspace_members.user_id foreign key
      await queryRunner.query(`
        ALTER TABLE workspace_members 
        DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey
      `)
      console.log('✅ Dropped workspace_members.user_id foreign key')
      
      // Drop accounts.created_by foreign key
      await queryRunner.query(`
        ALTER TABLE accounts 
        DROP CONSTRAINT IF EXISTS accounts_created_by_fkey
      `)
      console.log('✅ Dropped accounts.created_by foreign key')
      
      // Drop transactions.created_by foreign key
      await queryRunner.query(`
        ALTER TABLE transactions 
        DROP CONSTRAINT IF EXISTS transactions_created_by_fkey
      `)
      console.log('✅ Dropped transactions.created_by foreign key')
      
      // Drop budgets.created_by foreign key
      await queryRunner.query(`
        ALTER TABLE budgets 
        DROP CONSTRAINT IF EXISTS budgets_created_by_fkey
      `)
      console.log('✅ Dropped budgets.created_by foreign key')
      
      // Drop savings_goals.created_by foreign key
      await queryRunner.query(`
        ALTER TABLE savings_goals 
        DROP CONSTRAINT IF EXISTS savings_goals_created_by_fkey
      `)
      console.log('✅ Dropped savings_goals.created_by foreign key')
      
      console.log('\n🎉 Foreign key constraints fixed successfully!')
      
      // Test inserting a user profile
      console.log('\n🧪 Testing user profile creation...')
      const testUserId = 'test-user-' + Date.now()
      await queryRunner.query(`
        INSERT INTO user_profiles (user_id, display_name, preferred_currency, timezone, language)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO NOTHING
      `, [testUserId, 'Test User', 'SGD', 'Asia/Singapore', 'en'])
      
      console.log('✅ Test user profile created successfully')
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    
  } catch (error) {
    console.error('❌ Foreign key fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
fixForeignKeys() 