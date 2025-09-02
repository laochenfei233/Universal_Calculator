# 开发者指南

## 目录
- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [API开发规范](#api开发规范)
- [测试](#测试)
- [部署](#部署)

## 项目结构

```
src/
├── app.js              # Express应用入口
├── config/             # 配置文件和常量
├── middleware/        # Express中间件
├── routes/            # API路由
├── utils/             # 工具函数和辅助类
└── server.js          # 服务器启动脚本
```

## 开发环境设置

1. **安装依赖**
```bash
npm install
```

2. **环境变量配置**
创建 `.env` 文件：
```
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

3. **启动开发服务器**
```bash
npm run dev
```

## API开发规范

### 路由定义
- 使用RESTful风格
- 资源名使用复数形式
- 版本控制通过路径前缀实现 (`/api/v1/...`)

### 错误处理
- 使用统一的错误处理中间件
- 错误响应格式：
```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 测试

### 单元测试
```bash
npm test
```

### 集成测试
```bash
npm run test:integration
```

### E2E测试
```bash
npm run test:e2e
```

## 部署指南

### 生产环境部署
1. 构建前端资源
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

### Docker部署
```bash
docker build -t calculator .
docker run -p 3000:3000 calculator