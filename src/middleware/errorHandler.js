// 使用动态导入方式引入uuid
let uuidv4;
(async () => {
  const uuidModule = await import('uuid');
  uuidv4 = uuidModule.v4;
})();
const ResponseUtil = require('../utils/response');
const { ERROR_TYPES, HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 确保响应头设置为JSON
  res.setHeader('Content-Type', 'application/json');
  
  const errorId = uuidv4 ? uuidv4() : Date.now().toString(36) + Math.random().toString(36).substr(2);
  const timestamp = new Date().toISOString();
  
  // 确保错误对象有message属性
  const errorMessage = err.message || '未知错误';
  const errorStack = err.stack || '无堆栈信息';
  
  // 记录错误日志（添加防御性检查）
  if (logger && typeof logger.error === 'function') {
    logger.error('Error occurred:', {
      errorId,
      message: errorMessage,
      stack: errorStack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers && req.headers['user-agent'],
      timestamp
    });
  } else {
    console.error('Error occurred:', {
      errorId,
      message: errorMessage,
      url: req.url,
      stack: errorStack
    });
  }

  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    return ResponseUtil.validationError(res, err.details, errorId);
  }

  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    return ResponseUtil.error(
      res,
      '请求格式错误，请检查JSON格式',
      ERROR_TYPES.INVALID_INPUT,
      HTTP_STATUS.BAD_REQUEST,
      { errorId }
    );
  }

  // 数据库错误
  if (err.name === 'MongoError' || err.name === 'SequelizeError') {
    return ResponseUtil.error(
      res,
      '数据库操作失败',
      ERROR_TYPES.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { errorId }
    );
  }

  // 网络错误
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return ResponseUtil.error(
      res,
      '网络连接失败，请稍后重试',
      ERROR_TYPES.NETWORK_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { errorId }
    );
  }

  // 认证错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ResponseUtil.error(
      res,
      '身份验证失败',
      ERROR_TYPES.AUTHENTICATION_ERROR,
      HTTP_STATUS.UNAUTHORIZED,
      { errorId }
    );
  }

  // 自定义业务错误
  if (err.isBusinessError) {
    return ResponseUtil.error(
      res,
      err.message,
      err.errorType || ERROR_TYPES.BUSINESS_ERROR,
      err.statusCode || HTTP_STATUS.BAD_REQUEST,
      { errorId, ...err.details }
    );
  }

  // 默认服务器错误处理
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误，请联系管理员' 
    : err.message;

  // 确保错误对象有message属性
  if (!err.message) {
    err.message = '未知错误';
  }

  // 处理各种错误响应格式
  if (typeof err === 'string') {
    if (err.startsWith('<!DOCTYPE')) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器内部错误',
        code: ERROR_TYPES.INTERNAL_ERROR,
        errorId,
        timestamp
      });
    }
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: err,
      code: ERROR_TYPES.VALIDATION_ERROR,
      errorId,
      timestamp
    });
  }

  return ResponseUtil.error(
    res,
    errorMessage,
    ERROR_TYPES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    { 
      errorId,
      timestamp,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalError: err 
      })
    }
  );
};

/**
 * 404错误处理中间件
 */
const notFoundHandler = (req, res) => {
  ResponseUtil.error(
    res,
    `路径 ${req.originalUrl} 不存在`,
    ERROR_TYPES.NOT_FOUND,
    404
  );
};

/**
 * 异步错误捕获包装器
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};