import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Transaction, CreateTransaction, UpdateTransaction, TransactionFilter } from '../entities'
import { BaseRepository, PaginationOptions, PaginatedResult } from './base/BaseRepository'

export interface TransactionQuery extends TransactionFilter {
  workspace_id: string
}

export class TransactionRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findMany(
    filter: TransactionQuery,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Transaction> | Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select(`
        *,
        accounts (
          id,
          name,
          type
        )
      `)
      .eq('workspace_id', filter.workspace_id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filter.account_id) {
      query = query.eq('account_id', filter.account_id)
    }

    if (filter.type) {
      query = query.eq('type', filter.type)
    }

    if (filter.category) {
      query = query.eq('category', filter.category)
    }

    if (filter.start_date) {
      query = query.gte('transaction_date', filter.start_date.toISOString().split('T')[0])
    }

    if (filter.end_date) {
      query = query.lte('transaction_date', filter.end_date.toISOString().split('T')[0])
    }

    if (filter.min_amount !== undefined) {
      query = query.gte('amount', filter.min_amount)
    }

    if (filter.max_amount !== undefined) {
      query = query.lte('amount', filter.max_amount)
    }

    if (pagination) {
      return await this.paginate<Transaction>(query, pagination)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item))
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        accounts (
          id,
          name,
          type,
          currency
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async create(transaction: CreateTransaction): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([{
        ...transaction,
        transaction_date: transaction.transaction_date.toISOString().split('T')[0]
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async createMany(transactions: CreateTransaction[]): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(transactions.map(t => ({
        ...t,
        transaction_date: t.transaction_date.toISOString().split('T')[0]
      })))
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item))
  }

  async update(id: string, updates: UpdateTransaction): Promise<Transaction> {
    const updateData: any = { ...updates }
    if (updates.transaction_date) {
      updateData.transaction_date = updates.transaction_date.toISOString().split('T')[0]
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .update(updateData)
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
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async getSpendingByCategory(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{category: string, amount: number, count: number}>> {
    let query = this.supabase
      .from('transactions')
      .select('category, amount')
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .not('category', 'is', null)

    if (startDate) {
      query = query.gte('transaction_date', startDate.toISOString().split('T')[0])
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const categoryTotals = new Map<string, {amount: number, count: number}>()
    
    data.forEach(transaction => {
      const category = transaction.category || 'Other'
      const current = categoryTotals.get(category) || {amount: 0, count: 0}
      categoryTotals.set(category, {
        amount: current.amount + parseFloat(transaction.amount.toString()),
        count: current.count + 1
      })
    })

    return Array.from(categoryTotals.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    }))
  }

  async getIncomeByCategory(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{category: string, amount: number, count: number}>> {
    let query = this.supabase
      .from('transactions')
      .select('category, amount')
      .eq('workspace_id', workspaceId)
      .eq('type', 'income')
      .not('category', 'is', null)

    if (startDate) {
      query = query.gte('transaction_date', startDate.toISOString().split('T')[0])
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const categoryTotals = new Map<string, {amount: number, count: number}>()
    
    data.forEach(transaction => {
      const category = transaction.category || 'Other'
      const current = categoryTotals.get(category) || {amount: 0, count: 0}
      categoryTotals.set(category, {
        amount: current.amount + parseFloat(transaction.amount.toString()),
        count: current.count + 1
      })
    })

    return Array.from(categoryTotals.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    }))
  }

  private mapToEntity(data: any): Transaction {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      account_id: data.account_id,
      type: data.type,
      amount: parseFloat(data.amount),
      currency: data.currency,
      category: data.category,
      description: data.description,
      transaction_date: new Date(data.transaction_date),
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }
  }
}