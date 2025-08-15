import { Context } from 'hono'
import { 
  AppError, 
  ErrorType, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  DatabaseError, 
  BusinessLogicError,
  RateLimitError,
  ExternalServiceError
} from '../types/errors'

// Re-export error types and classes for convenience
export { 
  AppError, 
  ErrorType, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  DatabaseError, 
  BusinessLogicError,
  RateLimitError,
  ExternalServiceError
}

/**
 * Error utility functions for consistent error creation and handling
 */

/**
 * Create a validation error with field-specific details
 */
export function createValidationError(message: string, fieldErrors?: Record<string, string[]>) {
  return new ValidationError(message, { fieldErrors })
}

/**
 * Create an authentication error
 */
export function createAuthenticationError(message?: string) {
  return new AuthenticationError(message)
}

/**
 * Create an authorization error
 */
export function createAuthorizationError(message?: string) {
  return new AuthorizationError(message)
}

/**
 * Create a not found error
 */
export function createNotFoundError(resource: string) {
  return new NotFoundError(resource)
}

/**
 * Create a database error with query context
 */
export function createDatabaseError(message: string, query?: string, params?: any) {
  return new DatabaseError(message, { query, params })
}

/**
 * Create a business logic error
 */
export function createBusinessLogicError(message: string, statusCode?: number, context?: any) {
  return new BusinessLogicError(message, statusCode, context)
}

/**
 * Create a rate limit error
 */
export function createRateLimitError(limit: number, windowMs: number) {
  return new RateLimitError(
    `Rate limit exceeded: ${limit} requests per ${windowMs}ms`,
    { limit, windowMs }
  )
}

/**
 * Create an external service error
 */
export function createExternalServiceError(service: string, message: string, statusCode?: number) {
  return new ExternalServiceError(service, message, { statusCode })
}

/**
 * Check if an error is an operational error (expected/handled)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Extract error details for logging
 */
export function extractErrorDetails(error: Error, context?: Context) {
  const baseDetails = {
    name: error.name || 'UnknownError',
    message: typeof error.message === 'string' ? error.message : 'Unknown error occurred',
    stack: typeof error.stack === 'string' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  }

  if (error instanceof AppError) {
    return {
      ...baseDetails,
      type: error.type,
      statusCode: error.statusCode,
      details: error.details,
      isOperational: error.isOperational
    }
  }

  return baseDetails
}

/**
 * Get user-friendly error message (sanitized for production)
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof AppError) {
    // Return the original message for operational errors
    if (error.isOperational) {
      return error.message
    }
  }

  // For non-operational errors, return generic message in production
  if (process.env.NODE_ENV === 'production') {
    return 'An unexpected error occurred. Please try again later.'
  }

  return error.message
}

/**
 * Convert any error to AppError for consistent handling
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    const message = error.message || 'Unknown error occurred'
    
    // Check for specific error patterns and convert accordingly
    if (typeof message === 'string') {
      if (message.includes('duplicate key') || message.includes('unique constraint')) {
        return new ValidationError('Duplicate entry detected', { originalError: message })
      }

      if (message.includes('foreign key') || message.includes('violates')) {
        return new ValidationError('Invalid reference or constraint violation', { originalError: message })
      }

      if (message.includes('not found') || message.includes('does not exist')) {
        return new NotFoundError('Resource')
      }
    }

    // Default to server error for unknown errors
    return new AppError(
      ErrorType.SERVER_ERROR,
      message,
      500,
      { originalError: message },
      false // Non-operational since it's unexpected
    )
  }

  // Handle non-Error objects
  const message = typeof error === 'string' ? error : 'Unknown error occurred'
  return new AppError(ErrorType.SERVER_ERROR, message, 500, { originalError: error }, false)
}

/**
 * Log error with appropriate level based on error type
 */
export function getErrorLogLevel(error: AppError): 'error' | 'warn' | 'info' {
  switch (error.type) {
    case ErrorType.SERVER_ERROR:
    case ErrorType.DATABASE_ERROR:
    case ErrorType.EXTERNAL_SERVICE_ERROR:
      return 'error'
    
    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.AUTHORIZATION_ERROR:
    case ErrorType.RATE_LIMIT_ERROR:
      return 'warn'
    
    case ErrorType.VALIDATION_ERROR:
    case ErrorType.NOT_FOUND_ERROR:
    case ErrorType.BUSINESS_LOGIC_ERROR:
      return 'info'
    
    default:
      return 'error'
  }
}