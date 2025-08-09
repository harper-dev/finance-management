import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid()

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

// User profile schemas
export const userProfileCreateSchema = z.object({
  display_name: z.string().max(100).optional(),
  preferred_currency: z.string().length(3).default('SGD'),
  timezone: z.string().default('Asia/Singapore'),
  language: z.string().max(10).default('en'),
})

export const userProfileUpdateSchema = userProfileCreateSchema.partial()

// Workspace schemas
export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['personal', 'family', 'team']),
  currency: z.string().length(3).default('SGD'),
})

export const workspaceUpdateSchema = workspaceCreateSchema.partial()

// Account schemas
export const accountCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['cash', 'bank', 'investment', 'asset', 'debt']),
  currency: z.string().length(3).default('SGD'),
  balance: z.number().default(0),
})

export const accountUpdateSchema = accountCreateSchema.partial()

// Transaction schemas
export const transactionCreateSchema = z.object({
  account_id: uuidSchema,
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  transaction_date: z.string().datetime(),
})

export const transactionUpdateSchema = transactionCreateSchema.partial()

// Budget schemas
export const budgetCreateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  amount: z.number().positive(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
})

export const budgetUpdateSchema = budgetCreateSchema.partial()

// Savings goal schemas
export const savingsGoalCreateSchema = z.object({
  name: z.string().min(1).max(100),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().datetime().optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
})

export const savingsGoalUpdateSchema = savingsGoalCreateSchema.partial()

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.errors)}`)
  }
  
  return result.data
}