import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, budgetCreateSchema, budgetUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const budgets = new Hono<{ Bindings: Env }>()

// Get all budgets for a workspace
budgets.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const period = c.req.query('period')
    
    const pagination = validateRequest(paginationSchema, {
      page: c.req.query('page'),
      limit: c.req.query('limit')
    })
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    
    let query = supabase
      .from('budgets')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    if (period) {
      query = query.eq('period', period)
    }
    
    // Apply pagination
    query = query.range(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit - 1
    )
    
    const { data, error, count } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Get spending for each budget
    const budgetsWithSpending = await Promise.all(
      (data || []).map(async (budget) => {
        const { data: spending, error: spendingError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('workspace_id', workspaceId)
          .eq('category', budget.category)
          .eq('type', 'expense')
          .gte('transaction_date', budget.start_date)
          .lte('transaction_date', budget.end_date || new Date().toISOString().split('T')[0])
        
        const totalSpent = spending?.reduce((sum, t) => sum + t.amount, 0) || 0
        const remaining = budget.amount - totalSpent
        const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0
        
        return {
          ...budget,
          spent: totalSpent,
          remaining: Math.max(0, remaining),
          percentage_used: Math.min(100, percentageUsed),
          is_over_budget: totalSpent > budget.amount
        }
      })
    )
    
    return successResponse(c, {
      budgets: budgetsWithSpending,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch budgets: ${error}`, 500)
  }
})

// Get specific budget
budgets.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const budgetId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data: budget, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Budget')
      }
      throw new Error(error.message)
    }
    
    // Get spending for this budget
    const { data: spending, error: spendingError } = await supabase
      .from('transactions')
      .select('amount, description, transaction_date')
      .eq('workspace_id', budget.workspace_id)
      .eq('category', budget.category)
      .eq('type', 'expense')
      .gte('transaction_date', budget.start_date)
      .lte('transaction_date', budget.end_date || new Date().toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })
    
    const totalSpent = spending?.reduce((sum, t) => sum + t.amount, 0) || 0
    const remaining = budget.amount - totalSpent
    const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0
    
    const budgetWithDetails = {
      ...budget,
      spent: totalSpent,
      remaining: Math.max(0, remaining),
      percentage_used: Math.min(100, percentageUsed),
      is_over_budget: totalSpent > budget.amount,
      transactions: spending || []
    }
    
    return successResponse(c, budgetWithDetails)
  } catch (error) {
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
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        ...validatedData,
        workspace_id: workspaceId,
        created_by: user.id
      }])
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Budget created successfully')
  } catch (error) {
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
    
    const { data, error } = await supabase
      .from('budgets')
      .update(validatedData)
      .eq('id', budgetId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Budget')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Budget updated successfully')
  } catch (error) {
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
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, null, 'Budget deleted successfully')
  } catch (error) {
    return errorResponse(c, `Failed to delete budget: ${error}`, 500)
  }
})

export default budgets