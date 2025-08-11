import { z } from 'zod'
import { transactionCreateSchema, transactionUpdateSchema, paginationSchema } from '../utils/validation'

export type CreateTransactionDto = z.infer<typeof transactionCreateSchema>
export type UpdateTransactionDto = z.infer<typeof transactionUpdateSchema>

export interface TransactionResponseDto {
  id: string
  workspace_id: string
  account_id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  currency: string
  category?: string
  description?: string
  transaction_date: string
  created_by: string
  created_at: string
  updated_at: string
  account?: {
    id: string
    name: string
    type: string
  }
}

export interface TransactionFilterDto {
  account_id?: string
  type?: 'income' | 'expense' | 'transfer'
  category?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
}

export interface TransactionListRequestDto {
  filters?: TransactionFilterDto
  pagination?: z.infer<typeof paginationSchema>
}

export interface BulkCreateTransactionDto {
  transactions: CreateTransactionDto[]
}

export interface CategoryAnalysisDto {
  category: string
  amount: number
  percentage: number
  count: number
}