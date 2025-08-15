import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { AppError, ErrorType } from '../types/errors'
import { appErrorResponse, errorResponse } from '../utils/response'
import { normalizeError, extractErrorDetails, getErrorLogLevel } from '../utils/errors'
import { extendedLogger, logger } from '../config/logging'

/**
 * Request context tracking middleware
 * Adds unique request ID and context information for debugging
 */
export async function requestContextMiddleware(c: Context, next: Next) {
  try {
    // Generate unique request ID using a simpler method
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    c.set('requestId', requestId)
    
    // Store request context for error handling
    const requestContext = {
      id: requestId,
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header('User-Agent') || 'unknown',
      ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown',
      timestamp: new Date().toISOString(),
      userId: c.get('userId') || null, // Will be set by auth middleware if authenticated
      workspaceId: c.get('workspaceId') || null // Will be set by auth middleware if applicable
    }
    
    c.set('requestContext', requestContext)
    
    // Add request ID to response headers for debugging
    c.res.headers.set('X-Request-ID', requestId)
    
    await next()
  } catch (error) {
    console.error('Request context middleware error:', error)
    // Continue with request even if context setup fails
    await next()
  }
}

/**
 * Global error handler middleware for Hono.js
 * Handles all errors consistently with proper logging and user-friendly responses
 */
export function createErrorHandler() {
  return async (err: Error, c: Context): Promise<Response> => {
    try {
      const requestId = c.get('requestId')
      const requestContext = c.get('requestContext')
      
      // Extract detailed error information
      const errorDetails = extractErrorDetails(err)
      const logLevel = getErrorLogLevel(err)
      
      // Log the error with full context to file
      logger.error('Application error occurred', {
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
          ...errorDetails
        },
        request: {
          id: requestId,
          context: requestContext
        },
        timestamp: new Date().toISOString()
      })
      
      // Also log to console for development
      console.error('Application error occurred:', {
        error: err,
        requestId,
        requestContext
      })
      
      // Handle specific error types
      if (err instanceof HTTPException) {
        // Hono's built-in HTTP exceptions
        return errorResponse(
          c,
          err.message,
          err.status,
          getErrorTypeFromStatus(err.status)
        )
      }
      
      // Create a proper error response
      const errorResponseData = {
        success: false,
        error: {
          type: ErrorType.SERVER_ERROR,
          message: err.message || 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? {
            originalError: err.message,
            stack: err.stack
          } : undefined,
          timestamp: new Date().toISOString(),
          request_id: requestId
        }
      }
      
      return c.json(errorResponseData, 500)
      
    } catch (handlerError) {
      // Log the handler error itself
      logger.error('Error in error handler:', {
        originalError: err,
        handlerError: handlerError,
        timestamp: new Date().toISOString()
      })
      
      console.error('Error in error handler:', handlerError)
      // Fallback to basic error response
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

/**
 * Error logging middleware for detailed error tracking
 */
export async function errorLoggingMiddleware(c: Context, next: Next) {
  const startTime = Date.now()
  
  try {
    await next()
    
    // Log successful requests at debug level
    const duration = Date.now() - startTime
    const requestContext = c.get('requestContext')
    
    if (requestContext && typeof requestContext === 'object') {
      extendedLogger.debug('Request completed successfully', {
        ...requestContext,
        statusCode: c.res.status,
        duration: `${duration}ms`
      })
    } else {
      extendedLogger.debug('Request completed successfully', {
        statusCode: c.res.status,
        duration: `${duration}ms`
      })
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    const requestContext = c.get('requestContext')
    
    // Add timing information to error context
    c.set('requestDuration', duration)
    
    // Log the error with full context
    logger.error('Request failed', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: {
        context: requestContext,
        duration: `${duration}ms`
      },
      timestamp: new Date().toISOString()
    })
    
    // Re-throw to let error handler middleware handle it
    throw error
  }
}

/**
 * Async error wrapper for route handlers
 * Ensures async errors are properly caught and handled
 */
export function asyncErrorHandler(
  handler: (c: Context, next?: Next) => Promise<Response | void>
) {
  return async (c: Context, next?: Next) => {
    try {
      return await handler(c, next)
    } catch (error) {
      // Let the global error handler deal with it
      throw error
    }
  }
}

/**
 * Validation error handler for form/input validation
 */
export function handleValidationError(errors: any, message: string = 'Validation failed') {
  throw new AppError(
    ErrorType.VALIDATION_ERROR,
    message,
    422,
    { fieldErrors: errors }
  )
}

/**
 * Database error handler for database-related errors
 */
export function handleDatabaseError(error: Error, context?: string) {
  let message = 'Database operation failed'
  let details: any = { context }
  
  // Handle specific database error patterns
  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    message = 'Duplicate entry detected'
    details.type = 'duplicate_key'
  } else if (error.message.includes('foreign key') || error.message.includes('violates')) {
    message = 'Invalid reference or constraint violation'
    details.type = 'constraint_violation'
  } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
    message = 'Referenced resource not found'
    details.type = 'not_found'
  }
  
  throw new AppError(
    ErrorType.DATABASE_ERROR,
    message,
    500,
    {
      ...details,
      originalError: error.message
    }
  )
}

/**
 * Helper function to map HTTP status codes to error types
 */
function getErrorTypeFromStatus(status: number): ErrorType {
  switch (status) {
    case 400:
      return ErrorType.VALIDATION_ERROR
    case 401:
      return ErrorType.AUTHENTICATION_ERROR
    case 403:
      return ErrorType.AUTHORIZATION_ERROR
    case 404:
      return ErrorType.NOT_FOUND_ERROR
    case 422:
      return ErrorType.VALIDATION_ERROR
    case 429:
      return ErrorType.RATE_LIMIT_ERROR
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER_ERROR
    default:
      return ErrorType.SERVER_ERROR
  }
}