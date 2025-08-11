import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Transaction, CreateTransaction, UpdateTransaction, TransactionFilter } from '../entities'
import { TransactionRepository, AccountRepository, WorkspaceRepository } from '../repositories'
import { PaginationOptions, PaginatedResult } from '../repositories/base/BaseRepository'

export class TransactionService {
  private transactionRepo: TransactionRepository
  private accountRepo: AccountRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.transactionRepo = new TransactionRepository(supabase)
    this.accountRepo = new AccountRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getTransactions(
    workspaceId: string,
    userId: string,
    filters?: TransactionFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Transaction> | Transaction[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const filter = {
      workspace_id: workspaceId,
      ...filters
    }

    return await this.transactionRepo.findMany(filter, pagination)
  }

  async getTransactionById(transactionId: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findById(transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    await this.checkWorkspaceAccess(transaction.workspace_id, userId)
    return transaction
  }

  async createTransaction(transactionData: CreateTransaction, userId: string): Promise<Transaction> {
    await this.checkWorkspaceAccess(transactionData.workspace_id, userId)

    // Verify account exists and belongs to workspace
    const account = await this.accountRepo.findById(transactionData.account_id)
    if (!account) {
      throw new Error('Account not found')
    }
    if (account.workspace_id !== transactionData.workspace_id) {
      throw new Error('Account does not belong to this workspace')
    }

    // Create transaction
    const transaction = await this.transactionRepo.create({
      ...transactionData,
      created_by: userId
    })

    // Update account balance
    await this.updateAccountBalance(transactionData.account_id, transactionData.amount, transactionData.type)

    return transaction
  }

  async updateTransaction(transactionId: string, updates: UpdateTransaction, userId: string): Promise<Transaction> {
    const existingTransaction = await this.transactionRepo.findById(transactionId)
    if (!existingTransaction) {
      throw new Error('Transaction not found')
    }

    await this.checkWorkspaceAccess(existingTransaction.workspace_id, userId)

    // If account is changing, verify new account
    if (updates.account_id && updates.account_id !== existingTransaction.account_id) {
      const newAccount = await this.accountRepo.findById(updates.account_id)
      if (!newAccount) {
        throw new Error('New account not found')
      }
      if (newAccount.workspace_id !== existingTransaction.workspace_id) {
        throw new Error('New account does not belong to this workspace')
      }

      // Reverse old transaction effect
      await this.reverseAccountBalance(
        existingTransaction.account_id,
        existingTransaction.amount,
        existingTransaction.type
      )

      // Apply new transaction effect
      const newAmount = updates.amount ?? existingTransaction.amount
      const newType = updates.type ?? existingTransaction.type
      await this.updateAccountBalance(updates.account_id, newAmount, newType)
    } else if (updates.amount !== undefined || updates.type !== undefined) {
      // If amount or type changed but account is same
      const oldAccount = existingTransaction.account_id

      // Reverse old transaction
      await this.reverseAccountBalance(
        existingTransaction.account_id,
        existingTransaction.amount,
        existingTransaction.type
      )

      // Apply new transaction
      const newAmount = updates.amount ?? existingTransaction.amount
      const newType = updates.type ?? existingTransaction.type
      await this.updateAccountBalance(oldAccount, newAmount, newType)
    }

    return await this.transactionRepo.update(transactionId, updates)
  }

  async deleteTransaction(transactionId: string, userId: string): Promise<void> {
    const transaction = await this.transactionRepo.findById(transactionId)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    await this.checkWorkspaceAccess(transaction.workspace_id, userId)

    // Reverse the balance effect
    await this.reverseAccountBalance(transaction.account_id, transaction.amount, transaction.type)

    // Delete the transaction
    await this.transactionRepo.delete(transactionId)
  }

  async createBulkTransactions(transactions: CreateTransaction[], userId: string): Promise<Transaction[]> {
    if (transactions.length === 0) {
      return []
    }

    // Verify all transactions belong to workspaces user has access to
    const workspaceIds = [...new Set(transactions.map(t => t.workspace_id))]
    for (const workspaceId of workspaceIds) {
      await this.checkWorkspaceAccess(workspaceId, userId)
    }

    // Verify all accounts exist and belong to their respective workspaces
    const accountIds = [...new Set(transactions.map(t => t.account_id))]
    const accounts = await Promise.all(
      accountIds.map(id => this.accountRepo.findById(id))
    )

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i]
      const account = accounts.find(a => a?.id === transaction.account_id)
      
      if (!account) {
        throw new Error(`Account not found for transaction ${i + 1}`)
      }
      if (account.workspace_id !== transaction.workspace_id) {
        throw new Error(`Account does not belong to workspace for transaction ${i + 1}`)
      }
    }

    // Add created_by to all transactions
    const transactionsWithCreator = transactions.map(t => ({
      ...t,
      created_by: userId
    }))

    return await this.transactionRepo.createMany(transactionsWithCreator)
  }

  async getSpendingByCategory(
    workspaceId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{category: string, amount: number, count: number, percentage: number}>> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    
    const spending = await this.transactionRepo.getSpendingByCategory(workspaceId, startDate, endDate)
    const totalAmount = spending.reduce((sum, item) => sum + item.amount, 0)

    return spending.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
    }))
  }

  async getIncomeByCategory(
    workspaceId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{category: string, amount: number, count: number, percentage: number}>> {
    await this.checkWorkspaceAccess(workspaceId, userId)
    
    const income = await this.transactionRepo.getIncomeByCategory(workspaceId, startDate, endDate)
    const totalAmount = income.reduce((sum, item) => sum + item.amount, 0)

    return income.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
    }))
  }

  private async updateAccountBalance(accountId: string, amount: number, type: string): Promise<void> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) return

    let newBalance = account.balance

    switch (type) {
      case 'income':
        newBalance += amount
        break
      case 'expense':
        newBalance -= amount
        break
      // For transfers, we handle them at the service level with two transactions
    }

    await this.accountRepo.updateBalance(accountId, newBalance)
  }

  private async reverseAccountBalance(accountId: string, amount: number, type: string): Promise<void> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) return

    let newBalance = account.balance

    switch (type) {
      case 'income':
        newBalance -= amount
        break
      case 'expense':
        newBalance += amount
        break
    }

    await this.accountRepo.updateBalance(accountId, newBalance)
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }
  }
}