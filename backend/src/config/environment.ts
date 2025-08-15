export interface EnvironmentConfig {
  nodeEnv: string
  port: number
  supabase: {
    url: string
    key: string
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  logging: {
    level: string
    enableFileLogging: boolean
    logDirectory: string
  }
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3002'),
    supabase: {
      url: process.env.SUPABASE_URL || '',
      key: process.env.SUPABASE_ANON_KEY || '',
      host: process.env.SUPABASE_HOST || 'localhost',
      port: parseInt(process.env.SUPABASE_PORT || '5432'),
      user: process.env.SUPABASE_USER || 'postgres',
      password: process.env.SUPABASE_PASSWORD || '',
      database: process.env.SUPABASE_DB || 'postgres'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
      logDirectory: process.env.LOG_DIRECTORY || 'logs'
    }
  }
}

export const isDevelopment = (): boolean => {
  return getEnvironmentConfig().nodeEnv === 'development'
}

export const isProduction = (): boolean => {
  return getEnvironmentConfig().nodeEnv === 'production'
} 