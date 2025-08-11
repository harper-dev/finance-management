import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { UserProfile, CreateUserProfile, UpdateUserProfile } from '../entities'
import { BaseRepository } from './base/BaseRepository'

export class UserProfileRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async create(profile: CreateUserProfile): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async update(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async delete(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  private mapToEntity(data: any): UserProfile {
    return {
      id: data.id,
      user_id: data.user_id,
      display_name: data.display_name,
      preferred_currency: data.preferred_currency,
      timezone: data.timezone,
      language: data.language,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }
  }
}