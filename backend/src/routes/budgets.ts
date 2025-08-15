import { Hono } from 'hono'
import { BudgetService } from '../services/BudgetService'
import { requireAuth, AuthUser } from '../middleware/auth'
import { ResponseBuilder } from '../utils/apiResponse'
import { ValidationUtils } from '../utils/validation'
import { Env } from '../types/env'
import { CreateBudgetDto, UpdateBudgetDto } from '../entities'

const budgets = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all budgets for a workspace
budgets.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const period = c.req.query('period')
    
    if (!workspaceId) {
      return c.json(ResponseBuilder.error('workspace_id is required'), 400)
    }
    
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      return c.json(ResponseBuilder.validationError('Invalid workspace ID'), 400)
    }
    
    const budgetService = new BudgetService()
    
    const filters: any = { workspaceId }
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true'
    }
    if (period) {
      filters.period = period
    }
    
    const budgets = await budgetService.getBudgetsByWorkspace(workspaceId, filters.isActive)
    
    return c.json(ResponseBuilder.success(budgets))
  } catch (error) {
    console.error('Failed to fetch budgets:', error)
    return c.json(ResponseBuilder.serverError('Failed to fetch budgets'), 500)
  }
})

// Get specific budget
budgets.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = c.req.param('id')
    
    if (!ValidationUtils.isValidUUID(budgetId)) {
      return c.json(ResponseBuilder.validationError('Invalid budget ID'), 400)
    }
    
    const budgetService = new BudgetService()
    const budget = await budgetService.getBudgetWithSpending(budgetId)
    
    if (!budget) {
      return c.json(ResponseBuilder.notFound('Budget'), 404)
    }
    
    return c.json(ResponseBuilder.success(budget))
  } catch (error) {
    console.error('Failed to fetch budget:', error)
    return c.json(ResponseBuilder.serverError('Failed to fetch budget'), 500)
  }
})

// Create new budget
budgets.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return c.json(ResponseBuilder.error('workspace_id is required'), 400)
    }
    
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      return c.json(ResponseBuilder.validationError('Invalid workspace ID'), 400)
    }
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'amount', 'period', 'startDate']
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json(ResponseBuilder.validationError(`${field} is required`), 400)
      }
    }
    
    const budgetService = new BudgetService()
    
    const budgetData: CreateBudgetDto = {
      workspaceId,
      name: body.name,
      category: body.category,
      amount: body.amount,
      period: body.period,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      createdBy: user.id
    }
    
    const budget = await budgetService.createBudget(budgetData)
    
    return c.json(ResponseBuilder.success(budget, 'Budget created successfully'), 201)
  } catch (error) {
    console.error('Failed to create budget:', error)
    if (error instanceof Error) {
      return c.json(ResponseBuilder.error('Failed to create budget', error.message), 400)
    }
    return c.json(ResponseBuilder.serverError('Failed to create budget'), 500)
  }
})

// Update budget
budgets.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = c.req.param('id')
    const body = await c.req.json()
    
    if (!ValidationUtils.isValidUUID(budgetId)) {
      return c.json(ResponseBuilder.validationError('Invalid budget ID'), 400)
    }
    
    const budgetService = new BudgetService()
    
    const updateData: UpdateBudgetDto = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.category !== undefined) updateData.category = body.category
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.period !== undefined) updateData.period = body.period
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : undefined
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    
    const budget = await budgetService.updateBudget(budgetId, updateData)
    
    if (!budget) {
      return c.json(ResponseBuilder.notFound('Budget'), 404)
    }
    
    return c.json(ResponseBuilder.success(budget, 'Budget updated successfully'))
  } catch (error) {
    console.error('Failed to update budget:', error)
    if (error instanceof Error) {
      return c.json(ResponseBuilder.error('Failed to update budget', error.message), 400)
    }
    return c.json(ResponseBuilder.serverError('Failed to update budget'), 500)
  }
})

// Delete budget
budgets.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = c.req.param('id')
    
    if (!ValidationUtils.isValidUUID(budgetId)) {
      return c.json(ResponseBuilder.validationError('Invalid budget ID'), 400)
    }
    
    const budgetService = new BudgetService()
    const success = await budgetService.delete(budgetId)
    
    if (!success) {
      return c.json(ResponseBuilder.notFound('Budget'), 404)
    }
    
    return c.json(ResponseBuilder.success(null, 'Budget deleted successfully'))
  } catch (error) {
    console.error('Failed to delete budget:', error)
    return c.json(ResponseBuilder.serverError('Failed to delete budget'), 500)
  }
})

// Get budget with spending details
budgets.get('/:id/spending', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = c.req.param('id')
    
    if (!ValidationUtils.isValidUUID(budgetId)) {
      return c.json(ResponseBuilder.validationError('Invalid budget ID'), 400)
    }
    
    const budgetService = new BudgetService()
    const budgetWithSpending = await budgetService.getBudgetWithSpending(budgetId)
    
    if (!budgetWithSpending) {
      return c.json(ResponseBuilder.notFound('Budget'), 404)
    }
    
    return c.json(ResponseBuilder.success(budgetWithSpending))
  } catch (error) {
    console.error('Failed to fetch budget spending:', error)
    return c.json(ResponseBuilder.serverError('Failed to fetch budget spending'), 500)
  }
})

// Get active budgets with spending for a workspace
budgets.get('/workspace/:workspaceId/active', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      return c.json(ResponseBuilder.validationError('Invalid workspace ID'), 400)
    }
    
    const budgetService = new BudgetService()
    const activeBudgets = await budgetService.getActiveBudgetsWithSpending(workspaceId)
    
    return c.json(ResponseBuilder.success(activeBudgets))
  } catch (error) {
    console.error('Failed to fetch active budgets:', error)
    return c.json(ResponseBuilder.serverError('Failed to fetch active budgets'), 500)
  }
})

// Get budget summary for a workspace
budgets.get('/workspace/:workspaceId/summary', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.param('workspaceId')
    
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      return c.json(ResponseBuilder.validationError('Invalid workspace ID'), 400)
    }
    
    const budgetService = new BudgetService()
    const summary = await budgetService.getBudgetSummary(workspaceId)
    
    return c.json(ResponseBuilder.success(summary))
  } catch (error) {
    console.error('Failed to fetch budget summary:', error)
    return c.json(ResponseBuilder.serverError('Failed to fetch budget summary'), 500)
  }
})

export default budgets