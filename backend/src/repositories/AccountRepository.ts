import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { Account } from '../entities/Account'
import { Transaction } from '../entities/Transaction'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateAccountDto, UpdateAccountDto } from '../entities'

export interface AccountFilter {
  workspaceId: string
  isActive?: boolean
  type?: string
}

export class AccountRepository extends BaseRepository<Account> {
  private transactionRepository: Repository<Transaction>

  constructor() {
    super(Account)
    this.transactionRepository = AppDataSource.getRepository(Transaction)
  }

  async findByFilter(
    filter: AccountFilter,
    options?: FindManyOptions<Account>
  ): Promise<Account[]> {
    const where: FindOptionsWhere<Account> = {
      workspaceId: filter.workspaceId
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive
    }

    if (filter.type) {
      where.type = filter.type as any
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findActiveAccounts(workspaceId: string): Promise<Account[]> {
    return this.findByFilter({ workspaceId, isActive: true })
  }

  async updateBalance(accountId: string, newBalance: number): Promise<Account | null> {
    return this.update(accountId, { balance: newBalance })
  }

  async getAccountWithTransactions(accountId: string): Promise<{
    account: Account
    transactions: Transaction[]
  } | null> {
    const account = await this.findById(accountId)
    if (!account) return null

    const transactions = await this.transactionRepository.find({
      where: { accountId },
      order: { transactionDate: 'DESC' },
      take: 50 // Limit to last 50 transactions
    })

    return { account, transactions }
  }

  async getAccountSummary(accountId: string): Promise<{
    account: Account
    totalIncome: number
    totalExpenses: number
    netChange: number
    transactionCount: number
  } | null> {
    const account = await this.findById(accountId)
    if (!account) return null

    const transactions = await this.transactionRepository.find({
      where: { accountId }
    })

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netChange = totalIncome - totalExpenses
    const transactionCount = transactions.length

    return {
      account,
      totalIncome,
      totalExpenses,
      netChange,
      transactionCount
    }
  }
}