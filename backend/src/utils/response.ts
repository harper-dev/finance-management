import { Context } from 'hono'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export function successResponse<T>(c: Context, data: T, message?: string) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  
  return c.json(response)
}

export function errorResponse(c: Context, error: string, status: number = 400) {
  const response: ApiResponse = {
    success: false,
    error,
  }
  
  return c.json(response, status as any)
}

export function notFoundResponse(c: Context, resource: string = 'Resource') {
  return errorResponse(c, `${resource} not found`, 404)
}

export function validationErrorResponse(c: Context, errors: any) {
  const response: ApiResponse = {
    success: false,
    error: 'Validation failed',
    data: errors,
  }
  
  return c.json(response, 422 as any)
}