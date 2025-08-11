# 端口配置说明

## 默认端口

- **前端 (Frontend)**: 3001
- **后端 (Backend)**: 3002

## 环境变量配置

### 前端配置

在 `frontend/.env` 文件中设置：

```bash
# Frontend port configuration
VITE_PORT=3001

# API Configuration
VITE_API_URL=http://localhost:3002/api/v1
```

### 后端配置

在 `backend/.env` 文件中设置：

```bash
# Backend port configuration
PORT=3002
```

## 启动服务

### 前端启动
```bash
cd frontend
npm run dev
```
前端将在 `http://localhost:3001` 启动

### 后端启动
```bash
cd backend
npm run dev
```
后端将在 `http://localhost:3002` 启动

## 自定义端口

### 方法1: 修改环境变量文件
直接编辑 `.env` 文件中的端口配置

### 方法2: 临时设置环境变量
```bash
# 前端
VITE_PORT=4001 npm run dev

# 后端
PORT=4002 npm run dev
```

## 注意事项

1. 修改端口后，需要同步更新前端的 `VITE_API_URL` 配置
2. 确保所选端口没有被其他服务占用
3. 防火墙需要开放相应端口（如果需要外部访问）