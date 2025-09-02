const { HTTP_STATUS, ERROR_TYPES } = require('../config/constants');

/**
 * 统一API响应格式工具类
 */
class ResponseUtil {
  /**
   * 成功响应
   * @param {Object} res - Express响应对象
   * @param {*} data - 响应数据
   * @param {string} message - 响应消息
   * @param {number} statusCode - HTTP状态码
   */
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 错误响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {string} errorType - 错误类型
   * @param {number} statusCode - HTTP状态码
   * @param {*} details - 错误详情
   */
  static error(res, message = 'Internal Server Error', errorType = ERROR_TYPES.CALCULATION_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        type: errorType,
        message,
        details
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 验证错误响应
   * @param {Object} res - Express响应对象
   * @param {Array} errors - 验证错误数组
   */
  static validationError(res, errors) {
    return this.error(
      res,
      '输入验证失败',
      ERROR_TYPES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      errors
    );
  }

  /**
   * 计算错误响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} details - 错误详情
   */
  static calculationError(res, message = '计算错误', details = null) {
    return this.error(
      res,
      message,
      ERROR_TYPES.CALCULATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      details
    );
  }
}

module.exports = ResponseUtil;