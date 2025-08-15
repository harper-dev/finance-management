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
    
    // Validate and sanitize workspace ID
    const sanitizedWorkspaceId = validateRequest(uuidSchema, workspaceId.trim())
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const overview = await analyticsService.getWorkspaceOverview(sanitizedWorkspaceId, user.id)
    
    // Add fallback data and helpful messages for empty workspaces
    const enhancedOverview = {
      ...overview,
      data_status: overview.overview.accounts_count === 0 ? 'empty' : 'populated',
      suggestions: overview.overview.accounts_count === 0 ? [
        'Create your first account to start tracking finances',
        'Add some transactions to see meaningful analytics',
        'Set up budgets to monitor spending'
      ] : undefined
    }
    
    return successResponse(c, enhancedOverview)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, 'Invalid workspace ID format', 422)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, 'Workspace not found', 404)
    }
    
    // Log error for debugging but return generic message
    console.error('Overview analytics error:', error)
    return errorResponse(c, 'Failed to fetch overview analytics. Please try again later.', 500)
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
    
    // Validate and sanitize inputs
    const sanitizedWorkspaceId = validateRequest(uuidSchema, workspaceId.trim())
    
    // Validate period parameter with better error message
    const validPeriods = ['month', 'quarter', 'year']
    if (!validPeriods.includes(period)) {
      return errorResponse(c, `Invalid period. Must be one of: ${validPeriods.join(', ')}`, 422)
    }
    const validPeriod = period as 'month' | 'quarter' | 'year'
    
    // Validate optional date range parameters
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    
    if (startDate && endDate) {
      try {
        validateRequest(dateRangeSchema, {
          start_date: startDate,
          end_date: endDate
        })
      } catch (error) {
        return errorResponse(c, 'Invalid date format. Use YYYY-MM-DD format.', 422)
      }
    }
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const spending = await analyticsService.getSpendingAnalysis(sanitizedWorkspaceId, user.id, validPeriod)
    
    // Provide fallback data and helpful messages
    if (spending.length === 0) {
      return successResponse(c, {
        spending: [],
        message: `No spending data found for the ${validPeriod} period.`,
        suggestions: [
          'Add expense transactions to see spending breakdown',
          'Ensure transactions have categories assigned',
          'Try a different time period'
        ],
        period: validPeriod
      })
    }
    
    // Add summary statistics
    const totalAmount = spending.reduce((sum, item) => sum + item.amount, 0)
    const topCategory = spending.reduce((max, item) => item.amount > max.amount ? item : max, spending[0])
    
    return successResponse(c, {
      spending,
      summary: {
        total_amount: totalAmount,
        categories_count: spending.length,
        top_category: topCategory.category,
        period: validPeriod
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, 'Workspace not found', 404)
    }
    
    console.error('Spending analysis error:', error)
    return errorResponse(c, 'Failed to fetch spending analysis. Please try again later.', 500)
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
    
    // Validate and sanitize inputs
    const sanitizedWorkspaceId = validateRequest(uuidSchema, workspaceId.trim())
    
    // Validate period parameter with better error message
    const validPeriods = ['month', 'quarter', 'year']
    if (!validPeriods.includes(period)) {
      return errorResponse(c, `Invalid period. Must be one of: ${validPeriods.join(', ')}`, 422)
    }
    const validPeriod = period as 'month' | 'quarter' | 'year'
    
    // Validate optional date range parameters
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')
    
    if (startDate && endDate) {
      try {
        validateRequest(dateRangeSchema, {
          start_date: startDate,
          end_date: endDate
        })
      } catch (error) {
        return errorResponse(c, 'Invalid date format. Use YYYY-MM-DD format.', 422)
      }
    }
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const income = await analyticsService.getIncomeAnalysis(sanitizedWorkspaceId, user.id, validPeriod)
    
    // Provide fallback data and helpful messages
    if (income.length === 0) {
      return successResponse(c, {
        income: [],
        message: `No income data found for the ${validPeriod} period.`,
        suggestions: [
          'Add income transactions to see income breakdown',
          'Ensure transactions have categories assigned',
          'Try a different time period'
        ],
        period: validPeriod
      })
    }
    
    // Add summary statistics
    const totalAmount = income.reduce((sum, item) => sum + item.amount, 0)
    const topCategory = income.reduce((max, item) => item.amount > max.amount ? item : max, income[0])
    
    return successResponse(c, {
      income,
      summary: {
        total_amount: totalAmount,
        categories_count: income.length,
        top_category: topCategory.category,
        period: validPeriod
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, 'Workspace not found', 404)
    }
    
    console.error('Income analysis error:', error)
    return errorResponse(c, 'Failed to fetch income analysis. Please try again later.', 500)
  }
})

// Get financial trends over time
analytics.get('/trends', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const monthsParam = c.req.query('months')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    // Validate months parameter
    let months = 12
    if (monthsParam) {
      const parsedMonths = parseInt(monthsParam)
      if (isNaN(parsedMonths) || parsedMonths < 1 || parsedMonths > 36) {
        return errorResponse(c, 'months must be a number between 1 and 36', 422)
      }
      months = parsedMonths
    }
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const trends = await analyticsService.getFinancialTrends(workspaceId, user.id, months)
    
    // Handle insufficient data scenario
    if (trends.length === 0) {
      return successResponse(c, {
        trends: [],
        message: 'No financial data available for the requested period. Start by adding some transactions to see trends.',
        suggestions: [
          'Add income and expense transactions',
          'Ensure transactions have proper dates',
          'Try a shorter time period'
        ]
      })
    }
    
    // Check if data is sparse
    const nonZeroTrends = trends.filter(t => t.income > 0 || t.expenses > 0)
    if (nonZeroTrends.length < Math.min(3, months)) {
      return successResponse(c, {
        trends,
        message: 'Limited financial data available. Add more transactions for better trend analysis.',
        data_quality: 'sparse'
      })
    }
    
    return successResponse(c, { trends, data_quality: 'good' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to fetch trends: ${error}`, 500)
  }
})

// Get cash flow analysis
analytics.get('/cash-flow', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const cashFlow = await analyticsService.getCashFlowAnalysis(workspaceId, user.id)
    
    return successResponse(c, cashFlow)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to fetch cash flow analysis: ${error}`, 500)
  }
})

// Get spending patterns analysis
analytics.get('/spending-patterns', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    const analyticsService = new AnalyticsService(supabase)
    
    const patterns = await analyticsService.getSpendingPatterns(workspaceId, user.id)
    
    return successResponse(c, patterns)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    return errorResponse(c, `Failed to fetch spending patterns: ${error}`, 500)
  }
})

export default analytics