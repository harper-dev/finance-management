export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'

export interface Budget {
  id: string
  workspace_id: string
  name: string
  category: string
  amount: number
  period: BudgetPeriod
  start_date: Date
  end_date?: Date
  is_active: boolean
  created_by: string
  created_at: Date
}

export interface CreateBudget {
  workspace_id: string
  name: string
  category: string
  amount: number
  period: BudgetPeriod
  start_date: Date
  end_date?: Date
  created_by: string
}

export interface UpdateBudget {
  name?: string
  category?: string
  amount?: number
  period?: BudgetPeriod
  start_date?: Date
  end_date?: Date
  is_active?: boolean
}

export interface BudgetWithSpending extends Budget {
  spent: number
  remaining: number
  percentage_used: number
  is_over_budget: boolean
}