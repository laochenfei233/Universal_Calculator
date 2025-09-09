const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// 自定义日志格式
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// 控制台输出格式
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// 检查是否在Vercel环境中运行
const isVercel = process.env.VERCEL === '1';

// 创建logger实例
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'calculator-api' },
  transports: [
    // 始终添加控制台输出
    new transports.Console({
      format: consoleFormat
    })
  ]
});

// 只在非Vercel环境中添加文件日志
if (!isVercel) {
  // 确保日志目录存在
  const logDir = path.join(__dirname, '../../logs');
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // 添加文件日志
    logger.add(new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
    
    logger.add(new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
  } catch (error) {
    console.error('无法创建日志文件:', error);
  }
}

// 添加错误告警
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// 辅助函数：生成错误ID
function generateErrorId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// 辅助函数：记录审计日志
function auditLog(action, userId, details = {}) {
  logger.info('Audit log', {
    action,
    userId,
    ...details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
}

// 辅助函数：记录性能日志
function performanceLog(operation, duration, details = {}) {
  logger.info('Performance log', {
    operation,
    duration,
    ...details,
    timestamp: new Date().toISOString()
  });
}

// 辅助函数：记录安全事件
function securityLog(event, level = 'warn', details = {}) {
  const logMethod = level === 'error' ? 'error' : 'warn';
  logger[logMethod]('Security event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
}

module.exports = {
  logger,
  generateErrorId,
  auditLog,
  performanceLog,
  securityLog
};