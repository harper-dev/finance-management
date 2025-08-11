export interface WorkspaceOverviewDto {
  overview: {
    total_balance: number
    total_income: number
    total_expenses: number
    net_worth: number
    accounts_count: number
    active_budgets_count: number
    active_savings_goals_count: number
  }
  accounts: AccountSummaryDto[]
  monthly_summary: {
    income: number
    expenses: number
    net: number
  }
  active_budgets: BudgetSummaryDto[]
  active_savings_goals: AnalyticsSavingsGoalSummaryDto[]
}

export interface AccountSummaryDto {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export interface BudgetSummaryDto {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  remaining: number
  percentage_used: number
}

export interface AnalyticsSavingsGoalSummaryDto {
  id: string
  name: string
  target_amount: number
  current_amount: number
  progress_percentage: number
  target_date?: string
}

export interface SpendingAnalysisDto {
  category: string
  amount: number
  percentage: number
  transaction_count: number
}

export interface IncomeAnalysisDto {
  category: string
  amount: number
  percentage: number
  transaction_count: number
}

export interface FinancialTrendDto {
  period: string
  income: number
  expenses: number
  net: number
  balance: number
}

export interface AnalyticsQueryDto {
  period?: 'month' | 'quarter' | 'year'
  months?: number
}