import { TransactionRepository } from '../repositories/TransactionRepository'
import { BaseService } from './base/BaseService'
import { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../entities'
import { ValidationUtils } from '../utils/validation'

export class TransactionService extends BaseService<Transaction> {
  private transactionRepository: TransactionRepository

  constructor() {
    const repository = new TransactionRepository()
    super(repository)
    this.transactionRepository = repository
  }

  async createTransaction(transactionData: CreateTransactionDto): Promise<Transaction> {
    // Validate required fields
    this.validateRequiredFields(transactionData, [
      'workspaceId', 'accountId', 'type', 'amount', 'currency', 'transactionDate', 'createdBy'
    ])
    
    // Validate amount
    if (!ValidationUtils.isValidAmount(transactionData.amount)) {
      throw new Error('Invalid transaction amount')
    }
    
    // Validate transaction type
    ValidationUtils.validateEnum(transactionData.type, 'type', ['income', 'expense', 'transfer'])
    
    // Validate currency
    if (!ValidationUtils.isValidCurrency(transactionData.currency)) {
      throw new Error('Invalid currency code')
    }
    
    // Validate transaction date
    if (!ValidationUtils.isValidDate(transactionData.transactionDate)) {
      throw new Error('Invalid transaction date')
    }
    
    // Validate category length if provided
    if (transactionData.category) {
      ValidationUtils.validateStringLength(transactionData.category, 'category', 1, 100)
    }
    
    // Validate description length if provided
    if (transactionData.description) {
      ValidationUtils.validateStringLength(transactionData.description, 'description', 1, 1000)
    }

    return this.transactionRepository.createTransaction(transactionData)
  }

  async updateTransaction(id: string, updates: UpdateTransactionDto): Promise<Transaction | null> {
    this.validateId(id)

    if (updates.amount !== undefined && !ValidationUtils.isValidAmount(updates.amount)) {
      throw new Error('Invalid transaction amount')
    }

    if (updates.type) {
      ValidationUtils.validateEnum(updates.type, 'type', ['income', 'expense', 'transfer'])
    }

    if (updates.currency && !ValidationUtils.isValidCurrency(updates.currency)) {
      throw new Error('Invalid currency code')
    }

    if (updates.transactionDate && !ValidationUtils.isValidDate(updates.transactionDate)) {
      throw new Error('Invalid transaction date')
    }

    if (updates.category) {
      ValidationUtils.validateStringLength(updates.category, 'category', 1, 100)
    }

    if (updates.description) {
      ValidationUtils.validateStringLength(updates.description, 'description', 1, 1000)
    }

    return this.transactionRepository.update(id, updates)
  }

  async getTransactionsByFilter(
    filter: TransactionFilterDto,
    options?: any
  ): Promise<Transaction[]> {
    return this.transactionRepository.findByFilter(filter, options)
  }

  async getTransactionsByWorkspace(
    workspaceId: string,
    options?: any
  ): Promise<Transaction[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    return this.transactionRepository.findByWorkspace(workspaceId, options)
  }

  async getTransactionsByAccount(
    accountId: string,
    options?: any
  ): Promise<Transaction[]> {
    this.validateId(accountId)
    return this.transactionRepository.findByAccount(accountId, options)
  }

  async getCurrentMonthTransactions(workspaceId: string): Promise<Transaction[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    return this.transactionRepository.getCurrentMonthTransactions(workspaceId)
  }

  async getTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    if (!ValidationUtils.isValidDate(startDate) || !ValidationUtils.isValidDate(endDate)) {
      throw new Error('Invalid date range')
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date')
    }

    return this.transactionRepository.getTransactionsByDateRange(workspaceId, startDate, endDate)
  }

  async getCategorySummary(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    if (!ValidationUtils.isValidDate(startDate) || !ValidationUtils.isValidDate(endDate)) {
      throw new Error('Invalid date range')
    }

    return this.transactionRepository.getCategorySummary(workspaceId, startDate, endDate)
  }

  async getMonthlySummary(
    workspaceId: string,
    year: number
  ): Promise<Array<{ month: number; income: number; expenses: number; net: number }>> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    if (year < 1900 || year > 2100) {
      throw new Error('Invalid year')
    }

    return this.transactionRepository.getMonthlySummary(workspaceId, year)
  }

  async deleteTransaction(id: string): Promise<boolean> {
    this.validateId(id)
    return this.transactionRepository.deleteTransaction(id)
  }

  async getTransactionSummary(workspaceId: string): Promise<{
    totalTransactions: number
    totalIncome: number
    totalExpenses: number
    netChange: number
    averageTransactionAmount: number
    mostActiveCategory: string
    mostActiveMonth: string
  }> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const currentYear = new Date().getFullYear()
    const [transactions, monthlySummary] = await Promise.all([
      this.transactionRepository.findByWorkspace(workspaceId),
      this.transactionRepository.getMonthlySummary(workspaceId, currentYear)
    ])

    const totalTransactions = transactions.length
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    
    const netChange = totalIncome - totalExpenses
    const averageTransactionAmount = totalTransactions > 0 
      ? (totalIncome + totalExpenses) / totalTransactions 
      : 0

    // Find most active category
    const categoryCount = new Map<string, number>()
    transactions.forEach(t => {
      if (t.category) {
        categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1)
      }
    })
    const mostActiveCategory = Array.from(categoryCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Other'

    // Find most active month
    const monthCount = new Map<number, number>()
    transactions.forEach(t => {
      const month = new Date(t.transactionDate).getMonth()
      monthCount.set(month, (monthCount.get(month) || 0) + 1)
    })
    const mostActiveMonth = Array.from(monthCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return {
      totalTransactions,
      totalIncome,
      totalExpenses,
      netChange,
      averageTransactionAmount,
      mostActiveCategory,
      mostActiveMonth: monthNames[mostActiveMonth]
    }
  }
}