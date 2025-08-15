import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
  showDetails?: boolean
  actions?: React.ReactNode
}

/**
 * Generic error fallback component with recovery options
 */
export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  showDetails = false,
  actions
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showDetails && error && (
            <Alert variant="destructive">
              <AlertDescription className="font-mono text-sm">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            {resetError && (
              <Button onClick={resetError} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {actions || (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Network error fallback component
 */
export function NetworkErrorFallback({ resetError }: { resetError?: () => void }) {
  const isOnline = navigator.onLine

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {isOnline ? <Wifi className="w-6 h-6 text-orange-600" /> : <WifiOff className="w-6 h-6 text-red-600" />}
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {isOnline ? 'Connection Issue' : 'No Internet Connection'}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? 'Unable to connect to our servers. Please check your connection and try again.'
              : 'Please check your internet connection and try again.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {resetError && (
              <Button onClick={resetError} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Loading error fallback component
 */
export function LoadingErrorFallback({ 
  resource = "data",
  resetError 
}: { 
  resource?: string
  resetError?: () => void 
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Failed to Load {resource}
          </CardTitle>
          <CardDescription>
            We couldn't load the {resource}. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {resetError && (
              <Button onClick={resetError} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Loading
              </Button>
            )}
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Minimal error fallback for inline errors
 */
export function InlineErrorFallback({ 
  error, 
  resetError,
  message = "Something went wrong"
}: {
  error?: Error
  resetError?: () => void
  message?: string
}) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {resetError && (
          <Button variant="ghost" size="sm" onClick={resetError}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Empty state error fallback
 */
export function EmptyStateErrorFallback({
  title = "No data available",
  description = "There's no data to display right now.",
  action
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  )
}