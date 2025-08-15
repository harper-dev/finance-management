import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'
import { BaseAnalyticsService } from './BaseAnalyticsService'
import { AccountRepository } from '../../repositories/AccountRepository'
import { TransactionRepository } from '../../repositories/TransactionRepository'
import { BudgetRepository } from '../../repositories/BudgetRepository'
import { SavingsGoalRepository } from '../../repositories/SavingsGoalRepository'
import { WorkspaceRepository } from '../../repositories/WorkspaceRepository'

export interface WorkspaceOverview {
  totalBalance: number
  accountsCount: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyNet: number
  activeBudgetsCount: number
  activeGoalsCount: number
  lastUpdated: Date
}

export interface AccountSummary {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export interface BudgetSummary {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  remaining: number
  percentageUsed: number
}

export interface SavingsGoalSummary {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  progressPercentage: number
  isCompleted: boolean
}

export class WorkspaceOverviewService extends BaseAnalyticsService {
  private accountRepository: AccountRepository
  private transactionRepository: TransactionRepository
  private budgetRepository: BudgetRepository
  private savingsGoalRepository: SavingsGoalRepository
  private workspaceRepository: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    super()
    this.accountRepository = new AccountRepository()
    this.transactionRepository = new TransactionRepository()
    this.budgetRepository = new BudgetRepository()
    this.savingsGoalRepository = new SavingsGoalRepository()
    this.workspaceRepository = new WorkspaceRepository()
  }

  async getWorkspaceOverview(workspaceId: string): Promise<{
    overview: WorkspaceOverview
    accounts: AccountSummary[]
    monthlySummary: { income: number; expenses: number; net: number }
    activeBudgets: BudgetSummary[]
    activeSavingsGoals: SavingsGoalSummary[]
  }> {
    this.validateWorkspaceId(workspaceId)

    // Check cache first
    const cacheKey = `overview_${workspaceId}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 5)) { // 5 minutes cache
      return cached.data
    }

    try {
      // Execute all queries in parallel for better performance
      const [accounts, monthlyTransactions, budgets, savingsGoals] = await Promise.all([
        this.accountRepository.findByFilter({ workspaceId, isActive: true }),
        this.transactionRepository.getCurrentMonthTransactions(workspaceId),
        this.budgetRepository.findActiveBudgetsWithSpending(workspaceId).catch(() => []),
        this.savingsGoalRepository.findActiveGoalsWithProgress(workspaceId).catch(() => [])
      ])

      // Process accounts
      const accountSummaries: AccountSummary[] = accounts.map(acc => ({
        id: acc.id,
        name: acc.name || 'Unnamed Account',
        type: acc.type || 'unknown',
        balance: Number(acc.balance),
        currency: acc.currency || 'USD'
      }))

      // Calculate totals
      const totalBalance = accountSummaries.reduce((sum, acc) => sum + acc.balance, 0)
      const accountsCount = accountSummaries.length

      // Process monthly transactions
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // Process budgets
      const budgetSummaries: BudgetSummary[] = budgets.map(budget => ({
        id: budget.id,
        name: budget.name || 'Unnamed Budget',
        category: budget.category || 'Other',
        amount: Number(budget.amount),
        spent: budget.spent,
        remaining: budget.remaining,
        percentageUsed: budget.percentageUsed
      }))

      // Process savings goals
      const savingsGoalSummaries: SavingsGoalSummary[] = savingsGoals.map(goal => ({
        id: goal.id,
        name: goal.name || 'Unnamed Goal',
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        progressPercentage: goal.progressPercentage,
        isCompleted: goal.isCompleted
      }))

      const overview: WorkspaceOverview = {
        totalBalance,
        accountsCount,
        monthlyIncome,
        monthlyExpenses,
        monthlyNet: monthlyIncome - monthlyExpenses,
        activeBudgetsCount: budgetSummaries.length,
        activeGoalsCount: savingsGoalSummaries.length,
        lastUpdated: new Date()
      }

      const result = {
        overview,
        accounts: accountSummaries,
        monthlySummary: { income: monthlyIncome, expenses: monthlyExpenses, net: overview.monthlyNet },
        activeBudgets: budgetSummaries,
        activeSavingsGoals: savingsGoalSummaries
      }

      // Cache the result
      this.setCache(cacheKey, result)

      return result
    } catch (error) {
      throw new Error(`Failed to get workspace overview: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getQuickStats(workspaceId: string): Promise<{
    totalBalance: number
    monthlyNet: number
    activeBudgetsCount: number
    activeGoalsCount: number
  }> {
    this.validateWorkspaceId(workspaceId)

    const cacheKey = `quick_stats_${workspaceId}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 10)) { // 10 minutes cache
      return cached.data
    }

    try {
      const [accounts, monthlyTransactions, budgets, savingsGoals] = await Promise.all([
        this.accountRepository.findByFilter({ workspaceId, isActive: true }),
        this.transactionRepository.getCurrentMonthTransactions(workspaceId),
        this.budgetRepository.findByFilter({ workspaceId, isActive: true }),
        this.savingsGoalRepository.findByFilter({ workspaceId, isActive: true })
      ])

      const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
      
      const monthlyNet = monthlyTransactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + Number(t.amount)
        if (t.type === 'expense') return sum - Number(t.amount)
        return sum
      }, 0)

      const result = {
        totalBalance,
        monthlyNet,
        activeBudgetsCount: budgets.length,
        activeGoalsCount: savingsGoals.length
      }

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      throw new Error(`Failed to get quick stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  clearWorkspaceCache(workspaceId: string): void {
    this.clearCacheByPattern(workspaceId)
  }
} 