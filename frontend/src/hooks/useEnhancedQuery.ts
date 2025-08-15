import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { NetworkError, ValidationError, AuthenticationError, AuthorizationError, OfflineError, TimeoutError } from '@/services/api'
import { errorReportingService } from '@/services/errorReporting'
import { useToast } from '@/hooks/useToast'

/**
 * Enhanced useQuery hook with better error handling and user feedback
 */
export function useEnhancedQuery<TData, TError = Error>(
  options: UseQueryOptions<TData, TError> & {
    showErrorToast?: boolean
    errorToastTitle?: string
    onNetworkError?: (error: NetworkError) => void
    onAuthError?: (error: AuthenticationError | AuthorizationError) => void
    onValidationError?: (error: ValidationError) => void
  }
) {
  const { toast } = useToast()
  const {
    showErrorToast = true,
    errorToastTitle = 'Error',
    onNetworkError,
    onAuthError,
    onValidationError,
    onError,
    ...queryOptions
  } = options

  return useQuery({
    ...queryOptions,
    retry: (failureCount, error) => {
      // Custom retry logic based on error type
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return false
      }
      
      if (error instanceof ValidationError) {
        return false
      }
      
      if (error instanceof NetworkError || error instanceof TimeoutError || error instanceof OfflineError) {
        return failureCount < 3
      }
      
      return failureCount < 1
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Enhanced query error:', error)
      
      // Handle specific error types
      if (error instanceof NetworkError) {
        onNetworkError?.(error)
        if (showErrorToast) {
          toast({
            title: errorToastTitle,
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        onAuthError?.(error)
        if (showErrorToast) {
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof ValidationError) {
        onValidationError?.(error)
        if (showErrorToast) {
          toast({
            title: 'Validation Error',
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof OfflineError) {
        if (showErrorToast) {
          toast({
            title: 'Offline',
            description: 'You appear to be offline. Please check your connection.',
            variant: 'destructive'
          })
        }
      } else if (error instanceof TimeoutError) {
        if (showErrorToast) {
          toast({
            title: 'Timeout',
            description: 'Request timed out. Please try again.',
            variant: 'destructive'
          })
        }
      } else if (showErrorToast && error instanceof Error) {
        toast({
          title: errorToastTitle,
          description: error.message,
          variant: 'destructive'
        })
      }

      // Report to error monitoring
      if (error instanceof Error) {
        errorReportingService.reportCustomError(
          `Query Error: ${error.message}`,
          'medium',
          {
            errorType: error.constructor.name,
            queryKey: queryOptions.queryKey,
            stack: error.stack
          }
        )
      }

      // Call custom error handler
      onError?.(error)
    }
  })
}

/**
 * Enhanced useMutation hook with better error handling and user feedback
 */
export function useEnhancedMutation<TData, TError = Error, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    showErrorToast?: boolean
    showSuccessToast?: boolean
    errorToastTitle?: string
    successToastTitle?: string
    successToastDescription?: string
    onNetworkError?: (error: NetworkError) => void
    onAuthError?: (error: AuthenticationError | AuthorizationError) => void
    onValidationError?: (error: ValidationError) => void
  }
) {
  const { toast } = useToast()
  const {
    showErrorToast = true,
    showSuccessToast = false,
    errorToastTitle = 'Error',
    successToastTitle = 'Success',
    successToastDescription = 'Operation completed successfully',
    onNetworkError,
    onAuthError,
    onValidationError,
    onError,
    onSuccess,
    ...mutationOptions
  } = options

  return useMutation({
    ...mutationOptions,
    retry: (failureCount, error) => {
      // Don't retry mutations on client errors
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError || 
          error instanceof AuthorizationError) {
        return false
      }
      
      // Retry mutations only for network/server errors
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        return failureCount < 2
      }
      
      return false
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onError: (error, variables, context) => {
      console.error('Enhanced mutation error:', error)
      
      // Handle specific error types
      if (error instanceof NetworkError) {
        onNetworkError?.(error)
        if (showErrorToast) {
          toast({
            title: errorToastTitle,
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        onAuthError?.(error)
        if (showErrorToast) {
          toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof ValidationError) {
        onValidationError?.(error)
        if (showErrorToast) {
          toast({
            title: 'Validation Error',
            description: error.message,
            variant: 'destructive'
          })
        }
      } else if (error instanceof OfflineError) {
        if (showErrorToast) {
          toast({
            title: 'Offline',
            description: 'You appear to be offline. Please check your connection.',
            variant: 'destructive'
          })
        }
      } else if (error instanceof TimeoutError) {
        if (showErrorToast) {
          toast({
            title: 'Timeout',
            description: 'Request timed out. Please try again.',
            variant: 'destructive'
          })
        }
      } else if (showErrorToast && error instanceof Error) {
        toast({
          title: errorToastTitle,
          description: error.message,
          variant: 'destructive'
        })
      }

      // Report to error monitoring
      if (error instanceof Error) {
        errorReportingService.reportCustomError(
          `Mutation Error: ${error.message}`,
          'high',
          {
            errorType: error.constructor.name,
            variables: JSON.stringify(variables),
            stack: error.stack
          }
        )
      }

      // Call custom error handler
      onError?.(error, variables, context)
    },
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast({
          title: successToastTitle,
          description: successToastDescription,
          variant: 'default'
        })
      }

      // Call custom success handler
      onSuccess?.(data, variables, context)
    }
  })
}

/**
 * Hook for handling query errors with recovery options
 */
export function useQueryErrorRecovery() {
  const queryClient = useQueryClient()

  return {
    retryQuery: (queryKey: unknown[]) => {
      queryClient.refetchQueries({ queryKey })
    },
    invalidateQuery: (queryKey: unknown[]) => {
      queryClient.invalidateQueries({ queryKey })
    },
    resetQuery: (queryKey: unknown[]) => {
      queryClient.resetQueries({ queryKey })
    },
    clearCache: () => {
      queryClient.clear()
    },
    refetchAll: () => {
      queryClient.refetchQueries()
    }
  }
}

/**
 * Hook for monitoring query states and providing user feedback
 */
export function useQueryStateMonitor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return {
    getQueryState: (queryKey: unknown[]) => {
      return queryClient.getQueryState(queryKey)
    },
    isQueryLoading: (queryKey: unknown[]) => {
      const state = queryClient.getQueryState(queryKey)
      return state?.fetchStatus === 'fetching'
    },
    isQueryError: (queryKey: unknown[]) => {
      const state = queryClient.getQueryState(queryKey)
      return state?.status === 'error'
    },
    getQueryError: (queryKey: unknown[]) => {
      const state = queryClient.getQueryState(queryKey)
      return state?.error
    },
    showConnectionStatus: () => {
      if (!navigator.onLine) {
        toast({
          title: 'Offline',
          description: 'You are currently offline. Some features may not work.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Online',
          description: 'Connection restored.',
          variant: 'default'
        })
      }
    }
  }
}

/**
 * Hook for handling offline scenarios
 */
export function useOfflineHandler() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return {
    pauseQueries: () => {
      queryClient.getQueryCache().getAll().forEach(query => {
        query.cancel()
      })
    },
    resumeQueries: () => {
      queryClient.resumePausedMutations()
      queryClient.refetchQueries()
    },
    handleOffline: () => {
      toast({
        title: 'Connection Lost',
        description: 'You are now offline. Changes will be saved when connection is restored.',
        variant: 'destructive'
      })
    },
    handleOnline: () => {
      toast({
        title: 'Connection Restored',
        description: 'You are back online. Syncing data...',
        variant: 'default'
      })
      queryClient.refetchQueries()
    }
  }
}