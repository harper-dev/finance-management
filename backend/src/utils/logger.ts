// 检查是否在 Cloudflare Workers 环境中
const isCloudflareWorkers = typeof globalThis !== 'undefined' && 'Cloudflare' in globalThis;

// 日志级别定义
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// 简单的控制台日志格式
function formatLogMessage(level: string, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

// 创建简单的 logger 对象
const simpleLogger = {
  error: (message: string, meta?: any) => {
    console.error(formatLogMessage('ERROR', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatLogMessage('WARN', message, meta));
  },
  info: (message: string, meta?: any) => {
    console.info(formatLogMessage('INFO', message, meta));
  },
  http: (message: string, meta?: any) => {
    console.log(formatLogMessage('HTTP', message, meta));
  },
  verbose: (message: string, meta?: any) => {
    console.log(formatLogMessage('VERBOSE', message, meta));
  },
  debug: (message: string, meta?: any) => {
    console.log(formatLogMessage('DEBUG', message, meta));
  },
  silly: (message: string, meta?: any) => {
    console.log(formatLogMessage('SILLY', message, meta));
  }
};

// 导出 logger 实例
export const logger = simpleLogger;
export const httpLogger = simpleLogger;
export const dbLogger = simpleLogger;
export const authLogger = simpleLogger;

// 扩展 logger 对象
export const extendedLogger = {
  // 基本日志方法
  error: (message: string, meta?: any) => simpleLogger.error(message, meta),
  warn: (message: string, meta?: any) => simpleLogger.warn(message, meta),
  info: (message: string, meta?: any) => simpleLogger.info(message, meta),
  http: (message: string, meta?: any) => simpleLogger.http(message, meta),
  verbose: (message: string, meta?: any) => simpleLogger.verbose(message, meta),
  debug: (message: string, meta?: any) => simpleLogger.debug(message, meta),
  silly: (message: string, meta?: any) => simpleLogger.silly(message, meta),

  // HTTP 请求日志
  logRequest: (method: string, url: string, duration: number, statusCode: number, userAgent?: string, ip?: string) => {
    const level = statusCode >= 400 ? 'warn' : 'info';
    simpleLogger[level === 'warn' ? 'warn' : 'info']('HTTP Request', {
      method,
      url,
      duration: `${duration}ms`,
      statusCode,
      userAgent,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  // 数据库操作日志
  logDbOperation: (operation: string, table: string, duration: number, success: boolean, error?: string, query?: string) => {
    const level = success ? 'info' : 'error';
    simpleLogger[level === 'error' ? 'error' : 'info']('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      error,
      query,
      timestamp: new Date().toISOString()
    });
  },

  // 认证事件日志
  logAuthEvent: (event: string, userId: string, success: boolean, ip?: string, userAgent?: string) => {
    const level = success ? 'info' : 'warn';
    simpleLogger[level === 'warn' ? 'warn' : 'info']('Authentication Event', {
      event,
      userId,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  // 业务操作日志
  logBusinessEvent: (event: string, userId: string, workspaceId: string, details: any) => {
    simpleLogger.info('Business Event', {
      event,
      userId,
      workspaceId,
      details,
      timestamp: new Date().toISOString()
    });
  },

  // 性能监控日志
  logPerformance: (operation: string, duration: number, metadata?: any) => {
    const level = duration > 1000 ? 'warn' : 'info';
    simpleLogger[level === 'warn' ? 'warn' : 'info']('Performance', {
      operation,
      duration: `${duration}ms`,
      metadata,
      timestamp: new Date().toISOString()
    });
  }
}; 