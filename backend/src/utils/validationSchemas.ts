import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date())
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  'End date must be after start date'
)

// User Profile schemas
export const userProfileCreateSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(100).optional(),
  preferredCurrency: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
  language: z.string().length(2).default('en')
})

export const userProfileUpdateSchema = userProfileCreateSchema.partial().omit({ userId: true })

// Workspace schemas
export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ownerId: z.string().uuid(),
  currency: z.string().length(3).default('USD'),
  timezone: z.string().default('UTC'),
  isActive: z.boolean().default(true)
})

export const workspaceUpdateSchema = workspaceCreateSchema.partial().omit({ ownerId: true })

// Account schemas
export const accountCreateSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  balance: z.number().default(0),
  currency: z.string().length(3).default('USD'),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid()
})

export const accountUpdateSchema = accountCreateSchema.partial().omit({ workspaceId: true, createdBy: true })

// Transaction schemas
export const transactionCreateSchema = z.object({
  workspaceId: z.string().uuid(),
  accountId: z.string().uuid(),
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  transactionDate: z.string().datetime().or(z.date()),
  type: z.string().min(1).max(20).default('expense'),
  createdBy: z.string().uuid()
})

export const transactionUpdateSchema = transactionCreateSchema.partial().omit({ workspaceId: true, accountId: true, createdBy: true })

// Budget schemas
export const budgetCreateSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  period: z.string().min(1).max(10).default('month'),
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid()
})

export const budgetUpdateSchema = budgetCreateSchema.partial().omit({ workspaceId: true, createdBy: true })

// Savings Goal schemas
export const savingsGoalCreateSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.string().datetime().or(z.date()).optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  createdBy: z.string().uuid()
})

export const savingsGoalUpdateSchema = savingsGoalCreateSchema.partial().omit({ workspaceId: true, createdBy: true })

// User Settings schemas
export const userSettingsUpdateSchema = z.object({
  notificationPreferences: z.record(z.any()).optional(),
  themePreferences: z.record(z.any()).optional(),
  dataPrivacySettings: z.record(z.any()).optional()
})

// Validation helper function
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    
    result.error.errors.forEach((err) => {
      const path = err.path.length > 0 ? err.path.join('.') : 'root'
      if (!fieldErrors[path]) {
        fieldErrors[path] = []
      }
      fieldErrors[path].push(err.message)
    })
    
    const error = new Error(`Validation failed: ${JSON.stringify(fieldErrors)}`)
    ;(error as any).fieldErrors = fieldErrors
    throw error
  }
  
  return result.data
} 