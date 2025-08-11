export interface SavingsGoal {
  id: string
  workspace_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: Date
  category?: string
  description?: string
  is_active: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface CreateSavingsGoal {
  workspace_id: string
  name: string
  target_amount: number
  current_amount?: number
  target_date?: Date
  category?: string
  description?: string
  created_by: string
}

export interface UpdateSavingsGoal {
  name?: string
  target_amount?: number
  current_amount?: number
  target_date?: Date
  category?: string
  description?: string
  is_active?: boolean
}

export interface SavingsGoalWithProgress extends SavingsGoal {
  progress_percentage: number
  days_remaining?: number
  monthly_savings_needed: number
  is_completed: boolean
}