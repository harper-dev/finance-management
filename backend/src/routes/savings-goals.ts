import { Hono } from 'hono'
import { z } from 'zod'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, savingsGoalCreateSchema, savingsGoalUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const savingsGoals = new Hono<{ Bindings: Env }>()

// Get all savings goals for a workspace
savingsGoals.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const isActive = c.req.query('is_active')
    const category = c.req.query('category')
    
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
      .from('savings_goals')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }
    
    if (category) {
      query = query.eq('category', category)
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
    
    // Calculate progress and status for each goal
    const goalsWithProgress = (data || []).map((goal) => {
      const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
      const remaining = Math.max(0, goal.target_amount - goal.current_amount)
      const isCompleted = goal.current_amount >= goal.target_amount
      
      // Calculate days remaining if target date is set
      let daysRemaining = null
      if (goal.target_date) {
        const targetDate = new Date(goal.target_date)
        const today = new Date()
        const diffTime = targetDate.getTime() - today.getTime()
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      // Calculate monthly savings needed if target date is set and not completed
      let monthlySavingsNeeded = null
      if (goal.target_date && !isCompleted) {
        const targetDate = new Date(goal.target_date)
        const today = new Date()
        const monthsRemaining = Math.max(1, 
          (targetDate.getFullYear() - today.getFullYear()) * 12 + 
          (targetDate.getMonth() - today.getMonth())
        )
        monthlySavingsNeeded = remaining / monthsRemaining
      }
      
      return {
        ...goal,
        progress_percentage: Math.min(100, progressPercentage),
        remaining: remaining,
        is_completed: isCompleted,
        days_remaining: daysRemaining,
        monthly_savings_needed: monthlySavingsNeeded
      }
    })
    
    return successResponse(c, {
      savings_goals: goalsWithProgress,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch savings goals: ${error}`, 500)
  }
})

// Get specific savings goal
savingsGoals.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const goalId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data: goal, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Savings goal')
      }
      throw new Error(error.message)
    }
    
    // Calculate progress and statistics
    const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
    const remaining = Math.max(0, goal.target_amount - goal.current_amount)
    const isCompleted = goal.current_amount >= goal.target_amount
    
    // Calculate days remaining if target date is set
    let daysRemaining = null
    if (goal.target_date) {
      const targetDate = new Date(goal.target_date)
      const today = new Date()
      const diffTime = targetDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    // Calculate monthly savings needed
    let monthlySavingsNeeded = null
    if (goal.target_date && !isCompleted) {
      const targetDate = new Date(goal.target_date)
      const today = new Date()
      const monthsRemaining = Math.max(1, 
        (targetDate.getFullYear() - today.getFullYear()) * 12 + 
        (targetDate.getMonth() - today.getMonth())
      )
      monthlySavingsNeeded = remaining / monthsRemaining
    }
    
    const goalWithDetails = {
      ...goal,
      progress_percentage: Math.min(100, progressPercentage),
      remaining: remaining,
      is_completed: isCompleted,
      days_remaining: daysRemaining,
      monthly_savings_needed: monthlySavingsNeeded
    }
    
    return successResponse(c, goalWithDetails)
  } catch (error) {
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
    
    const { data, error } = await supabase
      .from('savings_goals')
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
    
    return successResponse(c, data, 'Savings goal created successfully')
  } catch (error) {
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
    
    const { data, error } = await supabase
      .from('savings_goals')
      .update(validatedData)
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Savings goal')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Savings goal updated successfully')
  } catch (error) {
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
    
    // First, get the current goal
    const { data: currentGoal, error: fetchError } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', goalId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return notFoundResponse(c, 'Savings goal')
      }
      throw new Error(fetchError.message)
    }
    
    // Update the current amount
    const newAmount = currentGoal.current_amount + amount
    
    const { data, error } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId)
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, data, `Successfully added ${amount} to savings goal`)
  } catch (error) {
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
    
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, null, 'Savings goal deleted successfully')
  } catch (error) {
    return errorResponse(c, `Failed to delete savings goal: ${error}`, 500)
  }
})

export default savingsGoals