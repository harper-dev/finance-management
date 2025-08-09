import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, accountCreateSchema, accountUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const accounts = new Hono<{ Bindings: Env }>()

// Get all accounts for a workspace
accounts.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const pagination = validateRequest(paginationSchema, {
      page: c.req.query('page'),
      limit: c.req.query('limit')
    })
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    
    const { data, error, count } = await supabase
      .from('accounts')
      .select('*', { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1)
    
    if (error) {
      throw new Error(error.message)
    }
    
    return successResponse(c, {
      accounts: data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch accounts: ${error}`, 500)
  }
})

// Get specific account
accounts.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Account')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data)
  } catch (error) {
    return errorResponse(c, `Failed to fetch account: ${error}`, 500)
  }
})

// Create new account
accounts.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(accountCreateSchema, body)
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('accounts')
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
    
    return successResponse(c, data, 'Account created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create account: ${error}`, 500)
  }
})

// Update account
accounts.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateRequest(accountUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('accounts')
      .update(validatedData)
      .eq('id', accountId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Account')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Account updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update account: ${error}`, 500)
  }
})

// Soft delete account (set is_active to false)
accounts.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', accountId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Account')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data, 'Account deleted successfully')
  } catch (error) {
    return errorResponse(c, `Failed to delete account: ${error}`, 500)
  }
})

// Get account balance history
accounts.get('/:id/balance-history', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    const days = parseInt(c.req.query('days') || '30')
    
    const supabase = getSupabaseClient(c.env)
    
    // Get transactions for balance calculation
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, transaction_date, created_at')
      .eq('account_id', accountId)
      .gte('transaction_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('transaction_date', { ascending: true })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Get current account balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance, currency')
      .eq('id', accountId)
      .single()
    
    if (accountError) {
      throw new Error(accountError.message)
    }
    
    // Calculate balance history
    let runningBalance = account.balance
    const balanceHistory = []
    
    // Start from current balance and work backwards
    for (let i = transactions.length - 1; i >= 0; i--) {
      const transaction = transactions[i]
      if (transaction.type === 'income') {
        runningBalance -= transaction.amount
      } else if (transaction.type === 'expense') {
        runningBalance += transaction.amount
      }
      
      balanceHistory.unshift({
        date: transaction.transaction_date,
        balance: runningBalance,
        currency: account.currency
      })
    }
    
    // Add current balance as the latest point
    balanceHistory.push({
      date: new Date().toISOString().split('T')[0],
      balance: account.balance,
      currency: account.currency
    })
    
    return successResponse(c, balanceHistory)
  } catch (error) {
    return errorResponse(c, `Failed to fetch balance history: ${error}`, 500)
  }
})

export default accounts