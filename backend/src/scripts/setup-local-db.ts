import { AppDataSource } from '../config/database'
import * as fs from 'fs'
import * as path from 'path'

async function setupLocalDatabase() {
  try {
    console.log('🔌 Setting up local PostgreSQL database...')
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    try {
      // Read and execute the initial schema migration
      const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql')
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8')
      
      console.log('📋 Executing initial schema migration...')
      await queryRunner.query(migrationSql)
      console.log('✅ Initial schema created')
      
      // Read and execute additional migrations
      const migrations = [
        '004_user_settings_and_workspace_enhancements.sql',
        '005_performance_indexes.sql'
      ]
      
      for (const migrationFile of migrations) {
        const migrationPath = path.join(__dirname, '../migrations', migrationFile)
        if (fs.existsSync(migrationPath)) {
          console.log(`📋 Executing ${migrationFile}...`)
          const sql = fs.readFileSync(migrationPath, 'utf-8')
          await queryRunner.query(sql)
          console.log(`✅ ${migrationFile} executed`)
        }
      }
      
      // Verify tables were created
      const tablesResult = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      
      console.log('\n📊 Tables created in public schema:')
      tablesResult.forEach((table: any) => {
        console.log(`  ✅ ${table.table_name}`)
      })
      
      // Test inserting a sample workspace
      console.log('\n🧪 Testing data insertion...')
      const workspaceId = '550e8400-e29b-41d4-a716-446655440000'
      await queryRunner.query(`
        INSERT INTO workspaces (id, name, type, owner_id, currency)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [workspaceId, 'Personal Workspace', 'personal', '00000000-0000-0000-0000-000000000000', 'SGD'])
      
      console.log('✅ Sample workspace created')
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    console.log('\n🎉 Local database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupLocalDatabase() 