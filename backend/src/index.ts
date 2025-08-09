import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { corsMiddleware } from './middleware/cors'
import { errorResponse } from './utils/response'
import { Env } from './types/env'

// Import routes (will be implemented next)
import authRoutes from './routes/auth'
import workspaceRoutes from './routes/workspaces'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import analyticsRoutes from './routes/analytics'

const app = new Hono<{ Bindings: Env }>()

// CORS middleware
app.use('*', corsMiddleware)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  })
})

// API routes
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/workspaces', workspaceRoutes)  
app.route('/api/v1/accounts', accountRoutes)
app.route('/api/v1/transactions', transactionRoutes)
app.route('/api/v1/budgets', budgetRoutes)
app.route('/api/v1/analytics', analyticsRoutes)

// 404 handler
app.notFound((c) => {
  return errorResponse(c, 'Endpoint not found', 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Global error:', err)
  
  if (err instanceof HTTPException) {
    return errorResponse(c, err.message, err.status)
  }
  
  return errorResponse(c, 'Internal server error', 500)
})

export default app