import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { SavingsGoalService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { savingsGoalCreateSchema, savingsGoalUpdateSchema, uuidSchema, paginationSchema } from '../utils/validationSchemas'
import { z } from 'zod'
import { Env } from '../types/env'

// Helper function to validate data with Zod schema
function validateData<T>(schema: z.ZodSchema<T>, data: any): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.errors)}`)
  }
  return result.data
}

const savingsGoals = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all savings goals for a workspace
savingsGoals.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const category = c.req.query('category')
    
    const query = c.req.query()
    const pagination = query.page ? validateData(paginationSchema, {
      page: query.page,
      limit: query.limit
    }) as { page: number; limit: number } : undefined
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateData(uuidSchema, workspaceId)
    
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
    const goalId = validateData(uuidSchema, c.req.param('id'))
    
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
    const validatedData = validateData(savingsGoalCreateSchema, body)
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'Workspace ID is required', 400)
    }
    
    validateData(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const goalData = {
      ...validatedData,
      workspaceId: workspaceId,
      createdBy: user.id
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
    const goalId = validateData(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateData(savingsGoalUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    // Convert string dates to Date objects if present
    const updateData = {
      ...validatedData,
      targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : undefined
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
    const goalId = validateData(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const { amount } = validateData(z.object({
      amount: z.number().positive()
    }), body)
    
    const supabase = getSupabaseClient(c.env)
    const savingsGoalService = new SavingsGoalService(supabase)
    
    const goal = await savingsGoalService.addMoneyToGoal(goalId, amount, user.id)
    
    return successResponse(c, goal, 'Money added to savings goal successfully')
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
    const goalId = validateData(uuidSchema, c.req.param('id'))
    
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