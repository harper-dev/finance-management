import { z } from 'zod'

/**
 * Frontend validation schemas that match backend validation
 * Includes comprehensive validation for currency formats and financial amounts
 */

// Basic validation schemas
export const commonSchemas = {
  // Basic types
  uuid: z.string().uuid('Invalid ID format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonEmptyString: z.string().min(1, 'This field is required').max(1000, 'Text too long'),
  email: z.string().email('Invalid email format').max(254, 'Email too long'),
  
  // Currency and financial validation
  currency: z.enum(['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD', 'AUD', 'CAD'], {
    errorMap: () => ({ message: 'Please select a valid currency' })
  }),
  
  // Enhanced amount validation with proper decimal handling
  amount: z.number()
    .refine((val) => Number.isFinite(val), 'Please enter a valid number')
    .refine((val) => Math.abs(val) <= 999999999.99, 'Amount is too large')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places'),
    
  positiveAmount: z.number()
    .positive('Amount must be greater than zero')
    .refine((val) => Number.isFinite(val), 'Please enter a valid number')
    .refine((val) => val <= 999999999.99, 'Amount is too large')
    .refine((val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places'),
  
  // String amount validation (for input fields)
  stringAmount: z.string()
    .refine((val) => {
      if (!val || val.trim() === '') return false
      const num = parseFloat(val)
      return !isNaN(num) && Number.isFinite(num)
    }, 'Please enter a valid number')
    .refine((val) => {
      const num = parseFloat(val)
      return Math.abs(num) <= 999999999.99
    }, 'Amount is too large')
    .refine((val) => {
      const decimalPlaces = (val.split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places')
    .transform((val) => parseFloat(val)),
    
  positiveStringAmount: z.string()
    .refine((val) => {
      if (!val || val.trim() === '') return false
      const num = parseFloat(val)
      return !isNaN(num) && Number.isFinite(num) && num > 0
    }, 'Please enter a positive number')
    .refine((val) => {
      const num = parseFloat(val)
      return num <= 999999999.99
    }, 'Amount is too large')
    .refine((val) => {
      const decimalPlaces = (val.split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount cannot have more than 2 decimal places')
    .transform((val) => parseFloat(val)),
  
  // Date and time
  dateString: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Please enter a valid date'
  ),
  
  isoDateTime: z.string().datetime('Please enter a valid date and time'),
  
  timezone: z.string()
    .min(1, 'Please select a timezone')
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
  
  // Text fields with proper validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long (maximum 100 characters)')
    .refine((val) => val.trim().length > 0, 'Name cannot be only spaces'),
    
  description: z.string()
    .max(500, 'Description is too long (maximum 500 characters)')
    .optional(),
    
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category name is too long (maximum 50 characters)')
    .refine((val) => val.trim().length > 0, 'Category cannot be only spaces'),
  
  // User preferences
  language: z.string()
    .min(2, 'Language code is too short')
    .max(10, 'Language code is too long')
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format'),
    
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], {
    errorMap: () => ({ message: 'Please select a valid date format' })
  }),
  
  // Account and transaction types
  accountType: z.enum(['cash', 'bank', 'investment', 'asset', 'debt'], {
    errorMap: () => ({ message: 'Please select a valid account type' })
  }),
  
  transactionType: z.enum(['income', 'expense', 'transfer'], {
    errorMap: () => ({ message: 'Please select a valid transaction type' })
  }),
  
  workspaceType: z.enum(['personal', 'family', 'team'], {
    errorMap: () => ({ message: 'Please select a valid workspace type' })
  }),
  
  budgetPeriod: z.enum(['monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Please select a valid budget period' })
  })
}

// Enhanced validation helpers
export const validationHelpers = {
  /**
   * Pagination schema
   */
  paginationSchema: z.object({
    page: z.number().min(1, 'Page must be at least 1').default(1),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  }),

  /**
   * Date range schema with comprehensive validation
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
   * Password strength validation
   */
  passwordSchema: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
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
}

// Form-specific schemas
export const formSchemas = {
  /**
   * Enhanced account form schema
   */
  accountForm: z.object({
    name: commonSchemas.name,
    type: commonSchemas.accountType,
    currency: commonSchemas.currency,
    initial_balance: commonSchemas.amount.default(0),
    description: commonSchemas.description,
  }),

  /**
   * Enhanced transaction form schema
   */
  transactionForm: z.object({
    account_id: commonSchemas.uuid,
    type: commonSchemas.transactionType,
    amount: commonSchemas.positiveStringAmount,
    currency: commonSchemas.currency,
    category: commonSchemas.category.optional(),
    description: commonSchemas.description,
    transaction_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    ),
  }),

  /**
   * Enhanced budget form schema
   */
  budgetForm: z.object({
    name: commonSchemas.name,
    category: commonSchemas.category,
    amount: commonSchemas.positiveStringAmount,
    period: commonSchemas.budgetPeriod,
    start_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid start date'
    ),
    end_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid end date'
    ).optional(),
  }).refine(
    (data) => {
      if (data.end_date) {
        return new Date(data.start_date) < new Date(data.end_date)
      }
      return true
    },
    'End date must be after start date'
  ),

  /**
   * Enhanced savings goal form schema
   */
  savingsGoalForm: z.object({
    name: commonSchemas.name,
    target_amount: commonSchemas.positiveStringAmount,
    current_amount: commonSchemas.stringAmount.default('0'),
    target_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid target date'
    ).optional(),
    category: commonSchemas.category.optional(),
    description: commonSchemas.description,
  }).refine(
    (data) => data.current_amount <= data.target_amount,
    'Current amount cannot exceed target amount'
  ).refine(
    (data) => {
      if (data.target_date) {
        return new Date(data.target_date) > new Date()
      }
      return true
    },
    'Target date must be in the future'
  ),

  /**
   * User settings form schema
   */
  userSettingsForm: validationHelpers.userSettingsSchema,

  /**
   * Workspace form schema
   */
  workspaceForm: z.object({
    name: commonSchemas.name,
    type: commonSchemas.workspaceType,
    currency: commonSchemas.currency,
  }),
}

// Utility functions for validation
export const validationUtils = {
  /**
   * Format currency amount for display
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  },

  /**
   * Parse currency input string to number
   */
  parseCurrencyInput: (input: string): number | null => {
    if (!input || input.trim() === '') return null
    
    // Remove currency symbols and spaces
    const cleaned = input.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    
    return isNaN(parsed) ? null : parsed
  },

  /**
   * Validate currency format in real-time
   */
  validateCurrencyFormat: (input: string): boolean => {
    if (!input || input.trim() === '') return true
    
    // Allow numbers with up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/
    return regex.test(input.replace(/[^\d.]/g, ''))
  },

  /**
   * Check if a value is a duplicate in an array (case-insensitive)
   */
  isDuplicate: (value: string, existingValues: string[]): boolean => {
    return existingValues.some(existing => 
      existing.toLowerCase() === value.toLowerCase()
    )
  },

  /**
   * Create a unique name validator
   */
  createUniqueValidator: (existingNames: string[]) => {
    return (name: string): boolean => {
      return !validationUtils.isDuplicate(name, existingNames)
    }
  },

  /**
   * Sanitize input for display
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim() // Remove leading/trailing spaces
      .substring(0, 1000) // Limit length
  },
}