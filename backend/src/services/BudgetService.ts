import { BudgetRepository } from '../repositories/BudgetRepository'
import { BaseService } from './base/BaseService'
import { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetWithSpendingDto } from '../entities'
import { ValidationUtils } from '../utils/validation'
import { ResponseBuilder } from '../utils/apiResponse'

export class BudgetService extends BaseService<Budget> {
  private budgetRepository: BudgetRepository

  constructor() {
    const repository = new BudgetRepository()
    super(repository)
    this.budgetRepository = repository
  }

  async createBudget(budgetData: CreateBudgetDto): Promise<Budget> {
    // Validate required fields
    this.validateRequiredFields(budgetData, ['workspaceId', 'name', 'category', 'amount', 'period', 'startDate', 'createdBy'])
    
    // Validate amount
    if (!ValidationUtils.isValidAmount(budgetData.amount)) {
      throw new Error('Invalid budget amount')
    }

    // Validate dates
    if (!ValidationUtils.isValidDate(budgetData.startDate)) {
      throw new Error('Invalid start date')
    }

    if (budgetData.endDate && !ValidationUtils.isValidDate(budgetData.endDate)) {
      throw new Error('Invalid end date')
    }

    // Validate period
    ValidationUtils.validateEnum(budgetData.period, 'period', ['monthly', 'quarterly', 'yearly'])

    return this.budgetRepository.create(budgetData)
  }

  async updateBudget(id: string, updates: UpdateBudgetDto): Promise<Budget | null> {
    this.validateId(id)

    if (updates.amount !== undefined && !ValidationUtils.isValidAmount(updates.amount)) {
      throw new Error('Invalid budget amount')
    }

    if (updates.startDate && !ValidationUtils.isValidDate(updates.startDate)) {
      throw new Error('Invalid start date')
    }

    if (updates.endDate && !ValidationUtils.isValidDate(updates.endDate)) {
      throw new Error('Invalid end date')
    }

    if (updates.period) {
      ValidationUtils.validateEnum(updates.period, 'period', ['monthly', 'quarterly', 'yearly'])
    }

    return this.budgetRepository.update(id, updates)
  }

  async getBudgetWithSpending(id: string): Promise<BudgetWithSpendingDto | null> {
    this.validateId(id)
    return this.budgetRepository.findByIdWithSpending(id)
  }

  async getActiveBudgetsWithSpending(workspaceId: string): Promise<BudgetWithSpendingDto[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    return this.budgetRepository.findActiveBudgetsWithSpending(workspaceId)
  }

  async getBudgetsByWorkspace(
    workspaceId: string,
    isActive?: boolean
  ): Promise<Budget[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const filter: any = { workspaceId }
    if (isActive !== undefined) {
      filter.isActive = isActive
    }

    return this.budgetRepository.findByFilter(filter)
  }

  async getBudgetsByCategory(workspaceId: string, category: string): Promise<Budget[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    return this.budgetRepository.findByFilter({ workspaceId, category })
  }

  async getBudgetsByPeriod(workspaceId: string, period: string): Promise<Budget[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    ValidationUtils.validateEnum(period, 'period', ['monthly', 'quarterly', 'yearly'])

    return this.budgetRepository.findByFilter({ workspaceId, period })
  }

  async deactivateBudget(id: string): Promise<Budget | null> {
    this.validateId(id)
    return this.budgetRepository.update(id, { isActive: false })
  }

  async reactivateBudget(id: string): Promise<Budget | null> {
    this.validateId(id)
    return this.budgetRepository.update(id, { isActive: true })
  }

  async getBudgetSummary(workspaceId: string): Promise<{
    totalBudgets: number
    activeBudgets: number
    totalBudgetAmount: number
    totalSpent: number
    totalRemaining: number
    averageUtilization: number
  }> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const budgetsWithSpending = await this.budgetRepository.findActiveBudgetsWithSpending(workspaceId)
    
    const totalBudgets = budgetsWithSpending.length
    const activeBudgets = budgetsWithSpending.filter(b => b.isActive).length
    
    const totalBudgetAmount = budgetsWithSpending.reduce((sum, b) => sum + Number(b.amount), 0)
    const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = budgetsWithSpending.reduce((sum, b) => sum + b.remaining, 0)
    
    const averageUtilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0

    return {
      totalBudgets,
      activeBudgets,
      totalBudgetAmount,
      totalSpent,
      totalRemaining,
      averageUtilization
    }
  }
}