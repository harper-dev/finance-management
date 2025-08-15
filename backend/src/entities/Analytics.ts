export interface WorkspaceOverview {
  total_balance: number
  total_income: number
  total_expenses: number
  net_worth: number
  accounts_count: number
  active_budgets_count: number
  active_savings_goals_count: number
}

export interface SpendingAnalysis {
  category: string
  amount: number
  percentage: number
  transaction_count: number
}

export interface IncomeAnalysis {
  category: string
  amount: number
  percentage: number
  transaction_count: number
}

export interface FinancialTrend {
  period: string
  income: number
  expenses: number
  net: number
  balance: number
  growth_rate?: number
  category_breakdown?: CategoryBreakdown[]
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  change_from_previous: number
}

export interface CashFlowData {
  monthly_average: number
  trend_direction: 'up' | 'down' | 'stable'
  volatility_score: number
  predictions: MonthlyPrediction[]
}

export interface MonthlyPrediction {
  period: string
  predicted_income: number
  predicted_expenses: number
  predicted_net: number
  confidence: number
}

export interface SpendingPattern {
  category: string
  monthly_average: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality_score: number
  recent_change_percentage: number
}

export interface AccountSummary {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export interface BudgetSummary {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  remaining: number
  percentage_used: number
}

export interface SavingsGoalSummary {
  id: string
  name: string
  target_amount: number
  current_amount: number
  progress_percentage: number
  target_date?: Date
}