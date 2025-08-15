import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create Winston logger
export const logger = winston.createLogger({
  level: 'error', // Set to error to ensure all error logs are captured
  format: logFormat,
  defaultMeta: { service: 'finance-management-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: 'info', // Console shows info and above
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${level}]: ${message}`
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`
          }
          return log
        })
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: 'info', // Combined log shows info and above
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error', // Only errors
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Daily rotate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, `error-${new Date().toISOString().split('T')[0]}.log`),
      level: 'error', // Only errors
      maxsize: 5242880, // 5MB
      maxFiles: 30,
      tailable: true
    })
  ]
})

// Create specialized loggers
export const httpLogger = winston.createLogger({
  level: 'http',
  format: logFormat,
  defaultMeta: { service: 'finance-management-backend', category: 'http' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

export const dbLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'finance-management-backend', category: 'database' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'database.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

export const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'finance-management-backend', category: 'authentication' },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'auth.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

// Extended logger with file logging
export const extendedLogger = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta)
    console.error(`[ERROR] ${message}`, meta)
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta)
    console.warn(`[WARN] ${message}`, meta)
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta)
    console.info(`[INFO] ${message}`, meta)
  },
  
  http: (message: string, meta?: any) => {
    httpLogger.http(message, meta)
    console.log(`[HTTP] ${message}`, meta)
  },
  
  verbose: (message: string, meta?: any) => {
    logger.verbose(message, meta)
    console.log(`[VERBOSE] ${message}`, meta)
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta)
    console.log(`[DEBUG] ${message}`, meta)
  },
  
  silly: (message: string, meta?: any) => {
    logger.silly(message, meta)
    console.log(`[SILLY] ${message}`, meta)
  },

  // HTTP 请求日志
  logRequest: (method: string, url: string, duration: number, statusCode: number, userAgent?: string, ip?: string) => {
    const level = statusCode >= 400 ? 'warn' : 'info'
    const meta = {
      method,
      url,
      duration: `${duration}ms`,
      statusCode,
      userAgent,
      ip,
      timestamp: new Date().toISOString()
    }
    
    if (level === 'warn') {
      httpLogger.warn('HTTP Request', meta)
    } else {
      httpLogger.info('HTTP Request', meta)
    }
  },

  // 数据库操作日志
  logDbOperation: (operation: string, table: string, duration: number, success: boolean, error?: string, query?: string) => {
    const level = success ? 'info' : 'error'
    const meta = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      error,
      query,
      timestamp: new Date().toISOString()
    }
    
    if (level === 'error') {
      dbLogger.error('Database Operation', meta)
    } else {
      dbLogger.info('Database Operation', meta)
    }
  },

  // 认证事件日志
  logAuthEvent: (event: string, userId: string, success: boolean, ip?: string, userAgent?: string) => {
    const level = success ? 'info' : 'warn'
    const meta = {
      event,
      userId,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }
    
    if (level === 'warn') {
      authLogger.warn('Authentication Event', meta)
    } else {
      authLogger.info('Authentication Event', meta)
    }
  },

  // 业务操作日志
  logBusinessEvent: (event: string, userId: string, workspaceId: string, details: any) => {
    logger.info('Business Event', {
      event,
      userId,
      workspaceId,
      details,
      timestamp: new Date().toISOString()
    })
  },

  // 性能监控日志
  logPerformance: (operation: string, duration: number, metadata?: any) => {
    const level = duration > 1000 ? 'warn' : 'info'
    const meta = {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    }
    
    if (level === 'warn') {
      logger.warn('Performance', meta)
    } else {
      logger.info('Performance', meta)
    }
  }
}

// Export default logger
export default logger 