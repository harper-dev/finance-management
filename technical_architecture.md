# 个人资产管理系统 - 技术架构设计

## 整体技术架构

### 技术栈选择
```
前端: React + TypeScript + Tailwind CSS + shadcn/ui
后端: Cloudflare Workers + Hono.js + Supabase Client
数据库: Supabase PostgreSQL (官方托管)
认证: Supabase Auth (支持Google OAuth)
缓存: Cloudflare KV (可选)
部署: Cloudflare Pages (前端) + Cloudflare Workers (后端)
```

### 架构图
```
React(TS) → Cloudflare Pages → Cloudflare Workers + Hono.js → Supabase PostgreSQL
                    ↓                                               ↓
              Supabase Auth + Google OAuth ←→ Supabase Database
                    ↓
              Cloudflare KV (缓存)
```

## 前端技术栈

### 核心技术选择
```typescript
- 框架: React 18 + TypeScript
- 样式: Tailwind CSS v3 + shadcn/ui
- 状态管理: Zustand / Redux Toolkit  
- 路由: React Router v6
- HTTP客户端: Axios + React Query
- 表单: React Hook Form + Zod
- 图表: Recharts
- 图标: Lucide React
- 认证: Supabase Auth SDK
```

### UI设计规范

**整体布局:**
```css
/* 网站整体居中 */
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 响应式断点 */
mobile: 640px
tablet: 768px  
desktop: 1024px
large: 1280px
xlarge: 1536px
```

**设计风格:**
- **色彩方案**: 深色/浅色双主题，主色调财务绿#10B981或蓝色#3B82F6
- **字体**: Inter/SF Pro Display (英文) + Noto Sans CJK (中文)
- **圆角**: 统一8px圆角，按钮6px
- **阴影**: subtle shadow，避免厚重感
- **间距**: 基于8px网格系统

**组件结构:**
```typescript
components/
├── ui/                 # 基础UI组件 (shadcn/ui)
│   ├── Button.tsx
│   ├── Card.tsx  
│   ├── Input.tsx
│   └── ...
├── layout/            # 布局组件
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
├── features/          # 功能组件  
│   ├── Dashboard/
│   ├── Transactions/
│   ├── Budget/
│   └── ...
└── charts/           # 图表组件
    ├── LineChart.tsx
    ├── PieChart.tsx
    └── ...
```

## 后端技术架构

### 技术栈
```typescript
- Runtime: Cloudflare Workers (V8)
- 框架: Hono.js + TypeScript
- 数据库客户端: Supabase JavaScript Client
- 数据库: Supabase PostgreSQL
- 缓存: Cloudflare KV (可选)
- 认证: Supabase Auth
- 加密: Web Crypto API
```

### 项目结构
```typescript
src/
├── index.ts              # Cloudflare Workers入口
├── routes/              # 路由模块
│   ├── auth.ts
│   ├── workspaces.ts
│   ├── accounts.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   └── analytics.ts
├── middleware/          # 中间件
│   ├── auth.ts         # Supabase JWT验证
│   ├── cors.ts
│   └── validation.ts
├── services/           # 业务逻辑层
│   ├── supabase.ts     # Supabase客户端
│   ├── encryption.ts
│   └── kv-cache.ts     # Cloudflare KV缓存
├── dto/               # 数据传输对象
├── utils/             # 工具函数
└── types/             # TypeScript类型定义
```

### API设计
```
/api/v1/
├── /auth              # Supabase代理认证
├── /workspaces        # 工作空间管理
├── /accounts          # 账户管理  
├── /transactions      # 交易记录
├── /budgets           # 预算管理
├── /goals             # 储蓄目标
├── /analytics         # 数据分析
└── /settings          # 用户设置
```

## 数据库设计

### 核心表结构

**1. 用户扩展信息表**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(100),
  preferred_currency VARCHAR(3) DEFAULT 'SGD',
  timezone VARCHAR(50) DEFAULT 'Asia/Singapore',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. 工作空间表**
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'personal', 'family', 'team'
  owner_id UUID REFERENCES auth.users(id),
  currency VARCHAR(3) DEFAULT 'SGD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) NOT NULL, -- 'owner', 'admin', 'member', 'viewer'
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT NOW()
);
```

**3. 资产账户表**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'investment', 'asset', 'debt'
  currency VARCHAR(3) DEFAULT 'SGD',
  balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**4. 交易记录表**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  account_id UUID REFERENCES accounts(id),
  type VARCHAR(20) NOT NULL, -- 'income', 'expense', 'transfer'
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  transaction_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**5. 预算表**
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**6. 储蓄目标表**
```sql
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 安全设计

### 数据加密
- **敏感字段加密**: 金额字段使用AES-256加密存储
- **密码安全**: 使用bcrypt哈希存储
- **传输安全**: 全站HTTPS/TLS加密

### 认证与授权
- **身份认证**: Supabase Auth + Google OAuth
- **JWT管理**: Supabase自动处理token刷新
- **权限控制**: 基于工作空间的RBAC权限模型

### 权限角色设计
```typescript
enum Role {
  OWNER = 'owner',     // 全部权限
  ADMIN = 'admin',     // 管理权限，不能删除工作空间
  MEMBER = 'member',   // 编辑权限  
  VIEWER = 'viewer'    // 只读权限
}
```

## 部署架构

### Cloudflare + Supabase混合方案 (极低成本)
```
前端: Cloudflare Pages (React静态部署)
后端: Cloudflare Workers (边缘计算)
数据库: Supabase PostgreSQL (托管数据库)
认证: Supabase Auth (Google OAuth)
缓存: Cloudflare KV (可选)
CDN: Cloudflare CDN (全球边缘网络)
```

### 免费额度分析
```
✅ Cloudflare:
- Pages: 500构建/月，无限带宽
- Workers: 100,000请求/天，10ms CPU/请求
- KV: 100,000读操作/天，1,000写操作/天

✅ Supabase (关键限制):
- 数据库存储: 500MB
- 数据传输: 2GB/月
- 月活用户: 50,000
- 并发连接: 60个
```

### 用户规模支持能力
```
免费阶段:
- 支持用户数: ~6,000-7,000 注册用户
- 活跃用户: ~2,000-3,000 MAU
- 存储限制: 500MB (主要瓶颈)

付费升级 ($25/月):
- 支持用户数: ~120,000 注册用户  
- 活跃用户: 100,000 MAU
- 存储空间: 8GB
```

### 配置文件

**Cloudflare Workers配置:**
```toml
# wrangler.toml
name = "finance-api"
main = "src/index.ts"
compatibility_date = "2024-01-15"
node_compat = true

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

**Supabase配置:**
```typescript
// supabase配置
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

// 本地开发
const supabaseLocalUrl = 'http://localhost:54321'
```

### CI/CD流程
```yaml
# .github/workflows/deploy.yml  
name: Deploy to Cloudflare
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
```

### 监控和运维
- **健康检查**: `/api/v1/health` (Workers Analytics)
- **日志管理**: Cloudflare Workers日志 + LogRocket
- **性能监控**: Cloudflare Analytics Dashboard
- **错误追踪**: Sentry (兼容Workers)
- **数据备份**: D1自动备份 + 导出脚本

## 开发环境设置

### 本地开发环境

**启动本地Supabase:**
```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化项目
supabase init

# 启动本地Supabase
supabase start

# 创建数据库迁移
supabase migration new create_tables

# 应用迁移  
supabase db push
```

**开发命令:**
```bash
# 前端开发
cd frontend && npm run dev

# 后端开发 (模拟Cloudflare Workers)
cd backend && wrangler dev

# 类型生成
supabase gen types typescript --local > types/database.types.ts

# 重置数据库
supabase db reset
```

### 环境变量管理
```bash
# Cloudflare Workers secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_KEY  
wrangler secret put JWT_SECRET
```

## 成本估算和商业模式

### 免费运营阶段 (0-6,000用户)
```
成本分析:
- Cloudflare: $0/月 (免费额度)
- Supabase: $0/月 (免费额度)
- 域名: ~$10-15/年
- 总计: 几乎完全免费! 🎉

用户容量:
- 注册用户: ~6,000-7,000
- 月活用户: ~2,000-3,000  
- 存储限制: 500MB (主要瓶颈)
```

### 付费升级阶段 (6,000-120,000用户)
```
成本分析:
- Cloudflare: $0-5/月 (可能超出免费额度)
- Supabase Pro: $25/月
- 总计: ~$25-30/月

用户容量:
- 注册用户: ~120,000
- 月活用户: 100,000
- 存储空间: 8GB
```

### 商业模式建议
```
付费转化模型:
- 6,000用户时升级成本: $25/月
- 需要付费用户: 50-100个 (按$5-10/月定价)
- 转化率要求: 1-2% (合理范围)

收入策略:
- 免费用户: 基础功能，广告支持
- 付费用户: 高级分析，无广告，优先支持
- 企业用户: 多团队，高级权限，API访问
```

### 扩展性考虑
- 全球边缘部署 (Cloudflare + Supabase全球部署)
- 自动扩缩容 (Serverless架构)
- 数据库读副本 (高并发支持)
- 微服务拆分 (大规模时考虑)

这个架构支持从MVP到大规模应用的平滑扩展，技术栈现代化且开发效率高。