const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

/**
 * SSL配置工具
 * 支持自动生成开发证书和加载生产证书
 */
class SSLConfig {
  constructor() {
    this.certPath = path.join(__dirname, '../../ssl');
    this.hasSSL = false;
    this.cert = null;
    this.key = null;
  }

  /**
   * 初始化SSL配置
   */
  async init() {
    try {
      // 确保SSL目录存在
      if (!fs.existsSync(this.certPath)) {
        fs.mkdirSync(this.certPath, { recursive: true });
      }

      // 检查是否存在证书文件
      const certFile = path.join(this.certPath, 'cert.pem');
      const keyFile = path.join(this.certPath, 'key.pem');

      if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
        // 加载现有证书
        this.cert = fs.readFileSync(certFile);
        this.key = fs.readFileSync(keyFile);
        this.hasSSL = true;
        logger.info('SSL证书加载成功');
      } else if (process.env.NODE_ENV === 'development') {
        // 开发环境自动生成证书
        await this.generateDevCert();
        this.hasSSL = true;
        logger.info('开发环境SSL证书生成成功');
      } else {
        logger.warn('未找到SSL证书文件，将使用HTTP');
      }
    } catch (error) {
      logger.error('SSL配置初始化失败', { error: error.message });
      this.hasSSL = false;
    }
  }

  /**
   * 生成开发环境证书
   */
  async generateDevCert() {
    try {
      const { generate } = require('selfsigned');
      const pems = generate([
        { name: 'commonName', value: 'localhost' }
      ], {
        days: 365,
        keySize: 2048,
        algorithm: 'sha256'
      });

      const certFile = path.join(this.certPath, 'cert.pem');
      const keyFile = path.join(this.certPath, 'key.pem');

      fs.writeFileSync(certFile, pems.cert);
      fs.writeFileSync(keyFile, pems.private);

      this.cert = pems.cert;
      this.key = pems.private;

      logger.info('开发证书生成完成');
    } catch (error) {
      logger.error('开发证书生成失败', { error: error.message });
      throw error;
    }
  }

  /**
   * 获取SSL配置
   */
  getConfig() {
    if (!this.hasSSL) {
      return null;
    }

    return {
      cert: this.cert,
      key: this.key,
      // 安全配置
      minVersion: 'TLSv1.2',
      ciphers: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384'
      ].join(':'),
      honorCipherOrder: true
    };
  }

  /**
   * 检查SSL状态
   */
  getStatus() {
    return {
      hasSSL: this.hasSSL,
      certPath: this.certPath,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * 创建HTTPS重定向中间件
   */
  createHTTPSRedirect() {
    return (req, res, next) => {
      // 只在生产环境启用HTTPS重定向
      if (process.env.NODE_ENV === 'production' && !req.secure) {
        const httpsUrl = `https://${req.hostname}${req.originalUrl}`;
        return res.redirect(301, httpsUrl);
      }
      next();
    };
  }

  /**
   * 创建HSTS中间件
   */
  createHSTSMiddleware() {
    return (req, res, next) => {
      if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      next();
    };
  }
}

// 创建单例实例
const sslConfig = new SSLConfig();

module.exports = sslConfig;