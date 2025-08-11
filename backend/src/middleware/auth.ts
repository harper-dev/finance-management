import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getSupabaseClient } from '../services/supabase'
import { Env } from '../types/env'

export interface AuthUser {
  id: string
  email?: string
  role?: string
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
    const supabase = getSupabaseClient(c.env)
    
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }

    // Add user info to context
    c.set('user', {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    })

    await next()
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    
    throw new HTTPException(401, { message: 'Authentication failed' })
  }
}

export function requireAuth() {
  return authMiddleware
}