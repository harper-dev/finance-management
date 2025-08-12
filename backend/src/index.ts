import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { corsMiddleware } from './middleware/cors'
import { errorResponse } from './utils/response'
import { Env } from './types/env'

// Import routes
import authRoutes from './routes/auth'
import workspaceRoutes from './routes/workspaces'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import savingsGoalRoutes from './routes/savings-goals'
import analyticsRoutes from './routes/analytics'

const app = new Hono<{ Bindings: Env }>()

// CORS middleware
app.use('*', corsMiddleware)

// Simple logging middleware
app.use('*', async (c, next) => {
  const startTime = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - Request started`);
  
  try {
    await next();
    const duration = Date.now() - startTime;
    const statusCode = c.res.status;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ${method} ${url} - Error (${duration}ms):`, error);
    throw error;
  }
});

// Health check endpoint
app.get('/health', (c) => {
  console.log('Health check requested');
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  })
})

// Test route to verify routing works
app.get('/test-route', (c) => {
  console.log('Test route called');
  return c.json({ message: 'Test route working' });
})

// API routes
console.log('Setting up API routes...');
app.route('/api/v1/auth', authRoutes)
console.log('Auth routes added');
app.route('/api/v1/workspaces', workspaceRoutes)  
console.log('Workspace routes added');
app.route('/api/v1/accounts', accountRoutes)
console.log('Account routes added');
app.route('/api/v1/transactions', transactionRoutes)
console.log('Transaction routes added');
app.route('/api/v1/budgets', budgetRoutes)
console.log('Budget routes added');
app.route('/api/v1/savings-goals', savingsGoalRoutes)
console.log('Savings goal routes added');
app.route('/api/v1/analytics', analyticsRoutes)
console.log('Analytics routes added');
console.log('All API routes configured');

// 404 handler
app.notFound((c) => {
  console.warn('Endpoint not found:', c.req.url);
  return errorResponse(c, 'Endpoint not found', 404)
})

// Global error handler
app.onError((err, c) => {
  console.error('Global error occurred:', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    url: c.req.url,
    method: c.req.method
  });
  
  if (err instanceof HTTPException) {
    return errorResponse(c, err.message, err.status)
  }
  
  return errorResponse(c, 'Internal server error', 500)
})

export default app