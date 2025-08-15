import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { Env } from '../types/env'

export interface AuthUser {
  id: string
  email?: string
  role?: string
}

// Simple JWT decoder (for development only)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env, Variables: { user: AuthUser } }>, next: Next) {
  const authorization = c.req.header('Authorization')
  
  if (!authorization) {
    throw new HTTPException(401, { message: 'Authorization header is required' })
  }

  const token = authorization.replace('Bearer ', '')
  
  if (!token) {
    throw new HTTPException(401, { message: 'Bearer token is required' })
  }

  try {
    // Decode JWT token to extract user information
    const decoded = decodeJWT(token)
    
    if (!decoded || !decoded.sub) {
      throw new HTTPException(401, { message: 'Invalid token format' })
    }

    // Extract user info from decoded token
    const user: AuthUser = {
      id: decoded.sub, // sub field contains user ID
      email: decoded.email,
      role: decoded.role || 'user'
    }
      
    console.log('Token verified successfully for user:', user.id)

    // Add user info to context
    c.set('user', user)

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    
    console.error('Authentication error:', error)
    throw new HTTPException(401, { message: 'Authentication failed' })
  }
}

export function requireAuth() {
  return authMiddleware
}