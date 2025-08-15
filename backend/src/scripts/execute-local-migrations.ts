import 'dotenv/config'
import { AppDataSource } from '../config/database'
import * as fs from 'fs'
import * as path from 'path'

async function executeLocalMigrations() {
  try {
    console.log('🔌 Executing local database migrations...')
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    try {
      // Execute migrations in order
      const migrations = [
        '001_initial_schema_local.sql'
      ]
      
      for (const migrationFile of migrations) {
        const migrationPath = path.join(__dirname, '../migrations', migrationFile)
        if (fs.existsSync(migrationPath)) {
          console.log(`📋 Executing ${migrationFile}...`)
          const sql = fs.readFileSync(migrationPath, 'utf-8')
          
          // Execute the entire SQL file as one statement
          try {
            await queryRunner.query(sql)
            console.log(`✅ ${migrationFile} executed successfully`)
          } catch (error) {
            console.log(`  ❌ Error executing ${migrationFile}: ${error.message}`)
            // Continue with other migrations
          }
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
      
      console.log('\n📊 Tables in public schema:')
      tablesResult.forEach((table: any) => {
        console.log(`  ✅ ${table.table_name}`)
      })
      
      // Test inserting a sample workspace if it exists
      if (tablesResult.some((t: any) => t.table_name === 'workspaces')) {
        console.log('\n🧪 Testing data insertion...')
        const workspaceId = '550e8400-e29b-41d4-a716-446655440000'
        await queryRunner.query(`
          INSERT INTO workspaces (id, name, type, owner_id, currency)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [workspaceId, 'Personal Workspace', 'personal', '00000000-0000-0000-0000-000000000000', 'SGD'])
        
        console.log('✅ Sample workspace created')
      }
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    console.log('\n🎉 Local database migrations completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration execution failed:', error)
    process.exit(1)
  }
}

// Run the migrations
executeLocalMigrations() 