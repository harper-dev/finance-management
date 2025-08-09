import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Env } from '../types/env'

let supabaseClient: SupabaseClient<Database> | null = null

export function getSupabaseClient(env: Env): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          },
        },
      }
    )
  }
  
  return supabaseClient
}

export function getSupabaseClientWithAuth(env: Env, token: string): SupabaseClient<Database> {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      },
    }
  )
}