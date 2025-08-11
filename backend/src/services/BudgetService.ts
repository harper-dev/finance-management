import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Budget, CreateBudget, UpdateBudget, BudgetWithSpending } from '../entities'
import { BudgetRepository, WorkspaceRepository } from '../repositories'
import { PaginationOptions, PaginatedResult } from '../repositories/base/BaseRepository'

export class BudgetService {
  private budgetRepo: BudgetRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.budgetRepo = new BudgetRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getBudgets(
    workspaceId: string,
    userId: string,
    filters?: { is_active?: boolean; period?: string },
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Budget> | Budget[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const filter = {
      workspace_id: workspaceId,
      ...filters
    }

    return await this.budgetRepo.findMany(filter, pagination)
  }

  async getBudgetById(budgetId: string, userId: string): Promise<Budget> {
    const budget = await this.budgetRepo.findById(budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    await this.checkWorkspaceAccess(budget.workspace_id, userId)
    return budget
  }

  async getBudgetByIdWithSpending(budgetId: string, userId: string): Promise<BudgetWithSpending> {
    const budget = await this.budgetRepo.findByIdWithSpending(budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    await this.checkWorkspaceAccess(budget.workspace_id, userId)
    return budget
  }

  async createBudget(budgetData: CreateBudget, userId: string): Promise<Budget> {
    await this.checkWorkspaceAccess(budgetData.workspace_id, userId)

    // Validate date ranges
    if (budgetData.end_date && budgetData.start_date >= budgetData.end_date) {
      throw new Error('End date must be after start date')
    }

    return await this.budgetRepo.create({
      ...budgetData,
      created_by: userId
    })
  }

  async updateBudget(budgetId: string, updates: UpdateBudget, userId: string): Promise<Budget> {
    const budget = await this.budgetRepo.findById(budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    await this.checkWorkspaceAccess(budget.workspace_id, userId)

    // Validate date ranges if being updated
    if (updates.start_date || updates.end_date) {
      const startDate = updates.start_date || budget.start_date
      const endDate = updates.end_date || budget.end_date
      
      if (endDate && startDate >= endDate) {
        throw new Error('End date must be after start date')
      }
    }

    return await this.budgetRepo.update(budgetId, updates)
  }

  async deleteBudget(budgetId: string, userId: string): Promise<void> {
    const budget = await this.budgetRepo.findById(budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    await this.checkWorkspaceAccess(budget.workspace_id, userId)
    await this.budgetRepo.delete(budgetId)
  }

  async getActiveBudgetsWithSpending(workspaceId: string, userId: string): Promise<BudgetWithSpending[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    return await this.budgetRepo.findActiveBudgetsWithSpending(workspaceId)
  }

  async getBudgetPerformance(workspaceId: string, userId: string): Promise<{
    total_budgets: number
    over_budget_count: number
    total_budgeted: number
    total_spent: number
    overall_percentage: number
  }> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    
    const budgetsWithSpending = await this.budgetRepo.findActiveBudgetsWithSpending(workspaceId)
    
    const total_budgets = budgetsWithSpending.length
    const over_budget_count = budgetsWithSpending.filter(b => b.is_over_budget).length
    const total_budgeted = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0)
    const total_spent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)
    const overall_percentage = total_budgeted > 0 ? (total_spent / total_budgeted) * 100 : 0

    return {
      total_budgets,
      over_budget_count,
      total_budgeted,
      total_spent,
      overall_percentage
    }
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }
  }
}