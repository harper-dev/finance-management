import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/services/api'
import type { UserProfile } from '@/types/api'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true })
          
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            set({ isInitialized: true, isLoading: false })
            return
          }

          if (session) {
            set({ session, user: session.user })
            
            // Get user profile
            try {
              const { profile } = await apiClient.getMe()
              set({ profile })
            } catch (profileError) {
              console.error('Error getting profile:', profileError)
            }
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session)
            
            if (session) {
              set({ session, user: session.user })
              
              // Get profile for new session
              try {
                const { profile } = await apiClient.getMe()
                set({ profile })
              } catch (profileError) {
                console.error('Error getting profile after auth change:', profileError)
              }
            } else {
              set({ session: null, user: null, profile: null })
            }
          })

          set({ isInitialized: true, isLoading: false })
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ isInitialized: true, isLoading: false })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }

          // Profile will be loaded by onAuthStateChange
          set({ isLoading: false })
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred' }
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ isLoading: true })
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`
            }
          })

          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }

          // Don't set loading to false here as we're redirecting
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred' }
        }
      },

      signUp: async (email: string, password: string, userData?: Partial<UserProfile>) => {
        try {
          set({ isLoading: true })
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData
            }
          })

          if (error) {
            set({ isLoading: false })
            return { error: error.message }
          }

          // If user is confirmed immediately, create profile
          if (data.user && !data.user.email_confirmed_at) {
            set({ isLoading: false })
            return {}
          }

          // Create profile
          if (userData) {
            try {
              const { profile, workspace } = await apiClient.createProfile(userData)
              set({ profile })
            } catch (profileError) {
              console.error('Error creating profile:', profileError)
            }
          }

          set({ isLoading: false })
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: 'An unexpected error occurred' }
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })
          await supabase.auth.signOut()
          set({ 
            user: null, 
            session: null, 
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
          
          const updatedProfile = await apiClient.updateProfile(data)
          set({ profile: updatedProfile, isLoading: false })
          
          return {}
        } catch (error) {
          set({ isLoading: false })
          return { error: 'Failed to update profile' }
        }
      }
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        user: state.user,
        profile: state.profile
      })
    }
  )
)