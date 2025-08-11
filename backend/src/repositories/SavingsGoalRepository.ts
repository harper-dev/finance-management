import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { SavingsGoal, CreateSavingsGoal, UpdateSavingsGoal, SavingsGoalWithProgress } from '../entities'
import { BaseRepository, PaginationOptions, PaginatedResult } from './base/BaseRepository'

export interface SavingsGoalFilter {
  workspace_id: string
  is_active?: boolean
  category?: string
}

export class SavingsGoalRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findMany(
    filter: SavingsGoalFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SavingsGoal> | SavingsGoal[]> {
    let query = this.supabase
      .from('savings_goals')
      .select('*')
      .eq('workspace_id', filter.workspace_id)
      .order('created_at', { ascending: false })

    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    if (filter.category) {
      query = query.eq('category', filter.category)
    }

    if (pagination) {
      return await this.paginate<SavingsGoal>(query, pagination)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item))
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const { data, error } = await this.supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findByIdWithProgress(id: string): Promise<SavingsGoalWithProgress | null> {
    const goal = await this.findById(id)
    if (!goal) return null

    return {
      ...goal,
      ...this.calculateProgress(goal)
    }
  }

  async create(goal: CreateSavingsGoal): Promise<SavingsGoal> {
    const { data, error } = await this.supabase
      .from('savings_goals')
      .insert([{
        ...goal,
        target_date: goal.target_date ? goal.target_date.toISOString().split('T')[0] : null
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async update(id: string, updates: UpdateSavingsGoal): Promise<SavingsGoal> {
    const updateData: any = { ...updates }
    if (updates.target_date !== undefined) {
      updateData.target_date = updates.target_date ? updates.target_date.toISOString().split('T')[0] : null
    }

    const { data, error } = await this.supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async addMoney(id: string, amount: number): Promise<SavingsGoal> {
    const goal = await this.findById(id)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    const newAmount = goal.current_amount + amount
    
    const { data, error } = await this.supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
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
      .from('savings_goals')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async findActiveGoalsWithProgress(workspaceId: string): Promise<SavingsGoalWithProgress[]> {
    const goals = await this.findMany({ workspace_id: workspaceId, is_active: true }) as SavingsGoal[]
    
    return goals.map(goal => ({
      ...goal,
      ...this.calculateProgress(goal)
    }))
  }

  private calculateProgress(goal: SavingsGoal): {
    progress_percentage: number
    days_remaining?: number
    monthly_savings_needed: number
    is_completed: boolean
  } {
    const progress_percentage = goal.target_amount > 0 
      ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
      : 0

    const is_completed = goal.current_amount >= goal.target_amount

    let days_remaining: number | undefined
    let monthly_savings_needed = 0

    if (goal.target_date && !is_completed) {
      const now = new Date()
      const targetDate = new Date(goal.target_date)
      days_remaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      const remaining_amount = goal.target_amount - goal.current_amount
      const months_remaining = days_remaining / 30.44 // Average days per month
      
      if (months_remaining > 0) {
        monthly_savings_needed = remaining_amount / months_remaining
      }
    } else if (!goal.target_date && !is_completed) {
      // If no target date, assume 12 months
      const remaining_amount = goal.target_amount - goal.current_amount
      monthly_savings_needed = remaining_amount / 12
    }

    return {
      progress_percentage,
      days_remaining,
      monthly_savings_needed: Math.max(0, monthly_savings_needed),
      is_completed
    }
  }

  private mapToEntity(data: any): SavingsGoal {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      name: data.name,
      target_amount: parseFloat(data.target_amount),
      current_amount: parseFloat(data.current_amount),
      target_date: data.target_date ? new Date(data.target_date) : undefined,
      category: data.category,
      description: data.description,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }
  }
}