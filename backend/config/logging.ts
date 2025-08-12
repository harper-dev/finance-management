export const loggingConfig = {
  // 日志级别: error, warn, info, http, verbose, debug, silly
  level: process.env.LOG_LEVEL || 'info',
  
  // 是否启用控制台日志
  enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
  
  // 是否启用文件日志
  enableFile: process.env.LOG_ENABLE_FILE !== 'false',
  
  // 日志目录
  logDir: process.env.LOG_DIR || 'logs',
  
  // 最大日志文件大小 (默认: 10m)
  maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10m',
  
  // 最大日志文件数量
  maxFiles: process.env.LOG_MAX_FILES || '14',
  
  // 日志格式
  format: process.env.LOG_FORMAT || 'json', // 'json' 或 'text'
  
  // 是否启用请求日志
  enableRequestLogging: process.env.LOG_ENABLE_REQUESTS !== 'false',
  
  // 是否启用数据库操作日志
  enableDbLogging: process.env.LOG_ENABLE_DB !== 'false',
  
  // 是否启用认证日志
  enableAuthLogging: process.env.LOG_ENABLE_AUTH !== 'false',
  
  // 是否启用业务事件日志
  enableBusinessLogging: process.env.LOG_ENABLE_BUSINESS !== 'false',
  
  // 是否启用性能监控日志
  enablePerformanceLogging: process.env.LOG_ENABLE_PERFORMANCE !== 'false',
  
  // Winston 特定配置
  winston: {
    // 是否在开发环境下显示颜色
    enableColors: process.env.NODE_ENV !== 'production',
    
    // 是否显示时间戳
    showTimestamp: process.env.LOG_SHOW_TIMESTAMP !== 'false',
    
    // 是否显示服务名称
    showServiceName: process.env.LOG_SHOW_SERVICE !== 'false',
    
    // 是否记录错误堆栈
    showStack: process.env.LOG_SHOW_STACK !== 'false',
    
    // 日志文件保留天数
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '14'),
    
    // 是否压缩旧日志文件
    compressOldLogs: process.env.LOG_COMPRESS_OLD === 'true',
    
    // 日志轮转时间模式
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    
    // 是否在启动时清理旧日志
    cleanOldLogs: process.env.LOG_CLEAN_OLD === 'true'
  }
}; 