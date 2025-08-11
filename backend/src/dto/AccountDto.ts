import { z } from 'zod'
import { accountCreateSchema, accountUpdateSchema, paginationSchema } from '../utils/validation'

export type CreateAccountDto = z.infer<typeof accountCreateSchema>
export type UpdateAccountDto = z.infer<typeof accountUpdateSchema>
export type PaginationDto = z.infer<typeof paginationSchema>

export interface AccountResponseDto {
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

export interface AccountFilterDto {
  is_active?: boolean
  type?: string
}

export interface AccountListRequestDto {
  filters?: AccountFilterDto
  pagination?: PaginationDto
}

export interface BalanceHistoryDto {
  date: string
  balance: number
}

export interface PaginatedResponseDto<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}