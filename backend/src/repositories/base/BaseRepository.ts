import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export abstract class BaseRepository {
  protected supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  protected async paginate<T>(
    query: any,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { page, limit } = options
    const offset = (page - 1) * limit

    // Get total count
    const { count } = await query.select('*', { count: 'exact', head: true })
    
    // Get paginated data
    const { data, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(error.message)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }
  }
}