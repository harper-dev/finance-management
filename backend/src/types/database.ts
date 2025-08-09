// Database types generated from Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          preferred_currency: string
          timezone: string
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          preferred_currency?: string
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          preferred_currency?: string
          timezone?: string
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          type: 'personal' | 'family' | 'team'
          owner_id: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'personal' | 'family' | 'team'
          owner_id: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'personal' | 'family' | 'team'
          owner_id?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions: any
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: any
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: any
          joined_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          workspace_id: string
          name: string
          type: 'cash' | 'bank' | 'investment' | 'asset' | 'debt'
          currency: string
          balance: number
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          type: 'cash' | 'bank' | 'investment' | 'asset' | 'debt'
          currency?: string
          balance?: number
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'investment' | 'asset' | 'debt'
          currency?: string
          balance?: number
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          workspace_id: string
          account_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          currency: string
          category: string | null
          description: string | null
          transaction_date: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          account_id: string
          type: 'income' | 'expense' | 'transfer'
          amount: number
          currency: string
          category?: string | null
          description?: string | null
          transaction_date: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          account_id?: string
          type?: 'income' | 'expense' | 'transfer'
          amount?: number
          currency?: string
          category?: string | null
          description?: string | null
          transaction_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          workspace_id: string
          name: string
          category: string
          amount: number
          period: 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string | null
          is_active: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          category: string
          amount: number
          period: 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          category?: string
          amount?: number
          period?: 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
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
        Insert: {
          id?: string
          workspace_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          description?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          category?: string | null
          description?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}