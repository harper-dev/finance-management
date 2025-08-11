import { create } from 'zustand'
import { authService } from '@/services/auth'
import type { UserProfile } from '@/types/api'

interface AuthState {
  user: any | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData?: { display_name?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      user: null,
      profile: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true })
          
          // Check if user has a stored token
          if (authService.isAuthenticated()) {
            try {
              const { user, profile } = await authService.getMe()
              set({ user, profile })
            } catch (error) {
              console.error('Error getting user info:', error)
              // Token might be expired, clear it
              authService.logout()
            }
          }

          set({ isInitialized: true, isLoading: false })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ isInitialized: true, isLoading: false })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const result = await authService.login({ email, password })
          
          set({ 
            user: result.user, 
            profile: result.profile,
            isLoading: false 
          })
          
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: error instanceof Error ? error.message : 'Login failed' }
        }
      },

      signUp: async (email: string, password: string, userData?: { display_name?: string }) => {
        try {
          set({ isLoading: true })
          
          const result = await authService.register({ 
            email, 
            password, 
            display_name: userData?.display_name 
          })
          
          // Only set user if we have a session (user confirmed immediately)
          if (result.user) {
            set({ 
              user: result.user, 
              profile: result.profile,
              isLoading: false 
            })
          } else {
            set({ isLoading: false })
          }
          
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: error instanceof Error ? error.message : 'Registration failed' }
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })
          await authService.logout()
          
          set({ 
            user: null, 
            profile: null, 
            isLoading: false 
          })
        } catch (error) {
          console.error('Error signing out:', error)
          set({ isLoading: false })
        }
      },

      updateProfile: async (data: Partial<UserProfile>) => {
        try {
          set({ isLoading: true })
          
          // Note: This would need to be implemented via API
          // For now, just return an error
          set({ isLoading: false })
          return { error: 'Profile update not implemented yet' }
        } catch (error) {
          set({ isLoading: false })
          return { error: 'Failed to update profile' }
        }
      }
    }))