import { Hono } from 'hono'
import { getSupabaseClient } from '../services/supabase'
import { AccountService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, accountCreateSchema, accountUpdateSchema, uuidSchema, paginationSchema } from '../utils/validation'
import { Env } from '../types/env'

const accounts = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Get all accounts for a workspace
accounts.get('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const workspaceId = c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    validateRequest(uuidSchema, workspaceId)
    
    const query = c.req.query()
    const filters: any = {}
    const pagination = query.page ? validateRequest(paginationSchema, { 
      page: query.page, 
      limit: query.limit 
    }) as { page: number; limit: number } : undefined
    
    if (query.is_active !== undefined) {
      filters.is_active = query.is_active === 'true'
    }
    if (query.type) {
      filters.type = query.type
    }
    
    const supabase = getSupabaseClient(c.env)
    const accountService = new AccountService(supabase)
    
    const accounts = await accountService.getAccounts(workspaceId, user.id, filters, pagination)
    
    return successResponse(c, accounts)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to get accounts: ${error}`, 500)
  }
})

// Get specific account
accounts.get('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const accountService = new AccountService(supabase)
    
    const account = await accountService.getAccountById(accountId, user.id)
    
    return successResponse(c, account)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to get account: ${error}`, 500)
  }
})

// Create new account
accounts.post('/', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const workspaceId = body.workspace_id || c.req.query('workspace_id')
    
    if (!workspaceId) {
      return errorResponse(c, 'workspace_id is required', 400)
    }
    
    // Create a schema without workspace_id for validation
    const { workspace_id, ...accountDataWithoutWorkspace } = body
    
    const validatedData = validateRequest(accountCreateSchema.omit({ workspace_id: true }), accountDataWithoutWorkspace)
    const accountData = {
      ...validatedData,
      workspace_id: workspaceId,
      created_by: user.id
    }
    
    const supabase = getSupabaseClient(c.env)
    const accountService = new AccountService(supabase)
    
    const account = await accountService.createAccount(accountData, user.id)
    
    return successResponse(c, account, 'Account created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
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
    const accountService = new AccountService(supabase)
    
    const account = await accountService.updateAccount(accountId, validatedData, user.id)
    
    return successResponse(c, account, 'Account updated successfully')
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
    return errorResponse(c, `Failed to update account: ${error}`, 500)
  }
})

// Soft delete account (set is_active to false)
accounts.delete('/:id', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const accountId = validateRequest(uuidSchema, c.req.param('id'))
    
    const supabase = getSupabaseClient(c.env)
    const accountService = new AccountService(supabase)
    
    const account = await accountService.deleteAccount(accountId, user.id)
    
    return successResponse(c, account, 'Account deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
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
    const accountService = new AccountService(supabase)
    
    const history = await accountService.getBalanceHistory(accountId, user.id, days)
    
    return successResponse(c, history)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return errorResponse(c, error.message, 403)
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse(c, error.message, 404)
    }
    return errorResponse(c, `Failed to get balance history: ${error}`, 500)
  }
})

export default accounts