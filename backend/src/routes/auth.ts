import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, userProfileCreateSchema, userProfileUpdateSchema } from '../utils/validation'
import { Env } from '../types/env'

const auth = new Hono<{ Bindings: Env }>()

// Get current user profile
auth.get('/me', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw new Error(error.message)
    }
    
    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{ user_id: user.id }])
        .select()
        .single()
      
      if (createError) {
        throw new Error(createError.message)
      }
      
      return successResponse(c, { user, profile: newProfile })
    }
    
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
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(validatedData)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
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
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert([{ user_id: user.id, ...validatedData }])
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return errorResponse(c, 'Profile already exists', 409)
      }
      throw new Error(error.message)
    }
    
    // Create default personal workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert([{
        name: 'Personal Finance',
        type: 'personal',
        owner_id: user.id,
        currency: validatedData.preferred_currency || 'SGD'
      }])
      .select()
      .single()
    
    if (workspaceError) {
      console.error('Failed to create default workspace:', workspaceError)
    } else {
      // Add user as owner to workspace_members
      await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner'
        }])
    }
    
    return successResponse(c, { profile, workspace }, 'Profile created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create profile: ${error}`, 500)
  }
})

export default auth