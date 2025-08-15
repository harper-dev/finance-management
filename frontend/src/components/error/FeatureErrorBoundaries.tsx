import React, { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertTriangle, TrendingUp, Settings, CreditCard, Target, PieChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FeatureErrorFallbackProps {
  error?: Error
  resetError?: () => void
  feature: string
  icon: ReactNode
  description: string
  actions?: ReactNode
}

/**
 * Generic feature error fallback component
 */
function FeatureErrorFallback({ 
  error, 
  resetError, 
  feature, 
  icon, 
  description,
  actions 
}: FeatureErrorFallbackProps) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          {icon}
          {feature} Error
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-3">
        {process.env.NODE_ENV === 'development' && error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded font-mono text-left">
            {error.message}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {resetError && (
            <Button onClick={resetError} size="sm">
              Try Again
            </Button>
          )}
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Analytics Error Boundary
 */
export function AnalyticsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Analytics"
      fallback={
        <FeatureErrorFallback
          feature="Analytics"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Unable to load analytics data. This might be due to insufficient data or a temporary issue."
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Data
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Settings Error Boundary
 */
export function SettingsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Settings"
      fallback={
        <FeatureErrorFallback
          feature="Settings"
          icon={<Settings className="w-5 h-5" />}
          description="Unable to load settings. Your preferences are safe and this is likely a temporary issue."
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Accounts Error Boundary
 */
export function AccountsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Accounts"
      fallback={
        <FeatureErrorFallback
          feature="Accounts"
          icon={<CreditCard className="w-5 h-5" />}
          description="Unable to load account information. Your data is safe and this is likely a temporary issue."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
                Dashboard
              </Button>
            </>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Budgets Error Boundary
 */
export function BudgetsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Budgets"
      fallback={
        <FeatureErrorFallback
          feature="Budgets"
          icon={<PieChart className="w-5 h-5" />}
          description="Unable to load budget information. Your budgets are safe and this is likely a temporary issue."
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Budgets
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Savings Goals Error Boundary
 */
export function SavingsGoalsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Savings Goals"
      fallback={
        <FeatureErrorFallback
          feature="Savings Goals"
          icon={<Target className="w-5 h-5" />}
          description="Unable to load savings goals. Your goals are safe and this is likely a temporary issue."
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Goals
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Transactions Error Boundary
 */
export function TransactionsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Transactions"
      fallback={
        <FeatureErrorFallback
          feature="Transactions"
          icon={<CreditCard className="w-5 h-5" />}
          description="Unable to load transaction data. Your transactions are safe and this is likely a temporary issue."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/transactions/new'}>
                Add Transaction
              </Button>
            </>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Dashboard Error Boundary
 */
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      feature="Dashboard"
      fallback={
        <FeatureErrorFallback
          feature="Dashboard"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Unable to load dashboard data. This might be due to a temporary issue or network problem."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/accounts'}>
                View Accounts
              </Button>
            </>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Form Error Boundary - for forms that might have validation or submission errors
 */
export function FormErrorBoundary({ children, formName }: { children: ReactNode; formName: string }) {
  return (
    <ErrorBoundary
      feature={`${formName} Form`}
      fallback={
        <FeatureErrorFallback
          feature={formName}
          icon={<AlertTriangle className="w-5 h-5" />}
          description="There was an issue with the form. Please try refreshing the page or contact support if the problem persists."
          actions={
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Form
            </Button>
          }
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}