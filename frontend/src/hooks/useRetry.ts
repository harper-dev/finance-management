import { useState, useCallback } from 'react'

interface UseRetryOptions {
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number) => void
  onMaxRetriesReached?: () => void
}

interface UseRetryReturn<T> {
  execute: () => Promise<T | null>
  isRetrying: boolean
  retryCount: number
  reset: () => void
}

export const useRetry = <T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onMaxRetriesReached
  } = options

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const execute = useCallback(async (): Promise<T | null> => {
    let currentAttempt = 0
    
    while (currentAttempt <= maxRetries) {
      try {
        setIsRetrying(currentAttempt > 0)
        setRetryCount(currentAttempt)
        
        const result = await asyncFunction()
        setIsRetrying(false)
        setRetryCount(0)
        return result
      } catch (error) {
        currentAttempt++
        
        if (currentAttempt <= maxRetries) {
          onRetry?.(currentAttempt)
          await new Promise(resolve => setTimeout(resolve, retryDelay * currentAttempt))
        } else {
          setIsRetrying(false)
          onMaxRetriesReached?.()
          throw error
        }
      }
    }
    
    return null
  }, [asyncFunction, maxRetries, retryDelay, onRetry, onMaxRetriesReached])

  const reset = useCallback(() => {
    setIsRetrying(false)
    setRetryCount(0)
  }, [])

  return {
    execute,
    isRetrying,
    retryCount,
    reset
  }
}