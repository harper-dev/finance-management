import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Account, CreateAccount, UpdateAccount } from '../entities'
import { AccountRepository, WorkspaceRepository } from '../repositories'
import { PaginationOptions, PaginatedResult } from '../repositories/base/BaseRepository'

export class AccountService {
  private accountRepo: AccountRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.accountRepo = new AccountRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getAccounts(
    workspaceId: string,
    userId: string,
    filters?: { is_active?: boolean; type?: string },
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Account> | Account[]> {
    await this.checkWorkspaceAccess(workspaceId, userId)

    const filter = {
      workspace_id: workspaceId,
      ...filters
    }

    return await this.accountRepo.findMany(filter, pagination)
  }

  async getAccountById(accountId: string, userId: string): Promise<Account> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.checkWorkspaceAccess(account.workspace_id, userId)
    return account
  }

  async createAccount(accountData: CreateAccount, userId: string): Promise<Account> {
    await this.checkWorkspaceAccess(accountData.workspace_id, userId)

    return await this.accountRepo.create({
      ...accountData,
      created_by: userId
    })
  }

  async updateAccount(accountId: string, updates: UpdateAccount, userId: string): Promise<Account> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.checkWorkspaceAccess(account.workspace_id, userId)
    return await this.accountRepo.update(accountId, updates)
  }

  async deleteAccount(accountId: string, userId: string): Promise<Account> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.checkWorkspaceAccess(account.workspace_id, userId)
    
    // Soft delete to preserve transaction history
    return await this.accountRepo.softDelete(accountId)
  }

  async getBalanceHistory(accountId: string, userId: string, days: number = 30): Promise<Array<{date: string, balance: number}>> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.checkWorkspaceAccess(account.workspace_id, userId)
    return await this.accountRepo.getBalanceHistory(accountId, days)
  }

  async recalculateAccountBalance(accountId: string, userId: string): Promise<number> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.checkWorkspaceAccess(account.workspace_id, userId)
    const newBalance = await this.accountRepo.recalculateBalance(accountId)
    
    // Update the account with the recalculated balance
    await this.accountRepo.updateBalance(accountId, newBalance)
    
    return newBalance
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }
  }
}