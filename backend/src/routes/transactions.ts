import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { TransactionService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse, notFoundResponse } from '../utils/response'
import { validateRequest, transactionCreateSchema, transactionUpdateSchema, uuidSchema, paginationSchema, dateRangeSchema } from '../utils/validation'
import { Env } from '../types/env'

const transactions = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

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
    const transactionService = new TransactionService(supabase)
    
    const filters = {
      account_id: accountId,
      category,
      type,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    }
    
    const result = await transactionService.getTransactions(workspaceId, user.id, filters, pagination)
    
    return successResponse(c, result)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to fetch transactions: ${error}`, 500)
  }
})

// Get specific transaction
transactions.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const transactionId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService(supabase)
    
    const transaction = await transactionService.getTransactionById(transactionId, user.id)
    
    return successResponse(c, transaction)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
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
    const transactionService = new TransactionService(supabase)
    
    const transactionData = {
      ...validatedData,
      workspace_id: workspaceId
    }
    
    const transaction = await transactionService.createTransaction(transactionData, user.id)
    
    return successResponse(c, transaction, 'Transaction created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
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
    const transactionService = new TransactionService(supabase)
    
    const transaction = await transactionService.updateTransaction(transactionId, validatedData, user.id)
    
    return successResponse(c, transaction, 'Transaction updated successfully')
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
    return errorResponse(c, `Failed to update transaction: ${error}`, 500)
  }
})

// Delete transaction
transactions.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const transactionId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService(supabase)
    
    await transactionService.deleteTransaction(transactionId, user.id)
    
    return successResponse(c, null, 'Transaction deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
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
    const transactionService = new TransactionService(supabase)
    
    const result = await transactionService.bulkCreateTransactions(
      validatedTransactions.map(transaction => ({
        ...transaction,
        workspace_id
      })),
      user.id
    )
    
    return successResponse(c, result, 'Transactions created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create transactions: ${error}`, 500)
  }
})

export default transactions