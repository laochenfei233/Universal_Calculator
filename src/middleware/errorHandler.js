const ResponseUtil = require('../utils/response');
const { ERROR_TYPES, HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();
  
  // 记录错误日志
  logger.error('Error occurred:', {
    errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp
  });

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

  // 默认服务器错误
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误，请联系管理员' 
    : err.message;

  return ResponseUtil.error(
    res,
    errorMessage,
    ERROR_TYPES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    { 
      errorId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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