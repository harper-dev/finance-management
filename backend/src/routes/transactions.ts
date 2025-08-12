import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { TransactionService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, transactionCreateSchema, transactionUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { extendedLogger } from '../utils/logger'
import { Env } from '../types/env'

const transactions = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all transactions for a workspace
transactions.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    extendedLogger.debug('Fetching transactions', { 
      userId: user.id, 
      workspaceId,
      query: c.req.query()
    });
    
    if (!workspaceId) {
      extendedLogger.warn('Missing workspace_id in transaction query', { userId: user.id });
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const query = c.req.query()
    const filters: any = {}
    const pagination = query.page ? validateRequest(paginationSchema, { 
      page: query.page, 
      limit: query.limit 
    }) as { page: number; limit: number } : undefined
    
    if (query.account_id) {
      filters.account_id = query.account_id
    }
    if (query.category) {
      filters.category = query.category
    }
    if (query.type) {
      filters.type = query.type
    }
    if (query.start_date) {
      filters.start_date = query.start_date
    }
    if (query.end_date) {
      filters.end_date = query.end_date
    }
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService(supabase)
    
    const startTime = Date.now();
    const transactions = await transactionService.getTransactions(workspaceId, user.id, filters, pagination)
    const duration = Date.now() - startTime;
    
    extendedLogger.logDbOperation('SELECT', 'transactions', duration, true);
    
    extendedLogger.info('Transactions fetched successfully', {
      userId: user.id,
      workspaceId,
      count: transactions.data?.length || 0,
      duration: `${duration}ms`
    });
    
    // If transactions is already a paginated result, return it directly
    // Otherwise, wrap it in successResponse
    if ('data' in transactions && 'pagination' in transactions) {
      return c.json({
        success: true,
        ...transactions
      })
    } else {
      return successResponse(c, transactions)
    }
  } catch (error) {
    extendedLogger.error('Failed to fetch transactions', {
      userId: c.get('user')?.id,
      workspaceId: c.req.query('workspace_id'),
      error: error instanceof Error ? error.message : String(error)
    });
    
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
    
    extendedLogger.debug('Fetching transaction', { 
      userId: user.id, 
      transactionId 
    });
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService(supabase)
    
    const startTime = Date.now();
    const transaction = await transactionService.getTransactionById(transactionId, user.id)
    const duration = Date.now() - startTime;
    
    extendedLogger.logDbOperation('SELECT', 'transactions', duration, true);
    
    extendedLogger.info('Transaction fetched successfully', {
      userId: user.id,
      transactionId,
      duration: `${duration}ms`
    });
    
    return successResponse(c, transaction)
  } catch (error) {
    extendedLogger.error('Failed to fetch transaction', {
      userId: c.get('user')?.id,
      transactionId: c.req.param('id'),
      error: error instanceof Error ? error.message : String(error)
    });
    
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
    const workspaceId = body.workspace_id
    
    extendedLogger.debug('Creating transaction', { 
      userId: user.id, 
      workspaceId,
      transactionData: { ...body, amount: body.amount, description: body.description?.substring(0, 100) }
    });
    
    if (!workspaceId) {
      extendedLogger.warn('Missing workspace_id in transaction creation', { userId: user.id });
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    // Create a schema without workspace_id for validation
    const { workspace_id, ...transactionDataWithoutWorkspace } = body
    
    const validatedData = validateRequest(transactionCreateSchema, transactionDataWithoutWorkspace)
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService(supabase)
    
    const transactionData = {
      ...validatedData,
      workspace_id: workspaceId,
      created_by: user.id,
      transaction_date: new Date(validatedData.transaction_date)
    }
    
    const startTime = Date.now();
    const transaction = await transactionService.createTransaction(transactionData, user.id)
    const duration = Date.now() - startTime;
    
    extendedLogger.logDbOperation('INSERT', 'transactions', duration, true);
    
    extendedLogger.logBusinessEvent('transaction_created', user.id, workspaceId, {
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      duration: `${duration}ms`
    });
    
    return successResponse(c, transaction, 'Transaction created successfully')
  } catch (error) {
    extendedLogger.error('Failed to create transaction', {
      userId: c.get('user')?.id,
      workspaceId: c.req.body?.workspace_id,
      error: error instanceof Error ? error.message : String(error),
      validationErrors: error instanceof Error && error.message.includes('Validation failed') ? error.message : undefined
    });
    
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
    
    // Convert string dates to Date objects if present
    const updateData = {
      ...validatedData,
      transaction_date: validatedData.transaction_date ? new Date(validatedData.transaction_date) : undefined
    }
    
    const transaction = await transactionService.updateTransaction(transactionId, updateData, user.id)
    
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
    
    const result = await transactionService.createBulkTransactions(
      validatedTransactions.map(transaction => ({
        ...transaction,
        workspace_id,
        created_by: user.id,
        transaction_date: new Date(transaction.transaction_date)
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