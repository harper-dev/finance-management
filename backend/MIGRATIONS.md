# 数据库迁移指南

本项目使用自定义的迁移系统来管理Supabase数据库schema变更。

## 迁移文件位置

```
backend/src/migrations/
├── 001_initial_schema.sql          # 初始数据库结构
├── 002_row_level_security.sql      # 行级安全策略
├── 003_stored_procedures.sql       # 存储过程
├── rollback_001_initial_schema.sql # 回滚文件示例
└── ...
```

## 环境变量设置

在 `backend/.env` 文件中设置：

```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

## 迁移命令

### 1. 查看迁移状态
```bash
npm run migrate:status
```
显示所有迁移的执行状态（已执行/待执行）

### 2. 运行迁移（推荐方式）
```bash
npm run migrate
# 或者
npm run migrate:up
```

这个命令会：
- 检查哪些迁移还没有执行
- 显示待执行迁移的SQL内容
- 提供执行指导

### 3. 手动标记迁移为已完成
```bash
npm run migrate:mark 001_initial_schema
```

### 4. 回滚最后一个迁移
```bash
npm run migrate:rollback
```

### 5. 取消标记迁移（用于回滚）
```bash
npm run migrate:unmark 001_initial_schema
```

## 迁移工作流程

### 首次设置数据库

1. **创建迁移跟踪表**
   
   在Supabase Dashboard > SQL Editor中执行：
   ```sql
   CREATE TABLE IF NOT EXISTS _migrations (
     id VARCHAR(255) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     executed_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **查看待执行的迁移**
   ```bash
   npm run migrate:status
   ```

3. **执行迁移**
   ```bash
   npm run migrate
   ```
   
   这会显示每个待执行迁移的SQL内容

4. **在Supabase中执行SQL**
   - 复制显示的SQL内容
   - 在Supabase Dashboard > SQL Editor中粘贴并执行
   
5. **标记迁移为已完成**
   ```bash
   npm run migrate:mark 001_initial_schema
   npm run migrate:mark 002_row_level_security  
   npm run migrate:mark 003_stored_procedures
   ```

### 添加新的迁移

1. **创建新的迁移文件**
   ```bash
   # 文件名格式: XXX_description.sql
   touch backend/src/migrations/004_add_new_table.sql
   ```

2. **编写迁移SQL**
   ```sql
   -- 004_add_new_table.sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **创建回滚文件（可选）**
   ```bash
   touch backend/src/migrations/rollback_004_add_new_table.sql
   ```
   ```sql
   -- rollback_004_add_new_table.sql
   DROP TABLE IF EXISTS new_table;
   ```

4. **执行迁移**
   ```bash
   npm run migrate
   ```

5. **在Supabase中执行并标记**
   ```bash
   npm run migrate:mark 004_add_new_table
   ```

## 回滚迁移

1. **查看回滚指导**
   ```bash
   npm run migrate:rollback
   ```

2. **在Supabase中执行回滚SQL**
   - 复制显示的回滚SQL
   - 在Supabase Dashboard > SQL Editor中执行

3. **取消迁移标记**
   ```bash
   npm run migrate:unmark migration_id
   ```

## 最佳实践

### 1. 迁移文件命名
- 使用三位数字前缀：`001_`, `002_`, `003_`
- 使用描述性名称：`001_initial_schema.sql`
- 按时间顺序编号

### 2. 迁移内容
- 每个迁移文件应该是原子性的
- 包含完整的DDL语句
- 添加适当的注释

### 3. 回滚文件
- 为重要的迁移创建回滚文件
- 文件名格式：`rollback_XXX_description.sql`
- 测试回滚脚本的正确性

### 4. 团队协作
- 提交代码前确保迁移已测试
- 在production环境谨慎执行迁移
- 备份数据库后再执行破坏性迁移

## 故障排除

### 迁移表不存在
如果看到"Migrations table does not exist"错误，请先创建迁移跟踪表：

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

### 权限错误
确保使用的是Supabase Service Key而不是Anon Key：
```bash
SUPABASE_SERVICE_KEY=your-service-key-here
```

### SQL执行错误
1. 检查SQL语法
2. 确保表/字段不存在冲突
3. 检查外键约束
4. 查看Supabase Dashboard中的错误信息

## 命令参考

| 命令 | 描述 |
|------|------|
| `npm run migrate` | 显示待执行迁移的SQL内容 |
| `npm run migrate:status` | 查看所有迁移状态 |
| `npm run migrate:mark <id>` | 标记迁移为已完成 |
| `npm run migrate:unmark <id>` | 取消迁移标记 |
| `npm run migrate:rollback` | 显示回滚指导 |

## 注意事项

⚠️ **重要提醒**：
- 本迁移系统主要提供SQL展示和状态跟踪功能
- 实际的SQL执行需要在Supabase Dashboard中手动完成
- 这样设计是为了确保安全性和可控性
- 在生产环境中执行迁移前务必备份数据库