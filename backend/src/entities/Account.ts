export type AccountType = 'cash' | 'bank' | 'investment' | 'asset' | 'debt'

export interface Account {
  id: string
  workspace_id: string
  name: string
  type: AccountType
  currency: string
  balance: number
  is_active: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateAccount {
  workspace_id: string
  name: string
  type: AccountType
  currency?: string
  balance?: number
  created_by: string
}

export interface UpdateAccount {
  name?: string
  type?: AccountType
  currency?: string
  balance?: number
  is_active?: boolean
}