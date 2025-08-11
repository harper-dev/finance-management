import { z } from 'zod'
import { savingsGoalCreateSchema, savingsGoalUpdateSchema, paginationSchema } from '../utils/validation'

export type CreateSavingsGoalDto = z.infer<typeof savingsGoalCreateSchema>
export type UpdateSavingsGoalDto = z.infer<typeof savingsGoalUpdateSchema>

export interface SavingsGoalResponseDto {
  id: string
  workspace_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
  category?: string
  description?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface SavingsGoalWithProgressDto extends SavingsGoalResponseDto {
  progress_percentage: number
  days_remaining?: number
  monthly_savings_needed: number
  is_completed: boolean
}

export interface SavingsGoalFilterDto {
  is_active?: boolean
  category?: string
}

export interface SavingsGoalListRequestDto {
  filters?: SavingsGoalFilterDto
  pagination?: z.infer<typeof paginationSchema>
}

export interface AddMoneyDto {
  amount: number
}

export interface SavingsGoalSummaryDto {
  total_goals: number
  active_goals: number
  completed_goals: number
  total_target_amount: number
  total_current_amount: number
  overall_progress_percentage: number
  total_monthly_savings_needed: number
}