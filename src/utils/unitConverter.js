// 单位换算工具函数
const { 
  UNIT_CATEGORIES, 
  isValidUnit, 
  getUnitInfo 
} = require('../config/unitConversions');

/**
 * 执行单位换算
 * @param {number} value - 要转换的数值
 * @param {string} fromUnit - 源单位
 * @param {string} toUnit - 目标单位
 * @param {string} category - 单位类别
 * @returns {Object} 转换结果
 */
function convertUnit(value, fromUnit, toUnit, category) {
  // 验证输入参数
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('输入值必须是有效数字');
  }
  
  if (!UNIT_CATEGORIES[category]) {
    throw new Error(`不支持的单位类别: ${category}`);
  }
  
  if (!isValidUnit(category, fromUnit)) {
    throw new Error(`无效的源单位: ${fromUnit}`);
  }
  
  if (!isValidUnit(category, toUnit)) {
    throw new Error(`无效的目标单位: ${toUnit}`);
  }
  
  // 如果源单位和目标单位相同，直接返回
  if (fromUnit === toUnit) {
    return {
      originalValue: value,
      convertedValue: value,
      fromUnit,
      toUnit,
      category,
      precision: getPrecision(value),
      fromUnitInfo: getUnitInfo(category, fromUnit),
      toUnitInfo: getUnitInfo(category, toUnit)
    };
  }
  
  const categoryConfig = UNIT_CATEGORIES[category];
  let convertedValue;
  
  // 温度转换需要特殊处理
  if (category === 'temperature') {
    convertedValue = convertTemperature(value, fromUnit, toUnit);
  } else {
    // 标准单位转换：先转换为基准单位，再转换为目标单位
    const fromUnitConfig = categoryConfig.units[fromUnit];
    const toUnitConfig = categoryConfig.units[toUnit];
    
    // 转换为基准单位
    const baseValue = value * fromUnitConfig.factor;
    // 从基准单位转换为目标单位
    convertedValue = baseValue / toUnitConfig.factor;
  }
  
  // 处理精度
  const precision = calculateOptimalPrecision(convertedValue, category);
  convertedValue = parseFloat(convertedValue.toFixed(precision));
  
  return {
    originalValue: value,
    convertedValue,
    fromUnit,
    toUnit,
    category,
    precision,
    fromUnitInfo: getUnitInfo(category, fromUnit),
    toUnitInfo: getUnitInfo(category, toUnit)
  };
}

/**
 * 温度单位转换
 * @param {number} value - 温度值
 * @param {string} fromUnit - 源温度单位
 * @param {string} toUnit - 目标温度单位
 * @returns {number} 转换后的温度值
 */
function convertTemperature(value, fromUnit, toUnit) {
  const temperatureUnits = UNIT_CATEGORIES.temperature.units;
  
  // 先转换为摄氏度
  const celsiusValue = temperatureUnits[fromUnit].toCelsius(value);
  
  // 再从摄氏度转换为目标单位
  return temperatureUnits[toUnit].fromCelsius(celsiusValue);
}

/**
 * 批量单位转换
 * @param {number} value - 要转换的数值
 * @param {string} fromUnit - 源单位
 * @param {string} category - 单位类别
 * @param {Array} targetUnits - 目标单位数组
 * @returns {Array} 转换结果数组
 */
function convertToMultipleUnits(value, fromUnit, category, targetUnits = []) {
  if (!UNIT_CATEGORIES[category]) {
    throw new Error(`不支持的单位类别: ${category}`);
  }
  
  // 如果没有指定目标单位，转换为该类别的所有单位
  if (targetUnits.length === 0) {
    targetUnits = Object.keys(UNIT_CATEGORIES[category].units);
  }
  
  const results = [];
  
  for (const toUnit of targetUnits) {
    if (toUnit === fromUnit) continue; // 跳过相同单位
    
    try {
      const result = convertUnit(value, fromUnit, toUnit, category);
      results.push(result);
    } catch (error) {
      // 记录错误但继续处理其他单位
      console.warn(`转换到 ${toUnit} 失败:`, error.message);
    }
  }
  
  return results;
}

/**
 * 计算最优精度
 * @param {number} value - 数值
 * @param {string} category - 单位类别
 * @returns {number} 建议的小数位数
 */
function calculateOptimalPrecision(value, category) {
  const absValue = Math.abs(value);
  
  // 根据不同类别设置不同的精度策略
  const precisionRules = {
    length: {
      large: 2,    // >= 1000
      medium: 2,   // 1-1000
      small: 6     // < 1
    },
    weight: {
      large: 2,
      medium: 3,
      small: 6
    },
    temperature: {
      large: 1,
      medium: 2,
      small: 3
    },
    area: {
      large: 2,
      medium: 4,
      small: 8
    },
    volume: {
      large: 2,
      medium: 4,
      small: 8
    },
    time: {
      large: 0,
      medium: 2,
      small: 3
    },
    speed: {
      large: 1,
      medium: 2,
      small: 4
    }
  };
  
  const rules = precisionRules[category] || precisionRules.length;
  
  if (absValue >= 1000) {
    return rules.large;
  } else if (absValue >= 1) {
    return rules.medium;
  } else {
    return rules.small;
  }
}

/**
 * 获取数值的当前精度
 * @param {number} value - 数值
 * @returns {number} 小数位数
 */
function getPrecision(value) {
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}

/**
 * 验证转换参数
 * @param {Object} params - 转换参数
 * @returns {Object} 验证结果
 */
function validateConversionParams(params) {
  const { value, fromUnit, toUnit, category } = params;
  const errors = [];
  
  // 验证数值
  if (value === undefined || value === null) {
    errors.push('缺少转换数值');
  } else if (typeof value !== 'number' || isNaN(value)) {
    errors.push('转换数值必须是有效数字');
  } else if (!isFinite(value)) {
    errors.push('转换数值不能是无穷大');
  }
  
  // 验证单位类别
  if (!category) {
    errors.push('缺少单位类别');
  } else if (!UNIT_CATEGORIES[category]) {
    errors.push(`不支持的单位类别: ${category}`);
  }
  
  // 验证源单位
  if (!fromUnit) {
    errors.push('缺少源单位');
  } else if (category && !isValidUnit(category, fromUnit)) {
    errors.push(`无效的源单位: ${fromUnit}`);
  }
  
  // 验证目标单位
  if (!toUnit) {
    errors.push('缺少目标单位');
  } else if (category && !isValidUnit(category, toUnit)) {
    errors.push(`无效的目标单位: ${toUnit}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 格式化转换结果
 * @param {Object} result - 转换结果
 * @param {Object} options - 格式化选项
 * @returns {Object} 格式化后的结果
 */
function formatConversionResult(result, options = {}) {
  const {
    includeSymbols = true,
    includeNames = true,
    locale = 'zh-CN'
  } = options;
  
  const formatted = {
    ...result,
    formattedOriginal: formatNumber(result.originalValue, locale),
    formattedConverted: formatNumber(result.convertedValue, locale)
  };
  
  if (includeSymbols) {
    formatted.fromSymbol = result.fromUnitInfo.symbol;
    formatted.toSymbol = result.toUnitInfo.symbol;
  }
  
  if (includeNames) {
    formatted.fromName = result.fromUnitInfo.name;
    formatted.toName = result.toUnitInfo.name;
  }
  
  return formatted;
}

/**
 * 格式化数字
 * @param {number} value - 数值
 * @param {string} locale - 地区设置
 * @returns {string} 格式化后的数字字符串
 */
function formatNumber(value, locale = 'zh-CN') {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 10,
    useGrouping: true
  }).format(value);
}

module.exports = {
  convertUnit,
  convertTemperature,
  convertToMultipleUnits,
  calculateOptimalPrecision,
  getPrecision,
  validateConversionParams,
  formatConversionResult,
  formatNumber
};