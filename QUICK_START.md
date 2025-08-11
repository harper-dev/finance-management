# 🚀 Finance Management - 快速开始

## 📋 前置要求

1. Node.js (v18或更高版本)
2. Supabase项目 (https://supabase.com)
3. npm 或 yarn

## 🔧 环境设置

### 1. 克隆并安装依赖

```bash
git clone <repository-url>
cd finance-management

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖  
cd ../backend
npm install
```

### 2. 环境变量配置

#### 前端环境变量 (`frontend/.env`)
```bash
# 端口配置
VITE_PORT=3001

# API配置
VITE_API_URL=http://localhost:3002/api/v1

# Supabase配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# 环境
VITE_NODE_ENV=development
```

#### 后端环境变量 (`backend/.env`)
```bash
# 端口配置
PORT=3002

# Supabase配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# JWT配置
JWT_SECRET=your-jwt-secret-key

# 环境
NODE_ENV=development
```

### 3. 数据库初始化

#### 方法1: 一键设置 (推荐)
```bash
cd backend
npm run db:setup
```

#### 方法2: 手动设置
```bash
# 1. 查看迁移状态
npm run migrate:status

# 2. 显示待执行的迁移SQL
npm run migrate

# 3. 在Supabase Dashboard执行SQL后，标记为完成
npm run migrate:mark 001_initial_schema
npm run migrate:mark 002_row_level_security
npm run migrate:mark 003_stored_procedures
```

## 🚀 启动应用

### 开发模式 (推荐开两个终端)

**终端1 - 启动后端:**
```bash
cd backend
npm run dev
```
后端将在 http://localhost:3002 启动

**终端2 - 启动前端:**
```bash  
cd frontend
npm run dev
```
前端将在 http://localhost:3001 启动

## 📱 功能特性

### ✅ 用户管理
- 用户注册/登录
- 个人资料管理
- 多语言支持 (中文/英文)

### ✅ 工作区管理
- 个人/家庭/团队工作区
- 成员权限管理
- 工作区切换

### ✅ 账户管理
- 多类型账户 (现金/银行/投资/资产/债务)
- 余额跟踪
- 账户历史记录

### ✅ 交易管理
- 收入/支出/转账记录
- 分类管理
- 批量导入

### ✅ 预算管理
- 月度/季度/年度预算
- 预算跟踪和提醒
- 超支预警

### ✅ 储蓄目标
- 目标设定和跟踪
- 进度可视化
- 达成提醒

### ✅ 分析报表
- 支出/收入分析
- 趋势图表
- 财务概览

## 🗄️ 数据库管理

### 迁移命令
```bash
# 查看迁移状态
npm run migrate:status

# 运行迁移 (显示SQL)
npm run migrate

# 标记迁移为已完成
npm run migrate:mark <migration_id>

# 回滚指导
npm run migrate:rollback

# 取消迁移标记
npm run migrate:unmark <migration_id>
```

### 数据库结构
- `user_profiles` - 用户资料
- `workspaces` - 工作区
- `workspace_members` - 成员关系
- `accounts` - 账户
- `transactions` - 交易记录
- `budgets` - 预算
- `savings_goals` - 储蓄目标

## 🏗️ 技术架构

### 前端 (React + TypeScript)
- **框架**: React 18 + Vite
- **状态管理**: Zustand
- **UI组件**: Radix UI + Tailwind CSS
- **图表**: Recharts
- **国际化**: i18next
- **路由**: React Router
- **HTTP客户端**: Axios + React Query

### 后端 (分层架构)
- **运行时**: Cloudflare Workers
- **框架**: Hono
- **架构**: Routes -> Services -> Repositories -> Entities -> Database
- **数据库**: Supabase (PostgreSQL)
- **验证**: Zod
- **认证**: JWT + Supabase Auth

### 架构层次
```
┌─────────────────┐
│   API Routes    │ ← HTTP请求处理
├─────────────────┤
│    Services     │ ← 业务逻辑
├─────────────────┤ 
│  Repositories   │ ← 数据访问
├─────────────────┤
│    Entities     │ ← 数据模型
├─────────────────┤
│    Database     │ ← Supabase PostgreSQL
└─────────────────┘
```

## 🔍 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 检查端口占用
lsof -i :3001
lsof -i :3002

# 修改端口 (在.env文件中)
VITE_PORT=4001
PORT=4002
```

**2. Supabase连接错误**
- 检查SUPABASE_URL和密钥是否正确
- 确保使用的是项目的实际URL而不是localhost
- 验证SERVICE_KEY权限

**3. 迁移失败**
```bash
# 检查环境变量
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# 查看详细错误
npm run migrate:status
```

**4. 编译错误**
```bash  
# 类型检查
npm run type-check

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 📚 更多文档

- [端口配置详解](PORT_CONFIG.md)
- [数据库迁移指南](backend/MIGRATIONS.md) 
- [API文档](backend/API.md)
- [部署指南](DEPLOYMENT.md)

## 🤝 贡献

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情