export interface Env {
  // Supabase configuration
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_KEY: string
  
  // JWT secret for additional validation
  JWT_SECRET: string
  
  // Cloudflare KV binding
  CACHE: KVNamespace
  
  // Environment
  ENVIRONMENT: 'development' | 'production'
}