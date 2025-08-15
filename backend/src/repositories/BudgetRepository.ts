import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { Budget } from '../entities/Budget'
import { Transaction } from '../entities/Transaction'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateBudgetDto, UpdateBudgetDto, BudgetWithSpendingDto } from '../entities'

export interface BudgetFilter {
  workspaceId: string
  isActive?: boolean
  period?: string
}

export class BudgetRepository extends BaseRepository<Budget> {
  private transactionRepository: Repository<Transaction>

  constructor() {
    super(Budget)
    this.transactionRepository = AppDataSource.getRepository(Transaction)
  }

  async findByFilter(
    filter: BudgetFilter,
    options?: FindManyOptions<Budget>
  ): Promise<Budget[]> {
    const where: FindOptionsWhere<Budget> = {
      workspaceId: filter.workspaceId
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive
    }

    if (filter.period) {
      where.period = filter.period as any
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findByIdWithSpending(id: string): Promise<BudgetWithSpendingDto | null> {
    const budget = await this.findById(id)
    if (!budget) return null

    const spending = await this.calculateSpending(budget)
    return {
      ...budget,
      ...spending
    }
  }

  async findActiveBudgetsWithSpending(workspaceId: string): Promise<BudgetWithSpendingDto[]> {
    const budgets = await this.findByFilter({ workspaceId, isActive: true })
    
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
    percentageUsed: number
    isOverBudget: boolean
  }> {
    // Calculate date range for current budget period
    const now = new Date()
    const startDate = new Date(budget.startDate)
    let endDate: Date

    if (budget.endDate) {
      endDate = new Date(budget.endDate)
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
    const transactions = await this.transactionRepository.find({
      where: {
        workspaceId: budget.workspaceId,
        type: 'expense',
        category: budget.category,
        transactionDate: {
          gte: startDate,
          lte: endDate
        } as any
      }
    })

    const spent = transactions.reduce((total, transaction) => total + Number(transaction.amount), 0)
    const remaining = Number(budget.amount) - spent
    const percentageUsed = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0
    const isOverBudget = spent > Number(budget.amount)

    return {
      spent,
      remaining,
      percentageUsed,
      isOverBudget
    }
  }
}