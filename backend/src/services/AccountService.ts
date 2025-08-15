import { AccountRepository } from '../repositories/AccountRepository'
import { BaseService } from './base/BaseService'
import { Account, CreateAccountDto, UpdateAccountDto } from '../entities'
import { ValidationUtils } from '../utils/validation'

export class AccountService extends BaseService<Account> {
  private accountRepository: AccountRepository

  constructor() {
    const repository = new AccountRepository()
    super(repository)
    this.accountRepository = repository
  }

  async createAccount(accountData: CreateAccountDto): Promise<Account> {
    // Validate required fields
    this.validateRequiredFields(accountData, ['workspaceId', 'name', 'type', 'createdBy'])
    
    // Validate name length
    ValidationUtils.validateStringLength(accountData.name, 'name', 1, 100)
    
    // Validate account type
    ValidationUtils.validateEnum(accountData.type, 'type', ['cash', 'bank', 'investment', 'asset', 'debt'])
    
    // Validate currency
    if (accountData.currency && !ValidationUtils.isValidCurrency(accountData.currency)) {
      throw new Error('Invalid currency code')
    }
    
    // Validate balance
    if (accountData.balance !== undefined && !ValidationUtils.isValidAmount(accountData.balance)) {
      throw new Error('Invalid balance amount')
    }

    return this.accountRepository.create(accountData)
  }

  async updateAccount(id: string, updates: UpdateAccountDto): Promise<Account | null> {
    this.validateId(id)

    if (updates.name) {
      ValidationUtils.validateStringLength(updates.name, 'name', 1, 100)
    }

    if (updates.type) {
      ValidationUtils.validateEnum(updates.type, 'type', ['cash', 'bank', 'investment', 'asset', 'debt'])
    }

    if (updates.currency && !ValidationUtils.isValidCurrency(updates.currency)) {
      throw new Error('Invalid currency code')
    }

    if (updates.balance !== undefined && !ValidationUtils.isValidAmount(updates.balance)) {
      throw new Error('Invalid balance amount')
    }

    return this.accountRepository.update(id, updates)
  }

  async getAccountsByWorkspace(
    workspaceId: string,
    isActive?: boolean
  ): Promise<Account[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const filter: any = { workspaceId }
    if (isActive !== undefined) {
      filter.isActive = isActive
    }

    return this.accountRepository.findByFilter(filter)
  }

  async getActiveAccounts(workspaceId: string): Promise<Account[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    return this.accountRepository.findActiveAccounts(workspaceId)
  }

  async getAccountsByType(workspaceId: string, type: string): Promise<Account[]> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    ValidationUtils.validateEnum(type, 'type', ['cash', 'bank', 'investment', 'asset', 'debt'])

    return this.accountRepository.findByFilter({ workspaceId, type })
  }

  async getAccountWithTransactions(accountId: string): Promise<{
    account: Account
    transactions: any[]
  } | null> {
    this.validateId(accountId)
    return this.accountRepository.getAccountWithTransactions(accountId)
  }

  async getAccountSummary(accountId: string): Promise<{
    account: Account
    totalIncome: number
    totalExpenses: number
    netChange: number
    transactionCount: number
  } | null> {
    this.validateId(accountId)
    return this.accountRepository.getAccountSummary(accountId)
  }

  async updateBalance(accountId: string, newBalance: number): Promise<Account | null> {
    this.validateId(accountId)
    
    if (!ValidationUtils.isValidAmount(newBalance)) {
      throw new Error('Invalid balance amount')
    }

    return this.accountRepository.updateBalance(accountId, newBalance)
  }

  async deactivateAccount(accountId: string): Promise<Account | null> {
    this.validateId(accountId)
    return this.accountRepository.update(accountId, { isActive: false })
  }

  async reactivateAccount(accountId: string): Promise<Account | null> {
    this.validateId(accountId)
    return this.accountRepository.update(accountId, { isActive: true })
  }

  async getAccountsSummary(workspaceId: string): Promise<{
    totalAccounts: number
    activeAccounts: number
    totalBalance: number
    accountsByType: Record<string, { count: number; totalBalance: number }>
    currencyBreakdown: Record<string, { count: number; totalBalance: number }>
  }> {
    if (!ValidationUtils.isValidUUID(workspaceId)) {
      throw new Error('Invalid workspace ID')
    }

    const accounts = await this.accountRepository.findByFilter({ workspaceId })
    
    const totalAccounts = accounts.length
    const activeAccounts = accounts.filter(a => a.isActive).length
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

    // Group by type
    const accountsByType: Record<string, { count: number; totalBalance: number }> = {}
    accounts.forEach(account => {
      const type = account.type
      if (!accountsByType[type]) {
        accountsByType[type] = { count: 0, totalBalance: 0 }
      }
      accountsByType[type].count++
      accountsByType[type].totalBalance += Number(account.balance)
    })

    // Group by currency
    const currencyBreakdown: Record<string, { count: number; totalBalance: number }> = {}
    accounts.forEach(account => {
      const currency = account.currency
      if (!currencyBreakdown[currency]) {
        currencyBreakdown[currency] = { count: 0, totalBalance: 0 }
      }
      currencyBreakdown[currency].count++
      currencyBreakdown[currency].totalBalance += Number(account.balance)
    })

    return {
      totalAccounts,
      activeAccounts,
      totalBalance,
      accountsByType,
      currencyBreakdown
    }
  }
}