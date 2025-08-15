/**
 * Standardized error types for the application
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

/**
 * Custom application error class with proper inheritance
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly details?: any
  public readonly timestamp: string
  public readonly isOperational: boolean

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message)
    
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name
    
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    }
  }
}

/**
 * Validation error class for form and input validation
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorType.VALIDATION_ERROR, message, 422, details)
  }
}

/**
 * Authentication error class for login/token issues
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(ErrorType.AUTHENTICATION_ERROR, message, 401, details)
  }
}

/**
 * Authorization error class for permission issues
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(ErrorType.AUTHORIZATION_ERROR, message, 403, details)
  }
}

/**
 * Not found error class for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    super(ErrorType.NOT_FOUND_ERROR, `${resource} not found`, 404, details)
  }
}

/**
 * Database error class for database-related issues
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(ErrorType.DATABASE_ERROR, message, 500, details)
  }
}

/**
 * Business logic error class for domain-specific errors
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, statusCode: number = 400, details?: any) {
    super(ErrorType.BUSINESS_LOGIC_ERROR, message, statusCode, details)
  }
}

/**
 * Rate limit error class for too many requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(ErrorType.RATE_LIMIT_ERROR, message, 429, details)
  }
}

/**
 * External service error class for third-party service failures
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(ErrorType.EXTERNAL_SERVICE_ERROR, `${service}: ${message}`, 502, details)
  }
}