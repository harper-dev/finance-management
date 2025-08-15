import { Context, Next } from 'hono'

export async function corsMiddleware(c: Context, next: Next) {
  const origin = c.req.header('origin')
  
  // Get allowed origins from environment variable or use defaults
  const allowedOriginsStr = c.env?.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:5173'
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim())
  
  // Always allow localhost origins in development
  const isLocalhost = origin?.startsWith('http://localhost') || origin?.startsWith('http://127.0.0.1')
  
  if (origin && (allowedOrigins.includes(origin) || isLocalhost)) {
    c.header('Access-Control-Allow-Origin', origin)
    console.log(`CORS: Allowing origin: ${origin}`)
  } else {
    console.log(`CORS: Origin not allowed: ${origin}`)
    console.log(`CORS: Allowed origins: ${allowedOrigins.join(', ')}`)
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
  c.header('Access-Control-Allow-Credentials', 'true')
  c.header('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200)
  }

  await next()
}