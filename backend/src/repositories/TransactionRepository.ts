import { Repository, FindOptionsWhere, FindManyOptions, Between } from 'typeorm'
import { Transaction } from '../entities/Transaction'
import { Account } from '../entities/Account'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../entities'

export class TransactionRepository extends BaseRepository<Transaction> {
  private accountRepository: Repository<Account>

  constructor() {
    super(Transaction)
    this.accountRepository = AppDataSource.getRepository(Account)
  }

  async findByFilter(
    filter: TransactionFilterDto,
    options?: FindManyOptions<Transaction>
  ): Promise<Transaction[]> {
    const where: FindOptionsWhere<Transaction> = {}

    if (filter.accountId) {
      where.accountId = filter.accountId
    }

    if (filter.type) {
      where.type = filter.type
    }

    if (filter.category) {
      where.category = filter.category
    }

    if (filter.startDate && filter.endDate) {
      where.transactionDate = Between(filter.startDate, filter.endDate)
    }

    if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
      if (filter.minAmount !== undefined && filter.maxAmount !== undefined) {
        where.amount = Between(filter.minAmount, filter.maxAmount) as any
      } else if (filter.minAmount !== undefined) {
        where.amount = { gte: filter.minAmount } as any
      } else if (filter.maxAmount !== undefined) {
        where.amount = { lte: filter.maxAmount } as any
      }
    }

    return this.repository.find({
      where,
      order: { transactionDate: 'DESC' },
      ...options
    })
  }

  async findByWorkspace(
    workspaceId: string,
    options?: FindManyOptions<Transaction>
  ): Promise<Transaction[]> {
    return this.repository.find({
      where: { workspaceId },
      order: { transactionDate: 'DESC' },
      ...options
    })
  }

  async findByAccount(
    accountId: string,
    options?: FindManyOptions<Transaction>
  ): Promise<Transaction[]> {
    return this.repository.find({
      where: { accountId },
      order: { transactionDate: 'DESC' },
      ...options
    })
  }

  async getCurrentMonthTransactions(workspaceId: string): Promise<Transaction[]> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return this.repository.find({
      where: {
        workspaceId,
        transactionDate: Between(startOfMonth, endOfMonth)
      },
      order: { transactionDate: 'DESC' }
    })
  }

  async getTransactionsByDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.repository.find({
      where: {
        workspaceId,
        transactionDate: Between(startDate, endDate)
      },
      order: { transactionDate: 'DESC' }
    })
  }

  async getCategorySummary(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    const transactions = await this.getTransactionsByDateRange(workspaceId, startDate, endDate)
    
    const categoryMap = new Map<string, { total: number; count: number }>()
    
    transactions.forEach(transaction => {
      if (transaction.category) {
        const existing = categoryMap.get(transaction.category) || { total: 0, count: 0 }
        existing.total += Number(transaction.amount)
        existing.count += 1
        categoryMap.set(transaction.category, existing)
      }
    })

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    }))
  }

  async getMonthlySummary(
    workspaceId: string,
    year: number
  ): Promise<Array<{ month: number; income: number; expenses: number; net: number }>> {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    const transactions = await this.getTransactionsByDateRange(workspaceId, startDate, endDate)
    
    const monthlyData = new Map<number, { income: number; expenses: number }>()
    
    // Initialize all months
    for (let month = 0; month < 12; month++) {
      monthlyData.set(month, { income: 0, expenses: 0 })
    }

    transactions.forEach(transaction => {
      const month = transaction.transactionDate.getMonth()
      const current = monthlyData.get(month)!
      
      if (transaction.type === 'income') {
        current.income += Number(transaction.amount)
      } else if (transaction.type === 'expense') {
        current.expenses += Number(transaction.amount)
      }
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month: month + 1,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }))
  }

  async createTransaction(
    transactionData: CreateTransactionDto
  ): Promise<Transaction> {
    // Validate account exists and belongs to workspace
    const account = await this.accountRepository.findOne({
      where: { id: transactionData.accountId, workspaceId: transactionData.workspaceId }
    })

    if (!account) {
      throw new Error('Account not found or does not belong to workspace')
    }

    // Create transaction
    const transaction = await this.create(transactionData)

    // Update account balance
    if (transaction.type === 'income') {
      account.balance = Number(account.balance) + Number(transaction.amount)
    } else if (transaction.type === 'expense') {
      account.balance = Number(account.balance) - Number(transaction.amount)
    }

    await this.accountRepository.save(account)

    return transaction
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transaction = await this.findById(id)
    if (!transaction) return false

    // Update account balance
    const account = await this.accountRepository.findOne({
      where: { id: transaction.accountId }
    })

    if (account) {
      if (transaction.type === 'income') {
        account.balance = Number(account.balance) - Number(transaction.amount)
      } else if (transaction.type === 'expense') {
        account.balance = Number(account.balance) + Number(transaction.amount)
      }
      await this.accountRepository.save(account)
    }

    return this.delete(id)
  }
}