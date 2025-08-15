import { ValidationUtils } from '../../utils/validation'

export abstract class BaseAnalyticsService {
  // Simple in-memory cache implementation
  private cache = new Map<string, { data: any; timestamp: number }>()

  protected getFromCache(key: string): { data: any; timestamp: number } | null {
    return this.cache.get(key) || null
  }

  protected setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  protected isCacheValid(timestamp: number, maxAgeMinutes: number): boolean {
    const maxAge = maxAgeMinutes * 60 * 1000 // Convert to milliseconds
    return Date.now() - timestamp < maxAge
  }

  protected validateWorkspaceId(workspaceId: string): void {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }
  }

  protected validateDateRange(startDate: Date, endDate: Date): void {
    if (!ValidationUtils.isValidDate(startDate) || !ValidationUtils.isValidDate(endDate)) {
      throw new Error('Invalid date range')
    }
    if (startDate > endDate) {
      throw new Error('Start date must be before end date')
    }
  }

  protected getPeriodDates(period: 'month' | 'quarter' | 'year'): { startDate: Date; endDate: Date } {
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

  protected clearCache(): void {
    this.cache.clear()
  }

  protected clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
} 