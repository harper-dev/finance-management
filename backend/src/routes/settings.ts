import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { UserSettingsService, WorkspaceService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateBody } from '../middleware/validation'
import { userSettingsUpdateSchema, workspaceSettingsUpdateSchema, uuidSchema } from '../utils/validation'
import { validateRequest } from '../utils/validation'
import { Env } from '../types/env'
import { AppError, ErrorType } from '../utils/errors'

const settings = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get user settings
settings.get('/user', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    const userSettingsService = new UserSettingsService(supabase)
    
    const userSettings = await userSettingsService.getUserSettings(user.id)
    
    return successResponse(c, userSettings)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(c, error.message, error.statusCode, error.type)
    }
    return errorResponse(c, `Failed to fetch user settings: ${error}`, 500, ErrorType.SERVER_ERROR)
  }
})

// Update user settings
settings.put('/user', requireAuth(), validateBody(userSettingsUpdateSchema), async (c) => {
  try {
    const user = c.get('user')
    const validatedData = c.get('validatedData')
    
    const supabase = getSupabaseClient(c.env)
    const userSettingsService = new UserSettingsService(supabase)
    
    const updatedSettings = await userSettingsService.updateUserSettings(user.id, validatedData)
    
    return successResponse(c, updatedSettings, 'User settings updated successfully')
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(c, error.message, error.statusCode, error.type)
    }
    return errorResponse(c, `Failed to update user settings: ${error}`, 500, ErrorType.SERVER_ERROR)
  }
})

// Update workspace settings (enhanced endpoint)
settings.put('/workspace/:id', requireAuth(), validateBody(workspaceSettingsUpdateSchema), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = validateRequest(uuidSchema, c.req.param('id'))
    const validatedData = c.get('validatedData')
    
    const supabase = getSupabaseClient(c.env)
    const workspaceService = new WorkspaceService(supabase)
    
    // Check if user has permission to update workspace settings
    const userRole = await workspaceService.getUserRole(workspaceId, user.id)
    if (!userRole || !['owner', 'admin'].includes(userRole)) {
      return errorResponse(c, 'Access denied: Insufficient permissions to update workspace settings', 403, ErrorType.AUTHORIZATION_ERROR)
    }
    
    // Update workspace with new settings
    const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, validatedData, user.id)
    
    // TODO: Add settings change notifications to workspace members
    // This would be implemented in a future iteration
    
    return successResponse(c, updatedWorkspace, 'Workspace settings updated successfully')
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(c, error.message, error.statusCode, error.type)
    }
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403, ErrorType.AUTHORIZATION_ERROR)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422, ErrorType.VALIDATION_ERROR)
    }
    return errorResponse(c, `Failed to update workspace settings: ${error}`, 500, ErrorType.SERVER_ERROR)
  }
})

export default settings