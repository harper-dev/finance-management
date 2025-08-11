import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { 
  WorkspaceOverview, 
  SpendingAnalysis, 
  IncomeAnalysis, 
  FinancialTrend,
  AccountSummary,
  BudgetSummary,
  SavingsGoalSummary
} from '../entities'
import { 
  AccountRepository, 
  TransactionRepository, 
  BudgetRepository, 
  SavingsGoalRepository, 
  WorkspaceRepository 
} from '../repositories'

export class AnalyticsService {
  private accountRepo: AccountRepository
  private transactionRepo: TransactionRepository
  private budgetRepo: BudgetRepository
  private savingsGoalRepo: SavingsGoalRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.accountRepo = new AccountRepository(supabase)
    this.transactionRepo = new TransactionRepository(supabase)
    this.budgetRepo = new BudgetRepository(supabase)
    this.savingsGoalRepo = new SavingsGoalRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getWorkspaceOverview(workspaceId: string, userId: string): Promise<{
    overview: WorkspaceOverview
    accounts: AccountSummary[]
    monthly_summary: { income: number; expenses: number; net: number }
    active_budgets: BudgetSummary[]
    active_savings_goals: SavingsGoalSummary[]
  }> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    // Get accounts
    const accounts = await this.accountRepo.findMany({ workspace_id: workspaceId, is_active: true }) as any[]
    const accountSummaries: AccountSummary[] = accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      currency: acc.currency
    }))

    // Calculate totals
    const total_balance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const accounts_count = accounts.length

    // Get current month transactions
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlyTransactions = await this.transactionRepo.findMany({
      workspace_id: workspaceId,
      start_date: startOfMonth,
      end_date: endOfMonth
    }) as any[]

    const monthly_income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthly_expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // Get budgets
    const budgets = await this.budgetRepo.findActiveBudgetsWithSpending(workspaceId)
    const budgetSummaries: BudgetSummary[] = budgets.map(budget => ({
      id: budget.id,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      remaining: budget.remaining,
      percentage_used: budget.percentage_used
    }))

    // Get savings goals
    const savingsGoals = await this.savingsGoalRepo.findActiveGoalsWithProgress(workspaceId)
    const savingsGoalSummaries: SavingsGoalSummary[] = savingsGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      progress_percentage: goal.progress_percentage,
      target_date: goal.target_date
    }))

    const overview: WorkspaceOverview = {
      total_balance,
      total_income: monthly_income,
      total_expenses: monthly_expenses,
      net_worth: monthly_income - monthly_expenses,
      accounts_count,
      active_budgets_count: budgets.length,
      active_savings_goals_count: savingsGoals.length
    }

    return {
      overview,
      accounts: accountSummaries,
      monthly_summary: {
        income: monthly_income,
        expenses: monthly_expenses,
        net: monthly_income - monthly_expenses
      },
      active_budgets: budgetSummaries,
      active_savings_goals: savingsGoalSummaries
    }
  }

  async getSpendingAnalysis(
    workspaceId: string, 
    userId: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<SpendingAnalysis[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const { startDate, endDate } = this.getPeriodDates(period)
    
    const categorySpending = await this.transactionRepo.getSpendingByCategory(workspaceId, startDate, endDate)
    const totalAmount = categorySpending.reduce((sum, item) => sum + item.amount, 0)

    return categorySpending.map(item => ({
      category: item.category,
      amount: item.amount,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      transaction_count: item.count
    }))
  }

  async getIncomeAnalysis(
    workspaceId: string, 
    userId: string,
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<IncomeAnalysis[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const { startDate, endDate } = this.getPeriodDates(period)
    
    const categoryIncome = await this.transactionRepo.getIncomeByCategory(workspaceId, startDate, endDate)
    const totalAmount = categoryIncome.reduce((sum, item) => sum + item.amount, 0)

    return categoryIncome.map(item => ({
      category: item.category,
      amount: item.amount,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
      transaction_count: item.count
    }))
  }

  async getFinancialTrends(
    workspaceId: string, 
    userId: string,
    months: number = 12
  ): Promise<FinancialTrend[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const trends: FinancialTrend[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const transactions = await this.transactionRepo.findMany({
        workspace_id: workspaceId,
        start_date: startDate,
        end_date: endDate
      }) as any[]

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      // Calculate balance at end of month
      const accounts = await this.accountRepo.findMany({ 
        workspace_id: workspaceId, 
        is_active: true 
      }) as any[]
      const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

      trends.push({
        period: startDate.toISOString().substring(0, 7), // YYYY-MM format
        income,
        expenses,
        net: income - expenses,
        balance
      })
    }

    return trends
  }

  private getPeriodDates(period: 'month' | 'quarter' | 'year'): { startDate: Date; endDate: Date } {
    const now = new Date()
    const endDate = new Date()
    let startDate: Date

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return { startDate, endDate }
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }
  }
}