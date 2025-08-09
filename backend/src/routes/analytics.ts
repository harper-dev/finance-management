import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, uuidSchema, dateRangeSchema } from '../utils/validation'
import { Env } from '../types/env'

const analytics = new Hono<{ Bindings: Env }>()

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
    
    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    
    // Get total accounts and balances
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('balance, currency, type')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
    
    if (accountsError) {
      throw new Error(accountsError.message)
    }
    
    // Calculate total balance by account type
    const balancesByType = accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = { total: 0, currency: account.currency, count: 0 }
      }
      acc[account.type].total += account.balance
      acc[account.type].count += 1
      return acc
    }, {} as Record<string, { total: number; currency: string; count: number }>)
    
    // Get monthly transactions summary
    const { data: monthlyTransactions, error: monthlyError } = await supabase
      .from('transactions')
      .select('type, amount, currency')
      .eq('workspace_id', workspaceId)
      .gte('transaction_date', startOfMonth)
      .lte('transaction_date', endOfMonth)
    
    if (monthlyError) {
      throw new Error(monthlyError.message)
    }
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Get budget summary
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('amount, category')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .lte('start_date', endOfMonth)
      .or(`end_date.is.null,end_date.gte.${startOfMonth}`)
    
    if (budgetsError) {
      throw new Error(budgetsError.message)
    }
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    
    // Get savings goals summary
    const { data: savingsGoals, error: goalsError } = await supabase
      .from('savings_goals')
      .select('target_amount, current_amount')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
    
    if (goalsError) {
      throw new Error(goalsError.message)
    }
    
    const savingsProgress = savingsGoals.reduce((acc, goal) => {
      acc.target += goal.target_amount
      acc.current += goal.current_amount
      return acc
    }, { target: 0, current: 0 })
    
    return successResponse(c, {
      accounts: {
        total_count: accounts.length,
        balances_by_type: balancesByType
      },
      monthly_summary: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses,
        budget_allocated: totalBudget,
        budget_used_percentage: totalBudget > 0 ? (monthlyExpenses / totalBudget) * 100 : 0
      },
      savings: {
        total_target: savingsProgress.target,
        total_saved: savingsProgress.current,
        progress_percentage: savingsProgress.target > 0 ? (savingsProgress.current / savingsProgress.target) * 100 : 0,
        goals_count: savingsGoals.length
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch overview analytics: ${error}`, 500)
  }
})

// Get spending analysis by category
analytics.get('/spending', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const period = c.req.query('period') || 'month' // month, quarter, year
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const dateRange = validateRequest(dateRangeSchema, {
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    })
    
    const supabase = getSupabaseClient(c.env)
    
    // Calculate date range if not provided
    let startDate = dateRange.start_date
    let endDate = dateRange.end_date
    
    if (!startDate || !endDate) {
      const now = new Date()
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString()
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString()
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString()
        endDate = new Date(now.getFullYear(), 11, 31).toISOString()
      }
    }
    
    // Get expense transactions grouped by category
    const { data: expenses, error } = await supabase
      .from('transactions')
      .select('category, amount, transaction_date')
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .gte('transaction_date', startDate!.split('T')[0])
      .lte('transaction_date', endDate!.split('T')[0])
      .order('transaction_date', { ascending: false })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Group by category
    const categorySpending = expenses.reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, transactions: [] }
      }
      acc[category].total += transaction.amount
      acc[category].count += 1
      acc[category].transactions.push(transaction)
      return acc
    }, {} as Record<string, { total: number; count: number; transactions: any[] }>)
    
    // Convert to array and sort by total
    const categoryArray = Object.entries(categorySpending).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
      transactions: data.transactions.slice(0, 5) // Latest 5 transactions
    })).sort((a, b) => b.total - a.total)
    
    const totalSpent = categoryArray.reduce((sum, cat) => sum + cat.total, 0)
    
    // Add percentage for each category
    const categoriesWithPercentage = categoryArray.map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0
    }))
    
    return successResponse(c, {
      period: { start_date: startDate, end_date: endDate },
      total_spent: totalSpent,
      categories: categoriesWithPercentage,
      summary: {
        top_category: categoriesWithPercentage[0]?.category || null,
        top_category_amount: categoriesWithPercentage[0]?.total || 0,
        categories_count: categoriesWithPercentage.length,
        average_per_category: totalSpent / categoriesWithPercentage.length || 0
      }
    })
  } catch (error) {
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
    
    // Calculate date range if not provided
    let startDate = dateRange.start_date
    let endDate = dateRange.end_date
    
    if (!startDate || !endDate) {
      const now = new Date()
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      }
    }
    
    // Get income transactions grouped by category
    const { data: income, error } = await supabase
      .from('transactions')
      .select('category, amount, transaction_date')
      .eq('workspace_id', workspaceId)
      .eq('type', 'income')
      .gte('transaction_date', startDate!.split('T')[0])
      .lte('transaction_date', endDate!.split('T')[0])
      .order('transaction_date', { ascending: false })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Group by category
    const categoryIncome = income.reduce((acc, transaction) => {
      const category = transaction.category || 'Other Income'
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 }
      }
      acc[category].total += transaction.amount
      acc[category].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)
    
    // Convert to array and sort by total
    const categoryArray = Object.entries(categoryIncome).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      average: data.total / data.count
    })).sort((a, b) => b.total - a.total)
    
    const totalIncome = categoryArray.reduce((sum, cat) => sum + cat.total, 0)
    
    return successResponse(c, {
      period: { start_date: startDate, end_date: endDate },
      total_income: totalIncome,
      categories: categoryArray.map(cat => ({
        ...cat,
        percentage: totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0
      }))
    })
  } catch (error) {
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
    
    // Calculate date range for the specified number of months
    const endDate = new Date()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months + 1, 1)
    
    // Get all transactions in the range
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, transaction_date')
      .eq('workspace_id', workspaceId)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Group by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const monthKey = transaction.transaction_date.substring(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0, net: 0 }
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += transaction.amount
      } else if (transaction.type === 'expense') {
        acc[monthKey].expenses += transaction.amount
      }
      
      acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses
      return acc
    }, {} as Record<string, { income: number; expenses: number; net: number }>)
    
    // Create array with all months in range (including months with no data)
    const trends = []
    for (let i = 0; i < months; i++) {
      const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
      const monthKey = date.toISOString().substring(0, 7)
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      trends.unshift({
        month: monthKey,
        month_name: monthName,
        income: monthlyData[monthKey]?.income || 0,
        expenses: monthlyData[monthKey]?.expenses || 0,
        net: monthlyData[monthKey]?.net || 0
      })
    }
    
    // Calculate averages
    const averages = {
      income: trends.reduce((sum, t) => sum + t.income, 0) / trends.length,
      expenses: trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length,
      net: trends.reduce((sum, t) => sum + t.net, 0) / trends.length
    }
    
    return successResponse(c, {
      trends,
      averages,
      period: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        months
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch trends: ${error}`, 500)
  }
})

export default analytics