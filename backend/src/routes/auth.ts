import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { AuthService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, userProfileCreateSchema, userProfileUpdateSchema } from '../utils/validation'
import { Env } from '../types/env'

const auth = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get current user profile
auth.get('/me', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    const profile = await authService.getUserProfile(user.id)
    
    return successResponse(c, { user, profile })
  } catch (error) {
    return errorResponse(c, `Failed to get user profile: ${error}`, 500)
  }
})

// Update user profile
auth.put('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(userProfileUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    const profile = await authService.updateUserProfile(user.id, validatedData)
    
    return successResponse(c, profile, 'Profile updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update profile: ${error}`, 500)
  }
})

// Create user profile (called after sign up)
auth.post('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(userProfileCreateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    const result = await authService.createUserProfile(user.id, validatedData)
    
    return successResponse(c, result, 'Profile created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      return errorResponse(c, 'Profile already exists', 409)
    }
    return errorResponse(c, `Failed to create profile: ${error}`, 500)
  }
})

export default auth