import { Context } from 'hono'
import { AppError, ErrorType } from '../types/errors'
import { getUserFriendlyMessage } from './errors'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    type: ErrorType
    message: string
    details?: any
    timestamp: string
    request_id?: string
  }
}

export function successResponse<T>(c: Context, data: T, message?: string) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  
  return c.json(response)
}

export function errorResponse(
  c: Context, 
  message: string, 
  status: number = 400, 
  type: ErrorType = ErrorType.SERVER_ERROR,
  details?: any
) {
  const response: ApiResponse = {
    success: false,
    error: {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      request_id: c.get('requestId') // Will be set by middleware
    }
  }
  
  return c.json(response, status as any)
}

export function appErrorResponse(c: Context, error: AppError) {
  const userMessage = getUserFriendlyMessage(error)
  
  const response: ApiResponse = {
    success: false,
    error: {
      type: error.type,
      message: userMessage,
      details: error.details,
      timestamp: error.timestamp,
      request_id: c.get('requestId')
    }
  }
  
  return c.json(response, error.statusCode as any)
}

export function notFoundResponse(c: Context, resource: string = 'Resource') {
  return errorResponse(c, `${resource} not found`, 404, ErrorType.NOT_FOUND_ERROR)
}

export function validationErrorResponse(c: Context, errors: any) {
  return errorResponse(
    c, 
    'Validation failed', 
    422, 
    ErrorType.VALIDATION_ERROR, 
    errors
  )
}

export function authenticationErrorResponse(c: Context, message: string = 'Authentication required') {
  return errorResponse(c, message, 401, ErrorType.AUTHENTICATION_ERROR)
}

export function authorizationErrorResponse(c: Context, message: string = 'Insufficient permissions') {
  return errorResponse(c, message, 403, ErrorType.AUTHORIZATION_ERROR)
}