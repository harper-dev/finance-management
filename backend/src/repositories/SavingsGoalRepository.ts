import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { SavingsGoal } from '../entities/SavingsGoal'
import { Transaction } from '../entities/Transaction'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateSavingsGoalDto, UpdateSavingsGoalDto, SavingsGoalWithProgressDto } from '../entities'

export interface SavingsGoalFilter {
  workspaceId: string
  isActive?: boolean
  category?: string
}

export class SavingsGoalRepository extends BaseRepository<SavingsGoal> {
  private transactionRepository: Repository<Transaction>

  constructor() {
    super(SavingsGoal)
    this.transactionRepository = AppDataSource.getRepository(Transaction)
  }

  async findByFilter(
    filter: SavingsGoalFilter,
    options?: FindManyOptions<SavingsGoal>
  ): Promise<SavingsGoal[]> {
    const where: FindOptionsWhere<SavingsGoal> = {
      workspaceId: filter.workspaceId
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive
    }

    if (filter.category) {
      where.category = filter.category
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findActiveGoals(workspaceId: string): Promise<SavingsGoal[]> {
    return this.findByFilter({ workspaceId, isActive: true })
  }

  async findActiveGoalsWithProgress(workspaceId: string): Promise<SavingsGoalWithProgressDto[]> {
    const goals = await this.findActiveGoals(workspaceId)
    
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await this.calculateProgress(goal)
        return {
          ...goal,
          ...progress
        }
      })
    )

    return goalsWithProgress
  }

  async findByIdWithProgress(id: string): Promise<SavingsGoalWithProgressDto | null> {
    const goal = await this.findById(id)
    if (!goal) return null

    const progress = await this.calculateProgress(goal)
    return {
      ...goal,
      ...progress
    }
  }

  async updateProgress(goalId: string, amount: number): Promise<SavingsGoal | null> {
    const goal = await this.findById(goalId)
    if (!goal) return null

    const newCurrentAmount = Number(goal.currentAmount) + amount
    return this.update(goalId, { currentAmount: newCurrentAmount })
  }

  async resetProgress(goalId: string): Promise<SavingsGoal | null> {
    return this.update(goalId, { currentAmount: 0 })
  }

  private async calculateProgress(goal: SavingsGoal): Promise<{
    progressPercentage: number
    daysRemaining?: number
    monthlySavingsNeeded: number
    isCompleted: boolean
  }> {
    const progressPercentage = Number(goal.targetAmount) > 0 
      ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 
      : 0

    let daysRemaining: number | undefined
    if (goal.targetDate) {
      const now = new Date()
      const targetDate = new Date(goal.targetDate)
      const diffTime = targetDate.getTime() - now.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Calculate monthly savings needed
    let monthlySavingsNeeded = 0
    if (goal.targetDate && daysRemaining && daysRemaining > 0) {
      const remainingAmount = Number(goal.targetAmount) - Number(goal.currentAmount)
      const monthsRemaining = daysRemaining / 30.44 // Average days per month
      monthlySavingsNeeded = remainingAmount / Math.max(monthsRemaining, 1)
    }

    const isCompleted = Number(goal.currentAmount) >= Number(goal.targetAmount)

    return {
      progressPercentage,
      daysRemaining,
      monthlySavingsNeeded,
      isCompleted
    }
  }

  async getGoalsByCategory(workspaceId: string): Promise<Array<{
    category: string
    goals: SavingsGoalWithProgressDto[]
    totalTarget: number
    totalCurrent: number
    averageProgress: number
  }>> {
    const goals = await this.findActiveGoalsWithProgress(workspaceId)
    
    const categoryMap = new Map<string, SavingsGoalWithProgressDto[]>()
    
    goals.forEach(goal => {
      const category = goal.category || 'Other'
      const existing = categoryMap.get(category) || []
      existing.push(goal)
      categoryMap.set(category, existing)
    })

    return Array.from(categoryMap.entries()).map(([category, categoryGoals]) => {
      const totalTarget = categoryGoals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0)
      const totalCurrent = categoryGoals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)
      const averageProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

      return {
        category,
        goals: categoryGoals,
        totalTarget,
        totalCurrent,
        averageProgress
      }
    })
  }

  async getGoalsSummary(workspaceId: string): Promise<{
    totalGoals: number
    activeGoals: number
    completedGoals: number
    totalTargetAmount: number
    totalCurrentAmount: number
    overallProgress: number
    averageMonthlySavings: number
  }> {
    const goals = await this.findActiveGoalsWithProgress(workspaceId)
    
    const totalGoals = goals.length
    const activeGoals = goals.filter(g => !g.isCompleted).length
    const completedGoals = goals.filter(g => g.isCompleted).length
    
    const totalTargetAmount = goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0)
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    
    const monthlySavings = goals
      .filter(g => g.monthlySavingsNeeded > 0)
      .reduce((sum, goal) => sum + goal.monthlySavingsNeeded, 0)
    
    const averageMonthlySavings = monthlySavings / Math.max(goals.length, 1)

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
      averageMonthlySavings
    }
  }
}