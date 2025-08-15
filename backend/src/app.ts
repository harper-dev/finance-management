import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import { 
  requestContextMiddleware, 
  errorLoggingMiddleware, 
  createErrorHandler 
} from './middleware/errorHandler'
import { loggingMiddleware } from './middleware/logging'
import { notFoundResponse } from './utils/response'
import { Env } from './types/env'
import { initializeDatabase } from './config/database'
import { getEnvironmentConfig } from './config/environment'
import { logger } from './config/logging'

// Import routes
import authRoutes from './routes/auth'
import settingsRoutes from './routes/settings'
import workspaceRoutes from './routes/workspaces'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import savingsGoalRoutes from './routes/savings-goals'
import analyticsRoutes from './routes/analytics'

export class FinanceManagementApp {
  private app: Hono<{ Bindings: Env }>

  constructor() {
    this.app = new Hono<{ Bindings: Env }>()
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  private setupMiddleware(): void {
    this.app.use('*', corsMiddleware)
    this.app.use('*', requestContextMiddleware)
    this.app.use('*', loggingMiddleware)
    this.app.use('*', this.setupEnvironment.bind(this))
    this.app.use('*', errorLoggingMiddleware)
  }

  private setupEnvironment(c: any, next: any): void {
    // Set environment variables for all routes
    c.env = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      JWT_SECRET: process.env.JWT_SECRET,
      ENVIRONMENT: process.env.NODE_ENV || 'development'
    }
    return next()
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', this.handleHealthCheck.bind(this))
    
    // Test error logging
    this.app.get('/test-error', this.handleTestError.bind(this))

    // API routes
    this.app.route('/api/v1/auth', authRoutes)
    this.app.route('/api/v1/settings', settingsRoutes)
    this.app.route('/api/v1/workspaces', workspaceRoutes)
    this.app.route('/api/v1/accounts', accountRoutes)
    this.app.route('/api/v1/transactions', transactionRoutes)
    this.app.route('/api/v1/budgets', budgetRoutes)
    this.app.route('/api/v1/savings-goals', savingsGoalRoutes)
    this.app.route('/api/v1/analytics', analyticsRoutes)
  }

  private setupErrorHandling(): void {
    this.app.notFound(this.handleNotFound.bind(this))
    this.app.onError(createErrorHandler())
  }

  private handleHealthCheck(c: any) {
    try {
      return c.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Health check error:', error)
      return c.json({ 
        status: 'error', 
        message: 'Health check failed' 
      }, 500)
    }
  }

  private handleNotFound(c: any) {
    return notFoundResponse(c, 'Endpoint')
  }

  private handleTestError(c: any) {
    // This will trigger the global error handler
    throw new Error('Test error for logging verification')
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing database connection...')
      await initializeDatabase()
      logger.info('Application initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize application:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        timestamp: new Date().toISOString()
      })
      
      // Don't throw error, just log it and continue
      // This allows the server to start even if database is not available
      logger.warn('Continuing without database connection...')
      
      // Try to initialize TypeORM entities even if connection fails
      try {
        const { AppDataSource } = await import('./config/database')
        if (AppDataSource.isInitialized) {
          logger.info('Database connection is available')
        } else {
          logger.warn('Database connection not available, some features may not work')
        }
      } catch (dbError) {
        logger.warn('Could not check database status:', {
          error: dbError.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  getApp(): Hono<{ Bindings: Env }> {
    return this.app
  }
}

export default FinanceManagementApp 