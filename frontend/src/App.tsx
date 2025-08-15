import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ErrorBoundary, QueryErrorBoundary } from '@/components/error'
import { NetworkStatusIndicator } from '@/components/ui/network-status-indicator'
import { errorReportingService } from '@/services/errorReporting'
import { NetworkError, ValidationError, AuthenticationError, AuthorizationError, OfflineError, TimeoutError } from '@/services/api'
import { testApiConnection, testCors } from '@/test-connection'
import { apiClient } from '@/services/api'
import '@/lib/i18n'

// Auth Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AuthRedirect from '@/components/auth/AuthRedirect'

// Pages
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import Accounts from '@/pages/Accounts'
import Transactions from '@/pages/Transactions'
import NewAccount from '@/pages/NewAccount'
import NewTransaction from '@/pages/NewTransaction'
import Budgets from '@/pages/Budgets'
import NewBudget from '@/pages/NewBudget'
import SavingsGoals from '@/pages/SavingsGoals'
import NewSavingsGoal from '@/pages/NewSavingsGoal'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import NewWorkspace from '@/pages/NewWorkspace'
import AccountDetail from '@/pages/AccountDetail'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import TeamManagement from '@/pages/TeamManagement'

// Public Pages
import Landing from '@/pages/Landing'
import NotFound from '@/pages/NotFound'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Help from '@/pages/Help'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'

// Enhanced QueryClient with comprehensive error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication/authorization errors
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return false
        }
        
        // Don't retry on validation errors
        if (error instanceof ValidationError) {
          return false
        }
        
        // Retry up to 3 times for network errors, timeouts, and server errors
        if (error instanceof NetworkError || error instanceof TimeoutError || error instanceof OfflineError) {
          return failureCount < 3
        }
        
        // Default: retry once for other errors
        return failureCount < 1
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        // Global error handling for queries
        console.error('Query error:', error)
        
        // Report errors to monitoring service
        if (error instanceof Error) {
          errorReportingService.reportCustomError(
            `Query Error: ${error.message}`,
            'medium',
            {
              errorType: error.constructor.name,
              stack: error.stack
            }
          )
        }
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors (4xx)
        if (error instanceof ValidationError || 
            error instanceof AuthenticationError || 
            error instanceof AuthorizationError) {
          return false
        }
        
        // Retry mutations only for network/server errors
        if (error instanceof NetworkError || error instanceof TimeoutError) {
          return failureCount < 2 // Fewer retries for mutations
        }
        
        return false
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      onError: (error) => {
        // Global error handling for mutations
        console.error('Mutation error:', error)
        
        // Report errors to monitoring service
        if (error instanceof Error) {
          errorReportingService.reportCustomError(
            `Mutation Error: ${error.message}`,
            'high',
            {
              errorType: error.constructor.name,
              stack: error.stack
            }
          )
        }
      }
    }
  }
})

function App() {
  const { initialize, isInitialized, user } = useAuthStore()
  const { loadWorkspaces } = useWorkspaceStore()

  useEffect(() => {
    initialize()
    
    // Add test functions to global window for debugging
    if (process.env.NODE_ENV === 'development') {
      (window as any).testApiConnection = testApiConnection
      ;(window as any).testCors = testCors
      ;(window as any).testApiClient = () => apiClient.testConnection()
      ;(window as any).apiClient = apiClient
      ;(window as any).checkAuthStatus = () => {
        const token = localStorage.getItem('auth_token')
        const refreshToken = localStorage.getItem('refresh_token')
        return {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          token: token ? `${token.substring(0, 20)}...` : null,
          refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null
        }
      }
      console.log('Test functions added to window: testApiConnection, testCors, testApiClient, apiClient, checkAuthStatus')
    }
  }, []) // Remove initialize from dependencies to prevent re-initialization

  useEffect(() => {
    if (isInitialized && user) {
      // Only load workspaces if user is authenticated AND token is available
      const token = localStorage.getItem('auth_token')
      if (token) {
        loadWorkspaces()
        // Set user context for error reporting
        errorReportingService.setUserContext(user.id)
      } else {
        console.warn('User authenticated but no token found, skipping workspace load')
      }
    } else {
      // Clear user context on logout
      errorReportingService.clearUserContext()
    }
  }, [isInitialized, user]) // Remove loadWorkspaces from dependencies

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorReportingService.reportError(error, errorInfo, 'App', 'critical')
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <QueryClientProvider client={queryClient}>
        <QueryErrorBoundary>
          <LanguageProvider>
            <NetworkStatusIndicator />
            <Router>
          <div className="App">
          <Routes>
            {/* Public marketing pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Auth routes */}
            <Route path="/login" element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } />
            
            <Route path="/signup" element={
              <AuthRedirect>
                <Signup />
              </AuthRedirect>
            } />
            
            <Route path="/forgot-password" element={
              <AuthRedirect>
                <ForgotPassword />
              </AuthRedirect>
            } />
            
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/accounts" element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            } />

            <Route path="/accounts/:id" element={
              <ProtectedRoute>
                <AccountDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />

            {/* Budget routes */}
            <Route path="/budgets" element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            } />
            
            <Route path="/budgets/new" element={
              <ProtectedRoute>
                <NewBudget />
              </ProtectedRoute>
            } />
            
            {/* Savings Goals routes */}
            <Route path="/savings-goals" element={
              <ProtectedRoute>
                <SavingsGoals />
              </ProtectedRoute>
            } />
            
            <Route path="/savings-goals/new" element={
              <ProtectedRoute>
                <NewSavingsGoal />
              </ProtectedRoute>
            } />
            
            {/* Legacy route redirect */}
            <Route path="/goals" element={<Navigate to="/savings-goals" replace />} />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/team" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } />

            {/* New item routes */}
            <Route path="/accounts/new" element={
              <ProtectedRoute>
                <NewAccount />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions/new" element={
              <ProtectedRoute>
                <NewTransaction />
              </ProtectedRoute>
            } />

            <Route path="/workspaces/new" element={
              <ProtectedRoute>
                <NewWorkspace />
              </ProtectedRoute>
            } />
            

            {/* App redirect */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
            </Router>
          </LanguageProvider>
        </QueryErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App