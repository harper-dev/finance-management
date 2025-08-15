import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  PieChart as PieChartIcon,
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  Calendar,
  Minus
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CategoryPattern {
  category: string
  amount: number
  percentage: number
  change_from_previous: number
  transaction_count: number
  average_per_transaction: number
  trend: 'up' | 'down' | 'stable'
}

interface SpendingPatternsProps {
  patterns: CategoryPattern[]
  currency?: string
  loading?: boolean
  error?: string | null
  period?: string
}

const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
]

export default function SpendingPatterns({ 
  patterns, 
  currency = 'USD',
  loading = false,
  error = null,
  period = 'this month'
}: SpendingPatternsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Spending Patterns
          </CardTitle>
          <CardDescription>
            Category breakdown and trends for {period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Spending Patterns
          </CardTitle>
          <CardDescription>
            Category breakdown and trends for {period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!patterns || patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Spending Patterns
          </CardTitle>
          <CardDescription>
            Category breakdown and trends for {period}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <p className="text-sm">No spending data available</p>
              <p className="text-xs mt-1">Add some expense transactions to see your spending patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="h-3 w-3 text-red-600" />
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="h-3 w-3 text-green-600" />
    }
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return 'text-red-600'
    } else if (trend === 'down' || change < 0) {
      return 'text-green-600'
    }
    return 'text-gray-400'
  }

  const getTrendBadge = (trend: string, change: number) => {
    if (Math.abs(change) < 5) {
      return <Badge variant="secondary">Stable</Badge>
    } else if (change > 0) {
      return <Badge variant="destructive">+{change.toFixed(1)}%</Badge>
    } else {
      return <Badge variant="default">{change.toFixed(1)}%</Badge>
    }
  }

  // Prepare data for pie chart
  const chartData = patterns.map((pattern, index) => ({
    ...pattern,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  // Calculate totals
  const totalAmount = patterns.reduce((sum, pattern) => sum + pattern.amount, 0)
  const totalTransactions = patterns.reduce((sum, pattern) => sum + pattern.transaction_count, 0)

  // Find top categories
  const topCategory = patterns[0]
  const mostFrequent = patterns.reduce((prev, current) => 
    current.transaction_count > prev.transaction_count ? current : prev
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Spending Patterns
        </CardTitle>
        <CardDescription>
          Category breakdown and trends for {period}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount, currency, true)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {patterns.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalTransactions}
            </div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: any, name: any, props: any) => [
                  formatCurrency(value, currency),
                  props.payload.category,
                  `${props.payload.percentage.toFixed(1)}%`
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Category Breakdown</h4>
          <div className="space-y-2">
            {patterns.map((pattern, index) => (
              <div key={pattern.category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <div>
                    <div className="font-medium">{pattern.category}</div>
                    <div className="text-sm text-gray-600">
                      {pattern.transaction_count} transactions • 
                      Avg {formatCurrency(pattern.average_per_transaction, currency)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(pattern.amount, currency)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {pattern.percentage.toFixed(1)}%
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(pattern.trend, pattern.change_from_previous)}
                      {getTrendBadge(pattern.trend, pattern.change_from_previous)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Pattern Insights</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• <strong>{topCategory.category}</strong> is your largest expense category at {topCategory.percentage.toFixed(1)}%</p>
            <p>• <strong>{mostFrequent.category}</strong> has the most transactions ({mostFrequent.transaction_count})</p>
            <p>• Average transaction size: {formatCurrency(totalAmount / totalTransactions, currency)}</p>
            
            {/* Trend insights */}
            {patterns.some(p => p.change_from_previous > 20) && (
              <p>• ⚠️ Some categories show significant increases from last period</p>
            )}
            {patterns.some(p => p.change_from_previous < -20) && (
              <p>• ✅ You've reduced spending in some categories compared to last period</p>
            )}
            
            {/* Concentration insight */}
            {topCategory.percentage > 40 && (
              <p>• 💡 Consider diversifying expenses - {topCategory.category} dominates your spending</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}