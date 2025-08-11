import { Context, Next } from 'hono'

export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('origin')
  
  // Get allowed origins from environment variable or use defaults
  const allowedOriginsStr = c.env?.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:5173'
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim())
  
  // Allow requests from allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin)
  } else {
    // For development, be more permissive with localhost origins
    if (origin?.startsWith('http://localhost') || origin?.startsWith('http://127.0.0.1')) {
      c.header('Access-Control-Allow-Origin', origin)
    }
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200)
  }

  await next()
}