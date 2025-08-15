import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Minus
} from 'lucide-react'

interface CashFlowData {
  monthly_average: number
  trend_direction: 'up' | 'down' | 'stable'
  volatility_score: number
  predictions?: Array<{
    month: string
    predicted_net: number
    confidence: number
  }>
}

interface CashFlowSummaryProps {
  data: CashFlowData | null
  currency?: string
  loading?: boolean
  error?: string | null
}

export default function CashFlowSummary({ 
  data, 
  currency = 'USD',
  loading = false,
  error = null
}: CashFlowSummaryProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cash Flow Summary
          </CardTitle>
          <CardDescription>
            Analysis of your cash flow patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
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
            <Activity className="h-5 w-5" />
            Cash Flow Summary
          </CardTitle>
          <CardDescription>
            Analysis of your cash flow patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cash Flow Summary
          </CardTitle>
          <CardDescription>
            Analysis of your cash flow patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <p className="text-sm">No cash flow data available</p>
              <p className="text-xs mt-1">Add transactions to see your cash flow analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = () => {
    switch (data.trend_direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (data.trend_direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendBadgeVariant = () => {
    switch (data.trend_direction) {
      case 'up':
        return 'default' as const
      case 'down':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  const getVolatilityStatus = () => {
    if (data.volatility_score < 0.3) {
      return {
        label: 'Low Volatility',
        description: 'Your cash flow is stable and predictable',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        color: 'text-green-600'
      }
    } else if (data.volatility_score < 0.7) {
      return {
        label: 'Moderate Volatility',
        description: 'Your cash flow has some variation',
        icon: <Activity className="h-4 w-4 text-yellow-600" />,
        color: 'text-yellow-600'
      }
    } else {
      return {
        label: 'High Volatility',
        description: 'Your cash flow is quite variable',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        color: 'text-red-600'
      }
    }
  }

  const volatilityStatus = getVolatilityStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Cash Flow Summary
        </CardTitle>
        <CardDescription>
          Analysis of your cash flow patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Average */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Monthly Average</div>
              <div className={`text-2xl font-bold ${data.monthly_average >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.monthly_average, currency)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant={getTrendBadgeVariant()}>
              {data.trend_direction === 'up' ? 'Improving' : 
               data.trend_direction === 'down' ? 'Declining' : 'Stable'}
            </Badge>
          </div>
        </div>

        {/* Volatility Analysis */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {volatilityStatus.icon}
              <span className={`font-medium ${volatilityStatus.color}`}>
                {volatilityStatus.label}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Score: {(data.volatility_score * 100).toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                data.volatility_score < 0.3 ? 'bg-green-500' :
                data.volatility_score < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(data.volatility_score * 100, 100)}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-600">
            {volatilityStatus.description}
          </p>
        </div>

        {/* Predictions (if available) */}
        {data.predictions && data.predictions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Upcoming Predictions</h4>
            <div className="space-y-2">
              {data.predictions.slice(0, 3).map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{prediction.month}</div>
                    <div className="text-xs text-gray-600">
                      {prediction.confidence}% confidence
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    prediction.predicted_net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(prediction.predicted_net, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Insights</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {data.monthly_average > 0 ? (
              <p>• You're maintaining a positive cash flow on average</p>
            ) : (
              <p>• Your expenses are exceeding income on average</p>
            )}
            
            {data.volatility_score < 0.3 ? (
              <p>• Your financial patterns are consistent and predictable</p>
            ) : data.volatility_score < 0.7 ? (
              <p>• Consider reviewing irregular expenses to improve stability</p>
            ) : (
              <p>• High variation suggests reviewing your budget and spending habits</p>
            )}
            
            {data.trend_direction === 'up' && (
              <p>• Your financial situation is trending positively</p>
            )}
            {data.trend_direction === 'down' && (
              <p>• Consider reviewing expenses to improve your cash flow</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}