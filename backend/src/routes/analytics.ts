import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { AnalyticsService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, uuidSchema, dateRangeSchema } from '../utils/validation'
import { Env } from '../types/env'

const analytics = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get overview analytics for a workspace
analytics.get('/overview', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const overview = await analyticsService.getWorkspaceOverview(workspaceId, user.id)
    
    return successResponse(c, overview)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to fetch overview analytics: ${error}`, 500)
  }
})

// Get spending analysis by category
analytics.get('/spending', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const period = c.req.query('period') || 'month'
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const dateRange = validateRequest(dateRangeSchema, {
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    })
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const options = {
      period,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    }
    
    const spending = await analyticsService.getSpendingAnalysis(workspaceId, user.id, options)
    
    return successResponse(c, spending)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to fetch spending analysis: ${error}`, 500)
  }
})

// Get income analysis
analytics.get('/income', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const period = c.req.query('period') || 'month'
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const dateRange = validateRequest(dateRangeSchema, {
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    })
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const options = {
      period,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    }
    
    const income = await analyticsService.getIncomeAnalysis(workspaceId, user.id, options)
    
    return successResponse(c, income)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to fetch income analysis: ${error}`, 500)
  }
})

// Get trends over time
analytics.get('/trends', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const months = parseInt(c.req.query('months') || '12')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const trends = await analyticsService.getTrends(workspaceId, user.id, months)
    
    return successResponse(c, trends)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to fetch trends: ${error}`, 500)
  }
})

export default analytics