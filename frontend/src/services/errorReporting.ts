import { ErrorInfo } from 'react'

export interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  errorId: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  workspaceId?: string
  feature?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

export interface NetworkErrorReport {
  url: string
  method: string
  status?: number
  statusText?: string
  responseText?: string
  timestamp: string
  userId?: string
  workspaceId?: string
}

/**
 * Error reporting service for production monitoring
 */
class ErrorReportingService {
  private isEnabled: boolean
  private userId?: string
  private workspaceId?: string

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production'
  }

  /**
   * Set user context for error reporting
   */
  setUserContext(userId: string, workspaceId?: string) {
    this.userId = userId
    this.workspaceId = workspaceId
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext() {
    this.userId = undefined
    this.workspaceId = undefined
  }

  /**
   * Report a React error boundary error
   */
  reportError(
    error: Error, 
    errorInfo: ErrorInfo, 
    feature?: string,
    severity: ErrorReport['severity'] = 'high',
    context?: Record<string, any>
  ) {
    if (!this.isEnabled) {
      console.error('Error Report (Development):', { error, errorInfo, feature, context })
      return
    }

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      workspaceId: this.workspaceId,
      feature,
      severity,
      context
    }

    this.sendErrorReport(report)
  }

  /**
   * Report a network/API error
   */
  reportNetworkError(
    url: string,
    method: string,
    status?: number,
    statusText?: string,
    responseText?: string
  ) {
    if (!this.isEnabled) {
      console.error('Network Error Report (Development):', { url, method, status, statusText })
      return
    }

    const report: NetworkErrorReport = {
      url,
      method,
      status,
      statusText,
      responseText,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      workspaceId: this.workspaceId
    }

    this.sendNetworkErrorReport(report)
  }

  /**
   * Report a custom error with context
   */
  reportCustomError(
    message: string,
    severity: ErrorReport['severity'] = 'medium',
    context?: Record<string, any>
  ) {
    if (!this.isEnabled) {
      console.error('Custom Error Report (Development):', { message, severity, context })
      return
    }

    const report: ErrorReport = {
      message,
      errorId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      workspaceId: this.workspaceId,
      severity,
      context
    }

    this.sendErrorReport(report)
  }

  /**
   * Send error report to monitoring service
   */
  private async sendErrorReport(report: ErrorReport) {
    try {
      // In a real application, you would send this to your error monitoring service
      // Examples: Sentry, LogRocket, Bugsnag, DataDog, etc.
      
      // For now, we'll send it to our own API endpoint
      await fetch('/api/v1/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      // Fallback: log to console if reporting fails
      console.error('Failed to send error report:', error)
      console.error('Original error report:', report)
    }
  }

  /**
   * Send network error report to monitoring service
   */
  private async sendNetworkErrorReport(report: NetworkErrorReport) {
    try {
      // Send to monitoring service
      await fetch('/api/v1/errors/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      // Fallback: log to console if reporting fails
      console.error('Failed to send network error report:', error)
      console.error('Original network error report:', report)
    }
  }

  /**
   * Test error reporting (for development/testing)
   */
  testErrorReporting() {
    if (process.env.NODE_ENV === 'development') {
      this.reportCustomError('Test error report', 'low', { test: true })
      console.log('Test error report sent')
    }
  }
}

// Create singleton instance
export const errorReportingService = new ErrorReportingService()

/**
 * Hook for error reporting in React components
 */
export function useErrorReporting() {
  return {
    reportError: errorReportingService.reportError.bind(errorReportingService),
    reportNetworkError: errorReportingService.reportNetworkError.bind(errorReportingService),
    reportCustomError: errorReportingService.reportCustomError.bind(errorReportingService),
    setUserContext: errorReportingService.setUserContext.bind(errorReportingService),
    clearUserContext: errorReportingService.clearUserContext.bind(errorReportingService)
  }
}

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  errorReportingService.reportCustomError(
    `Unhandled Promise Rejection: ${event.reason}`,
    'high',
    {
      type: 'unhandledrejection',
      reason: event.reason,
      promise: event.promise
    }
  )
})

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
  errorReportingService.reportCustomError(
    `Uncaught Error: ${event.message}`,
    'critical',
    {
      type: 'uncaught',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
  )
})