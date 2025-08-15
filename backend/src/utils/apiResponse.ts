export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export class ResponseBuilder {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }
  }

  static error(message: string, error?: string): ApiResponse<never> {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    }
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    }
  }

  static notFound(resource: string): ApiResponse<never> {
    return this.error(`${resource} not found`)
  }

  static validationError(message: string): ApiResponse<never> {
    return this.error('Validation failed', message)
  }

  static serverError(message?: string): ApiResponse<never> {
    return this.error('Internal server error', message)
  }
} 