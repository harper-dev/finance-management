import React from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

/**
 * Component for displaying network status
 */
export function NetworkStatusIndicator() {
  const networkStatus = useNetworkStatus()
  
  if (networkStatus.isOnline && networkStatus.isConnected) {
    return null // Don't show anything when everything is working
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-2 text-center text-sm">
      {!networkStatus.isOnline ? (
        'You are offline. Changes will be saved when connection is restored.'
      ) : !networkStatus.isConnected ? (
        'Unable to connect to server. Some features may not work.'
      ) : null}
    </div>
  )
}