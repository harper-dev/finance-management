import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useWorkspaceStore } from '@/stores/workspaceStore'

// Generic hook for API calls with loading states
export function useApiCall<T>(
  fn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await fn()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, dependencies)

  return {
    data,
    isLoading,
    error,
    execute,
    reset: () => {
      setData(null)
      setError(null)
    }
  }
}

// Workspaces hooks
export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces()
  })
}

export function useWorkspace(id: string) {
  return useQuery(['workspace', id], () => apiClient.getWorkspace(id), {
    enabled: !!id
  })
}

// Accounts hooks
export function useAccounts(workspaceId?: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['accounts', workspaceId, page, limit],
    queryFn: () => apiClient.getAccounts(workspaceId!, page, limit),
    enabled: !!workspaceId
  })
}

export function useAccount(id: string) {
  return useQuery(['account', id], () => apiClient.getAccount(id), {
    enabled: !!id
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', currentWorkspace?.id] })
    }
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateAccount(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['accounts', currentWorkspace?.id])
        queryClient.invalidateQueries(['account', id])
      }
    }
  )
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation(
    (id: string) => apiClient.deleteAccount(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['accounts', currentWorkspace?.id])
      }
    }
  )
}

// Transactions hooks
export function useTransactions(
  workspaceId?: string, 
  options?: {
    page?: number
    limit?: number
    account_id?: string
    category?: string
    type?: string
    start_date?: string
    end_date?: string
  }
) {
  console.log('useTransactions called:', { workspaceId, options });
  
  return useQuery(
    ['transactions', workspaceId, options],
    () => {
      console.log('Fetching transactions with:', { workspaceId, options });
      return apiClient.getTransactions(workspaceId!, options);
    },
    { 
      enabled: !!workspaceId,
      onSuccess: (data) => {
        console.log('Transactions fetched successfully:', data);
      },
      onError: (error) => {
        console.error('Error fetching transactions:', error);
      }
    }
  )
}

export function useTransaction(id: string) {
  return useQuery(['transaction', id], () => apiClient.getTransaction(id), {
    enabled: !!id
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createTransaction(data),
    onSuccess: () => {
      // Invalidate all transaction queries for this workspace (with any options)
      queryClient.invalidateQueries({ 
        queryKey: ['transactions', currentWorkspace?.id],
        exact: false 
      })
      queryClient.invalidateQueries({ queryKey: ['accounts', currentWorkspace?.id] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => apiClient.updateTransaction(id, data),
    {
      onSuccess: (_, { id }) => {
        // Invalidate all transaction queries for this workspace (with any options)
        queryClient.invalidateQueries({ 
          queryKey: ['transactions', currentWorkspace?.id],
          exact: false 
        })
        queryClient.invalidateQueries(['transaction', id])
        queryClient.invalidateQueries(['accounts', currentWorkspace?.id])
        queryClient.invalidateQueries(['analytics'])
      }
    }
  )
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation(
    (id: string) => apiClient.deleteTransaction(id),
    {
      onSuccess: () => {
        // Invalidate all transaction queries for this workspace (with any options)
        queryClient.invalidateQueries({ 
          queryKey: ['transactions', currentWorkspace?.id],
          exact: false 
        })
        queryClient.invalidateQueries(['accounts', currentWorkspace?.id])
        queryClient.invalidateQueries(['analytics'])
      }
    }
  )
}

// Budgets hooks
export function useBudgets(
  workspaceId?: string,
  options?: {
    page?: number
    limit?: number
    is_active?: boolean
    period?: string
  }
) {
  return useQuery(
    ['budgets', workspaceId, options],
    () => apiClient.getBudgets(workspaceId!, options),
    { enabled: !!workspaceId }
  )
}

export function useBudget(id: string) {
  return useQuery(['budget', id], () => apiClient.getBudget(id), {
    enabled: !!id
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { currentWorkspace } = useWorkspaceStore()
  
  return useMutation(
    (data: any) => apiClient.createBudget(currentWorkspace!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budgets', currentWorkspace?.id])
        queryClient.invalidateQueries(['analytics'])
      }
    }
  )
}

// Analytics hooks
export function useOverviewAnalytics(workspaceId?: string) {
  return useQuery(
    ['analytics', 'overview', workspaceId],
    () => apiClient.getOverviewAnalytics(workspaceId!),
    { enabled: !!workspaceId }
  )
}

export function useSpendingAnalytics(
  workspaceId?: string,
  options?: {
    period?: string
    start_date?: string
    end_date?: string
  }
) {
  return useQuery(
    ['analytics', 'spending', workspaceId, options],
    () => apiClient.getSpendingAnalytics(workspaceId!, options),
    { enabled: !!workspaceId }
  )
}

export function useTrendsAnalytics(workspaceId?: string, months: number = 12) {
  return useQuery(
    ['analytics', 'trends', workspaceId, months],
    () => apiClient.getTrendsAnalytics(workspaceId!, months),
    { enabled: !!workspaceId }
  )
}