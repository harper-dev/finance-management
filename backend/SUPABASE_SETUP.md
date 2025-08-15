# Supabase 认证和数据库设置指南

## 概述

本后端使用 Supabase 进行：
1. **用户认证**：登录、注册、登出、令牌刷新
2. **数据库存储**：所有数据存储在 Supabase 的 `public` schema 中

## 环境变量配置

在 `.env` 文件中添加以下 Supabase 配置：

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Supabase Database Connection (for TypeORM)
SUPABASE_HOST=db.your-project.supabase.co
SUPABASE_PORT=5432
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your_database_password_here
SUPABASE_DB=postgres
```

## 获取 Supabase 配置

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择或创建项目
3. 进入项目设置 (Settings) > API
4. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_KEY`

5. 进入项目设置 (Settings) > Database
6. 复制以下信息：
   - **Host** → `SUPABASE_HOST` (通常是 `db.your-project.supabase.co`)
   - **Database password** → `SUPABASE_PASSWORD`
   - **Port** → `SUPABASE_PORT` (通常是 5432)

## 数据库 Schema

后端使用 Supabase 中的 `public` schema，包含以下表：

- `user_profiles` - 用户档案
- `workspaces` - 工作空间
- `workspace_members` - 工作空间成员
- `accounts` - 账户
- `transactions` - 交易记录
- `budgets` - 预算
- `savings_goals` - 储蓄目标
- `user_settings` - 用户设置

## 认证流程

### 1. 用户注册
- 端点：`POST /api/v1/auth/register`
- 功能：在 Supabase 中创建用户账户，并在 `public` schema 中创建用户档案
- 请求体：
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "display_name": "User Name"
  }
  ```

### 2. 用户登录
- 端点：`POST /api/v1/auth/login`
- 功能：验证用户凭据，返回用户信息和会话令牌
- 请求体：
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### 3. 用户登出
- 端点：`POST /api/v1/auth/logout`
- 功能：使当前会话失效
- 需要：`Authorization: Bearer <token>` 头部

### 4. 令牌刷新
- 端点：`POST /api/v1/auth/refresh`
- 功能：使用刷新令牌获取新的访问令牌
- 请求体：
  ```json
  {
    "refresh_token": "your_refresh_token"
  }
  ```

### 5. 用户档案管理
- 获取档案：`GET /api/v1/auth/profile`
- 创建档案：`POST /api/v1/auth/profile`
- 更新档案：`PUT /api/v1/auth/profile`

## 数据库连接

后端使用 TypeORM 直接连接到 Supabase 的 PostgreSQL 数据库：

- **连接方式**：PostgreSQL 直接连接
- **Schema**：`public`
- **SSL**：启用（Supabase 要求）
- **认证**：用户名/密码认证

## 安全特性

- 密码在 Supabase 中安全存储
- JWT 令牌用于会话管理
- 自动令牌刷新
- 安全的登出机制
- 数据库连接使用 SSL 加密

## 错误处理

系统会返回详细的错误信息，包括：
- 验证错误 (422)
- 认证错误 (401)
- 服务器错误 (500)
- Supabase 配置错误
- 数据库连接错误

## 测试

### 1. 测试注册
```bash
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","display_name":"Test User"}'
```

### 2. 测试登录
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. 测试登出
```bash
curl -X POST http://localhost:3002/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 注意事项

1. **环境变量**：确保 `.env` 文件中的 Supabase 配置正确
2. **网络访问**：确保服务器可以访问 Supabase API 和数据库
3. **数据库权限**：确保数据库用户有访问 `public` schema 的权限
4. **SSL 连接**：Supabase 要求 SSL 连接
5. **错误日志**：检查控制台输出以获取详细的错误信息

## 故障排除

### 常见错误

1. **"Supabase configuration is missing"**
   - 检查 `.env` 文件中的 Supabase 配置
   - 确保环境变量已正确加载

2. **"Invalid credentials"**
   - 检查用户名和密码
   - 确保用户已在 Supabase 中注册

3. **"Authentication service is not configured"**
   - 检查 Supabase URL 和密钥是否正确
   - 确保网络连接正常

4. **"Database connection failed"**
   - 检查数据库连接参数
   - 确保数据库密码正确
   - 检查网络连接和防火墙设置

### 调试步骤

1. 检查环境变量是否正确加载
2. 验证 Supabase 项目配置
3. 检查网络连接
4. 查看服务器控制台输出
5. 检查 Supabase Dashboard 中的用户管理
6. 验证数据库连接参数

## 迁移和 Schema 管理

如果需要创建或更新数据库表，可以使用现有的迁移文件：

```bash
# 查看迁移状态
npm run migrate status

# 运行迁移
npm run migrate up

# 标记迁移为已完成
npm run migrate mark <migration_id>
```

迁移文件位于 `src/migrations/` 目录中，包含完整的数据库 schema 定义。 