import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { authService } from '@/services/auth'
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
  CreateSavingsGoalData
} from '@/types/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    })

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, logout user
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error)
      }
    )
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
    const response: AxiosResponse<ApiResponse<OverviewAnalytics>> = 
      await this.client.get('/analytics/overview', { 
        params: { workspace_id: workspaceId } 
      })
    return response.data.data!
  }

  async getSpendingAnalytics(
    workspaceId: string,
    options?: {
      period?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<SpendingAnalytics> {
    const response: AxiosResponse<ApiResponse<SpendingAnalytics>> = 
      await this.client.get('/analytics/spending', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    return response.data.data!
  }

  async getIncomeAnalytics(
    workspaceId: string,
    options?: {
      period?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<IncomeAnalytics> {
    const response: AxiosResponse<ApiResponse<IncomeAnalytics>> = 
      await this.client.get('/analytics/income', { 
        params: { workspace_id: workspaceId, ...options } 
      })
    return response.data.data!
  }

  async getTrendsAnalytics(workspaceId: string, months: number = 12): Promise<TrendsAnalytics> {
    const response: AxiosResponse<ApiResponse<TrendsAnalytics>> = 
      await this.client.get('/analytics/trends', { 
        params: { workspace_id: workspaceId, months } 
      })
    return response.data.data!
  }
}

export const apiClient = new ApiClient()

// Export a simplified api object for form components
export const api = {
  getAccounts: (workspaceId: string) => apiClient.getAccounts(workspaceId),
  createAccount: (data: CreateAccountData) => apiClient.createAccount(data),
  updateAccount: (id: string, data: Partial<CreateAccountData>) => apiClient.updateAccount(id, data),
  createTransaction: (data: CreateTransactionData) => apiClient.createTransaction(data),
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => apiClient.updateTransaction(id, data),
}

export default apiClient