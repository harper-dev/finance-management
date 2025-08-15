import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/services/api'

export interface NetworkStatus {
  isOnline: boolean
  isConnected: boolean
  lastOnline: Date | null
  connectionType: string | null
}

/**
 * Hook for monitoring network status and handling offline/online scenarios
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => {
    // Initialize state once during component mount
    const getConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        return connection?.effectiveType || connection?.type || null
      }
      return null
    }

    return {
      isOnline: navigator.onLine,
      isConnected: navigator.onLine,
      lastOnline: navigator.onLine ? new Date() : null,
      connectionType: getConnectionType()
    }
  })
  
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    const updateNetworkStatus = (isOnline: boolean) => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline,
        isConnected: isOnline,
        lastOnline: isOnline ? new Date() : prev.lastOnline
      }))
    }

    const handleOnline = () => {
      updateNetworkStatus(true)
      
      // Test actual connectivity to API server
      testApiConnection()
      
      // Resume paused mutations and refetch queries
      queryClient.resumePausedMutations()
      queryClient.refetchQueries()
      
      toast({
        title: 'Connection Restored',
        description: 'You are back online. Syncing data...',
        variant: 'default'
      })
    }

    const handleOffline = () => {
      updateNetworkStatus(false)
      
      toast({
        title: 'Connection Lost',
        description: 'You are now offline. Changes will be saved when connection is restored.',
        variant: 'destructive'
      })
    }

    const testApiConnection = async () => {
      try {
        const isConnected = await apiClient.testConnection()
        setNetworkStatus(prev => ({
          ...prev,
          isConnected
        }))
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false
        }))
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for connection changes if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const handleConnectionChange = () => {
        setNetworkStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || connection?.type || null
        }))
      }
      connection?.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient, toast])

  const retryConnection = async () => {
    try {
      const isConnected = await apiClient.testConnection()
      setNetworkStatus(prev => ({
        ...prev,
        isConnected
      }))
      
      if (isConnected) {
        queryClient.refetchQueries()
        toast({
          title: 'Connection Test Successful',
          description: 'API server is reachable.',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Connection Test Failed',
          description: 'Unable to reach API server.',
          variant: 'destructive'
        })
      }
      
      return isConnected
    } catch (error) {
      toast({
        title: 'Connection Test Failed',
        description: 'Unable to reach API server.',
        variant: 'destructive'
      })
      return false
    }
  }

  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!networkStatus.isOnline) return 'offline'
    
    const connectionType = networkStatus.connectionType
    if (!connectionType) return 'good'
    
    switch (connectionType) {
      case '4g':
      case 'wifi':
        return 'excellent'
      case '3g':
        return 'good'
      case '2g':
      case 'slow-2g':
        return 'poor'
      default:
        return 'good'
    }
  }

  const getOfflineDuration = (): number | null => {
    if (networkStatus.isOnline || !networkStatus.lastOnline) return null
    return Date.now() - networkStatus.lastOnline.getTime()
  }

  return {
    ...networkStatus,
    connectionQuality: getConnectionQuality(),
    offlineDuration: getOfflineDuration(),
    retryConnection,
    isApiConnected: networkStatus.isConnected
  }
}

/**
 * Hook for handling offline-first functionality
 */
export function useOfflineSupport() {
  const networkStatus = useNetworkStatus()
  const queryClient = useQueryClient()

  const queueMutation = (mutationFn: () => Promise<any>, key: string) => {
    if (networkStatus.isOnline) {
      return mutationFn()
    }
    
    // Store mutation for later execution
    const queuedMutations = JSON.parse(localStorage.getItem('queuedMutations') || '[]')
    queuedMutations.push({ key, timestamp: Date.now() })
    localStorage.setItem('queuedMutations', JSON.stringify(queuedMutations))
    
    return Promise.resolve({ queued: true })
  }

  const processQueuedMutations = async () => {
    if (!networkStatus.isOnline) return
    
    const queuedMutations = JSON.parse(localStorage.getItem('queuedMutations') || '[]')
    
    for (const mutation of queuedMutations) {
      try {
        // Process queued mutations here
        // This would need to be implemented based on your specific mutation types
        console.log('Processing queued mutation:', mutation)
      } catch (error) {
        console.error('Failed to process queued mutation:', error)
      }
    }
    
    // Clear processed mutations
    localStorage.removeItem('queuedMutations')
  }

  useEffect(() => {
    if (networkStatus.isOnline) {
      processQueuedMutations()
    }
  }, [networkStatus.isOnline])

  return {
    queueMutation,
    processQueuedMutations,
    hasQueuedMutations: JSON.parse(localStorage.getItem('queuedMutations') || '[]').length > 0
  }
}

