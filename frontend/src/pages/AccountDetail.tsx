import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Search,
  Calendar,
  DollarSign,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { formatCurrency } from '@/lib/utils';
import TransactionItem from '@/components/features/TransactionItem';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Fetch account details
  const { data: account, isLoading: accountLoading, error: accountError } = useQuery({
    queryKey: ['account', id],
    queryFn: () => apiClient.getAccount(id!),
    enabled: !!id,
  });

  // Fetch account transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['account-transactions', id, currentWorkspace?.id],
    queryFn: () => {
      if (!currentWorkspace || !id) return Promise.resolve({ data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } });
      return apiClient.getTransactions(currentWorkspace.id, {
        account_id: id,
        page: 1,
        limit: 50
      });
    },
    enabled: !!id && !!currentWorkspace,
  });

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="p-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select a workspace to view account details.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (accountLoading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg mt-6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (accountError || !account) {
    return (
      <Layout>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load account details. The account may not exist or you may not have access to it.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/accounts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const transactions = transactionsData?.data || [];
  const currency = currentWorkspace.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;

  // Calculate account statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = transactions.length;

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'asset': return 'bg-yellow-100 text-yellow-800';
      case 'debt': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'bank': return <BarChart3 className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/accounts')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accounts
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/transactions/new?account_id=${account.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Link>
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Account
              </Button>
            </div>
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    {getAccountTypeIcon(account.type)}
                    {account.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Badge className={getAccountTypeColor(account.type)}>
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </Badge>
                    <span>•</span>
                    <span>{account.currency}</span>
                    <span>•</span>
                    <span className={account.is_active ? 'text-green-600' : 'text-red-600'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance, currency)}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome, currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {transactions.filter(t => t.type === 'income').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses, currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {transactions.filter(t => t.type === 'expense').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {transactionCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total recorded transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                All transactions for this account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="w-full md:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-48">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category!}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Transaction List */}
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => {
                        // Navigate to transaction details if needed
                        console.log('Transaction clicked:', transaction.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    {transactions.length === 0 
                      ? 'Start by adding your first transaction to this account.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                  {transactions.length === 0 && (
                    <Button asChild>
                      <Link to={`/transactions/new?account_id=${account.id}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Transaction
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}