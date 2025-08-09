import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { apiClient } from '@/services/api';

export default function Analytics() {
  const { currentWorkspace } = useWorkspaceStore();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Mock data since API endpoints may not exist yet
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', currentWorkspace?.id, selectedPeriod, selectedYear],
    queryFn: () => {
      if (!currentWorkspace) return Promise.resolve(null);
      
      // Mock analytics data
      return Promise.resolve({
        summary: {
          total_income: 15400,
          total_expenses: 12850,
          net_income: 2550,
          average_monthly_income: 3850,
          average_monthly_expenses: 3212.50,
          expense_growth: 5.2,
          income_growth: 8.7,
          savings_rate: 16.6
        },
        expense_categories: [
          { name: 'Food & Dining', amount: 3200, percentage: 24.9 },
          { name: 'Transportation', amount: 2100, percentage: 16.3 },
          { name: 'Bills & Utilities', amount: 1800, percentage: 14.0 },
          { name: 'Entertainment', amount: 1500, percentage: 11.7 },
          { name: 'Shopping', amount: 1200, percentage: 9.3 },
          { name: 'Healthcare', amount: 800, percentage: 6.2 },
          { name: 'Other', amount: 2250, percentage: 17.5 }
        ],
        monthly_trends: [
          { month: 'Jan', income: 3200, expenses: 2800, net: 400 },
          { month: 'Feb', income: 3400, expenses: 3100, net: 300 },
          { month: 'Mar', income: 3800, expenses: 3200, net: 600 },
          { month: 'Apr', income: 4000, expenses: 3750, net: 250 }
        ],
        budget_performance: {
          total_budgets: 8,
          over_budget: 2,
          under_budget: 4,
          on_track: 2,
          total_allocated: 4500,
          total_spent: 4120,
          utilization: 91.6
        },
        savings_goals: {
          total_goals: 3,
          completed: 1,
          on_track: 1,
          behind: 1,
          total_target: 25000,
          total_saved: 18500,
          progress: 74.0
        }
      });
    },
    enabled: !!currentWorkspace,
  });

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="p-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select a workspace to view analytics.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const data = analyticsData;
  const currency = currentWorkspace.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">
                Insights into your financial patterns and performance
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Time Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="w-full md:w-48">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly View</SelectItem>
                      <SelectItem value="quarterly">Quarterly View</SelectItem>
                      <SelectItem value="yearly">Yearly View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {currencySymbol}{formatAmount(data?.summary.total_income || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {data?.summary.income_growth}% vs last period
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
                  {currencySymbol}{formatAmount(data?.summary.total_expenses || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-red-600" />
                  {data?.summary.expense_growth}% vs last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {currencySymbol}{formatAmount(data?.summary.net_income || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly avg: {currencySymbol}{formatAmount((data?.summary.net_income || 0) / 4)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {data?.summary.savings_rate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of total income
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Expense Categories */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expense Categories
                  </CardTitle>
                  <CardDescription>
                    Breakdown of spending by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.expense_categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: `hsl(${index * 50}, 70%, 50%)` 
                            }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: `hsl(${index * 50}, 70%, 50%)`
                              }}
                            />
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="text-sm font-medium">
                              {currencySymbol}{formatAmount(category.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {category.percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="space-y-6">
              {/* Budget Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Budget Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {data?.budget_performance.under_budget}
                      </div>
                      <p className="text-xs text-muted-foreground">Under Budget</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {data?.budget_performance.over_budget}
                      </div>
                      <p className="text-xs text-muted-foreground">Over Budget</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span>{data?.budget_performance.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data?.budget_performance.utilization}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{currencySymbol}{formatAmount(data?.budget_performance.total_spent || 0)}</span>
                      <span>{currencySymbol}{formatAmount(data?.budget_performance.total_allocated || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {data?.savings_goals.completed}
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {data?.savings_goals.on_track}
                      </div>
                      <p className="text-xs text-muted-foreground">On Track</p>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {data?.savings_goals.behind}
                      </div>
                      <p className="text-xs text-muted-foreground">Behind</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{data?.savings_goals.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data?.savings_goals.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{currencySymbol}{formatAmount(data?.savings_goals.total_saved || 0)}</span>
                      <span>{currencySymbol}{formatAmount(data?.savings_goals.total_target || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Income vs expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.monthly_trends.map((month, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{month.month}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${(month.income / 5000) * 100}%` }}
                        />
                        <div
                          className="absolute left-0 top-0 h-full bg-red-500 opacity-70 transition-all duration-300"
                          style={{ width: `${(month.expenses / 5000) * 100}%` }}
                        />
                      </div>
                      <div className="text-right min-w-[100px] text-sm">
                        <div className="text-green-600 font-medium">
                          +{currencySymbol}{formatAmount(month.income)}
                        </div>
                        <div className="text-red-600">
                          -{currencySymbol}{formatAmount(month.expenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}