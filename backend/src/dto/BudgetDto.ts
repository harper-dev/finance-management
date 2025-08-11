import { z } from 'zod'
import { budgetCreateSchema, budgetUpdateSchema, paginationSchema } from '../utils/validation'

export type CreateBudgetDto = z.infer<typeof budgetCreateSchema>
export type UpdateBudgetDto = z.infer<typeof budgetUpdateSchema>

export interface BudgetResponseDto {
  id: string
  workspace_id: string
  name: string
  category: string
  amount: number
  period: 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  is_active: boolean
  created_by: string
  created_at: string
}

export interface BudgetWithSpendingDto extends BudgetResponseDto {
  spent: number
  remaining: number
  percentage_used: number
  is_over_budget: boolean
}

export interface BudgetFilterDto {
  is_active?: boolean
  period?: string
}

export interface BudgetListRequestDto {
  filters?: BudgetFilterDto
  pagination?: z.infer<typeof paginationSchema>
}

export interface BudgetPerformanceDto {
  total_budgets: number
  over_budget_count: number
  total_budgeted: number
  total_spent: number
  overall_percentage: number
}