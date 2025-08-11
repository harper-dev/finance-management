const { serve } = require('@hono/node-server')
const { Hono } = require('hono')
const { cors } = require('hono/cors')
require('dotenv').config()

// We'll need to use a simpler approach since the routes are TypeScript

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Environment variables middleware
app.use('*', (c, next) => {
  c.env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    JWT_SECRET: process.env.JWT_SECRET
  }
  return next()
})

// Routes
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/workspaces', workspacesRoutes)
app.route('/api/v1/accounts', accountsRoutes)
app.route('/api/v1/transactions', transactionsRoutes)
app.route('/api/v1/budgets', budgetsRoutes)
app.route('/api/v1/savings-goals', savingsGoalsRoutes)
app.route('/api/v1/analytics', analyticsRoutes)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = parseInt(process.env.PORT || '3002')

console.log(`Starting server on http://localhost:${port}`)
serve({
  fetch: app.fetch,
  port
})