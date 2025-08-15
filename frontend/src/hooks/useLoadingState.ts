import { useState, useCallback } from 'react'
import { useTimeout } from './useTimeout'

interface UseLoadingStateOptions {
  timeout?: number
  onTimeout?: () => void
  initialLoading?: boolean
}

interface UseLoadingStateReturn {
  isLoading: boolean
  isTimedOut: boolean
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>
  reset: () => void
}

export const useLoadingState = (
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn => {
  const { timeout = 30000, onTimeout, initialLoading = false } = options
  
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [isTimedOut, setIsTimedOut] = useState(false)

  const handleTimeout = useCallback(() => {
    setIsTimedOut(true)
    setIsLoading(false)
    onTimeout?.()
  }, [onTimeout])

  useTimeout(handleTimeout, isLoading && !isTimedOut ? timeout : null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setIsTimedOut(false)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (error) {
      stopLoading()
      throw error
    }
  }, [startLoading, stopLoading])

  const reset = useCallback(() => {
    setIsLoading(false)
    setIsTimedOut(false)
  }, [])

  return {
    isLoading,
    isTimedOut,
    startLoading,
    stopLoading,
    withLoading,
    reset
  }
}