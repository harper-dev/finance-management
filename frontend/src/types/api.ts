// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Database types (from backend)
export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  preferred_currency: string
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  type: 'personal' | 'family' | 'team'
  owner_id: string
  currency: string
  created_at: string
  updated_at: string
  workspace_members?: WorkspaceMember[]
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: any
  joined_at: string
  user_profiles?: {
    display_name: string | null
  }
}

export type AccountType = 'cash' | 'bank' | 'investment' | 'asset' | 'debt';

export interface Account {
  id: string
  workspace_id: string
  name: string
  type: AccountType
  currency: string
  balance: number
  description?: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string
  workspace_id: string
  account_id: string
  to_account_id?: string | null
  type: TransactionType
  amount: number
  currency: string
  category: string | null
  description: string | null
  notes?: string | null
  date: string
  transaction_date: string
  created_by: string
  created_at: string
  updated_at: string
  accounts?: {
    name: string
    type: string
    currency: string
  }
}

export interface Budget {
  id: string
  workspace_id: string
  name: string
  category: string
  amount: number
  currency: string
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string | null
  is_active: boolean
  created_by: string
  created_at: string
  // Additional fields for budget analysis
  spent?: number
  remaining?: number
  percentage_used?: number
  is_over_budget?: boolean
  transactions?: Transaction[]
}

export interface SavingsGoal {
  id: string
  workspace_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  category: string | null
  description: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Analytics types
export interface OverviewAnalytics {
  accounts: {
    total_count: number
    balances_by_type: Record<string, {
      total: number
      currency: string
      count: number
    }>
  }
  monthly_summary: {
    income: number
    expenses: number
    net: number
    budget_allocated: number
    budget_used_percentage: number
  }
  savings: {
    total_target: number
    total_saved: number
    progress_percentage: number
    goals_count: number
  }
}

export interface SpendingAnalytics {
  period: {
    start_date: string
    end_date: string
  }
  total_spent: number
  categories: Array<{
    category: string
    total: number
    count: number
    average: number
    percentage: number
    transactions: Transaction[]
  }>
  summary: {
    top_category: string | null
    top_category_amount: number
    categories_count: number
    average_per_category: number
  }
}

export interface IncomeAnalytics {
  period: {
    start_date: string
    end_date: string
  }
  total_income: number
  categories: Array<{
    category: string
    total: number
    count: number
    average: number
    percentage: number
  }>
}

export interface TrendsAnalytics {
  trends: Array<{
    month: string
    month_name: string
    income: number
    expenses: number
    net: number
  }>
  averages: {
    income: number
    expenses: number
    net: number
  }
  period: {
    start_date: string
    end_date: string
    months: number
  }
}

// Form types
export interface CreateWorkspaceData {
  name: string
  type: 'personal' | 'family' | 'team'
  currency: string
}

export interface CreateAccountData {
  workspace_id: string
  name: string
  type: AccountType
  currency: string
  initial_balance: number
  description?: string
}

export interface CreateTransactionData {
  workspace_id: string
  account_id: string
  to_account_id?: string
  type: TransactionType
  amount: number
  currency: string
  category?: string
  description: string
  transaction_date: string
  notes?: string
}

export interface CreateBudgetData {
  name: string
  category: string
  amount: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
}

export interface CreateSavingsGoalData {
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
  category?: string
  description?: string
}