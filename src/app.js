const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入中间件
const requestLogger = require('./middleware/requestLogger');
const rateLimitMiddleware = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const {
  sqlInjectionProtection,
  xssProtection,
  inputValidation,
  securityHeaders,
  corsConfig,
  enhancedRateLimit
} = require('./middleware/security');

// 导入路由
const apiRoutes = require('./routes');

// 创建Express应用
const app = express();

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 安全头部和CORS配置
app.use(securityHeaders);
app.use(corsConfig);

// 基础中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// 安全防护中间件
app.use(sqlInjectionProtection);
app.use(xssProtection);
app.use(inputValidation);

// 增强的速率限制
app.use('/api', enhancedRateLimit);

// 静态文件服务
// 根据环境判断静态文件路径
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'public') 
  : path.join(__dirname, '../public');

app.use(express.static(staticPath));

// API路由
app.use('/api', apiRoutes);

// 根路径重定向到静态文件
app.get('/', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'public', 'index.html')
    : path.join(__dirname, '../public', 'index.html');
  
  res.sendFile(indexPath);
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

module.exports = app;