import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { WorkspaceService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, workspaceCreateSchema, workspaceUpdateSchema, uuidSchema } from '../utils/validation'
import { Env } from '../types/env'

const workspaces = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all user workspaces
workspaces.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    const workspaceService = new WorkspaceService(supabase)
    
    const userWorkspaces = await workspaceService.getUserWorkspaces(user.id)
    
    return successResponse(c, userWorkspaces)
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
    const workspaceService = new WorkspaceService(supabase)
    
    const workspace = await workspaceService.getWorkspaceById(workspaceId, user.id)
    
    if (!workspace) {
      return errorResponse(c, 'Workspace not found', 404)
    }
    
    return successResponse(c, workspace)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
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
    const workspaceService = new WorkspaceService(supabase)
    
    const workspace = await workspaceService.createWorkspace(validatedData, user.id)
    
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
    const workspaceService = new WorkspaceService(supabase)
    
    const workspace = await workspaceService.updateWorkspace(workspaceId, validatedData, user.id)
    
    return successResponse(c, workspace, 'Workspace updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
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
    const workspaceService = new WorkspaceService(supabase)
    
    await workspaceService.deleteWorkspace(workspaceId, user.id)
    
    return successResponse(c, null, 'Workspace deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to delete workspace: ${error}`, 500)
  }
})

// Invite user to workspace
workspaces.post('/:id/invite', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const { user_id, role = 'member' } = body
    
    if (!user_id) {
      return errorResponse(c, 'user_id is required', 400)
    }
    
    const supabase = getSupabaseClient(c.env)
    const workspaceService = new WorkspaceService(supabase)
    
    const member = await workspaceService.inviteUser(workspaceId, user_id, role, user.id)
    
    return successResponse(c, member, 'User invited successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('already a member')) {
      return errorResponse(c, error.message, 409)
    }
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
    
    if (!role || !['admin', 'member', 'viewer'].includes(role)) {
      return errorResponse(c, 'Valid role is required', 400)
    }
    
    const supabase = getSupabaseClient(c.env)
    const workspaceService = new WorkspaceService(supabase)
    
    const member = await workspaceService.updateMemberRole(workspaceId, userId, role, user.id)
    
    return successResponse(c, member, 'Member role updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Cannot modify owner')) {
      return errorResponse(c, error.message, 400)
    }
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
    const workspaceService = new WorkspaceService(supabase)
    
    await workspaceService.removeMember(workspaceId, userId, user.id)
    
    return successResponse(c, null, 'Member removed successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Cannot remove owner')) {
      return errorResponse(c, error.message, 400)
    }
    return errorResponse(c, `Failed to remove member: ${error}`, 500)
  }
})

export default workspaces