import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useOverviewAnalytics, useAccounts, useTransactions } from '@/hooks/useApi'
import Layout from '@/components/layout/Layout'
import AccountCard from '@/components/features/AccountCard'
import TransactionItem from '@/components/features/TransactionItem'
import PieChart from '@/components/charts/PieChart'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { currentWorkspace } = useWorkspaceStore()
  
  const { data: analytics } = useOverviewAnalytics(currentWorkspace?.id)
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts(currentWorkspace?.id, 1, 6)
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(
    currentWorkspace?.id, 
    { limit: 5 }
  )

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">No workspace selected</h2>
            <p className="text-muted-foreground">Please create or select a workspace to continue.</p>
            <Button asChild>
              <Link to="/workspaces/new">Create Workspace</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const monthlyIncome = analytics?.monthly_summary.income || 0
  const monthlyExpenses = analytics?.monthly_summary.expenses || 0
  const netIncome = analytics?.monthly_summary.net || 0
  const totalAccounts = analytics?.accounts.total_count || 0

  // Prepare data for spending chart
  const spendingData = Object.entries(analytics?.accounts.balances_by_type || {}).map(([type, data]) => ({
    name: type,
    value: data.total,
    percentage: 0 // Will be calculated by the chart component
  }))

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back to {currentWorkspace.name}
            </p>
          </div>
          <Button asChild>
            <Link to="/transactions/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyIncome, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyExpenses, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAccounts}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Accounts Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Accounts</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/accounts">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : accounts.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {accounts.slice(0, 4).map((account: any) => (
                      <AccountCard 
                        key={account.id} 
                        account={account}
                        onClick={() => {/* Navigate to account details */}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No accounts found</p>
                    <Button className="mt-4" asChild>
                      <Link to="/accounts/new">Create Account</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/transactions">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : transactionsData?.data.length ? (
                  <div className="space-y-2">
                    {transactionsData.data.map((transaction) => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction}
                        onClick={() => {/* Navigate to transaction details */}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                    <Button className="mt-4" asChild>
                      <Link to="/transactions/new">Add Transaction</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Sidebar */}
          <div className="space-y-6">
            {/* Account Balance Distribution */}
            {spendingData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart 
                    data={spendingData}
                    dataKey="value"
                    currency={currentWorkspace.currency}
                    height={250}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
            )}

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget Used</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(analytics?.monthly_summary.budget_used_percentage || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(analytics?.monthly_summary.budget_used_percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Spent: {formatCurrency(monthlyExpenses, currentWorkspace.currency)}
                    </span>
                    <span className="text-muted-foreground">
                      Budget: {formatCurrency(analytics?.monthly_summary.budget_allocated || 0, currentWorkspace.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Savings Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">
                      {formatPercentage(analytics?.savings.progress_percentage || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(analytics?.savings.progress_percentage || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Saved: {formatCurrency(analytics?.savings.total_saved || 0, currentWorkspace.currency)}
                    </span>
                    <span className="text-muted-foreground">
                      Target: {formatCurrency(analytics?.savings.total_target || 0, currentWorkspace.currency)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/goals">Manage Goals</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}