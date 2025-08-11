export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  id: string
  workspace_id: string
  account_id: string
  type: TransactionType
  amount: number
  currency: string
  category?: string
  description?: string
  transaction_date: Date
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateTransaction {
  workspace_id: string
  account_id: string
  type: TransactionType
  amount: number
  currency: string
  category?: string
  description?: string
  transaction_date: Date
  created_by: string
}

export interface UpdateTransaction {
  account_id?: string
  type?: TransactionType
  amount?: number
  currency?: string
  category?: string
  description?: string
  transaction_date?: Date
}

export interface TransactionFilter {
  account_id?: string
  type?: TransactionType
  category?: string
  start_date?: Date
  end_date?: Date
  min_amount?: number
  max_amount?: number
}