import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'
import { BaseAnalyticsService } from './BaseAnalyticsService'
import { TransactionRepository } from '../../repositories/TransactionRepository'

export interface SpendingAnalysis {
  totalSpent: number
  averageDailySpending: number
  topCategories: CategorySpending[]
  spendingTrends: SpendingTrend[]
  budgetUtilization: BudgetUtilization[]
}

export interface CategorySpending {
  category: string
  total: number
  count: number
  percentage: number
  averagePerTransaction: number
  changeFromPrevious: number
}

export interface SpendingTrend {
  period: string
  total: number
  change: number
  changePercentage: number
}

export interface BudgetUtilization {
  category: string
  budgeted: number
  spent: number
  remaining: number
  utilizationPercentage: number
  isOverBudget: boolean
}

export interface SpendingPattern {
  category: string
  monthlyAverage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonalityScore: number
  recentChangePercentage: number
}

export class SpendingAnalysisService extends BaseAnalyticsService {
  private transactionRepository: TransactionRepository

  constructor(supabase: SupabaseClient<Database>) {
    super()
    this.transactionRepository = new TransactionRepository()
  }

  async getSpendingAnalysis(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SpendingAnalysis> {
    this.validateWorkspaceId(workspaceId)
    this.validateDateRange(startDate, endDate)

    const cacheKey = `spending_analysis_${workspaceId}_${startDate.toISOString()}_${endDate.toISOString()}`
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

      const expenseTransactions = transactions.filter(t => t.type === 'expense')
      
      const analysis: SpendingAnalysis = {
        totalSpent: expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
        averageDailySpending: this.calculateAverageDailySpending(expenseTransactions, startDate, endDate),
        topCategories: this.calculateTopCategories(expenseTransactions),
        spendingTrends: this.calculateSpendingTrends(expenseTransactions, startDate, endDate),
        budgetUtilization: [] // This would be populated with budget data
      }

      this.setCache(cacheKey, analysis)
      return analysis
    } catch (error) {
      throw new Error(`Failed to get spending analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getCategoryBreakdown(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CategorySpending[]> {
    this.validateWorkspaceId(workspaceId)
    this.validateDateRange(startDate, endDate)

    const cacheKey = `category_breakdown_${workspaceId}_${startDate.toISOString()}_${endDate.toISOString()}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 15)) {
      return cached.data
    }

    try {
      const transactions = await this.transactionRepository.getTransactionsByDateRange(
        workspaceId,
        startDate,
        endDate
      )

      const expenseTransactions = transactions.filter(t => t.type === 'expense')
      const breakdown = this.calculateTopCategories(expenseTransactions)
      
      this.setCache(cacheKey, breakdown)
      return breakdown
    } catch (error) {
      throw new Error(`Failed to get category breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSpendingPatterns(
    workspaceId: string,
    monthsBack: number = 6
  ): Promise<SpendingPattern[]> {
    this.validateWorkspaceId(workspaceId)

    const cacheKey = `spending_patterns_${workspaceId}_${monthsBack}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 20)) {
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

      const expenseTransactions = transactions.filter(t => t.type === 'expense')
      const patterns = this.calculateSpendingPatterns(expenseTransactions, monthsBack)
      
      this.setCache(cacheKey, patterns)
      return patterns
    } catch (error) {
      throw new Error(`Failed to get spending patterns: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMonthlySpendingComparison(
    workspaceId: string,
    year: number
  ): Promise<Array<{ month: number; spending: number; changeFromPrevious: number }>> {
    this.validateWorkspaceId(workspaceId)

    const cacheKey = `monthly_spending_${workspaceId}_${year}`
    const cached = this.getFromCache(cacheKey)
    if (cached && this.isCacheValid(cached.timestamp, 30)) {
      return cached.data
    }

    try {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31)

      const transactions = await this.transactionRepository.getTransactionsByDateRange(
        workspaceId,
        startDate,
        endDate
      )

      const monthlySpending = this.calculateMonthlySpending(transactions, year)
      
      this.setCache(cacheKey, monthlySpending)
      return monthlySpending
    } catch (error) {
      throw new Error(`Failed to get monthly spending comparison: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateAverageDailySpending(
    transactions: any[],
    startDate: Date,
    endDate: Date
  ): number {
    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff > 0 ? totalSpent / daysDiff : 0
  }

  private calculateTopCategories(transactions: any[]): CategorySpending[] {
    const categoryMap = new Map<string, { total: number; count: number }>()
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other'
      const current = categoryMap.get(category) || { total: 0, count: 0 }
      current.total += Number(transaction.amount)
      current.count += 1
      categoryMap.set(category, current)
    })

    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
        averagePerTransaction: data.count > 0 ? data.total / data.count : 0,
        changeFromPrevious: 0 // This would need previous period data to calculate
      }))
      .sort((a, b) => b.total - a.total)
  }

  private calculateSpendingTrends(
    transactions: any[],
    startDate: Date,
    endDate: Date
  ): SpendingTrend[] {
    const trends: SpendingTrend[] = []
    
    // Group by week for trend analysis
    const weeklyGroups = new Map<string, number>()
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate)
        return transactionDate >= weekStart && transactionDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      })
      
      const weekTotal = weekTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
      weeklyGroups.set(weekKey, weekTotal)
      
      currentDate.setDate(currentDate.getDate() + 7)
    }

    let previousTotal = 0
    weeklyGroups.forEach((total, week) => {
      const change = total - previousTotal
      const changePercentage = previousTotal > 0 ? (change / previousTotal) * 100 : 0
      
      trends.push({
        period: week,
        total,
        change,
        changePercentage
      })
      
      previousTotal = total
    })

    return trends
  }

  private calculateSpendingPatterns(
    transactions: any[],
    monthsBack: number
  ): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const categoryData = new Map<string, number[]>()
    
    // Group spending by category and month
    for (let i = 0; i < monthsBack; i++) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i, 1)
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })

      monthTransactions.forEach(t => {
        const category = t.category || 'Other'
        if (!categoryData.has(category)) {
          categoryData.set(category, new Array(monthsBack).fill(0))
        }
        const monthIndex = monthsBack - 1 - i
        categoryData.get(category)![monthIndex] += Number(t.amount)
      })
    }

    // Calculate patterns for each category
    categoryData.forEach((monthlyAmounts, category) => {
      const monthlyAverage = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length
      
      // Calculate trend
      const firstHalf = monthlyAmounts.slice(0, Math.floor(monthlyAmounts.length / 2))
      const secondHalf = monthlyAmounts.slice(Math.floor(monthlyAmounts.length / 2))
      const firstHalfAvg = firstHalf.reduce((sum, amount) => sum + amount, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, amount) => sum + amount, 0) / secondHalf.length
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'increasing'
      else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'decreasing'
      
      // Calculate seasonality score
      const variance = monthlyAmounts.reduce((sum, amount) => {
        const diff = amount - monthlyAverage
        return sum + (diff * diff)
      }, 0) / monthlyAmounts.length
      
      const seasonalityScore = monthlyAverage > 0 ? (Math.sqrt(variance) / monthlyAverage) * 100 : 0
      
      // Calculate recent change percentage
      const recentChangePercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

      patterns.push({
        category,
        monthlyAverage,
        trend,
        seasonalityScore,
        recentChangePercentage
      })
    })

    return patterns.sort((a, b) => b.monthlyAverage - a.monthlyAverage)
  }

  private calculateMonthlySpending(
    transactions: any[],
    year: number
  ): Array<{ month: number; spending: number; changeFromPrevious: number }> {
    const monthlyData = new Map<number, number>()
    
    // Initialize all months
    for (let month = 0; month < 12; month++) {
      monthlyData.set(month, 0)
    }

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const month = new Date(transaction.transactionDate).getMonth()
        const current = monthlyData.get(month) || 0
        monthlyData.set(month, current + Number(transaction.amount))
      }
    })

    let previousMonthSpending = 0
    return Array.from(monthlyData.entries()).map(([month, spending]) => {
      const changeFromPrevious = previousMonthSpending > 0 ? spending - previousMonthSpending : 0
      previousMonthSpending = spending
      
      return {
        month: month + 1,
        spending,
        changeFromPrevious
      }
    })
  }

  clearSpendingCache(workspaceId: string): void {
    this.clearCacheByPattern(`spending_${workspaceId}`)
    this.clearCacheByPattern(`category_breakdown_${workspaceId}`)
    this.clearCacheByPattern(`spending_patterns_${workspaceId}`)
  }
} 