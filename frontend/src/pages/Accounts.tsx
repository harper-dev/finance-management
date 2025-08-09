import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useAccounts } from '@/hooks/useApi'
import Layout from '@/components/layout/Layout'
import AccountCard from '@/components/features/AccountCard'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'

export default function Accounts() {
  const navigate = useNavigate()
  const { currentWorkspace } = useWorkspaceStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: accounts = [], isLoading } = useAccounts(currentWorkspace?.id, currentPage, 20)

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">No workspace selected</h2>
            <p className="text-muted-foreground">Please select a workspace to view accounts.</p>
          </div>
        </div>
      </Layout>
    )
  }
  
  // Filter accounts based on search term and type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || account.type === filterType
    return matchesSearch && matchesType
  })

  // Calculate total balance by type
  const balanceByType = accounts.reduce((acc: Record<string, number>, account: any) => {
    if (!acc[account.type]) {
      acc[account.type] = 0
    }
    acc[account.type] += account.balance
    return acc
  }, {} as Record<string, number>)

  const totalBalance = Object.values(balanceByType).reduce((sum: number, balance: number) => sum + balance, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
            <p className="text-muted-foreground">
              Manage your financial accounts in {currentWorkspace.name}
            </p>
          </div>
          <Button asChild>
            <Link to="/accounts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalBalance, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">All accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash & Bank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  (balanceByType.cash || 0) + (balanceByType.bank || 0),
                  currentWorkspace.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">Liquid assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  (balanceByType.investment || 0) + (balanceByType.asset || 0),
                  currentWorkspace.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">Long-term assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  -(Math.abs(balanceByType.debt || 0)),
                  currentWorkspace.currency
                )}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding debts</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Accounts Grid */}
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : filteredAccounts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAccounts.map((account: any) => (
                  <AccountCard 
                    key={account.id} 
                    account={account}
                    onClick={() => {
                      navigate(`/accounts/${account.id}`)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm || filterType !== 'all' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No accounts match your filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterType('all')
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No accounts found</p>
                    <Button asChild>
                      <Link to="/accounts/new">Create your first account</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination - Temporarily disabled until pagination is implemented */}
            {false && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing accounts
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={false}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}