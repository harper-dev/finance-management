import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, workspaceCreateSchema, workspaceUpdateSchema, uuidSchema } from '../utils/validation'
import { Env } from '../types/env'

const workspaces = new Hono<{ Bindings: Env }>()

// Get all user workspaces
workspaces.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members!inner(role)
      `)
      .eq('workspace_members.user_id', user.id)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, data)
  } catch (error) {
    return errorResponse(c, `Failed to fetch workspaces: ${error}`, 500)
  }
})

// Get specific workspace
workspaces.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('workspaces')
      .select(`
        *,
        workspace_members(
          id,
          user_id,
          role,
          permissions,
          joined_at,
          user_profiles(display_name)
        )
      `)
      .eq('id', workspaceId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Workspace')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data)
  } catch (error) {
    return errorResponse(c, `Failed to fetch workspace: ${error}`, 500)
  }
})

// Create new workspace
workspaces.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(workspaceCreateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    
    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert([{ ...validatedData, owner_id: user.id }])
      .select()
      .single()
    
    if (workspaceError) {
      throw new Error(workspaceError.message)
    }
    
    // Add creator as owner member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert([{
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner'
      }])
    
    if (memberError) {
      throw new Error(memberError.message)
    }
    
    return successResponse(c, workspace, 'Workspace created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create workspace: ${error}`, 500)
  }
})

// Update workspace
workspaces.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateRequest(workspaceUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('workspaces')
      .update(validatedData)
      .eq('id', workspaceId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Workspace')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Workspace updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update workspace: ${error}`, 500)
  }
})

// Delete workspace
workspaces.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, null, 'Workspace deleted successfully')
  } catch (error) {
    return errorResponse(c, `Failed to delete workspace: ${error}`, 500)
  }
})

// Invite user to workspace
workspaces.post('/:id/invite', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const { email, role = 'member' } = body
    
    if (!email) {
      return errorResponse(c, 'Email is required', 400)
    }
    
    const supabase = getSupabaseClient(c.env)
    
    // Find user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError || !authUser.user) {
      return errorResponse(c, 'User not found', 404)
    }
    
    // Add to workspace
    const { data, error } = await supabase
      .from('workspace_members')
      .insert([{
        workspace_id: workspaceId,
        user_id: authUser.user.id,
        role: role
      }])
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return errorResponse(c, 'User is already a member', 409)
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'User invited successfully')
  } catch (error) {
    return errorResponse(c, `Failed to invite user: ${error}`, 500)
  }
})

// Update member role
workspaces.put('/:id/members/:userId', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const userId = validateRequest(uuidSchema, c.req.param('userId'))
    const body = await c.req.json()
    const { role } = body
    
    if (!role || !['owner', 'admin', 'member', 'viewer'].includes(role)) {
      return errorResponse(c, 'Valid role is required', 400)
    }
    
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Member role updated successfully')
  } catch (error) {
    return errorResponse(c, `Failed to update member role: ${error}`, 500)
  }
})

// Remove member from workspace
workspaces.delete('/:id/members/:userId', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const userId = validateRequest(uuidSchema, c.req.param('userId'))
    
    const supabase = getSupabaseClient(c.env)
    
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, null, 'Member removed successfully')
  } catch (error) {
    return errorResponse(c, `Failed to remove member: ${error}`, 500)
  }
})

export default workspaces