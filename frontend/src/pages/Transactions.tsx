import { useState } from 'react'
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useTransactions, useAccounts } from '@/hooks/useApi'
import { Layout } from '@/components/layout/Layout'
import TransactionItem from '@/components/features/TransactionItem'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'

export default function Transactions() {
  const { currentWorkspace } = useWorkspaceStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState('month') // month, quarter, year, all

  const { data: transactionsData, isLoading } = useTransactions(
    currentWorkspace?.id, 
    { 
      page: currentPage, 
      limit: 20,
      type: filterType !== 'all' ? filterType : undefined,
      account_id: filterAccount !== 'all' ? filterAccount : undefined,
      category: filterCategory !== 'all' ? filterCategory : undefined,
    }
  )

  const { data: accountsData } = useAccounts(currentWorkspace?.id, 1, 100)

  // Debug logging
  console.log('Transactions page render:', {
    currentWorkspace: currentWorkspace?.id,
    transactionsData,
    transactionsCount: transactionsData?.data?.length || 0,
    pagination: (transactionsData as any)?.pagination,
    filterType,
    filterAccount,
    filterCategory
  });

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">No workspace selected</h2>
            <p className="text-muted-foreground">Please select a workspace to view transactions.</p>
          </div>
        </div>
      </Layout>
    )
  }

  const transactions = transactionsData?.data || []
  const accounts = (accountsData as any)?.data || []
  
  // Get unique categories
  const categories = Array.from(new Set(
    transactions
      .map(t => t.category)
      .filter(Boolean)
  )) as string[]

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accounts?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Calculate summary stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netAmount = totalIncome - totalExpenses

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Track your financial transactions in {currentWorkspace.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link to="/transactions/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netAmount, currentWorkspace.currency)}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filterAccount} onValueChange={setFilterAccount}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction}
                    onClick={() => {
                      // Navigate to transaction details
                      console.log('Navigate to transaction:', transaction.id)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm || filterType !== 'all' || filterAccount !== 'all' || filterCategory !== 'all' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No transactions match your filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setFilterType('all')
                        setFilterAccount('all')
                        setFilterCategory('all')
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No transactions found</p>
                    <Button asChild>
                      <Link to="/transactions/new">Add your first transaction</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {transactionsData && (transactionsData as any).pagination?.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, (transactionsData as any).pagination.total)} of {(transactionsData as any).pagination.total} transactions
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
                    disabled={currentPage >= (transactionsData as any).pagination.pages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, (transactionsData as any).pagination.pages))}
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