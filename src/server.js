const app = require('./app');
const { logger } = require('./utils/logger');

// 检查是否在Vercel环境中运行
const isVercel = process.env.VERCEL === '1';

// 只在非Vercel环境中启动服务器
if (!isVercel) {
  const config = require('./config/production');
  const sslConfig = require('./utils/sslConfig');
  
  // 从配置文件获取端口，默认为3000
  const PORT = config.port || process.env.PORT || 3000;
  const HTTP_PORT = PORT;
  const HTTPS_PORT = config.httpsPort || PORT + 1;
  
  // 初始化SSL配置
  async function startServer() {
    try {
      await sslConfig.init();
      const ssl = sslConfig.getConfig();
      
      let server;
      
      if (ssl) {
        // 启动HTTPS服务器
        const https = require('https');
        server = https.createServer(ssl, app);
        
        server.listen(HTTPS_PORT, () => {
          logger.info('HTTPS服务器启动成功', {
            port: HTTPS_PORT,
            environment: process.env.NODE_ENV || 'development'
          });
          
          console.log(`🚀 HTTPS服务器启动成功`);
          console.log(`📍 服务地址: https://localhost:${HTTPS_PORT}`);
          console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
          console.log(`🔐 SSL: 已启用`);
        });
        
        // 同时启动HTTP重定向服务器
        if (process.env.NODE_ENV === 'production') {
          const http = require('http');
          const redirectApp = require('express')();
          
          // 设置HTTP到HTTPS的重定向
          redirectApp.use((req, res) => {
            res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
          });
          
          http.createServer(redirectApp).listen(HTTP_PORT, () => {
            logger.info('HTTP重定向服务器启动成功', { port: HTTP_PORT });
            console.log(`🔄 HTTP重定向服务运行在端口 ${HTTP_PORT}`);
          });
        }
      } else {
        // 启动HTTP服务器
        const http = require('http');
        server = http.createServer(app);
        
        server.listen(HTTP_PORT, () => {
          logger.info('HTTP服务器启动成功', {
            port: HTTP_PORT,
            environment: process.env.NODE_ENV || 'development'
          });
          
          console.log(`🚀 HTTP服务器启动成功`);
          console.log(`📍 服务地址: http://localhost:${HTTP_PORT}`);
          console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
          console.log(`⚠️ SSL: 未启用`);
        });
      }
      
      return server;
    } catch (error) {
      logger.error('服务器启动失败', { error: error.message });
      throw error;
    }
  }
  
  // 启动服务器
  const server = startServer().catch(error => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });
  
  // 优雅关闭
  async function gracefulShutdown(signal) {
    console.log(`收到${signal}信号，开始优雅关闭...`);
    logger.info('开始优雅关闭服务器', { signal });
    
    try {
      const currentServer = await server;
      if (currentServer) {
        currentServer.close(() => {
          console.log('服务器已关闭');
          logger.info('服务器优雅关闭完成');
          process.exit(0);
        });
        
        // 强制关闭超时
        setTimeout(() => {
          console.log('优雅关闭超时，强制退出');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error('关闭服务器时发生错误:', error);
      process.exit(1);
    }
  }
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// 未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // 在Vercel环境中不要退出进程
  if (!isVercel) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 在Vercel环境中不要退出进程
  if (!isVercel) {
    process.exit(1);
  }
});

// 导出Express应用
module.exports = app;