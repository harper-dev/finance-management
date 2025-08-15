import React, { Component, ReactNode } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { NetworkError, ValidationError, AuthenticationError, AuthorizationError, OfflineError, TimeoutError } from '@/services/api'
import { errorReportingService } from '@/services/errorReporting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Wifi, RefreshCw, Shield, AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Enhanced error boundary specifically for React Query errors
 */
export class QueryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('QueryErrorBoundary caught an error:', error, errorInfo)
    
    // Report to error monitoring service
    errorReportingService.reportError(error, errorInfo, 'QueryErrorBoundary', 'high')
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <QueryErrorResetBoundary>
          {({ reset }) => (
            this.props.fallback ? 
              this.props.fallback(this.state.error!, () => {
                this.setState({ hasError: false, error: null })
                reset()
              }) :
              <DefaultQueryErrorFallback 
                error={this.state.error!} 
                onReset={() => {
                  this.setState({ hasError: false, error: null })
                  reset()
                }}
              />
          )}
        </QueryErrorResetBoundary>
      )
    }

    return this.props.children
  }
}

/**
 * Default fallback component for query errors
 */
function DefaultQueryErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const getErrorContent = () => {
    if (error instanceof OfflineError) {
      return {
        icon: <Wifi className="h-8 w-8 text-orange-500" />,
        title: 'You\'re Offline',
        description: 'Please check your internet connection and try again.',
        actionText: 'Retry when online',
        variant: 'warning' as const
      }
    }

    if (error instanceof TimeoutError) {
      return {
        icon: <RefreshCw className="h-8 w-8 text-blue-500" />,
        title: 'Request Timed Out',
        description: 'The request took too long to complete. Please try again.',
        actionText: 'Try again',
        variant: 'info' as const
      }
    }

    if (error instanceof NetworkError) {
      return {
        icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
        title: 'Connection Problem',
        description: 'Unable to connect to the server. Please check your connection and try again.',
        actionText: 'Retry',
        variant: 'destructive' as const
      }
    }

    if (error instanceof AuthenticationError) {
      return {
        icon: <Shield className="h-8 w-8 text-yellow-500" />,
        title: 'Authentication Required',
        description: 'Please log in to continue.',
        actionText: 'Go to login',
        variant: 'warning' as const,
        onClick: () => window.location.href = '/login'
      }
    }

    if (error instanceof AuthorizationError) {
      return {
        icon: <Shield className="h-8 w-8 text-red-500" />,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        actionText: 'Go back',
        variant: 'destructive' as const,
        onClick: () => window.history.back()
      }
    }

    if (error instanceof ValidationError) {
      return {
        icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
        title: 'Invalid Data',
        description: error.message || 'The data provided is invalid. Please check and try again.',
        actionText: 'Try again',
        variant: 'warning' as const
      }
    }

    // Generic error
    return {
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      title: 'Something went wrong',
      description: error.message || 'An unexpected error occurred. Please try again.',
      actionText: 'Try again',
      variant: 'destructive' as const
    }
  }

  const { icon, title, description, actionText, variant, onClick } = getErrorContent()

  return (
    <div className="flex items-center justify-center min-h-[200px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onClick || onReset}
            variant={variant === 'destructive' ? 'destructive' : variant === 'warning' ? 'outline' : 'default'}
            className="w-full"
          >
            {actionText}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook for using query error boundary
 */
export function useQueryErrorHandler() {
  return {
    onError: (error: Error) => {
      console.error('Query error:', error)
      
      // Report to error monitoring
      errorReportingService.reportCustomError(
        `Query Error: ${error.message}`,
        'medium',
        {
          errorType: error.constructor.name,
          stack: error.stack
        }
      )
    }
  }
}

export default QueryErrorBoundary