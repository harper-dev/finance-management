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
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  transactions: number
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