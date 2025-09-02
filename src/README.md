# 多功能计算器 - 后端架构文档

## 项目结构

```
src/
├── app.js                 # Express应用配置
├── server.js             # 服务器启动入口
├── config/
│   └── constants.js      # 应用常量配置
├── middleware/
│   ├── errorHandler.js   # 错误处理中间件
│   ├── rateLimiter.js    # 速率限制中间件
│   └── requestLogger.js  # 请求日志中间件
├── routes/
│   ├── index.js          # 主路由配置
│   ├── calculator.js     # 基础计算路由
│   ├── tax.js           # 个税计算路由
│   ├── mortgage.js      # 房贷计算路由
│   ├── bmi.js           # BMI计算路由
│   └── converter.js     # 转换功能路由
└── utils/
    ├── response.js       # 统一响应格式
    ├── validation.js     # 输入验证工具
    └── cache.js         # 内存缓存工具
```

## 核心特性

### 1. 统一API响应格式

所有API响应都遵循统一格式：

**成功响应:**
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**错误响应:**
```json
{
  "success": false,
  "error": {
    "type": "CALCULATION_ERROR",
    "message": "计算错误",
    "details": "具体错误信息"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 错误处理机制

- 全局错误处理中间件
- 统一错误类型定义
- 详细错误日志记录
- 友好的错误消息

### 3. 输入验证

- 数字验证和范围检查
- 表达式安全验证
- 批量验证支持
- 自定义验证规则

### 4. 内存缓存

- 计算结果缓存
- TTL过期机制
- 内存使用限制
- 缓存统计信息

### 5. 速率限制

- IP级别限制
- 滑动窗口算法
- 自动清理机制
- 响应头信息

### 6. 请求日志

- 请求/响应日志
- 性能监控
- 错误追踪
- 时间戳记录

## API端点

### 健康检查
- `GET /api/health` - 服务健康状态
- `GET /api/info` - API信息

### 计算功能
- `POST /api/calculate` - 基础/科学计算
- `POST /api/tax` - 个税计算
- `POST /api/mortgage` - 房贷计算
- `POST /api/bmi` - BMI计算
- `POST /api/convert` - 单位换算
- `POST /api/convert/number` - 数字转换
- `POST /api/convert/relationship` - 称呼计算

## 使用方法

### 启动服务器
```bash
npm start          # 生产环境
npm run dev        # 开发环境（热重载）
```

### 测试API
```bash
node test-api.js   # 运行API测试脚本
```

## 配置选项

### 环境变量
- `PORT` - 服务器端口（默认3000）
- `NODE_ENV` - 运行环境
- `CORS_ORIGIN` - CORS允许的源

### 常量配置
在 `src/config/constants.js` 中可以配置：
- 错误类型
- 缓存设置
- 速率限制
- HTTP状态码

## 性能优化

1. **内存缓存** - 常用计算结果缓存
2. **请求合并** - 批量计算接口
3. **算法优化** - 高效数学算法
4. **连接复用** - HTTP连接池
5. **响应压缩** - Gzip压缩

## 安全措施

1. **输入验证** - 严格的参数验证
2. **表达式安全** - 防止代码注入
3. **速率限制** - 防止滥用
4. **错误处理** - 不泄露敏感信息
5. **CORS配置** - 跨域访问控制

## 扩展指南

### 添加新的计算器

1. 在 `src/routes/` 创建新路由文件
2. 在 `src/routes/index.js` 注册路由
3. 实现计算逻辑和验证
4. 添加单元测试
5. 更新API文档

### 自定义中间件

1. 在 `src/middleware/` 创建中间件文件
2. 在 `src/app.js` 注册中间件
3. 配置中间件选项
4. 添加相关测试

## 监控和日志

- 请求响应时间监控
- 错误率统计
- 内存使用监控
- API调用频率分析