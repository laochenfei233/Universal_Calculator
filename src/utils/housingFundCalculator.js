/**
 * 公积金基数计算工具类
 * 提供公积金基数计算、缴费额计算等功能
 */

const taxConfig = require('../config/taxConfig');

class HousingFundCalculator {
  /**
   * 计算公积金缴费金额
   * @param {Object} params 计算参数
   * @param {number} params.salary 月工资
   * @param {number} params.base 公积金缴费基数
   * @param {number} params.rate 公积金缴费比例
   * @param {string} params.city 城市代码
   * @returns {Object} 计算结果
   */
  static calculateHousingFund(params) {
    // 参数验证
    if (!params || typeof params !== 'object') {
      throw new Error('参数必须是一个对象');
    }

    const {
      salary,
      base = 0,
      rate = 0,
      city = 'national'
    } = params;

    // 验证必填参数
    if (salary === undefined || salary === null) {
      throw new Error('工资(salary)是必填参数');
    }

    // 获取城市公积金限额配置
    const limits = taxConfig.getSocialInsuranceLimits(city);
    const housingFundConfig = limits.housingFund;
    
    // 验证配置
    if (!housingFundConfig || !housingFundConfig.minBase || !housingFundConfig.maxBase || !housingFundConfig.rate) {
      throw new Error(`获取${city}公积金配置失败`);
    }

    // 如果没有指定基数，则根据工资自动计算基数
    const actualBase = base > 0 ? 
      Math.min(Math.max(base, housingFundConfig.minBase), housingFundConfig.maxBase) : 
      this.calculateBase(salary, housingFundConfig);
    
    // 如果没有指定比例，则使用默认比例
    const actualRate = rate > 0 ? 
      Math.min(Math.max(rate, 0.05), 0.24) : // 比例范围5%-24%
      housingFundConfig.rate;
    
    // 计算个人缴费金额（精确到分）
    const personalAmount = parseFloat((actualBase * actualRate).toFixed(2));
    
    // 计算单位缴费金额（通常与个人相同或更高）
    const employerAmount = parseFloat((actualBase * actualRate).toFixed(2));
    
    // 计算总缴费金额
    const totalAmount = parseFloat((personalAmount + employerAmount).toFixed(2));
    
    // 验证计算结果
    if (isNaN(personalAmount) || isNaN(employerAmount) || isNaN(totalAmount)) {
      throw new Error('计算结果无效');
    }
    
    return {
      base: actualBase,
      personalRate: actualRate * 100, // 转为百分比
      employerRate: actualRate * 100, // 转为百分比
      personalAmount,
      employerAmount,
      totalAmount,
      city,
      limits: {
        minBase: housingFundConfig.minBase,
        maxBase: housingFundConfig.maxBase
      }
    };
  }

  /**
   * 根据工资自动计算公积金缴费基数
   * @param {number} salary 月工资
   * @param {Object} config 公积金配置
   * @returns {number} 缴费基数
   */
  static calculateBase(salary, config) {
    // 参数验证
    if (salary === undefined || salary === null || isNaN(salary)) {
      throw new Error('工资(salary)必须是有效数字');
    }
    
    if (!config || !config.minBase || !config.maxBase) {
      throw new Error('公积金配置无效');
    }

    // 基数不能低于最低基数，不能高于最高基数
    const base = Math.min(Math.max(salary, config.minBase), config.maxBase);
    
    // 验证计算结果
    if (isNaN(base)) {
      throw new Error('基数计算失败');
    }
    
    return base;
  }

  /**
   * 计算公积金基数调整方案
   * @param {Object} params 计算参数
   * @param {number} params.averageSalary 上年度职工月平均工资
   * @param {number} params.personalSalary 个人月平均工资
   * @param {number} params.currentBase 当前公积金基数
   * @param {number} params.rate 公积金缴费比例
   * @param {string} params.city 城市代码
   * @returns {Object} 调整方案
   */
  static calculateBaseAdjustment(params) {
    const {
      averageSalary,
      personalSalary,
      currentBase = 0,
      rate = 0.12,
      city = 'national'
    } = params;

    // 获取城市公积金限额配置
    const limits = taxConfig.getSocialInsuranceLimits(city);
    const housingFundConfig = limits.housingFund;
    
    // 计算新基数（基于个人工资）
    const newBaseOnSalary = Math.min(Math.max(personalSalary, housingFundConfig.minBase), housingFundConfig.maxBase);
    
    // 计算新基数（基于社会平均工资）
    const minBaseOnAverage = averageSalary * 0.6; // 通常为社平工资的60%
    const maxBaseOnAverage = averageSalary * 3;   // 通常为社平工资的300%
    
    const newBaseOnAverage = Math.min(Math.max(personalSalary, minBaseOnAverage), maxBaseOnAverage);
    const newBase = Math.min(newBaseOnAverage, housingFundConfig.maxBase);
    
    // 计算调整前后的缴费变化
    const currentPersonalAmount = currentBase * rate;
    const newPersonalAmount = newBase * rate;
    const monthlyDifference = newPersonalAmount - currentPersonalAmount;
    const annualDifference = monthlyDifference * 12;
    
    return {
      currentBase,
      recommendedBase: newBase,
      currentMonthlyPayment: Math.round(currentPersonalAmount * 100) / 100,
      newMonthlyPayment: Math.round(newPersonalAmount * 100) / 100,
      monthlyDifference: Math.round(monthlyDifference * 100) / 100,
      annualDifference: Math.round(annualDifference * 100) / 100,
      rate: rate * 100, // 转为百分比
      limits: {
        minBase: housingFundConfig.minBase,
        maxBase: housingFundConfig.maxBase
      },
      averageSalaryLimits: {
        minBase: Math.round(minBaseOnAverage * 100) / 100,
        maxBase: Math.round(maxBaseOnAverage * 100) / 100
      }
    };
  }

  /**
   * 计算公积金贷款额度
   * @param {Object} params 计算参数
   * @param {number} params.base 公积金缴费基数
   * @param {number} params.balance 公积金账户余额
   * @param {number} params.monthlyIncome 月收入
   * @param {number} params.years 贷款年限
   * @param {number} params.rate 贷款利率
   * @returns {Object} 贷款额度计算结果
   */
  static calculateLoanLimit(params) {
    const {
      base = 0,
      balance = 0,
      monthlyIncome = 0,
      years = 30,
      rate = 0.031 // 3.1%为公积金贷款基准利率
    } = params;

    // 基于账户余额计算（通常为账户余额的10-15倍）
    const balanceBasedLimit = balance * 15;
    
    // 基于缴费基数计算（通常为缴费基数的15-20倍）
    const baseBasedLimit = base * 20;
    
    // 基于还款能力计算（月供不超过月收入的50%）
    // 使用等额本息还款公式: 月供 = 贷款本金 × 月利率 × (1+月利率)^还款月数 / [(1+月利率)^还款月数 - 1]
    const monthlyRate = rate / 12;
    const months = years * 12;
    const maxMonthlyPayment = monthlyIncome * 0.5;
    
    // 根据月供反推最大贷款额
    const incomeBasedLimit = maxMonthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
    
    // 取三种计算方式的最小值作为最终贷款额度
    const loanLimit = Math.min(balanceBasedLimit, baseBasedLimit, incomeBasedLimit);
    
    return {
      loanLimit: Math.round(loanLimit * 100) / 100,
      balanceBasedLimit: Math.round(balanceBasedLimit * 100) / 100,
      baseBasedLimit: Math.round(baseBasedLimit * 100) / 100,
      incomeBasedLimit: Math.round(incomeBasedLimit * 100) / 100,
      maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      years,
      rate: rate * 100 // 转为百分比
    };
  }

  /**
   * 获取公积金提取额度
   * @param {Object} params 计算参数
   * @param {number} params.balance 公积金账户余额
   * @param {number} params.monthlyRent 月租金
   * @param {number} params.withdrawalType 提取类型（rent=租房, medical=医疗, education=教育）
   * @returns {Object} 提取额度计算结果
   */
  static calculateWithdrawalLimit(params) {
    const {
      balance = 0,
      monthlyRent = 0,
      withdrawalType = 'rent'
    } = params;

    let withdrawalLimit = 0;
    let reason = '';
    
    switch (withdrawalType) {
      case 'rent':
        // 租房提取通常不超过月租金的100%，且不超过账户余额
        withdrawalLimit = Math.min(monthlyRent, balance);
        reason = '租房提取额度不超过实际租金支出';
        break;
        
      case 'medical':
        // 医疗提取通常不超过账户余额的80%
        withdrawalLimit = balance * 0.8;
        reason = '医疗提取额度不超过账户余额的80%';
        break;
        
      case 'education':
        // 教育提取通常不超过账户余额的50%
        withdrawalLimit = balance * 0.5;
        reason = '教育提取额度不超过账户余额的50%';
        break;
        
      default:
        // 其他情况默认不超过账户余额的30%
        withdrawalLimit = balance * 0.3;
        reason = '其他提取额度不超过账户余额的30%';
    }
    
    return {
      withdrawalLimit: Math.round(withdrawalLimit * 100) / 100,
      balance,
      withdrawalType,
      reason
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
  static getOptimizationSuggestions(params) {
    const {
      salary,
      currentBase,
      currentRate
    } = params;

    const suggestions = [];
    
    // 基数优化建议
    if (currentBase < salary * 0.9) {
      suggestions.push({
        type: 'base',
        title: '提高公积金缴费基数',
        description: '当前缴费基数低于实际工资的90%，建议在年度调整时提高基数以增加公积金积累',
        priority: 'high'
      });
    }
    
    // 比例优化建议
    if (currentRate < 0.12) {
      suggestions.push({
        type: 'rate',
        title: '提高公积金缴费比例',
        description: '当前缴费比例低于12%，建议在政策允许范围内提高缴费比例以增加公积金积累',
        priority: 'medium'
      });
    }
    
    // 补充公积金建议
    suggestions.push({
      type: 'supplementary',
      title: '考虑补充公积金',
      description: '如单位支持补充公积金，可考虑参与以进一步增加住房储备金',
      priority: 'low'
    });
    
    return suggestions;
  }
}

module.exports = HousingFundCalculator;