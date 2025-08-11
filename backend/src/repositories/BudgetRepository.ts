import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Budget, CreateBudget, UpdateBudget, BudgetWithSpending } from '../entities'
import { BaseRepository, PaginationOptions, PaginatedResult } from './base/BaseRepository'

export interface BudgetFilter {
  workspace_id: string
  is_active?: boolean
  period?: string
}

export class BudgetRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findMany(
    filter: BudgetFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Budget> | Budget[]> {
    let query = this.supabase
      .from('budgets')
      .select('*')
      .eq('workspace_id', filter.workspace_id)
      .order('created_at', { ascending: false })

    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    if (filter.period) {
      query = query.eq('period', filter.period)
    }

    if (pagination) {
      return await this.paginate<Budget>(query, pagination)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item))
  }

  async findById(id: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByIdWithSpending(id: string): Promise<BudgetWithSpending | null> {
    const budget = await this.findById(id)
    if (!budget) return null

    const spending = await this.calculateSpending(budget)
    return {
      ...budget,
      ...spending
    }
  }

  async create(budget: CreateBudget): Promise<Budget> {
    const { data, error } = await this.supabase
      .from('budgets')
      .insert([{
        ...budget,
        start_date: budget.start_date.toISOString().split('T')[0],
        end_date: budget.end_date ? budget.end_date.toISOString().split('T')[0] : null
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async update(id: string, updates: UpdateBudget): Promise<Budget> {
    const updateData: any = { ...updates }
    if (updates.start_date) {
      updateData.start_date = updates.start_date.toISOString().split('T')[0]
    }
    if (updates.end_date) {
      updateData.end_date = updates.end_date.toISOString().split('T')[0]
    }

    const { data, error } = await this.supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async findActiveBudgetsWithSpending(workspaceId: string): Promise<BudgetWithSpending[]> {
    const budgets = await this.findMany({ workspace_id: workspaceId, is_active: true }) as Budget[]
    
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await this.calculateSpending(budget)
        return {
          ...budget,
          ...spending
        }
      })
    )

    return budgetsWithSpending
  }

  private async calculateSpending(budget: Budget): Promise<{
    spent: number
    remaining: number
    percentage_used: number
    is_over_budget: boolean
  }> {
    // Calculate date range for current budget period
    const now = new Date()
    const startDate = new Date(budget.start_date)
    let endDate: Date

    if (budget.end_date) {
      endDate = new Date(budget.end_date)
    } else {
      // Calculate end date based on period
      endDate = new Date(startDate)
      switch (budget.period) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3)
          break
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }
    }

    // Get spending for this budget's category in the current period
    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount')
      .eq('workspace_id', budget.workspace_id)
      .eq('type', 'expense')
      .eq('category', budget.category)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])

    if (error) {
      throw new Error(error.message)
    }

    const spent = data.reduce((total, transaction) => total + parseFloat(transaction.amount.toString()), 0)
    const remaining = budget.amount - spent
    const percentage_used = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    const is_over_budget = spent > budget.amount

    return {
      spent,
      remaining,
      percentage_used,
      is_over_budget
    }
  }

  private mapToEntity(data: any): Budget {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      name: data.name,
      category: data.category,
      amount: parseFloat(data.amount),
      period: data.period,
      start_date: new Date(data.start_date),
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: new Date(data.created_at)
    }
  }
}