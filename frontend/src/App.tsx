import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { LanguageProvider } from '@/contexts/LanguageContext'
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { initialize, isInitialized, user } = useAuthStore()
  const { loadWorkspaces } = useWorkspaceStore()

  useEffect(() => {
    initialize()
  }, []) // Remove initialize from dependencies to prevent re-initialization

  useEffect(() => {
    if (isInitialized && user) {
      // Only load workspaces if user is authenticated
      loadWorkspaces()
    }
  }, [isInitialized, user]) // Remove loadWorkspaces from dependencies

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
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
    </QueryClientProvider>
  )
}

export default App