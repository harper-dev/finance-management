// Export all analytics services
export { AnalyticsService } from './AnalyticsService'
export { WorkspaceOverviewService } from './WorkspaceOverviewService'
export { FinancialTrendService } from './FinancialTrendService'
export { SpendingAnalysisService } from './SpendingAnalysisService'
export { BaseAnalyticsService } from './BaseAnalyticsService'

// Export interfaces
export type {
  WorkspaceOverview,
  AccountSummary,
  BudgetSummary,
  SavingsGoalSummary
} from './WorkspaceOverviewService'

export type {
  FinancialTrend,
  CashFlowData,
  MonthlyPrediction
} from './FinancialTrendService'

export type {
  SpendingAnalysis,
  CategorySpending,
  SpendingTrend,
  BudgetUtilization,
  SpendingPattern
} from './SpendingAnalysisService' 