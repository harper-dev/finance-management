import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface UseOptimisticUpdateOptions<T> {
  queryKey: (string | number)[]
  updateFn: (oldData: T[], newItem: any) => T[]
  revertFn?: (oldData: T[], failedItem: any) => T[]
}

interface UseOptimisticUpdateReturn<T> {
  optimisticUpdate: (newItem: any, mutationFn: () => Promise<any>) => Promise<void>
  isOptimistic: boolean
}

export const useOptimisticUpdate = <T>({
  queryKey,
  updateFn,
  revertFn
}: UseOptimisticUpdateOptions<T>): UseOptimisticUpdateReturn<T> => {
  const queryClient = useQueryClient()
  const [isOptimistic, setIsOptimistic] = useState(false)

  const optimisticUpdate = useCallback(async (newItem: any, mutationFn: () => Promise<any>) => {
    setIsOptimistic(true)
    
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey })

    // Snapshot the previous value
    const previousData = queryClient.getQueryData<{ data: T[] }>(queryKey)

    // Optimistically update to the new value
    if (previousData) {
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: updateFn(previousData.data, newItem)
      })
    }

    try {
      // Perform the actual mutation
      await mutationFn()
      
      // Invalidate and refetch to get the real data
      queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      // If the mutation fails, revert the optimistic update
      if (previousData && revertFn) {
        queryClient.setQueryData(queryKey, {
          ...previousData,
          data: revertFn(previousData.data, newItem)
        })
      } else if (previousData) {
        // Fallback: restore the original data
        queryClient.setQueryData(queryKey, previousData)
      }
      throw error
    } finally {
      setIsOptimistic(false)
    }
  }, [queryClient, queryKey, updateFn, revertFn])

  return {
    optimisticUpdate,
    isOptimistic
  }
}