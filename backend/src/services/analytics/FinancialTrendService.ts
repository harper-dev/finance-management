import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'
import { BaseAnalyticsService } from './BaseAnalyticsService'
import { TransactionRepository } from '../../repositories/TransactionRepository'
import { AccountRepository } from '../../repositories/AccountRepository'

export interface FinancialTrend {
  month: string
  income: number
  expenses: number
  net: number
  growthRate?: number
  cumulativeNet: number
}

export interface CashFlowData {
  date: string
  income: number
  expenses: number
  net: number
  runningBalance: number
}

export interface MonthlyPrediction {
  month: string
  predictedIncome: number
  predictedExpenses: number
  predictedNet: number
  confidence: number
}

export class FinancialTrendService extends BaseAnalyticsService {
  private transactionRepository: TransactionRepository
  private accountRepository: AccountRepository

  constructor(supabase: SupabaseClient<Database>) {
    super()
    this.transactionRepository = new TransactionRepository()
    this.accountRepository = new AccountRepository()
  }

  async getFinancialTrends(
    workspaceId: string,
    monthsBack: number = 12
  ): Promise<FinancialTrend[]> {
    this.validateWorkspaceId(workspaceId)

    const cacheKey = `trends_${workspaceId}_${monthsBack}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 15)) { // 15 minutes cache
      return cached.data
    }

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - monthsBack)

      const transactions = await this.transactionRepository.getTransactionsByDateRange(
        workspaceId,
        startDate,
        endDate
      )

      const trends = this.calculateTrends(transactions, monthsBack)
      
      this.setCache(cacheKey, trends)
      return trends
    } catch (error) {
      throw new Error(`Failed to get financial trends: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getCashFlowData(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CashFlowData[]> {
    this.validateWorkspaceId(workspaceId)
    this.validateDateRange(startDate, endDate)

    const cacheKey = `cashflow_${workspaceId}_${startDate.toISOString()}_${endDate.toISOString()}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 10)) {
      return cached.data
    }

    try {
      const transactions = await this.transactionRepository.getTransactionsByDateRange(
        workspaceId,
        startDate,
        endDate
      )

      const cashFlowData = this.calculateCashFlow(transactions, startDate, endDate)
      
      this.setCache(cacheKey, cashFlowData)
      return cashFlowData
    } catch (error) {
      throw new Error(`Failed to get cash flow data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMonthlyPredictions(
    workspaceId: string,
    monthsAhead: number = 3
  ): Promise<MonthlyPrediction[]> {
    this.validateWorkspaceId(workspaceId)

    const cacheKey = `predictions_${workspaceId}_${monthsAhead}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 30)) { // 30 minutes cache
      return cached.data
    }

    try {
      // Get historical data for prediction
      const trends = await this.getFinancialTrends(workspaceId, 12)
      
      const predictions = this.calculatePredictions(trends, monthsAhead)
      
      this.setCache(cacheKey, predictions)
      return predictions
    } catch (error) {
      throw new Error(`Failed to get monthly predictions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateTrends(transactions: any[], monthsBack: number): FinancialTrend[] {
    const trends: FinancialTrend[] = []
    const now = new Date()
    let cumulativeNet = 0

    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const net = income - expenses
      cumulativeNet += net

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const trend: FinancialTrend = {
        month: monthName,
        income,
        expenses,
        net,
        cumulativeNet
      }

      // Calculate growth rate if we have previous month data
      if (trends.length > 0) {
        const previousNet = trends[trends.length - 1].net
        if (previousNet !== 0) {
          trend.growthRate = ((net - previousNet) / Math.abs(previousNet)) * 100
        }
      }

      trends.push(trend)
    }

    return trends
  }

  private calculateCashFlow(transactions: any[], startDate: Date, endDate: Date): CashFlowData[] {
    const cashFlow: CashFlowData[] = []
    const currentDate = new Date(startDate)
    let runningBalance = 0

    while (currentDate <= endDate) {
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate)
        return transactionDate.toDateString() === currentDate.toDateString()
      })

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const net = income - expenses
      runningBalance += net

      cashFlow.push({
        date: currentDate.toISOString().split('T')[0],
        income,
        expenses,
        net,
        runningBalance
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return cashFlow
  }

  private calculatePredictions(trends: FinancialTrend[], monthsAhead: number): MonthlyPrediction[] {
    const predictions: MonthlyPrediction[] = []
    
    if (trends.length < 3) {
      // Need at least 3 months of data for prediction
      return predictions
    }

    // Calculate average growth rates
    const growthRates = trends
      .filter(t => t.growthRate !== undefined)
      .map(t => t.growthRate!)
    
    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
    
    // Calculate seasonal patterns
    const seasonalPatterns = this.calculateSeasonalPatterns(trends)
    
    const lastTrend = trends[trends.length - 1]
    let currentIncome = lastTrend.income
    let currentExpenses = lastTrend.expenses

    for (let i = 1; i <= monthsAhead; i++) {
      // Apply growth rate and seasonal adjustment
      const seasonalAdjustment = seasonalPatterns[i % 12] || 1
      
      const predictedIncome = currentIncome * (1 + avgGrowthRate / 100) * seasonalAdjustment
      const predictedExpenses = currentExpenses * (1 + avgGrowthRate / 100) * seasonalAdjustment
      const predictedNet = predictedIncome - predictedExpenses

      // Calculate confidence based on data consistency
      const confidence = Math.max(0.5, 1 - (i * 0.1)) // Confidence decreases with time

      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() + i)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      predictions.push({
        month: monthName,
        predictedIncome,
        predictedExpenses,
        predictedNet,
        confidence
      })

      currentIncome = predictedIncome
      currentExpenses = predictedExpenses
    }

    return predictions
  }

  private calculateSeasonalPatterns(trends: FinancialTrend[]): number[] {
    const seasonalPatterns: number[] = new Array(12).fill(1)
    
    if (trends.length < 12) {
      return seasonalPatterns
    }

    // Group by month and calculate average ratios
    const monthlyGroups = new Map<number, { income: number[]; expenses: number[] }>()
    
    trends.forEach(trend => {
      const month = new Date(trend.month).getMonth()
      if (!monthlyGroups.has(month)) {
        monthlyGroups.set(month, { income: [], expenses: [] })
      }
      monthlyGroups.get(month)!.income.push(trend.income)
      monthlyGroups.get(month)!.expenses.push(trend.expenses)
    })

    // Calculate seasonal factors
    monthlyGroups.forEach((data, month) => {
      const avgIncome = data.income.reduce((sum, val) => sum + val, 0) / data.income.length
      const avgExpenses = data.expenses.reduce((sum, val) => sum + val, 0) / data.expenses.length
      
      // Normalize to overall average
      const overallAvgIncome = trends.reduce((sum, t) => sum + t.income, 0) / trends.length
      const overallAvgExpenses = trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length
      
      seasonalPatterns[month] = (avgIncome + avgExpenses) / (overallAvgIncome + overallAvgExpenses)
    })

    return seasonalPatterns
  }

  clearTrendsCache(workspaceId: string): void {
    this.clearCacheByPattern(`trends_${workspaceId}`)
    this.clearCacheByPattern(`predictions_${workspaceId}`)
  }
} 