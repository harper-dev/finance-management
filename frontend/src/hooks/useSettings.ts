import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEnhancedQuery, useEnhancedMutation } from '@/hooks/useEnhancedQuery'
import { apiClient } from '@/services/api'
import type { UserSettings, UpdateUserSettingsData, UpdateWorkspaceSettingsData, Workspace } from '@/types/api'

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  user: () => [...settingsKeys.all, 'user'] as const,
}

// User Settings Hooks
export function useUserSettings() {
  return useEnhancedQuery({
    queryKey: settingsKeys.user(),
    queryFn: () => apiClient.getUserSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    errorToastTitle: 'Failed to load settings',
    showErrorToast: false // Let the component handle error display
  })
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient()

  return useEnhancedMutation({
    mutationFn: (data: UpdateUserSettingsData) => apiClient.updateUserSettings(data),
    showSuccessToast: true,
    successToastTitle: 'Settings Updated',
    successToastDescription: 'Your settings have been saved successfully.',
    errorToastTitle: 'Failed to update settings',
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.user() })

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(settingsKeys.user())

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.user(), {
          ...previousSettings,
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
      }

      // Return a context object with the snapshotted value
      return { previousSettings }
    },
    onError: (err, newSettings, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.user(), context.previousSettings)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: settingsKeys.user() })
    },
  })
}

// Workspace Settings Hooks
export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient()

  return useEnhancedMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceSettingsData }) =>
      apiClient.updateWorkspaceSettings(workspaceId, data),
    showSuccessToast: true,
    successToastTitle: 'Workspace Updated',
    successToastDescription: 'Workspace settings have been saved successfully.',
    errorToastTitle: 'Failed to update workspace',
    onMutate: async ({ workspaceId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['workspaces'] })
      await queryClient.cancelQueries({ queryKey: ['workspace', workspaceId] })

      // Snapshot the previous values
      const previousWorkspaces = queryClient.getQueryData<Workspace[]>(['workspaces'])
      const previousWorkspace = queryClient.getQueryData<Workspace>(['workspace', workspaceId])

      // Optimistically update workspace in workspaces list
      if (previousWorkspaces) {
        queryClient.setQueryData<Workspace[]>(['workspaces'], 
          previousWorkspaces.map(ws => 
            ws.id === workspaceId 
              ? { ...ws, ...data, updated_at: new Date().toISOString() }
              : ws
          )
        )
      }

      // Optimistically update individual workspace
      if (previousWorkspace) {
        queryClient.setQueryData<Workspace>(['workspace', workspaceId], {
          ...previousWorkspace,
          ...data,
          updated_at: new Date().toISOString(),
        })
      }

      return { previousWorkspaces, previousWorkspace }
    },
    onError: (err, { workspaceId }, context) => {
      // Roll back optimistic updates
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(['workspaces'], context.previousWorkspaces)
      }
      if (context?.previousWorkspace) {
        queryClient.setQueryData(['workspace', workspaceId], context.previousWorkspace)
      }
    },
    onSettled: (data, error, { workspaceId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })
}

// Combined settings hook for easier usage
export function useSettings() {
  const userSettings = useUserSettings()
  const updateUserSettings = useUpdateUserSettings()
  const updateWorkspaceSettings = useUpdateWorkspaceSettings()

  return {
    // User settings
    userSettings: userSettings.data,
    isLoadingUserSettings: userSettings.isLoading,
    userSettingsError: userSettings.error,
    
    // Mutations
    updateUserSettings: updateUserSettings.mutate,
    updateUserSettingsAsync: updateUserSettings.mutateAsync,
    isUpdatingUserSettings: updateUserSettings.isPending,
    userSettingsUpdateError: updateUserSettings.error,
    
    updateWorkspaceSettings: updateWorkspaceSettings.mutate,
    updateWorkspaceSettingsAsync: updateWorkspaceSettings.mutateAsync,
    isUpdatingWorkspaceSettings: updateWorkspaceSettings.isPending,
    workspaceSettingsUpdateError: updateWorkspaceSettings.error,
    
    // Success states
    isUserSettingsUpdateSuccess: updateUserSettings.isSuccess,
    isWorkspaceSettingsUpdateSuccess: updateWorkspaceSettings.isSuccess,
  }
}