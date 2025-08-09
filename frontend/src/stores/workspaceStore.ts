import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '@/services/api'
import type { Workspace } from '@/types/api'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
  
  // Actions
  loadWorkspaces: () => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
  createWorkspace: (data: any) => Promise<Workspace>
  updateWorkspace: (id: string, data: any) => Promise<Workspace>
  deleteWorkspace: (id: string) => Promise<void>
  inviteMember: (workspaceId: string, email: string, role: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,

      loadWorkspaces: async () => {
        try {
          set({ isLoading: true })
          const workspaces = await apiClient.getWorkspaces()
          
          // Set first workspace as current if none selected
          const { currentWorkspace } = get()
          const newCurrentWorkspace = currentWorkspace 
            ? workspaces.find(w => w.id === currentWorkspace.id) || workspaces[0]
            : workspaces[0]
          
          set({ 
            workspaces, 
            currentWorkspace: newCurrentWorkspace,
            isLoading: false 
          })
        } catch (error) {
          console.error('Error loading workspaces:', error)
          set({ isLoading: false })
        }
      },

      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace })
      },

      createWorkspace: async (data) => {
        try {
          set({ isLoading: true })
          const newWorkspace = await apiClient.createWorkspace(data)
          
          const { workspaces } = get()
          const updatedWorkspaces = [...workspaces, newWorkspace]
          
          set({ 
            workspaces: updatedWorkspaces,
            currentWorkspace: newWorkspace,
            isLoading: false 
          })
          
          return newWorkspace
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateWorkspace: async (id: string, data) => {
        try {
          set({ isLoading: true })
          const updatedWorkspace = await apiClient.updateWorkspace(id, data)
          
          const { workspaces, currentWorkspace } = get()
          const updatedWorkspaces = workspaces.map(w => 
            w.id === id ? updatedWorkspace : w
          )
          
          set({ 
            workspaces: updatedWorkspaces,
            currentWorkspace: currentWorkspace?.id === id ? updatedWorkspace : currentWorkspace,
            isLoading: false 
          })
          
          return updatedWorkspace
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      deleteWorkspace: async (id: string) => {
        try {
          set({ isLoading: true })
          await apiClient.deleteWorkspace(id)
          
          const { workspaces, currentWorkspace } = get()
          const updatedWorkspaces = workspaces.filter(w => w.id !== id)
          
          // If deleted workspace was current, switch to first available
          const newCurrentWorkspace = currentWorkspace?.id === id 
            ? updatedWorkspaces[0] || null
            : currentWorkspace
          
          set({ 
            workspaces: updatedWorkspaces,
            currentWorkspace: newCurrentWorkspace,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      inviteMember: async (workspaceId: string, email: string, role: string) => {
        try {
          await apiClient.inviteToWorkspace(workspaceId, email, role)
          // Optionally reload workspace to get updated members list
        } catch (error) {
          throw error
        }
      }
    }),
    {
      name: 'workspace-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace
      })
    }
  )
)