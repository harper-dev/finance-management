import { Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Budget } from '@/types/api'
import { cn } from '@/lib/utils'

interface BudgetCardProps {
  budget: Budget
  onClick?: () => void
}

export default function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const spent = budget.spent || 0
  const remaining = budget.remaining || 0
  const percentageUsed = budget.percentage_used || 0
  const isOverBudget = budget.is_over_budget || false

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600 bg-red-100'
    if (percentageUsed > 80) return 'text-orange-600 bg-orange-100'
    if (percentageUsed > 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getStatusIcon = () => {
    if (isOverBudget) return AlertTriangle
    if (percentageUsed > 80) return Target
    return CheckCircle
  }

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500'
    if (percentageUsed > 80) return 'bg-orange-500'
    if (percentageUsed > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const StatusIcon = getStatusIcon()
  const statusColor = getStatusColor()
  const progressColor = getProgressColor()

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate">{budget.name}</CardTitle>
        <div className={cn("p-2 rounded-full", statusColor)}>
          <StatusIcon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget amounts */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className={cn("font-medium", isOverBudget ? "text-red-600" : "")}>
              {formatCurrency(spent, budget.currency || 'SGD')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">
              {formatCurrency(budget.amount, budget.currency || 'SGD')}
            </span>
          </div>
          {!isOverBudget && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-green-600">
                {formatCurrency(remaining, budget.currency || 'SGD')}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground capitalize">{budget.category}</span>
            <span className={cn(
              "text-xs font-medium",
              isOverBudget ? "text-red-600" : ""
            )}>
              {formatPercentage(Math.min(percentageUsed, 100))}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all duration-300", progressColor)}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Period info */}
        <div className="text-xs text-muted-foreground">
          Period: {budget.period} • {budget.start_date} 
          {budget.end_date && ` - ${budget.end_date}`}
        </div>
      </CardContent>
    </Card>
  )
}