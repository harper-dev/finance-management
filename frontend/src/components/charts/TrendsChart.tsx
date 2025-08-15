import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendsChartData {
  month: string
  month_name: string
  income: number
  expenses: number
  net: number
}

interface TrendsChartProps {
  data: TrendsChartData[]
  currency?: string
  height?: number
  loading?: boolean
  error?: string | null
}

export default function TrendsChart({ 
  data, 
  currency = 'USD',
  height = 400,
  loading = false,
  error = null
}: TrendsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Trends
          </CardTitle>
          <CardDescription>
            Income vs expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
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
            <TrendingUp className="h-5 w-5" />
            Financial Trends
          </CardTitle>
          <CardDescription>
            Income vs expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-1">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Trends
          </CardTitle>
          <CardDescription>
            Income vs expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-gray-500">
            <div className="text-center">
              <p className="text-sm">No trend data available</p>
              <p className="text-xs mt-1">Add some transactions to see your financial trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate trend indicators
  const latestMonth = data[data.length - 1]
  const previousMonth = data.length > 1 ? data[data.length - 2] : null
  
  const incomeTrend = previousMonth 
    ? ((latestMonth.income - previousMonth.income) / previousMonth.income) * 100
    : 0
  
  const expensesTrend = previousMonth 
    ? ((latestMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
    : 0

  const netTrend = previousMonth 
    ? ((latestMonth.net - previousMonth.net) / (Math.abs(previousMonth.net) || 1)) * 100
    : 0

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-400'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Trends
        </CardTitle>
        <CardDescription>
          Income vs expenses over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Income Trend</div>
            <div className={`flex items-center justify-center gap-1 text-sm font-medium ${getTrendColor(incomeTrend)}`}>
              {getTrendIcon(incomeTrend)}
              {Math.abs(incomeTrend).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Expense Trend</div>
            <div className={`flex items-center justify-center gap-1 text-sm font-medium ${getTrendColor(-expensesTrend)}`}>
              {getTrendIcon(-expensesTrend)}
              {Math.abs(expensesTrend).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Net Trend</div>
            <div className={`flex items-center justify-center gap-1 text-sm font-medium ${getTrendColor(netTrend)}`}>
              {getTrendIcon(netTrend)}
              {Math.abs(netTrend).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month_name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, currency, true)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                formatter={(value: any, name: string) => [
                  formatCurrency(value, currency), 
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                ]}
                labelStyle={{ color: '#1f2937', fontWeight: 500 }}
                itemStyle={{ color: '#6b7280' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="line"
              />
              
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                connectNulls={false}
              />
              
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="Expenses"
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                connectNulls={false}
              />
              
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Net"
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}