# Winston 日志系统使用说明

## 概述

后端应用现在使用 **Winston** 作为日志系统，这是一个功能强大、可扩展的 Node.js 日志库。Winston 提供了更好的性能、更多的功能和更好的可维护性。

## 特性

- 🚀 **高性能**: Winston 是 Node.js 生态中最快的日志库之一
- 📁 **自动文件轮转**: 按日期和大小自动轮转日志文件
- 🎨 **彩色控制台输出**: 开发环境下提供彩色日志输出
- 📊 **结构化日志**: JSON 格式的日志，便于解析和分析
- 🔄 **多种传输方式**: 支持文件、控制台、HTTP 等多种输出
- ⚙️ **灵活配置**: 通过环境变量轻松配置

## 安装的依赖

```bash
npm install winston winston-daily-rotate-file
```

## 配置

### 环境变量

可以通过以下环境变量配置日志系统：

```bash
# 日志级别: error, warn, info, http, verbose, debug, silly
LOG_LEVEL=info

# 是否启用控制台日志
LOG_ENABLE_CONSOLE=true

# 是否启用文件日志
LOG_ENABLE_FILE=true

# 日志目录
LOG_DIR=logs

# 最大日志文件大小 (支持: 10m, 100k, 1g 等)
LOG_MAX_FILE_SIZE=10m

# 最大日志文件数量
LOG_MAX_FILES=14

# 是否启用请求日志
LOG_ENABLE_REQUESTS=true

# 是否启用数据库操作日志
LOG_ENABLE_DB=true

# 是否启用认证日志
LOG_ENABLE_AUTH=true

# 是否启用业务事件日志
LOG_ENABLE_BUSINESS=true

# 是否启用性能监控日志
LOG_ENABLE_PERFORMANCE=true

# Winston 特定配置
LOG_SHOW_TIMESTAMP=true
LOG_SHOW_SERVICE=true
LOG_SHOW_STACK=true
LOG_RETENTION_DAYS=14
LOG_COMPRESS_OLD=true
LOG_CLEAN_OLD=true
```

### 默认配置

如果没有设置环境变量，系统将使用以下默认值：

- 日志级别：`info`
- 控制台日志：启用（开发环境）
- 文件日志：启用
- 日志目录：`logs/`
- 最大文件大小：`10m`
- 最大文件数量：`14` 个
- 文件保留天数：`14` 天

## 日志级别

Winston 使用标准的日志级别，从低到高：

### SILLY (0)
- 最详细的调试信息
- 通常只在开发时使用

### DEBUG (1)
- 详细的调试信息
- 请求开始和结束
- 数据库查询详情

### VERBOSE (2)
- 详细的执行信息
- 函数调用和返回值

### HTTP (3)
- HTTP 请求和响应信息
- 网络相关的日志

### INFO (4) - 默认级别
- 一般信息
- 成功的操作
- 请求统计

### WARN (5)
- 警告信息
- 非关键错误
- 性能问题

### ERROR (6)
- 错误信息
- 操作失败
- 异常详情

## 日志文件

### 文件类型

系统会创建以下类型的日志文件：

1. **`combined-YYYY-MM-DD.log`** - 所有级别的日志
2. **`error-YYYY-MM-DD.log`** - 只包含错误级别的日志
3. **`http-YYYY-MM-DD.log`** - HTTP 请求相关的日志
4. **`database-YYYY-MM-DD.log`** - 数据库操作日志
5. **`auth-YYYY-MM-DD.log`** - 认证相关日志

### 文件轮转

- **按日期轮转**: 每天创建新的日志文件
- **按大小轮转**: 当文件大小超过限制时自动轮转
- **自动清理**: 保留指定数量的历史文件
- **可选压缩**: 可以压缩旧的日志文件

### 日志格式

#### 文件格式
```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "Transaction created successfully",
  "service": "finance-management-api",
  "userId": "123",
  "workspaceId": "456",
  "transactionId": "789",
  "amount": 100,
  "type": "expense",
  "duration": "45ms"
}
```

#### 控制台格式
```
10:30:45 info Transaction created successfully | {"userId":"123","workspaceId":"456","transactionId":"789","amount":100,"type":"expense","duration":"45ms"}
```

## 使用方法

### 在代码中使用日志

```typescript
import { extendedLogger } from '../utils/logger';

// 基本日志方法
extendedLogger.error('Failed to create user', { error: 'Email already exists' });
extendedLogger.warn('Database connection slow', { duration: '2000ms' });
extendedLogger.info('User logged in successfully', { userId: '123' });
extendedLogger.http('HTTP request completed', { method: 'POST', url: '/api/users' });
extendedLogger.verbose('Function called', { functionName: 'createUser', params: { email: 'user@example.com' } });
extendedLogger.debug('Processing request', { requestId: 'req-123' });
extendedLogger.silly('Very detailed debug info');

// 特殊日志方法
extendedLogger.logRequest('POST', '/api/users', 150, 201, 'Mozilla/5.0...', '192.168.1.1');
extendedLogger.logDbOperation('INSERT', 'users', 45, true, undefined, 'INSERT INTO users...');
extendedLogger.logAuthEvent('login', 'user123', true, '192.168.1.1', 'Mozilla/5.0...');
extendedLogger.logBusinessEvent('user_registered', 'user123', 'workspace456', { plan: 'premium' });
extendedLogger.logPerformance('database_query', 250, { table: 'users', operation: 'SELECT' });
```

### 日志中间件

日志中间件自动记录所有 HTTP 请求：

- 请求开始和结束时间
- 请求方法和 URL
- 响应状态码
- 请求持续时间
- 用户代理和 IP 地址

### 数据库操作日志

自动记录数据库操作：

- 操作类型（SELECT, INSERT, UPDATE, DELETE）
- 表名
- 操作持续时间
- 成功/失败状态
- 错误信息（如果有）
- SQL 查询（可选）

### 认证事件日志

记录认证相关事件：

- 登录/登出
- 用户 ID
- 成功/失败状态
- IP 地址
- 用户代理

### 业务事件日志

记录重要的业务操作：

- 事件类型
- 用户 ID
- 工作区 ID
- 详细信息

### 性能监控日志

记录性能相关的信息：

- 操作名称
- 执行时间
- 元数据
- 自动标记慢操作（>1秒）

## 性能考虑

- **异步写入**: 日志写入是异步的，不会阻塞主线程
- **缓冲机制**: Winston 使用内部缓冲来提高性能
- **文件 I/O 优化**: 使用流式写入和适当的缓冲大小
- **可配置级别**: 可以通过环境变量调整日志详细程度

## 故障排除

### 日志文件不创建
- 检查 `LOG_DIR` 环境变量
- 确保应用有写入权限
- 检查磁盘空间
- 验证 Winston 依赖是否正确安装

### 日志级别不正确
- 验证 `LOG_LEVEL` 环境变量值
- 确保值是小写的（error, warn, info, http, verbose, debug, silly）
- 检查 Winston 配置

### 日志文件过大
- 调整 `LOG_MAX_FILE_SIZE` 环境变量
- 减少 `LOG_MAX_FILES` 值
- 启用压缩：`LOG_COMPRESS_OLD=true`

### 性能问题
- 降低日志级别
- 禁用不必要的日志类型
- 调整文件轮转设置

## 示例配置

### 开发环境
```bash
LOG_LEVEL=debug
LOG_ENABLE_CONSOLE=true
LOG_ENABLE_FILE=true
LOG_ENABLE_REQUESTS=true
LOG_ENABLE_DB=true
LOG_ENABLE_AUTH=true
LOG_ENABLE_BUSINESS=true
LOG_ENABLE_PERFORMANCE=true
LOG_SHOW_TIMESTAMP=true
LOG_SHOW_COLORS=true
```

### 生产环境
```bash
LOG_LEVEL=warn
LOG_ENABLE_CONSOLE=false
LOG_ENABLE_FILE=true
LOG_ENABLE_REQUESTS=true
LOG_ENABLE_DB=false
LOG_ENABLE_AUTH=true
LOG_ENABLE_BUSINESS=true
LOG_ENABLE_PERFORMANCE=true
LOG_COMPRESS_OLD=true
LOG_CLEAN_OLD=true
```

### 测试环境
```bash
LOG_LEVEL=error
LOG_ENABLE_CONSOLE=true
LOG_ENABLE_FILE=false
LOG_ENABLE_REQUESTS=false
LOG_ENABLE_DB=false
LOG_ENABLE_AUTH=false
LOG_ENABLE_BUSINESS=false
LOG_ENABLE_PERFORMANCE=false
```

## 迁移说明

如果你之前使用的是自定义日志系统，迁移到 Winston 只需要：

1. 安装依赖：`npm install winston winston-daily-rotate-file`
2. 更新导入：`import { extendedLogger } from '../utils/logger'`
3. 替换日志调用：`logger.info()` → `extendedLogger.info()`

Winston 提供了更好的性能和更多的功能，同时保持了简单的 API。 