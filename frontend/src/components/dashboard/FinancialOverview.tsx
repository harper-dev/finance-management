import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TrendChart from '@/components/charts/TrendChart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCurrency, formatPercentage, calculatePercentageChange } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface FinancialOverviewProps {
  data: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netIncome: number;
    budgetAllocated: number;
    budgetSpent: number;
    savingsTarget: number;
    currentSavings: number;
    trends: {
      month: string;
      income: number;
      expenses: number;
      net: number;
    }[];
    accounts: {
      total: number;
      active: number;
    };
    budgets: {
      total: number;
      overBudget: number;
    };
    goals: {
      total: number;
      completed: number;
    };
  };
  currency: string;
  previousMonth?: {
    income: number;
    expenses: number;
    net: number;
  };
}

export function FinancialOverview({ data, currency, previousMonth }: FinancialOverviewProps) {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;
  
  // Calculate changes from previous month
  const incomeChange = previousMonth ? calculatePercentageChange(data.monthlyIncome, previousMonth.income) : 0;
  const expenseChange = previousMonth ? calculatePercentageChange(data.monthlyExpenses, previousMonth.expenses) : 0;
  const netChange = previousMonth ? calculatePercentageChange(data.netIncome, previousMonth.net) : 0;
  
  // Budget utilization
  const budgetUtilization = data.budgetAllocated > 0 ? (data.budgetSpent / data.budgetAllocated) * 100 : 0;
  
  // Savings rate
  const savingsRate = data.monthlyIncome > 0 ? ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100 : 0;
  
  // Savings progress
  const savingsProgress = data.savingsTarget > 0 ? (data.currentSavings / data.savingsTarget) * 100 : 0;

  // Prepare trend chart data
  const trendLines = [
    { dataKey: 'income', name: 'Income', color: '#10b981' },
    { dataKey: 'expenses', name: 'Expenses', color: '#ef4444' },
    { dataKey: 'net', name: 'Net Income', color: '#3b82f6' }
  ];

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.totalBalance, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {data.accounts.active} active accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.monthlyIncome, currency)}
            </div>
            {previousMonth && (
              <p className={`text-xs flex items-center gap-1 ${getChangeColor(incomeChange)}`}>
                {getChangeIcon(incomeChange)}
                {formatPercentage(Math.abs(incomeChange))} vs last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.monthlyExpenses, currency)}
            </div>
            {previousMonth && (
              <p className={`text-xs flex items-center gap-1 ${getChangeColor(-expenseChange)}`}>
                {getChangeIcon(-expenseChange)}
                {formatPercentage(Math.abs(expenseChange))} vs last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <BarChart3 className={`h-4 w-4 ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              Savings rate: {formatPercentage(savingsRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Budget Overview
              </span>
              <Badge variant={budgetUtilization > 100 ? 'destructive' : budgetUtilization > 80 ? 'default' : 'secondary'}>
                {formatPercentage(budgetUtilization)} used
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span>{formatPercentage(budgetUtilization)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetUtilization > 100 ? 'bg-red-600' : 
                    budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currencySymbol}{(data.budgetSpent || 0).toLocaleString()}</span>
                <span>{currencySymbol}{(data.budgetAllocated || 0).toLocaleString()}</span>
              </div>
            </div>
            
            {data.budgets.overBudget > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{data.budgets.overBudget} budget{data.budgets.overBudget !== 1 ? 's' : ''} over limit</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/budgets">
                  <Target className="h-3 w-3 mr-1" />
                  Manage Budgets
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/budgets/new">
                  Create Budget
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Savings Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Savings Goals
              </span>
              <Badge variant={savingsProgress >= 100 ? 'default' : 'secondary'}>
                {data.goals.completed} of {data.goals.total} completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{formatPercentage(savingsProgress)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currencySymbol}{(data.currentSavings || 0).toLocaleString()}</span>
                <span>{currencySymbol}{(data.savingsTarget || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/savings-goals">
                  <PiggyBank className="h-3 w-3 mr-1" />
                  View Goals
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link to="/savings-goals/new">
                  Create Goal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {data.trends && data.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Financial Trends
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/analytics">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  View Analytics
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data.trends}
              lines={trendLines}
              xAxisKey="month"
              currency={currency}
              height={350}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}