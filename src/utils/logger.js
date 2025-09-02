const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// 控制台输出格式（开发环境）
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// 创建logger实例
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'calculator-api' },
  transports: [
    // 错误日志文件（按天轮转）
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d'
    }),
    
    // 所有日志文件（按天轮转）
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    }),
    
    // 审计日志（专门记录重要操作）
    new DailyRotateFile({
      filename: path.join(logDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '10m',
      maxFiles: '90d'
    })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat
  }));
}

// 生产环境添加错误告警
if (process.env.NODE_ENV === 'production') {
  logger.on('error', (error) => {
    console.error('Logger error:', error);
  });
}

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