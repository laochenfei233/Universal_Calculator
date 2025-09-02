/**
 * 数字转换工具
 * 支持阿拉伯数字与中文数字的双向转换，包括财务专用大写格式
 */

class NumberConverter {
  constructor() {
    // 基础中文数字
    this.chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
    // 财务专用大写数字
    this.financialNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    
    // 中文单位
    this.chineseUnits = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿', '千亿', '万亿'];
    
    // 财务单位
    this.financialUnits = ['', '拾', '佰', '仟', '万', '拾万', '佰万', '仟万', '亿', '拾亿', '佰亿', '仟亿', '万亿'];
    
    // 中文数字到阿拉伯数字的映射
    this.chineseToArabicMap = {
      '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
      '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5, '陆': 6, '柒': 7, '捌': 8, '玖': 9,
      '十': 10, '拾': 10, '百': 100, '佰': 100, '千': 1000, '仟': 1000,
      '万': 10000, '亿': 100000000
    };
    
    // 支持的最大数值
    this.MAX_NUMBER = 999999999999999; // 15位数
    this.MIN_NUMBER = -999999999999999;
  }

  /**
   * 验证数字范围
   * @param {number} num - 要验证的数字
   * @returns {object} 验证结果
   */
  validateNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) {
      return { isValid: false, error: '输入必须是有效数字' };
    }
    
    if (!isFinite(num)) {
      return { isValid: false, error: '数字不能是无穷大' };
    }
    
    if (num > this.MAX_NUMBER || num < this.MIN_NUMBER) {
      return { isValid: false, error: `数字超出支持范围 (${this.MIN_NUMBER} ~ ${this.MAX_NUMBER})` };
    }
    
    return { isValid: true };
  }

  /**
   * 阿拉伯数字转中文数字
   * @param {number} num - 阿拉伯数字
   * @param {boolean} isFinancial - 是否为财务格式
   * @returns {string} 中文数字
   */
  arabicToChinese(num, isFinancial = false) {
    const validation = this.validateNumber(num);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (num === 0) return isFinancial ? '零' : '零';
    
    const isNegative = num < 0;
    const absNum = Math.abs(Math.floor(num));
    
    const numbers = isFinancial ? this.financialNumbers : this.chineseNumbers;
    const units = isFinancial ? this.financialUnits : this.chineseUnits;
    
    let result = this.convertPositiveNumber(absNum, numbers, units);
    
    // 处理特殊情况：10-19的数字
    if (!isFinancial && absNum >= 10 && absNum < 20) {
      result = result.replace(/^一十/, '十');
    }
    
    return isNegative ? '负' + result : result;
  }

  /**
   * 转换正整数
   * @param {number} num - 正整数
   * @param {array} numbers - 数字数组
   * @param {array} units - 单位数组
   * @returns {string} 转换结果
   */
  convertPositiveNumber(num, numbers, units) {
    if (num === 0) return numbers[0];
    
    let result = '';
    let unitIndex = 0;
    let hasZero = false;
    
    while (num > 0) {
      const digit = num % 10;
      
      if (digit !== 0) {
        if (hasZero && result) {
          result = numbers[0] + result;
        }
        result = numbers[digit] + (unitIndex > 0 ? units[unitIndex] : '') + result;
        hasZero = false;
      } else {
        hasZero = true;
      }
      
      num = Math.floor(num / 10);
      unitIndex++;
    }
    
    return result;
  }

  /**
   * 中文数字转阿拉伯数字
   * @param {string} chineseNum - 中文数字
   * @returns {number} 阿拉伯数字
   */
  chineseToArabic(chineseNum) {
    if (typeof chineseNum !== 'string') {
      throw new Error('输入必须是字符串');
    }
    
    const trimmed = chineseNum.trim();
    if (!trimmed) {
      throw new Error('输入不能为空');
    }
    
    // 处理负数
    const isNegative = trimmed.startsWith('负');
    const numStr = isNegative ? trimmed.slice(1) : trimmed;
    
    if (numStr === '零') return 0;
    
    let result = 0;
    let section = 0; // 当前段的值
    let temp = 0; // 临时值
    
    for (let i = 0; i < numStr.length; i++) {
      const char = numStr[i];
      const value = this.chineseToArabicMap[char];
      
      if (value === undefined) {
        throw new Error(`无法识别的字符: ${char}`);
      }
      
      if (value < 10) {
        // 数字0-9
        temp = value;
      } else if (value === 10) {
        // 十
        if (temp === 0) temp = 1;
        section += temp * 10;
        temp = 0;
      } else if (value === 100) {
        // 百
        if (temp === 0) temp = 1;
        section += temp * 100;
        temp = 0;
      } else if (value === 1000) {
        // 千
        if (temp === 0) temp = 1;
        section += temp * 1000;
        temp = 0;
      } else if (value === 10000) {
        // 万
        if (temp > 0) section += temp;
        if (section === 0) section = 1;
        result += section * 10000;
        section = 0;
        temp = 0;
      } else if (value === 100000000) {
        // 亿
        if (temp > 0) section += temp;
        if (section === 0) section = 1;
        result = (result + section) * 100000000;
        section = 0;
        temp = 0;
      }
    }
    
    // 处理剩余的数字
    if (temp > 0) section += temp;
    result += section;
    
    return isNegative ? -result : result;
  }

  /**
   * 数字转换为财务专用大写格式（带金额单位）
   * @param {number} amount - 金额
   * @param {string} currency - 货币单位，默认为'元'
   * @returns {string} 财务大写格式
   */
  toFinancialFormat(amount, currency = '元') {
    const validation = this.validateNumber(amount);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    if (amount === 0) return `零${currency}整`;
    
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    
    // 分离整数和小数部分
    const integerPart = Math.floor(absAmount);
    const decimalPart = Math.round((absAmount - integerPart) * 100);
    
    let result = '';
    
    // 转换整数部分
    if (integerPart > 0) {
      result += this.arabicToChinese(integerPart, true) + currency;
    }
    
    // 转换小数部分（角、分）
    if (decimalPart > 0) {
      const jiao = Math.floor(decimalPart / 10);
      const fen = decimalPart % 10;
      
      if (integerPart > 0 && jiao === 0 && fen > 0) {
        result += '零';
      }
      
      if (jiao > 0) {
        result += this.financialNumbers[jiao] + '角';
      }
      
      if (fen > 0) {
        result += this.financialNumbers[fen] + '分';
      }
    } else if (integerPart > 0) {
      result += '整';
    }
    
    return isNegative ? '负' + result : result;
  }

  /**
   * 智能转换：自动识别输入类型并转换
   * @param {string|number} input - 输入值
   * @param {string} targetType - 目标类型: 'chinese', 'financial', 'arabic', 'financial-amount'
   * @returns {object} 转换结果
   */
  convert(input, targetType) {
    try {
      let result = '';
      let inputType = '';
      let originalValue = input;
      
      // 判断输入类型
      if (typeof input === 'number') {
        inputType = 'arabic';
      } else if (typeof input === 'string') {
        const trimmed = input.trim();
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          inputType = 'arabic';
          originalValue = parseFloat(trimmed);
        } else if (/^[负]?[零一二三四五六七八九十百千万亿壹贰叁肆伍陆柒捌玖拾佰仟]+$/.test(trimmed)) {
          inputType = 'chinese';
        } else {
          throw new Error('无法识别的输入格式');
        }
      } else {
        throw new Error('输入类型不支持');
      }
      
      // 执行转换
      switch (targetType) {
        case 'chinese':
          if (inputType === 'arabic') {
            result = this.arabicToChinese(originalValue, false);
          } else {
            result = originalValue; // 已经是中文
          }
          break;
          
        case 'financial':
          if (inputType === 'arabic') {
            result = this.arabicToChinese(originalValue, true);
          } else {
            // 先转为阿拉伯数字，再转为财务格式
            const arabicNum = this.chineseToArabic(originalValue);
            result = this.arabicToChinese(arabicNum, true);
          }
          break;
          
        case 'arabic':
          if (inputType === 'chinese') {
            result = this.chineseToArabic(originalValue);
          } else {
            result = originalValue; // 已经是阿拉伯数字
          }
          break;
          
        case 'financial-amount':
          const numValue = inputType === 'arabic' ? originalValue : this.chineseToArabic(originalValue);
          result = this.toFinancialFormat(numValue);
          break;
          
        default:
          throw new Error('不支持的转换类型');
      }
      
      return {
        success: true,
        original: input,
        result: result,
        inputType: inputType,
        targetType: targetType,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        original: input,
        error: error.message,
        inputType: typeof input === 'number' ? 'arabic' : 'unknown',
        targetType: targetType,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 批量转换
   * @param {array} inputs - 输入数组
   * @param {string} targetType - 目标类型
   * @returns {array} 转换结果数组
   */
  batchConvert(inputs, targetType) {
    if (!Array.isArray(inputs)) {
      throw new Error('输入必须是数组');
    }
    
    return inputs.map(input => this.convert(input, targetType));
  }

  /**
   * 获取支持的转换类型
   * @returns {object} 支持的类型信息
   */
  getSupportedTypes() {
    return {
      inputTypes: ['arabic', 'chinese'],
      outputTypes: ['chinese', 'financial', 'arabic', 'financial-amount'],
      maxNumber: this.MAX_NUMBER,
      minNumber: this.MIN_NUMBER,
      description: {
        chinese: '中文数字（如：一千二百三十四）',
        financial: '财务大写数字（如：壹仟贰佰叁拾肆）',
        arabic: '阿拉伯数字（如：1234）',
        'financial-amount': '财务金额格式（如：壹仟贰佰叁拾肆元整）'
      }
    };
  }
}

module.exports = NumberConverter;