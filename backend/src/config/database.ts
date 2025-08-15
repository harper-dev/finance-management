import { DataSource } from 'typeorm'
import { UserProfile } from '../entities/UserProfile'
import { UserSettings } from '../entities/UserSettings'
import { Workspace } from '../entities/Workspace'
import { Account } from '../entities/Account'
import { Transaction } from '../entities/Transaction'
import { Budget } from '../entities/Budget'
import { SavingsGoal } from '../entities/SavingsGoal'
import { logger } from './logging'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.SUPABASE_HOST || 'db.your-project.supabase.co',
  port: parseInt(process.env.SUPABASE_PORT || '5432'),
  username: process.env.SUPABASE_USER || 'postgres',
  password: process.env.SUPABASE_PASSWORD || '',
  database: process.env.SUPABASE_DB || 'postgres',
  schema: 'public', // Use public schema in Supabase
  synchronize: false, // Disable auto-sync in production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.SUPABASE_HOST === 'localhost' ? false : {
    rejectUnauthorized: false // Required for Supabase
  },
  entities: [
    UserProfile,
    UserSettings,
    Workspace,
    Account,
    Transaction,
    Budget,
    SavingsGoal
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: []
})

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize()
    logger.info('Database connection established to Supabase public schema')

    // Verify we can access the public schema
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    try {
      // Check if we can query from public schema
      const result = await queryRunner.query('SELECT current_schema()')
      logger.info('Current schema:', { schema: result[0].current_schema })

      // Check if our tables exist
      const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      logger.info('Available tables in public schema:', { 
        tables: tables.map((t: any) => t.table_name) 
      })

    } finally {
      await queryRunner.release()
    }

  } catch (error) {
    logger.error('Database connection failed:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    })
    throw error
  }
} 