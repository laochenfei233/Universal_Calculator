/**
 * 输入验证工具类
 */
class ValidationUtil {
  /**
   * 验证是否为有效数字
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @returns {Object} 验证结果
   */
  static validateNumber(value, fieldName = 'value') {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName}不能为空` };
    }

    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return { isValid: false, error: `${fieldName}必须是有效数字` };
    }

    return { isValid: true, value: num };
  }

  /**
   * 验证数字范围
   * @param {number} value - 数值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @param {string} fieldName - 字段名称
   * @returns {Object} 验证结果
   */
  static validateRange(value, min, max, fieldName = 'value') {
    if (value < min || value > max) {
      return { 
        isValid: false, 
        error: `${fieldName}必须在${min}到${max}之间` 
      };
    }
    return { isValid: true };
  }

  /**
   * 验证正数
   * @param {number} value - 数值
   * @param {string} fieldName - 字段名称
   * @returns {Object} 验证结果
   */
  static validatePositive(value, fieldName = 'value') {
    if (value <= 0) {
      return { isValid: false, error: `${fieldName}必须大于0` };
    }
    return { isValid: true };
  }

  /**
   * 验证必需字段
   * @param {*} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @returns {Object} 验证结果
   */
  static validateRequired(value, fieldName = 'field') {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName}不能为空` };
    }
    return { isValid: true };
  }

  /**
   * 验证数学表达式安全性
   * @param {string} expression - 数学表达式
   * @returns {Object} 验证结果
   */
  static validateExpression(expression) {
    if (!expression || typeof expression !== 'string') {
      return { isValid: false, error: '表达式不能为空' };
    }

    // 检查危险字符和函数
    const dangerousPatterns = [
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>/,
      /import\s+/i,
      /require\s*\(/i,
      /process\./i,
      /global\./i,
      /__/,
      /\$\{/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        return { isValid: false, error: '表达式包含不安全的内容' };
      }
    }

    // 只允许数字、运算符、括号、小数点和数学函数
    const allowedPattern = /^[0-9+\-*/().\s,^%abcdefghijklmnopqrstuvwxyzπe]+$/i;
    if (!allowedPattern.test(expression)) {
      return { isValid: false, error: '表达式包含不支持的字符' };
    }

    return { isValid: true };
  }

  /**
   * 批量验证
   * @param {Array} validations - 验证规则数组
   * @returns {Object} 验证结果
   */
  static validateBatch(validations) {
    const errors = [];

    for (const validation of validations) {
      const result = validation();
      if (!result.isValid) {
        errors.push(result.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ValidationUtil;