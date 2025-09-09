const { logger } = require('./logger');

/**
 * SSL配置工具
 * 简化版，不处理实际SSL证书
 */
class SSLConfig {
  constructor() {
    this.hasSSL = false;
  }

  /**
   * 初始化SSL配置
   */
  async init() {
    logger.info('SSL配置初始化（简化版）');
    this.hasSSL = false;
  }

  /**
   * 获取SSL配置
   */
  getConfig() {
    return null;
  }

  /**
   * 检查SSL状态
   */
  getStatus() {
    return {
      hasSSL: false,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * 创建HTTPS重定向中间件
   */
  createHTTPSRedirect() {
    return (req, res, next) => {
      next();
    };
  }

  /**
   * 创建HSTS中间件
   */
  createHSTSMiddleware() {
    return (req, res, next) => {
      next();
    };
  }
}

// 创建单例实例
const sslConfig = new SSLConfig();

module.exports = sslConfig;