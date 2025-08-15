import { Context, Next } from 'hono'
import { z } from 'zod'
import { ValidationError } from '../types/errors'
import { sanitizeInput, sanitizeObject } from '../utils/sanitization'

/**
 * Enhanced validation middleware factory for request body validation
 * Includes comprehensive validation, field-level error reporting, and sanitization
 */
export function validateBody<T>(schema: z.ZodSchema<T>, options?: ValidationOptions) {
  return async (c: Context, next: Next) => {
    try {
      let body: any
      
      // Handle different content types
      const contentType = c.req.header('content-type') || ''
      
      if (contentType.includes('application/json')) {
        body = await c.req.json()
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        body = await c.req.parseBody()
      } else {
        // Try to parse as JSON by default
        try {
          body = await c.req.json()
        } catch {
          throw new ValidationError('Invalid request body format', {
            expectedContentType: 'application/json'
          })
        }
      }

      // Sanitize input if enabled (default: true)
      if (options?.sanitize !== false) {
        body = sanitizeObject(body)
      }

      // Validate against schema
      const result = schema.safeParse(body)
      
      if (!result.success) {
        const fieldErrors = formatZodErrors(result.error)
        throw new ValidationError('Request validation failed', { 
          fieldErrors,
          invalidFields: Object.keys(fieldErrors)
        })
      }

      // Store validated and sanitized data
      c.set('validatedData', result.data)
      c.set('originalData', body)
      
      await next()
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      
      if (error instanceof z.ZodError) {
        const fieldErrors = formatZodErrors(error)
        throw new ValidationError('Request validation failed', { fieldErrors })
      }
      
      // Handle JSON parsing errors
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new ValidationError('Invalid JSON format in request body')
      }
      
      throw error
    }
  }
}

/**
 * Enhanced validation middleware factory for query parameters
 * Includes sanitization and comprehensive error reporting
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, options?: ValidationOptions) {
  return async (c: Context, next: Next) => {
    try {
      let query = c.req.query()
      
      // Convert query object to handle multiple values properly
      const queryParams: Record<string, any> = {}
      for (const [key, value] of Object.entries(query)) {
        queryParams[key] = value
      }

      // Sanitize query parameters if enabled (default: true)
      if (options?.sanitize !== false) {
        for (const [key, value] of Object.entries(queryParams)) {
          if (typeof value === 'string') {
            queryParams[key] = sanitizeInput(value)
          }
        }
      }

      const result = schema.safeParse(queryParams)
      
      if (!result.success) {
        const fieldErrors = formatZodErrors(result.error)
        throw new ValidationError('Query parameter validation failed', { 
          fieldErrors,
          invalidFields: Object.keys(fieldErrors)
        })
      }

      c.set('validatedQuery', result.data)
      c.set('originalQuery', queryParams)
      
      await next()
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      
      if (error instanceof z.ZodError) {
        const fieldErrors = formatZodErrors(error)
        throw new ValidationError('Query parameter validation failed', { fieldErrors })
      }
      
      throw error
    }
  }
}

/**
 * Enhanced validation middleware factory for path parameters
 * Includes sanitization and comprehensive error reporting
 */
export function validateParams<T>(schema: z.ZodSchema<T>, options?: ValidationOptions) {
  return async (c: Context, next: Next) => {
    try {
      let params = c.req.param()
      
      // Sanitize path parameters if enabled (default: true)
      if (options?.sanitize !== false) {
        const sanitizedParams: Record<string, any> = {}
        for (const [key, value] of Object.entries(params)) {
          sanitizedParams[key] = typeof value === 'string' ? sanitizeInput(value) : value
        }
        params = sanitizedParams
      }

      const result = schema.safeParse(params)
      
      if (!result.success) {
        const fieldErrors = formatZodErrors(result.error)
        throw new ValidationError('Path parameter validation failed', { 
          fieldErrors,
          invalidFields: Object.keys(fieldErrors)
        })
      }

      c.set('validatedParams', result.data)
      c.set('originalParams', params)
      
      await next()
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      
      if (error instanceof z.ZodError) {
        const fieldErrors = formatZodErrors(error)
        throw new ValidationError('Path parameter validation failed', { fieldErrors })
      }
      
      throw error
    }
  }
}

/**
 * Validation options interface
 */
export interface ValidationOptions {
  sanitize?: boolean
  allowUnknown?: boolean
  stripUnknown?: boolean
}

/**
 * Enhanced common validation schemas with comprehensive validation rules
 */
export const commonSchemas = {
  // Basic types
  uuid: z.string().uuid('Invalid UUID format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'Cannot be empty').max(1000, 'Text too long'),
  email: z.string().email('Invalid email format').max(254, 'Email too long'),
  
  // Currency and financial
  currency: z.enum(['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD', 'AUD', 'CAD'], {
    errorMap: () => ({ message: 'Invalid currency code' })
  }),
  
  // Enhanced amount validation with proper decimal handling
  amount: z.number()
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
    .refine((val) => Math.abs(val) <= 999999999.99, 'Amount exceeds maximum allowed value')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places'),
    
  positiveAmount: z.number()
    .positive('Amount must be positive')
    .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
    .refine((val) => val <= 999999999.99, 'Amount exceeds maximum allowed value')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places'),
  
  // Date and time
  dateString: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  
  isoDateTime: z.string().datetime('Invalid ISO datetime format'),
  
  timezone: z.string()
    .min(1, 'Timezone cannot be empty')
    .refine(
      (tz) => {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: tz })
          return true
        } catch {
          return false
        }
      },
      'Invalid timezone'
    ),
  
  // Text fields with sanitization
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name too long')
    .refine((val) => val.trim().length > 0, 'Name cannot be only whitespace'),
    
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
    
  category: z.string()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category name too long')
    .refine((val) => val.trim().length > 0, 'Category cannot be only whitespace'),
  
  // User preferences
  language: z.string()
    .min(2, 'Language code too short')
    .max(10, 'Language code too long')
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format'),
    
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], {
    errorMap: () => ({ message: 'Invalid date format' })
  }),
  
  // Account and transaction types
  accountType: z.enum(['cash', 'bank', 'investment', 'asset', 'debt'], {
    errorMap: () => ({ message: 'Invalid account type' })
  }),
  
  transactionType: z.enum(['income', 'expense', 'transfer'], {
    errorMap: () => ({ message: 'Invalid transaction type' })
  }),
  
  workspaceType: z.enum(['personal', 'family', 'team'], {
    errorMap: () => ({ message: 'Invalid workspace type' })
  }),
  
  budgetPeriod: z.enum(['monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Invalid budget period' })
  })
}

/**
 * Enhanced validation helper functions and schemas
 */
export const validationHelpers = {
  /**
   * Enhanced pagination schema with better validation
   */
  paginationSchema: z.object({
    page: z.string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 1)
      .refine((val) => val >= 1, 'Page must be at least 1'),
    limit: z.string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 20)
      .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  }),

  /**
   * Enhanced date range schema with comprehensive validation
   */
  dateRangeSchema: z.object({
    startDate: commonSchemas.dateString.optional(),
    endDate: commonSchemas.dateString.optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return start <= end
      }
      return true
    },
    'Start date must be before or equal to end date'
  ).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 1095 // Max 3 years
      }
      return true
    },
    'Date range cannot exceed 3 years'
  ),

  /**
   * User settings validation schema
   */
  userSettingsSchema: z.object({
    display_name: commonSchemas.name.optional(),
    preferred_currency: commonSchemas.currency,
    timezone: commonSchemas.timezone,
    date_format: commonSchemas.dateFormat,
    language: commonSchemas.language,
    email_notifications: z.boolean(),
    push_notifications: z.boolean(),
    weekly_reports: z.boolean(),
    budget_alerts: z.boolean(),
    goal_reminders: z.boolean(),
  }),

  /**
   * Workspace settings validation schema
   */
  workspaceSettingsSchema: z.object({
    name: commonSchemas.name,
    type: commonSchemas.workspaceType,
    currency: commonSchemas.currency,
    timezone: commonSchemas.timezone.optional(),
    date_format: commonSchemas.dateFormat.optional(),
  }),

  /**
   * Enhanced financial amount validation
   */
  createAmountSchema: (options?: { allowNegative?: boolean; maxValue?: number }) => {
    let schema = z.number()
      .refine((val) => Number.isFinite(val), 'Amount must be a valid number')
      .refine((val) => {
        const decimalPlaces = (val.toString().split('.')[1] || '').length
        return decimalPlaces <= 2
      }, 'Amount cannot have more than 2 decimal places')

    if (!options?.allowNegative) {
      schema = schema.positive('Amount must be positive')
    }

    const maxValue = options?.maxValue || 999999999.99
    schema = schema.refine(
      (val) => Math.abs(val) <= maxValue,
      `Amount exceeds maximum allowed value of ${maxValue}`
    )

    return schema
  },

  /**
   * Duplicate prevention schema helper
   */
  createUniqueFieldSchema: (fieldName: string, existingValues: string[]) => {
    return z.string().refine(
      (val) => !existingValues.includes(val.toLowerCase()),
      `${fieldName} already exists`
    )
  },

  /**
   * Password strength validation
   */
  passwordSchema: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => /\d/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      'Password must contain at least one special character'
    ),

  /**
   * File upload validation
   */
  fileUploadSchema: z.object({
    filename: z.string().min(1, 'Filename required').max(255, 'Filename too long'),
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type),
      'Invalid file type'
    ),
    size: z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB'),
  })
}

/**
 * Format Zod errors into a more user-friendly structure
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : 'root'
    
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    
    // Customize error messages for better UX
    let message = err.message
    
    // Handle specific error types
    switch (err.code) {
      case 'invalid_type':
        if (err.expected === 'number' && err.received === 'string') {
          message = 'Must be a valid number'
        } else if (err.expected === 'boolean' && err.received === 'string') {
          message = 'Must be true or false'
        }
        break
      case 'too_small':
        if (err.type === 'string') {
          message = err.minimum === 1 ? 'This field is required' : `Must be at least ${err.minimum} characters`
        } else if (err.type === 'number') {
          message = `Must be at least ${err.minimum}`
        }
        break
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be no more than ${err.maximum} characters`
        } else if (err.type === 'number') {
          message = `Must be no more than ${err.maximum}`
        }
        break
    }
    
    fieldErrors[path].push(message)
  })
  
  return fieldErrors
}

/**
 * Comprehensive validation middleware that combines body, query, and params validation
 */
export function validateRequest<TBody = any, TQuery = any, TParams = any>(
  schemas: {
    body?: z.ZodSchema<TBody>
    query?: z.ZodSchema<TQuery>
    params?: z.ZodSchema<TParams>
  },
  options?: ValidationOptions
) {
  return async (c: Context, next: Next) => {
    const errors: Record<string, string[]> = {}
    
    try {
      // Validate body if schema provided
      if (schemas.body) {
        try {
          const bodyMiddleware = validateBody(schemas.body, options)
          await bodyMiddleware(c, async () => {})
        } catch (error) {
          if (error instanceof ValidationError && error.details?.fieldErrors) {
            Object.assign(errors, error.details.fieldErrors)
          } else {
            throw error
          }
        }
      }
      
      // Validate query if schema provided
      if (schemas.query) {
        try {
          const queryMiddleware = validateQuery(schemas.query, options)
          await queryMiddleware(c, async () => {})
        } catch (error) {
          if (error instanceof ValidationError && error.details?.fieldErrors) {
            Object.assign(errors, error.details.fieldErrors)
          } else {
            throw error
          }
        }
      }
      
      // Validate params if schema provided
      if (schemas.params) {
        try {
          const paramsMiddleware = validateParams(schemas.params, options)
          await paramsMiddleware(c, async () => {})
        } catch (error) {
          if (error instanceof ValidationError && error.details?.fieldErrors) {
            Object.assign(errors, error.details.fieldErrors)
          } else {
            throw error
          }
        }
      }
      
      // If there are validation errors, throw them all at once
      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Request validation failed', { 
          fieldErrors: errors,
          invalidFields: Object.keys(errors)
        })
      }
      
      await next()
    } catch (error) {
      throw error
    }
  }
}