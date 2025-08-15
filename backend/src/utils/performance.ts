export interface PerformanceMetrics {
  operation: string
  startTime: number
  endTime: number
  duration: number
  memoryUsage?: NodeJS.MemoryUsage
  success: boolean
  error?: string
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private isEnabled: boolean = true

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startOperation(operation: string): string {
    if (!this.isEnabled) return ''
    
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    
    this.metrics.push({
      operation,
      startTime,
      endTime: 0,
      duration: 0,
      success: false
    })
    
    return operationId
  }

  endOperation(operationId: string, success: boolean = true, error?: string): void {
    if (!this.isEnabled || !operationId) return
    
    const metric = this.metrics.find(m => m.operation === operationId.split('_')[0])
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      metric.success = success
      metric.error = error
      metric.memoryUsage = process.memoryUsage()
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getMetricsByOperation(operation: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.operation === operation)
  }

  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetricsByOperation(operation)
    if (operationMetrics.length === 0) return 0
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalDuration / operationMetrics.length
  }

  getSuccessRate(operation: string): number {
    const operationMetrics = this.getMetricsByOperation(operation)
    if (operationMetrics.length === 0) return 0
    
    const successful = operationMetrics.filter(m => m.success).length
    return successful / operationMetrics.length
  }

  clearMetrics(): void {
    this.metrics = []
  }

  enable(): void {
    this.isEnabled = true
  }

  disable(): void {
    this.isEnabled = false
  }

  isMonitoringEnabled(): boolean {
    return this.isEnabled
  }
}

export class QueryOptimizer {
  static optimizeQuery(query: any, options: {
    maxResults?: number
    enableCache?: boolean
    cacheTTL?: number
  } = {}): any {
    const { maxResults = 1000, enableCache = true, cacheTTL = 300 } = options
    
    // Add pagination if not present
    if (!query.take && maxResults) {
      query.take = maxResults
    }
    
    // Add cache options
    if (enableCache) {
      query.cache = {
        id: `query_${Date.now()}`,
        milliseconds: cacheTTL * 1000
      }
    }
    
    return query
  }

  static createIndexedQuery(table: string, columns: string[], conditions: any = {}): any {
    return {
      table,
      columns,
      conditions,
      useIndex: true,
      optimize: true
    }
  }
}

export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private static maxSize = 1000

  static set(key: string, data: any, ttlSeconds: number = 300): void {
    // Clean up expired entries
    this.cleanup()
    
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  static has(key: string): boolean {
    return this.get(key) !== null
  }

  static delete(key: string): boolean {
    return this.cache.delete(key)
  }

  static clear(): void {
    this.cache.clear()
  }

  static size(): number {
    return this.cache.size
  }

  private static cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export class DatabaseOptimizer {
  static async optimizeQueries(queries: any[]): Promise<any[]> {
    // Group similar queries
    const groupedQueries = this.groupSimilarQueries(queries)
    
    // Optimize each group
    return groupedQueries.map(group => this.optimizeQueryGroup(group))
  }

  private static groupSimilarQueries(queries: any[]): any[][] {
    const groups: any[][] = []
    
    queries.forEach(query => {
      const groupKey = this.getQueryGroupKey(query)
      let group = groups.find(g => this.getQueryGroupKey(g[0]) === groupKey)
      
      if (!group) {
        group = []
        groups.push(group)
      }
      
      group.push(query)
    })
    
    return groups
  }

  private static getQueryGroupKey(query: any): string {
    return `${query.table || 'unknown'}_${query.operation || 'unknown'}`
  }

  private static optimizeQueryGroup(queries: any[]): any {
    if (queries.length === 1) return queries[0]
    
    // Merge similar queries
    const baseQuery = { ...queries[0] }
    
    // Combine conditions
    const allConditions = queries.flatMap(q => q.conditions || [])
    baseQuery.conditions = this.mergeConditions(allConditions)
    
    // Optimize for bulk operations
    baseQuery.bulk = true
    baseQuery.optimized = true
    
    return baseQuery
  }

  private static mergeConditions(conditions: any[]): any {
    // Simple condition merging - in a real implementation, this would be more sophisticated
    return conditions.reduce((merged, condition) => {
      return { ...merged, ...condition }
    }, {})
  }
}

// Performance decorator for methods
export function measurePerformance(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance()
      const operation = operationName || `${target.constructor.name}.${propertyName}`
      const operationId = monitor.startOperation(operation)
      
      try {
        const result = await method.apply(this, args)
        monitor.endOperation(operationId, true)
        return result
      } catch (error) {
        monitor.endOperation(operationId, false, error instanceof Error ? error.message : 'Unknown error')
        throw error
      }
    }
  }
} 