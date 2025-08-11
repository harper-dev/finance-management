import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { SavingsGoal, CreateSavingsGoal, UpdateSavingsGoal, SavingsGoalWithProgress } from '../entities'
import { SavingsGoalRepository, WorkspaceRepository } from '../repositories'
import { PaginationOptions, PaginatedResult } from '../repositories/base/BaseRepository'

export class SavingsGoalService {
  private savingsGoalRepo: SavingsGoalRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.savingsGoalRepo = new SavingsGoalRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getSavingsGoals(
    workspaceId: string,
    userId: string,
    filters?: { is_active?: boolean; category?: string },
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<SavingsGoal> | SavingsGoal[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const filter = {
      workspace_id: workspaceId,
      ...filters
    }

    return await this.savingsGoalRepo.findMany(filter, pagination)
  }

  async getSavingsGoalById(goalId: string, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepo.findById(goalId)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    await this.checkWorkspaceAccess(goal.workspace_id, userId)
    return goal
  }

  async getSavingsGoalByIdWithProgress(goalId: string, userId: string): Promise<SavingsGoalWithProgress> {
    const goal = await this.savingsGoalRepo.findByIdWithProgress(goalId)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    await this.checkWorkspaceAccess(goal.workspace_id, userId)
    return goal
  }

  async createSavingsGoal(goalData: CreateSavingsGoal, userId: string): Promise<SavingsGoal> {
    await this.checkWorkspaceAccess(goalData.workspace_id, userId)

    // Validate target amount
    if (goalData.target_amount <= 0) {
      throw new Error('Target amount must be greater than 0')
    }

    // Validate current amount
    if (goalData.current_amount && goalData.current_amount < 0) {
      throw new Error('Current amount cannot be negative')
    }

    // Validate target date is in the future
    if (goalData.target_date && goalData.target_date <= new Date()) {
      throw new Error('Target date must be in the future')
    }

    return await this.savingsGoalRepo.create({
      ...goalData,
      created_by: userId
    })
  }

  async updateSavingsGoal(goalId: string, updates: UpdateSavingsGoal, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepo.findById(goalId)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    await this.checkWorkspaceAccess(goal.workspace_id, userId)

    // Validate updates
    if (updates.target_amount !== undefined && updates.target_amount <= 0) {
      throw new Error('Target amount must be greater than 0')
    }

    if (updates.current_amount !== undefined && updates.current_amount < 0) {
      throw new Error('Current amount cannot be negative')
    }

    if (updates.target_date !== undefined && updates.target_date && updates.target_date <= new Date()) {
      throw new Error('Target date must be in the future')
    }

    return await this.savingsGoalRepo.update(goalId, updates)
  }

  async deleteSavingsGoal(goalId: string, userId: string): Promise<void> {
    const goal = await this.savingsGoalRepo.findById(goalId)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    await this.checkWorkspaceAccess(goal.workspace_id, userId)
    await this.savingsGoalRepo.delete(goalId)
  }

  async addMoneyToGoal(goalId: string, amount: number, userId: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepo.findById(goalId)
    if (!goal) {
      throw new Error('Savings goal not found')
    }

    await this.checkWorkspaceAccess(goal.workspace_id, userId)

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (!goal.is_active) {
      throw new Error('Cannot add money to inactive savings goal')
    }

    return await this.savingsGoalRepo.addMoney(goalId, amount)
  }

  async getActiveGoalsWithProgress(workspaceId: string, userId: string): Promise<SavingsGoalWithProgress[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    return await this.savingsGoalRepo.findActiveGoalsWithProgress(workspaceId)
  }

  async getSavingsGoalSummary(workspaceId: string, userId: string): Promise<{
    total_goals: number
    active_goals: number
    completed_goals: number
    total_target_amount: number
    total_current_amount: number
    overall_progress_percentage: number
    total_monthly_savings_needed: number
  }> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    
    const goalsWithProgress = await this.savingsGoalRepo.findActiveGoalsWithProgress(workspaceId)
    const allGoals = await this.savingsGoalRepo.findMany({ workspace_id: workspaceId }) as SavingsGoal[]
    
    const total_goals = allGoals.length
    const active_goals = goalsWithProgress.length
    const completed_goals = goalsWithProgress.filter(g => g.is_completed).length
    const total_target_amount = goalsWithProgress.reduce((sum, g) => sum + g.target_amount, 0)
    const total_current_amount = goalsWithProgress.reduce((sum, g) => sum + g.current_amount, 0)
    const overall_progress_percentage = total_target_amount > 0 ? (total_current_amount / total_target_amount) * 100 : 0
    const total_monthly_savings_needed = goalsWithProgress.reduce((sum, g) => sum + g.monthly_savings_needed, 0)

    return {
      total_goals,
      active_goals,
      completed_goals,
      total_target_amount,
      total_current_amount,
      overall_progress_percentage,
      total_monthly_savings_needed
    }
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }
  }
}