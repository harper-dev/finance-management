import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Account, CreateAccount, UpdateAccount } from '../entities'
import { BaseRepository, PaginationOptions, PaginatedResult } from './base/BaseRepository'

export interface AccountFilter {
  workspace_id: string
  is_active?: boolean
  type?: string
}

export class AccountRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findMany(
    filter: AccountFilter,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Account> | Account[]> {
    let query = this.supabase
      .from('accounts')
      .select('*')
      .eq('workspace_id', filter.workspace_id)
      .order('created_at', { ascending: false })

    if (filter.is_active !== undefined) {
      query = query.eq('is_active', filter.is_active)
    }

    if (filter.type) {
      query = query.eq('type', filter.type)
    }

    if (pagination) {
      return await this.paginate<Account>(query, pagination)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item))
  }

  async findById(id: string): Promise<Account | null> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async create(account: CreateAccount): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .insert([account])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async update(id: string, updates: UpdateAccount): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async updateBalance(id: string, balance: number): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update({ balance })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async softDelete(id: string): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async getBalanceHistory(accountId: string, days: number = 30): Promise<Array<{date: string, balance: number}>> {
    const { data, error } = await this.supabase
      .rpc('get_account_balance_history', {
        account_id: accountId,
        days_back: days
      })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async recalculateBalance(accountId: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('calculate_account_balance', { account_id: accountId })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  private mapToEntity(data: any): Account {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      name: data.name,
      type: data.type,
      currency: data.currency,
      balance: parseFloat(data.balance),
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }
  }
}