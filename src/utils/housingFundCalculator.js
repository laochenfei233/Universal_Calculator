const taxConfig = require('../config/taxConfig');

// 安全数值处理
function ensureNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// 安全乘法计算
function safeMultiply(a, b) {
  return ensureNumber(a) * ensureNumber(b);
}

// 安全加法计算
function safeAdd(a, b) {
  return ensureNumber(a) + ensureNumber(b);
}

// 绝对安全的四舍五入实现
function preciseRound(value, decimals = 2) {
  try {
    // 完全避免任何toFixed或toString调用
    const num = Number(value);
    if (isNaN(num)) return 0;
    
    const factor = 10 ** decimals;
    const rounded = Math.round((num * factor) + (Math.sign(num) * Number.EPSILON)) / factor;
    
    // 处理可能存在的浮点数精度问题
    const fixedDecimals = rounded.toString().split('.')[1]?.length || 0;
    return fixedDecimals < decimals ? 
      Number(rounded.toFixed(decimals)) : 
      rounded;
  } catch {
    return 0;
  }
}

class HousingFundCalculator {
  static calculateHousingFund(params = {}) {
    // 输入处理
    const input = {
      salary: ensureNumber(params.salary),
      base: ensureNumber(params.base),
      rate: Math.min(Math.max(ensureNumber(params.rate), 0.05), 0.24),
      city: params.city || 'national'
    };

    // 参数验证
    if (input.salary <= 0) throw new Error('工资必须是正数');

    // 获取配置
    const config = taxConfig.getSocialInsuranceLimits(input.city)?.housingFund;
    if (!config?.minBase || !config?.maxBase) {
      throw new Error('获取公积金配置失败');
    }

    // 计算基数
    const base = input.base > 0 
      ? Math.min(Math.max(input.base, config.minBase), config.maxBase)
      : Math.min(Math.max(input.salary, config.minBase), config.maxBase);

    // 计算比例
    const rate = input.rate > 0 ? input.rate : config.rate;

    // 分步安全计算
    const baseNum = ensureNumber(base);
    const rateNum = ensureNumber(rate);
    
    const personalAmount = preciseRound(baseNum * rateNum);
    const employerAmount = preciseRound(baseNum * rateNum);
    const sum = ensureNumber(personalAmount) + ensureNumber(employerAmount);
    const totalAmount = preciseRound(sum);
    
    // 最终验证
    if (![baseNum, rateNum, personalAmount, employerAmount, totalAmount].every(Number.isFinite)) {
      throw new Error('计算结果包含无效数值');
    }

    // 结果验证
    if ([base, rate, personalAmount, employerAmount, totalAmount].some(isNaN)) {
      throw new Error('计算结果无效');
    }

    return {
      base,
      personalRate: rate * 100,
      employerRate: rate * 100,
      personalAmount,
      employerAmount,
      totalAmount,
      city: input.city,
      limits: {
        minBase: config.minBase,
        maxBase: config.maxBase
      }
    };
  }

  /**
   * 获取公积金缴费优化建议
   * @param {Object} params 计算参数
   * @param {number} params.salary 月工资
   * @param {number} params.currentBase 当前公积金基数
   * @param {number} params.currentRate 当前公积金缴费比例
   * @returns {Array} 优化建议
   */
  static getOptimizationSuggestions(params = {}) {
    const salary = ensureNumber(params.salary);
    const currentBase = ensureNumber(params.currentBase);
    const currentRate = ensureNumber(params.currentRate);
    
    const suggestions = [];
    
    // 基数优化建议
    if (currentBase < salary * 0.9) {
      suggestions.push({
        type: 'base',
        title: '提高公积金缴费基数',
        description: '当前缴费基数低于实际工资的90%，建议在年度调整时提高基数',
        priority: 'high'
      });
    }
    
    // 比例优化建议
    if (currentRate < 0.12) {
      suggestions.push({
        type: 'rate', 
        title: '提高公积金缴费比例',
        description: '当前缴费比例低于12%，建议在政策允许范围内提高比例',
        priority: 'medium'
      });
    }
    
    // 补充公积金建议
    suggestions.push({
      type: 'supplementary',
      title: '考虑补充公积金',
      description: '如单位支持补充公积金，可考虑参与以增加住房储备金',
      priority: 'low' 
    });
    
    return suggestions;
  }
}

module.exports = HousingFundCalculator;