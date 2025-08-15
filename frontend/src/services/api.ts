import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { authService } from '@/services/auth'
import { errorReportingService } from '@/services/errorReporting'
import type {
  ApiResponse,
  PaginationResponse,
  UserProfile,
  Workspace,
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  OverviewAnalytics,
  SpendingAnalytics,
  IncomeAnalytics,
  TrendsAnalytics,
  CreateWorkspaceData,
  CreateAccountData,
  CreateTransactionData,
  CreateBudgetData,
  CreateSavingsGoalData,
  UserSettings,
  UpdateUserSettingsData,
  UpdateWorkspaceSettingsData
} from '@/types/api'

// Enhanced error types for better error handling
export interface ApiError {
  type: string
  message: string
  details?: any
  timestamp: string
  request_id?: string
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public data?: any,
    public isRetryable: boolean = true
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class OfflineError extends Error {
  constructor(message: string = 'You appear to be offline. Please check your internet connection.') {
    super(message)
    this.name = 'OfflineError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Retry configuration interface
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryCondition?: (error: Error) => boolean
}

class ApiClient {
  private client: AxiosInstance
  private isOnline: boolean = navigator.onLine
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error: Error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return error instanceof NetworkError || 
             error instanceof TimeoutError ||
             error instanceof OfflineError ||
             (error instanceof NetworkError && error.status && error.status >= 500)
    }
  }

  constructor() {
    const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api/v1'
    
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    this.setupOfflineDetection()
    
    // Initialize online status properly
    this.isOnline = navigator.onLine
    console.log('API Client initialized with online status:', this.isOnline)
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          isOnline: this.isOnline,
          navigatorOnline: navigator.onLine
        })
        
        // Check if offline before making request
        if (!this.isOnline) {
          console.log('Request blocked - API client thinks we are offline')
          console.log('navigator.onLine:', navigator.onLine)
          console.log('this.isOnline:', this.isOnline)
          // Don't block the request, just log the warning
          // return Promise.reject(new OfflineError())
        }

        // Add auth token to requests
        const token = authService.getToken()
        if (token && token.trim() !== '') {
          config.headers.Authorization = `Bearer ${token}`
          console.log('Adding auth token to request:', {
            url: config.url,
            token: `${token.substring(0, 20)}...`,
            hasToken: true,
            tokenLength: token.length
          })
        } else {
          console.warn('No valid auth token available for request:', {
            url: config.url,
            hasToken: false,
            token: token,
            localStorage: {
              auth_token: !!localStorage.getItem('auth_token'),
              refresh_token: !!localStorage.getItem('refresh_token')
            }
          })
          
          // For protected endpoints, reject the request if no token
          if (config.url && (
            config.url.includes('/workspaces') ||
            config.url.includes('/accounts') ||
            config.url.includes('/transactions') ||
            config.url.includes('/budgets') ||
            config.url.includes('/savings-goals') ||
            config.url.includes('/analytics')
          )) {
            console.error('Protected endpoint requested without token, rejecting request')
            return Promise.reject(new Error('Authentication required'))
          }
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID()

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor with enhanced error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          method: response.config.method?.toUpperCase()
        })
        return response
      },
      async (error: AxiosError) => {
        console.error('API Response Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          data: error.response?.data
        })
        
        const enhancedError = this.handleApiError(error)
        
        // Report network errors to monitoring service
        if (error.config) {
          errorReportingService.reportNetworkError(
            error.config.url || 'unknown',
            error.config.method?.toUpperCase() || 'unknown',
            error.response?.status,
            error.response?.statusText,
            typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data)
          )
        }

        return Promise.reject(enhancedError)
      }
    )
  }

  /**
   * Setup offline/online detection
   */
  private setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('Connection restored - API client online')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('Connection lost - API client offline')
    })
    
    // Log initial state
    console.log('Initial navigator.onLine:', navigator.onLine)
    console.log('Initial API client isOnline:', this.isOnline)
  }

  /**
   * Enhanced error handling for API responses
   */
  private handleApiError(error: AxiosError): Error {
    // Check if offline first, but be less aggressive
    if (!this.isOnline && !navigator.onLine) {
      console.log('Both API client and navigator think we are offline')
      return new OfflineError()
    }

    // Network error (no response)
    if (!error.response) {
      // Timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return new TimeoutError('Request timed out. Please check your connection and try again.')
      }
      
      // Network connection errors
      if (error.code === 'NETWORK_ERROR' || 
          error.code === 'ERR_NETWORK' ||
          error.message.includes('Network Error') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        return new NetworkError('Network connection failed. Please check your internet connection.', undefined, undefined, undefined, true)
      }

      // Connection refused/unavailable
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ERR_CONNECTION_REFUSED' ||
          error.message.includes('Connection refused')) {
        return new NetworkError('Unable to connect to server. Please try again later.', undefined, undefined, undefined, true)
      }

      // DNS resolution errors
      if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo ENOTFOUND')) {
        return new NetworkError('Server not found. Please check your connection.', undefined, undefined, undefined, true)
      }

      // Generic network error
      return new NetworkError('Network error occurred. Please try again.', undefined, undefined, undefined, true)
    }

    const { status, data } = error.response
    const apiError = data as { error?: ApiError }

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        if (apiError.error?.type === 'VALIDATION_ERROR') {
          return new ValidationError(
            apiError.error.message || 'Validation failed',
            apiError.error.details?.fieldErrors || apiError.error.details?.errors
          )
        }
        return new Error(apiError.error?.message || 'Bad request')

      case 401:
        // Token expired or invalid, logout user
        setTimeout(() => {
          authService.logout()
          window.location.href = '/login'
        }, 100)
        return new AuthenticationError(apiError.error?.message || 'Authentication required. Please log in again.')

      case 403:
        return new AuthorizationError(apiError.error?.message || 'You do not have permission to perform this action.')

      case 404:
        return new Error(apiError.error?.message || 'The requested resource was not found.')

      case 409:
        return new ValidationError(
          apiError.error?.message || 'Conflict: Resource already exists or has been modified.',
          apiError.error?.details?.fieldErrors
        )

      case 422:
        return new ValidationError(
          apiError.error?.message || 'Validation failed',
          apiError.error?.details?.fieldErrors || apiError.error?.details?.errors
        )

      case 429:
        return new NetworkError('Too many requests. Please wait a moment and try again.', status, error.response.statusText, undefined, true)

      case 500:
        return new NetworkError('Internal server error. Please try again later.', status, error.response.statusText, undefined, true)

      case 502:
        return new NetworkError('Bad gateway. The server is temporarily unavailable.', status, error.response.statusText, undefined, true)

      case 503:
        return new NetworkError('Service unavailable. Please try again later.', status, error.response.statusText, undefined, true)

      case 504:
        return new NetworkError('Gateway timeout. The server took too long to respond.', status, error.response.statusText, undefined, true)

      default:
        const isRetryable = status >= 500 || status === 408 || status === 429
        return new NetworkError(
          apiError.error?.message || `Request failed with status ${status}`,
          status,
          error.response.statusText,
          undefined,
          isRetryable
        )
    }
  }

  /**
   * Enhanced retry mechanism with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.retryConfig, ...config }
    let lastError: Error

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on authentication/authorization errors
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          throw error
        }

        // Don't retry on validation errors (4xx client errors)
        if (error instanceof ValidationError) {
          throw error
        }

        // Check if error is retryable
        const shouldRetry = retryConfig.retryCondition ? 
          retryConfig.retryCondition(lastError) : 
          this.isRetryableError(lastError)

        if (!shouldRetry || attempt >= retryConfig.maxRetries) {
          throw error
        }

        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = retryConfig.baseDelay * Math.pow(2, attempt - 1)
        const jitter = Math.random() * 0.1 * exponentialDelay // Add up to 10% jitter
        const delay = Math.min(exponentialDelay + jitter, retryConfig.maxDelay)

        console.log(`Retrying request (attempt ${attempt}/${retryConfig.maxRetries}) after ${Math.round(delay)}ms`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    if (error instanceof NetworkError) {
      return error.isRetryable
    }
    
    if (error instanceof TimeoutError || error instanceof OfflineError) {
      return true
    }

    return false
  }

  /**
   * Make a request with automatic retry logic
   */
  private async makeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    return this.retryRequest(async () => {
      const response = await requestFn()
      return response.data
    }, retryConfig)
  }

  /**
   * Check if the client is online
   */
  public isClientOnline(): boolean {
    return this.isOnline
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Testing API connection...')
      console.log('Base URL:', this.client.defaults.baseURL)
      console.log('isOnline:', this.isOnline)
      console.log('navigator.onLine:', navigator.onLine)
      
      const response = await this.client.get('/workspaces')
      return { 
        success: true, 
        message: 'Connection successful',
        details: { status: response.status, data: response.data }
      }
    } catch (error) {
      console.error('API connection test failed:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    }
  }

  /**
   * Get current retry configuration
   */
  public getRetryConfig(): RetryConfig {
    return { ...this.retryConfig }
  }

  /**
   * Update retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config }
  }

  // Note: Auth endpoints are now handled by authService

  // Workspaces endpoints
  async getWorkspaces(): Promise<Workspace[]> {
    const response: AxiosResponse<ApiResponse<Workspace[]>> = 
      await this.client.get('/workspaces')
    return response.data.data!
  }

  async getWorkspace(id: string): Promise<Workspace> {
    const response: AxiosResponse<ApiResponse<Workspace>> = 
      await this.client.get(`/workspaces/${id}`)
    return response.data.data!
  }

  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    const response: AxiosResponse<ApiResponse<Workspace>> = 
      await this.client.post('/workspaces', data)
    return response.data.data!
  }

  async updateWorkspace(id: string, data: Partial<CreateWorkspaceData>): Promise<Workspace> {
    const response: AxiosResponse<ApiResponse<Workspace>> = 
      await this.client.put(`/workspaces/${id}`, data)
    return response.data.data!
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.client.delete(`/workspaces/${id}`)
  }

  async inviteToWorkspace(workspaceId: string, email: string, role: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.client.post(`/workspaces/${workspaceId}/invite`, { email, role })
    return response.data.data!
  }

  // Accounts endpoints
  async getAccounts(workspaceId: string, page: number = 1, limit: number = 20): Promise<Account[]> {
    const response: AxiosResponse<ApiResponse<{ data: Account[]; pagination: any }>> = 
      await this.client.get('/accounts', { 
        params: { workspace_id: workspaceId, page, limit } 
      })
    return response.data.data!.data
  }

  async getAccount(id: string): Promise<Account> {
    const response: AxiosResponse<ApiResponse<Account>> = 
      await this.client.get(`/accounts/${id}`)
    return response.data.data!
  }

  async createAccount(data: CreateAccountData): Promise<Account> {
    const response: AxiosResponse<ApiResponse<Account>> = 
      await this.client.post('/accounts', data)
    return response.data.data!
  }

  async updateAccount(id: string, data: Partial<CreateAccountData>): Promise<Account> {
    const response: AxiosResponse<ApiResponse<Account>> = 
      await this.client.put(`/accounts/${id}`, data)
    return response.data.data!
  }

  async deleteAccount(id: string): Promise<void> {
    await this.client.delete(`/accounts/${id}`)
  }

  // Transactions endpoints
  async getTransactions(
    workspaceId: string,
    options?: {
      page?: number
      limit?: number
      account_id?: string
      category?: string
      type?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<PaginationResponse<Transaction>> {
    const response: AxiosResponse<ApiResponse<{ transactions: Transaction[]; pagination: any }>> = 
      await this.client.get('/transactions', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    return {
      data: response.data.data!.transactions,
      pagination: response.data.data!.pagination
    }
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response: AxiosResponse<ApiResponse<Transaction>> = 
      await this.client.get(`/transactions/${id}`)
    return response.data.data!
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response: AxiosResponse<ApiResponse<Transaction>> = 
      await this.client.post('/transactions', data)
    return response.data.data!
  }

  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response: AxiosResponse<ApiResponse<Transaction>> = 
      await this.client.put(`/transactions/${id}`, data)
    return response.data.data!
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.client.delete(`/transactions/${id}`)
  }

  async bulkCreateTransactions(workspaceId: string, transactions: CreateTransactionData[]): Promise<{ transactions: Transaction[]; count: number }> {
    const response: AxiosResponse<ApiResponse<{ transactions: Transaction[]; count: number }>> = 
      await this.client.post('/transactions/bulk', { 
        transactions, 
        workspace_id: workspaceId 
      })
    return response.data.data!
  }

  // Budgets endpoints
  async getBudgets(
    workspaceId: string,
    options?: {
      page?: number
      limit?: number
      is_active?: boolean
      period?: string
    }
  ): Promise<PaginationResponse<Budget>> {
    const response: AxiosResponse<ApiResponse<{ budgets: Budget[]; pagination: any }>> = 
      await this.client.get('/budgets', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    return {
      data: response.data.data!.budgets,
      pagination: response.data.data!.pagination
    }
  }

  async getBudget(id: string): Promise<Budget> {
    const response: AxiosResponse<ApiResponse<Budget>> = 
      await this.client.get(`/budgets/${id}`)
    return response.data.data!
  }

  async createBudget(workspaceId: string, data: CreateBudgetData): Promise<Budget> {
    const response: AxiosResponse<ApiResponse<Budget>> = 
      await this.client.post('/budgets', data, { 
        params: { workspace_id: workspaceId } 
      })
    return response.data.data!
  }

  async updateBudget(id: string, data: Partial<CreateBudgetData>): Promise<Budget> {
    const response: AxiosResponse<ApiResponse<Budget>> = 
      await this.client.put(`/budgets/${id}`, data)
    return response.data.data!
  }

  async deleteBudget(id: string): Promise<void> {
    await this.client.delete(`/budgets/${id}`)
  }

  // Savings Goals endpoints
  async getSavingsGoals(
    workspaceId: string,
    options?: {
      page?: number
      limit?: number
      is_active?: boolean
      category?: string
    }
  ): Promise<PaginationResponse<SavingsGoal>> {
    const response: AxiosResponse<ApiResponse<{ savings_goals: SavingsGoal[]; pagination: any }>> = 
      await this.client.get('/savings-goals', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    return {
      data: response.data.data!.savings_goals,
      pagination: response.data.data!.pagination
    }
  }

  async getSavingsGoal(id: string): Promise<SavingsGoal> {
    const response: AxiosResponse<ApiResponse<SavingsGoal>> = 
      await this.client.get(`/savings-goals/${id}`)
    return response.data.data!
  }

  async createSavingsGoal(workspaceId: string, data: CreateSavingsGoalData): Promise<SavingsGoal> {
    const response: AxiosResponse<ApiResponse<SavingsGoal>> = 
      await this.client.post('/savings-goals', data, { 
        params: { workspace_id: workspaceId } 
      })
    return response.data.data!
  }

  async updateSavingsGoal(id: string, data: Partial<CreateSavingsGoalData>): Promise<SavingsGoal> {
    const response: AxiosResponse<ApiResponse<SavingsGoal>> = 
      await this.client.put(`/savings-goals/${id}`, data)
    return response.data.data!
  }

  async addMoneyToSavingsGoal(id: string, amount: number): Promise<SavingsGoal> {
    const response: AxiosResponse<ApiResponse<SavingsGoal>> = 
      await this.client.post(`/savings-goals/${id}/add-money`, { amount })
    return response.data.data!
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    await this.client.delete(`/savings-goals/${id}`)
  }

  // Analytics endpoints
  async getOverviewAnalytics(workspaceId: string): Promise<OverviewAnalytics> {
    return this.makeRequest(async () => {
      return this.client.get<ApiResponse<OverviewAnalytics>>('/analytics/overview', { 
        params: { workspace_id: workspaceId } 
      })
    }).then(response => response.data!)
  }

  async getSpendingAnalytics(
    workspaceId: string,
    options?: {
      period?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<SpendingAnalytics> {
    return this.makeRequest(async () => {
      return this.client.get<ApiResponse<SpendingAnalytics>>('/analytics/spending', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    }).then(response => response.data!)
  }

  async getIncomeAnalytics(
    workspaceId: string,
    options?: {
      period?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<IncomeAnalytics> {
    return this.makeRequest(async () => {
      return this.client.get<ApiResponse<IncomeAnalytics>>('/analytics/income', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    }).then(response => response.data!)
  }

  async getTrendsAnalytics(workspaceId: string, months: number = 12): Promise<TrendsAnalytics> {
    return this.makeRequest(async () => {
      return this.client.get<ApiResponse<TrendsAnalytics>>('/analytics/trends', { 
        params: { workspace_id: workspaceId, months } 
      })
    }).then(response => response.data!)
  }

  // Settings endpoints
  async getUserSettings(): Promise<UserSettings> {
    return this.makeRequest(async () => {
      return this.client.get<ApiResponse<UserSettings>>('/settings/user')
    }).then(response => response.data!)
  }

  async updateUserSettings(data: UpdateUserSettingsData): Promise<UserSettings> {
    return this.makeRequest(async () => {
      return this.client.put<ApiResponse<UserSettings>>('/settings/user', data)
    }, { maxRetries: 2 }).then(response => response.data!) // Fewer retries for mutations
  }

  async updateWorkspaceSettings(workspaceId: string, data: UpdateWorkspaceSettingsData): Promise<Workspace> {
    return this.makeRequest(async () => {
      return this.client.put<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, data)
    }, { maxRetries: 2 }).then(response => response.data!) // Fewer retries for mutations
  }
}

export const apiClient = new ApiClient()

// Export a simplified api object for form components
export const api = {
  getAccounts: (workspaceId: string) => apiClient.getAccounts(workspaceId),
  createAccount: (data: CreateAccountData) => apiClient.createAccount(data),
  updateAccount: (id: string, data: Partial<CreateAccountData>) => apiClient.updateAccount(id, data),
  getTransactions: (workspaceId: string, options?: any) => apiClient.getTransactions(workspaceId, options),
  createTransaction: (data: CreateTransactionData) => apiClient.createTransaction(data),
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => apiClient.updateTransaction(id, data),
}

export default apiClient