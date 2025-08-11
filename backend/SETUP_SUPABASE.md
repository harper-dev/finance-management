# 🚀 Supabase 设置指南

## 📋 第一步: 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 选择组织和设置项目信息：
   - **项目名称**: finance-management (或你喜欢的名称)
   - **数据库密码**: 设置一个强密码（请记住这个密码）
   - **区域**: 选择离你最近的区域
4. 点击 "Create new project" 并等待项目创建完成

## 🔑 第二步: 获取 API 密钥

项目创建完成后：

1. 在项目面板中，点击左侧菜单的 **"Settings"**
2. 点击 **"API"** 选项卡
3. 你会看到以下信息：

### 项目 URL
```
Project URL: https://your-project-id.supabase.co
```

### API 密钥
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚙️ 第三步: 更新环境变量

1. 打开 `backend/.env` 文件
2. 替换以下值为你的实际 Supabase 信息：

```bash
# Backend port configuration
PORT=3002

# Supabase Configuration
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_ANON_KEY=你的anon-public-key
SUPABASE_SERVICE_KEY=你的service-role-key

# JWT Configuration  
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Environment
NODE_ENV=development
```

### 🔒 重要说明

- **SUPABASE_ANON_KEY**: 用于前端客户端连接，可以公开
- **SUPABASE_SERVICE_KEY**: 用于后端服务端连接，具有完全数据库访问权限，**必须保密**

## 🎯 第四步: 测试连接

更新环境变量后，测试连接：

```bash
cd backend
npm run migrate:status
```

如果配置正确，你应该看到迁移状态而不是错误信息。

## 🗄️ 第五步: 运行数据库迁移

### 方法1: 一键设置 (推荐)
```bash
npm run db:setup
```

### 方法2: 手动步骤
```bash
# 1. 查看待执行的迁移
npm run migrate

# 2. 复制显示的 SQL 到 Supabase Dashboard > SQL Editor 执行

# 3. 标记迁移为已完成
npm run migrate:mark 001_initial_schema
npm run migrate:mark 002_row_level_security  
npm run migrate:mark 003_stored_procedures
```

## 📱 第六步: 更新前端配置

同时更新前端的环境变量 `frontend/.env`：

```bash
# Frontend port configuration
VITE_PORT=3001

# API configuration
VITE_API_URL=http://localhost:3002/api/v1

# Supabase configuration (使用相同的项目信息)
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-public-key

# Environment
VITE_NODE_ENV=development
```

## 🔧 常见问题

### Q: "fetch failed" 错误
**A:** 检查 SUPABASE_URL 是否正确，确保网络连接正常

### Q: "Invalid API key" 错误  
**A:** 验证 SUPABASE_SERVICE_KEY 是否正确复制，确保没有多余的空格

### Q: "permission denied" 错误
**A:** 确保使用的是 service_role key 而不是 anon key

### Q: 迁移表创建失败
**A:** 检查 service_role key 权限，或在 Supabase Dashboard 中手动创建

## 🔒 安全提醒

- **永远不要**将 `SUPABASE_SERVICE_KEY` 提交到版本控制系统
- **永远不要**在前端代码中使用 `SUPABASE_SERVICE_KEY`  
- 生产环境中使用环境变量而不是 .env 文件
- 定期轮换 API 密钥

## 📚 更多资源

- [Supabase 官方文档](https://supabase.com/docs)
- [API 密钥管理](https://supabase.com/docs/guides/api/api-keys)
- [行级安全 (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

---

设置完成后，你就可以开始使用完整的财务管理系统了！ 🎉