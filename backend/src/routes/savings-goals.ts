import { Hono } from 'hono'
import { z } from 'zod'
import { getSupabaseClient } from '../services/supabase'
import { SavingsGoalService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, savingsGoalCreateSchema, savingsGoalUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const savingsGoals = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all savings goals for a workspace
savingsGoals.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const category = c.req.query('category')
    
    const query = c.req.query()
    const pagination = query.page ? validateRequest(paginationSchema, {
      page: query.page,
      limit: query.limit
    }) as { page: number; limit: number } : undefined
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const filters = {
      is_active: isActive !== undefined ? isActive === 'true' : undefined,
      category
    }
    
    const result = await savingsGoalService.getSavingsGoals(workspaceId, user.id, filters, pagination)
    
    return successResponse(c, result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to fetch savings goals: ${error}`, 500)
  }
})

// Get specific savings goal
savingsGoals.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const goalId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const goal = await savingsGoalService.getSavingsGoalById(goalId, user.id)
    
    return successResponse(c, goal)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to fetch savings goal: ${error}`, 500)
  }
})

// Create new savings goal
savingsGoals.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(savingsGoalCreateSchema, body)
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const goalData = {
      ...validatedData,
      workspace_id: workspaceId,
      created_by: user.id,
      target_date: validatedData.target_date ? new Date(validatedData.target_date) : undefined
    }
    
    const goal = await savingsGoalService.createSavingsGoal(goalData, user.id)
    
    return successResponse(c, goal, 'Savings goal created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create savings goal: ${error}`, 500)
  }
})

// Update savings goal
savingsGoals.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const goalId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateRequest(savingsGoalUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    // Convert string dates to Date objects if present
    const updateData = {
      ...validatedData,
      target_date: validatedData.target_date ? new Date(validatedData.target_date) : undefined
    }
    
    const goal = await savingsGoalService.updateSavingsGoal(goalId, updateData, user.id)
    
    return successResponse(c, goal, 'Savings goal updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update savings goal: ${error}`, 500)
  }
})

// Add money to savings goal
savingsGoals.post('/:id/add-money', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const goalId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const { amount } = validateRequest(z.object({
      amount: z.number().positive()
    }), body)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const goal = await savingsGoalService.addMoneyToGoal(goalId, amount, user.id)
    
    return successResponse(c, goal, `Successfully added ${amount} to savings goal`)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to add money to savings goal: ${error}`, 500)
  }
})

// Delete savings goal
savingsGoals.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const goalId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    await savingsGoalService.deleteSavingsGoal(goalId, user.id)
    
    return successResponse(c, null, 'Savings goal deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to delete savings goal: ${error}`, 500)
  }
})

export default savingsGoals