import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { BudgetService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, budgetCreateSchema, budgetUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const budgets = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all budgets for a workspace
budgets.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const period = c.req.query('period')
    
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
    const budgetService = new BudgetService(supabase)
    
    const filters = {
      is_active: isActive !== undefined ? isActive === 'true' : undefined,
      period
    }
    
    const result = await budgetService.getBudgets(workspaceId, user.id, filters, pagination)
    
    return successResponse(c, result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to fetch budgets: ${error}`, 500)
  }
})

// Get specific budget
budgets.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const budgetService = new BudgetService(supabase)
    
    const budget = await budgetService.getBudgetById(budgetId, user.id)
    
    return successResponse(c, budget)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to fetch budget: ${error}`, 500)
  }
})

// Create new budget
budgets.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(budgetCreateSchema, body)
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const budgetService = new BudgetService(supabase)
    
    const budgetData = {
      ...validatedData,
      workspace_id: workspaceId,
      created_by: user.id,
      start_date: new Date(validatedData.start_date),
      end_date: validatedData.end_date ? new Date(validatedData.end_date) : undefined
    }
    
    const budget = await budgetService.createBudget(budgetData, user.id)
    
    return successResponse(c, budget, 'Budget created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create budget: ${error}`, 500)
  }
})

// Update budget
budgets.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateRequest(budgetUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const budgetService = new BudgetService(supabase)
    
    // Convert string dates to Date objects if present
    const updateData = {
      ...validatedData,
      start_date: validatedData.start_date ? new Date(validatedData.start_date) : undefined,
      end_date: validatedData.end_date ? new Date(validatedData.end_date) : undefined
    }
    
    const budget = await budgetService.updateBudget(budgetId, updateData, user.id)
    
    return successResponse(c, budget, 'Budget updated successfully')
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
    return errorResponse(c, `Failed to update budget: ${error}`, 500)
  }
})

// Delete budget
budgets.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const budgetService = new BudgetService(supabase)
    
    await budgetService.deleteBudget(budgetId, user.id)
    
    return successResponse(c, null, 'Budget deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to delete budget: ${error}`, 500)
  }
})

export default budgets