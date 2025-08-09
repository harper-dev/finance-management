import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { requireAuth } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, transactionCreateSchema, transactionUpdateSchema, uuidSchema, paginationSchema, dateRangeSchema } from '../utils/validation'
import { Env } from '../types/env'

const transactions = new Hono<{ Bindings: Env }>()

// Get all transactions for a workspace
transactions.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    const accountId = c.req.query('account_id')
    const category = c.req.query('category')
    const type = c.req.query('type')
    
    const pagination = validateRequest(paginationSchema, {
      page: c.req.query('page'),
      limit: c.req.query('limit')
    })
    
    const dateRange = validateRequest(dateRangeSchema, {
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date')
    })
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        accounts(name, type, currency)
      `, { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (accountId) {
      query = query.eq('account_id', accountId)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    if (dateRange.start_date) {
      query = query.gte('transaction_date', dateRange.start_date.split('T')[0])
    }
    
    if (dateRange.end_date) {
      query = query.lte('transaction_date', dateRange.end_date.split('T')[0])
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
    
    return successResponse(c, {
      transactions: data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    })
  } catch (error) {
    return errorResponse(c, `Failed to fetch transactions: ${error}`, 500)
  }
})

// Get specific transaction
transactions.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const transactionId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts(name, type, currency)
      `)
      .eq('id', transactionId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse(c, 'Transaction')
      }
      throw new Error(error.message)
    }
    
    return successResponse(c, data)
  } catch (error) {
    return errorResponse(c, `Failed to fetch transaction: ${error}`, 500)
  }
})

// Create new transaction
transactions.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(transactionCreateSchema, body)
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const supabase = getSupabaseClient(c.env)
    
    // Start transaction to update both transaction and account balance
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        ...validatedData,
        workspace_id: workspaceId,
        created_by: user.id
      }])
      .select()
      .single()
    
    if (transactionError) {
      throw new Error(transactionError.message)
    }
    
    // Update account balance
    const balanceChange = validatedData.type === 'income' 
      ? validatedData.amount 
      : validatedData.type === 'expense' 
        ? -validatedData.amount 
        : 0 // transfer will be handled separately
    
    if (balanceChange !== 0) {
      const { error: balanceError } = await supabase.rpc('update_account_balance', {
        account_id: validatedData.account_id,
        amount_change: balanceChange
      })
      
      if (balanceError) {
        // Rollback transaction
        await supabase.from('transactions').delete().eq('id', transaction.id)
        throw new Error(balanceError.message)
      }
    }
    
    // Fetch the complete transaction with account info
    const { data: completeTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts(name, type, currency)
      `)
      .eq('id', transaction.id)
      .single()
    
    if (fetchError) {
      throw new Error(fetchError.message)
    }
    
    return successResponse(c, completeTransaction, 'Transaction created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create transaction: ${error}`, 500)
  }
})

// Update transaction
transactions.put('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const transactionId = validateRequest(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateRequest(transactionUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    
    // Get original transaction for balance adjustment
    const { data: originalTransaction, error: originalError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    
    if (originalError) {
      if (originalError.code === 'PGRST116') {
        return notFoundResponse(c, 'Transaction')
      }
      throw new Error(originalError.message)
    }
    
    // Update transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update(validatedData)
      .eq('id', transactionId)
      .select(`
        *,
        accounts(name, type, currency)
      `)
      .single()
    
    if (updateError) {
      throw new Error(updateError.message)
    }
    
    // Calculate balance adjustment if amount or type changed
    if (validatedData.amount !== undefined || validatedData.type !== undefined) {
      const newAmount = validatedData.amount ?? originalTransaction.amount
      const newType = validatedData.type ?? originalTransaction.type
      
      // Reverse original transaction effect
      const originalBalanceChange = originalTransaction.type === 'income' 
        ? -originalTransaction.amount 
        : originalTransaction.type === 'expense' 
          ? originalTransaction.amount 
          : 0
      
      // Apply new transaction effect
      const newBalanceChange = newType === 'income' 
        ? newAmount 
        : newType === 'expense' 
          ? -newAmount 
          : 0
      
      const totalBalanceChange = originalBalanceChange + newBalanceChange
      
      if (totalBalanceChange !== 0) {
        const { error: balanceError } = await supabase.rpc('update_account_balance', {
          account_id: originalTransaction.account_id,
          amount_change: totalBalanceChange
        })
        
        if (balanceError) {
          throw new Error(balanceError.message)
        }
      }
    }
    
    return successResponse(c, updatedTransaction, 'Transaction updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update transaction: ${error}`, 500)
  }
})

// Delete transaction
transactions.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const transactionId = validateRequest(uuidSchema, c.req.param('id'))
    const supabase = getSupabaseClient(c.env)
    
    // Get transaction for balance adjustment
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return notFoundResponse(c, 'Transaction')
      }
      throw new Error(fetchError.message)
    }
    
    // Delete transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
    
    if (deleteError) {
      throw new Error(deleteError.message)
    }
    
    // Reverse balance change
    const balanceChange = transaction.type === 'income' 
      ? -transaction.amount 
      : transaction.type === 'expense' 
        ? transaction.amount 
        : 0
    
    if (balanceChange !== 0) {
      const { error: balanceError } = await supabase.rpc('update_account_balance', {
        account_id: transaction.account_id,
        amount_change: balanceChange
      })
      
      if (balanceError) {
        // Note: Transaction is already deleted, log error but don't fail
        console.error('Failed to update account balance after transaction deletion:', balanceError)
      }
    }
    
    return successResponse(c, null, 'Transaction deleted successfully')
  } catch (error) {
    return errorResponse(c, `Failed to delete transaction: ${error}`, 500)
  }
})

// Bulk create transactions
transactions.post('/bulk', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const { transactions: transactionsData, workspace_id } = body
    
    if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
      return errorResponse(c, 'Transactions array is required and cannot be empty', 400)
    }
    
    if (!workspace_id) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspace_id)
    
    // Validate all transactions
    const validatedTransactions = transactionsData.map(transaction => 
      validateRequest(transactionCreateSchema, transaction)
    )
    
    const supabase = getSupabaseClient(c.env)
    
    // Insert all transactions
    const { data, error } = await supabase
      .from('transactions')
      .insert(
        validatedTransactions.map(transaction => ({
          ...transaction,
          workspace_id,
          created_by: user.id
        }))
      )
      .select()
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Note: For bulk operations, we're not updating account balances automatically
    // This should be done separately or with a batch job for performance reasons
    
    return successResponse(c, { transactions: data, count: data.length }, 'Transactions created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create transactions: ${error}`, 500)
  }
})

export default transactions