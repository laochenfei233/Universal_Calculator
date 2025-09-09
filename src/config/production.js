// 生产环境配置
module.exports = {
  // 服务器端口
  port: process.env.PORT || 3000,
  
  // 日志配置
  log: {
    level: 'info',
    file: 'logs/app.log'
  },
  
  // 缓存配置
  cache: {
    ttl: 3600, // 1小时
    max: 1000
  },
  
  // 安全配置
  security: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // API配置
  api: {
    prefix: '/api'
  }
};