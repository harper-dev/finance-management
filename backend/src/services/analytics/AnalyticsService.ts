import { WorkspaceOverviewService } from './WorkspaceOverviewService'
import { FinancialTrendService } from './FinancialTrendService'
import { SpendingAnalysisService } from './SpendingAnalysisService'
import { ValidationUtils } from '../../utils/validation'

export class AnalyticsService {
  private workspaceOverviewService: WorkspaceOverviewService
  private financialTrendService: FinancialTrendService
  private spendingAnalysisService: SpendingAnalysisService

  constructor() {
    this.workspaceOverviewService = new WorkspaceOverviewService()
    this.financialTrendService = new FinancialTrendService()
    this.spendingAnalysisService = new SpendingAnalysisService()
  }

  // Workspace Overview Methods
  async getWorkspaceOverview(workspaceId: string) {
    return this.workspaceOverviewService.getWorkspaceOverview(workspaceId)
  }

  async getQuickStats(workspaceId: string) {
    return this.workspaceOverviewService.getQuickStats(workspaceId)
  }

  // Financial Trends Methods
  async getFinancialTrends(workspaceId: string, monthsBack: number = 12) {
    return this.financialTrendService.getFinancialTrends(workspaceId, monthsBack)
  }

  async getCashFlowData(workspaceId: string, startDate: Date, endDate: Date) {
    return this.financialTrendService.getCashFlowData(workspaceId, startDate, endDate)
  }

  async getMonthlyPredictions(workspaceId: string, monthsAhead: number = 3) {
    return this.financialTrendService.getMonthlyPredictions(workspaceId, monthsAhead)
  }

  // Spending Analysis Methods
  async getSpendingAnalysis(workspaceId: string, startDate: Date, endDate: Date) {
    return this.spendingAnalysisService.getSpendingAnalysis(workspaceId, startDate, endDate)
  }

  async getCategoryBreakdown(workspaceId: string, startDate: Date, endDate: Date) {
    return this.spendingAnalysisService.getCategoryBreakdown(workspaceId, startDate, endDate)
  }

  async getSpendingPatterns(workspaceId: string, monthsBack: number = 6) {
    return this.spendingAnalysisService.getSpendingPatterns(workspaceId, monthsBack)
  }

  async getMonthlySpendingComparison(workspaceId: string, year: number) {
    return this.spendingAnalysisService.getMonthlySpendingComparison(workspaceId, year)
  }

  // Comprehensive Analytics Dashboard
  async getAnalyticsDashboard(
    workspaceId: string,
    options: {
      includeOverview?: boolean
      includeTrends?: boolean
      includeSpending?: boolean
      monthsBack?: number
      startDate?: Date
      endDate?: Date
    } = {}
  ) {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const {
      includeOverview = true,
      includeTrends = true,
      includeSpending = true,
      monthsBack = 6,
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date()
    } = options

    try {
      const dashboard: any = {
        workspaceId,
        generatedAt: new Date(),
        summary: {}
      }

      // Execute requested analytics in parallel
      const promises: Promise<any>[] = []

      if (includeOverview) {
        promises.push(
          this.workspaceOverviewService.getQuickStats(workspaceId)
            .then(stats => ({ overview: stats }))
            .catch(() => ({ overview: null }))
        )
      }

      if (includeTrends) {
        promises.push(
          this.financialTrendService.getFinancialTrends(workspaceId, monthsBack)
            .then(trends => ({ trends }))
            .catch(() => ({ trends: null }))
        )
      }

      if (includeSpending) {
        promises.push(
          this.spendingAnalysisService.getCategoryBreakdown(workspaceId, startDate, endDate)
            .then(breakdown => ({ spending: { categoryBreakdown: breakdown } }))
            .catch(() => ({ spending: null }))
        )
      }

      const results = await Promise.all(promises)

      // Merge results
      results.forEach(result => {
        Object.assign(dashboard, result)
      })

      // Add summary statistics
      if (dashboard.overview && dashboard.trends) {
        dashboard.summary = {
          totalBalance: dashboard.overview.totalBalance,
          monthlyNet: dashboard.overview.monthlyNet,
          trendDirection: this.calculateTrendDirection(dashboard.trends),
          topSpendingCategory: dashboard.spending?.categoryBreakdown?.[0]?.category || 'N/A'
        }
      }

      return dashboard
    } catch (error) {
      throw new Error(`Failed to generate analytics dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Cache Management
  clearAllCache(workspaceId: string): void {
    this.workspaceOverviewService.clearWorkspaceCache(workspaceId)
    this.financialTrendService.clearTrendsCache(workspaceId)
    this.spendingAnalysisService.clearSpendingCache(workspaceId)
  }

  clearCacheByType(workspaceId: string, type: 'overview' | 'trends' | 'spending'): void {
    switch (type) {
      case 'overview':
        this.workspaceOverviewService.clearWorkspaceCache(workspaceId)
        break
      case 'trends':
        this.financialTrendService.clearTrendsCache(workspaceId)
        break
      case 'spending':
        this.spendingAnalysisService.clearSpendingCache(workspaceId)
        break
    }
  }

  // Utility Methods
  private calculateTrendDirection(trends: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (trends.length < 2) return 'stable'
    
    const recentTrends = trends.slice(-3) // Last 3 months
    const netChanges = recentTrends.map(t => t.net)
    
    const increasing = netChanges.filter((change, i) => i > 0 && change > netChanges[i - 1]).length
    const decreasing = netChanges.filter((change, i) => i > 0 && change < netChanges[i - 1]).length
    
    if (increasing > decreasing) return 'increasing'
    if (decreasing > increasing) return 'decreasing'
    return 'stable'
  }

  // Performance Monitoring
  async getAnalyticsPerformanceMetrics(workspaceId: string): Promise<{
    cacheHitRate: number
    averageResponseTime: number
    lastUpdated: Date
  }> {
    // This would implement actual performance monitoring
    // For now, return mock data
    return {
      cacheHitRate: 0.75,
      averageResponseTime: 150, // milliseconds
      lastUpdated: new Date()
    }
  }
} 