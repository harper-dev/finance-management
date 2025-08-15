import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { TransactionService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { transactionCreateSchema, transactionUpdateSchema, uuidSchema, paginationSchema } from '../utils/validationSchemas'
import { z } from 'zod'
import { Env } from '../types/env'

// Helper function to validate data with Zod schema
function validateData<T>(schema: z.ZodSchema<T>, data: any): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.errors)}`)
  }
  return result.data
}

const transactions = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all transactions for a workspace
transactions.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateData(uuidSchema, workspaceId)
    
    const query = c.req.query()
    const filters: any = {}
    const pagination = query.page ? validateData(paginationSchema, { 
      page: query.page, 
      limit: query.limit 
    }) : undefined
    
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
    const transactionService = new TransactionService()
    
    const startTime = Date.now();
    const transactions = await transactionService.getTransactionsByWorkspace(workspaceId, { pagination, filters })
    const duration = Date.now() - startTime;
    
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
    const transactionId = validateData(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService()
    
    const startTime = Date.now();
    const transaction = await transactionService.getById(transactionId)
    const duration = Date.now() - startTime;
    
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
    const workspaceId = body.workspace_id
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
          validateData(uuidSchema, workspaceId)
    
    // Create a schema without workspace_id for validation
    const { workspace_id, ...transactionDataWithoutWorkspace } = body
    
          const validatedData = validateData(transactionCreateSchema, transactionDataWithoutWorkspace)
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService()
    
    const transactionData = {
      ...validatedData,
      workspaceId: workspaceId,
      createdBy: user.id,
      transactionDate: new Date(validatedData.transactionDate),
      currency: 'SGD', // Default currency since schema doesn't have it
      type: validatedData.type || 'expense' // Ensure type is always defined
    }
    
    const startTime = Date.now();
    const transaction = await transactionService.createTransaction(transactionData)
    const duration = Date.now() - startTime;
    
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
    const transactionId = validateData(uuidSchema, c.req.param('id'))
    const body = await c.req.json()
    const validatedData = validateData(transactionUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService()
    
    // Convert string dates to Date objects if present
    const updateData = {
      ...validatedData,
      transactionDate: validatedData.transactionDate ? new Date(validatedData.transactionDate) : undefined
    }
    
    const transaction = await transactionService.updateTransaction(transactionId, updateData)
    
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
    const transactionId = validateData(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService()
    
    await transactionService.delete(transactionId)
    
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
    
          validateData(uuidSchema, workspace_id)
    
    // Validate all transactions
    const validatedTransactions = transactionsData.map(transaction => 
      validateData(transactionCreateSchema, transaction)
    )
    
    const supabase = getSupabaseClient(c.env)
    const transactionService = new TransactionService()
    
    const result = await transactionService.createTransaction({
      ...validatedTransactions[0],
      workspaceId: workspace_id,
      createdBy: user.id,
      transactionDate: new Date(validatedTransactions[0].transactionDate),
      currency: 'SGD', // Default currency since schema doesn't have it
      type: validatedTransactions[0].type || 'expense' // Ensure type is always defined
    })
    
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