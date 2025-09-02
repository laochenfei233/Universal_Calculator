/**
 * 个人所得税计算工具类
 * 提供各种个税计算功能，支持配置化管理
 */

const taxConfig = require('../config/taxConfig');

class TaxCalculator {
  /**
   * 计算月度工资个税
   * @param {Object} params 计算参数
   * @param {number} params.salary 税前工资
   * @param {number} params.socialInsurance 社保个人缴费
   * @param {number} params.housingFund 公积金个人缴费
   * @param {Object} params.specialDeductions 专项扣除
   * @param {number} params.year 税收年度
   * @returns {Object} 计算结果
   */
  static calculateMonthlySalaryTax(params) {
    const {
      salary,
      socialInsurance = 0,
      housingFund = 0,
      specialDeductions = {},
      year = new Date().getFullYear()
    } = params;

    // 获取基本减除费用
    const basicDeduction = taxConfig.getBasicDeduction(year);
    
    // 计算专项扣除总额
    const totalSpecialDeductions = this.calculateSpecialDeductions(specialDeductions);
    
    // 计算应纳税所得额
    const taxableIncome = Math.max(0, 
      salary - basicDeduction - socialInsurance - housingFund - totalSpecialDeductions.total
    );
    
    // 计算个税
    const tax = this.calculateTaxByBrackets(taxableIncome, taxConfig.getMonthlyTaxBrackets());
    
    // 计算税后收入
    const afterTaxIncome = salary - tax - socialInsurance - housingFund;
    
    return {
      grossSalary: salary,
      taxableIncome,
      tax: Math.round(tax * 100) / 100,
      afterTaxIncome: Math.round(afterTaxIncome * 100) / 100,
      deductions: {
        basicDeduction,
        socialInsurance,
        housingFund,
        specialDeductions: totalSpecialDeductions,
        totalDeductions: basicDeduction + socialInsurance + housingFund + totalSpecialDeductions.total
      },
      effectiveTaxRate: salary > 0 ? Math.round((tax / salary) * 10000) / 100 : 0, // 百分比，保留2位小数
      marginalTaxRate: this.getMarginalTaxRate(taxableIncome, taxConfig.getMonthlyTaxBrackets())
    };
  }

  /**
   * 计算年度综合所得个税
   * @param {Object} params 计算参数
   * @returns {Object} 计算结果
   */
  static calculateAnnualTax(params) {
    const {
      annualSalary,
      annualBonus = 0,
      otherIncome = 0,
      annualSocialInsurance = 0,
      annualHousingFund = 0,
      specialDeductions = {},
      bonusTaxMethod = 'combined', // 'separate' or 'combined'
      year = new Date().getFullYear()
    } = params;

    const basicDeduction = taxConfig.getBasicDeduction(year) * 12; // 年度基本减除费用
    const totalSpecialDeductions = this.calculateSpecialDeductions(specialDeductions, true); // 年度专项扣除
    
    let totalTax = 0;
    let taxDetails = {};

    if (bonusTaxMethod === 'separate' && annualBonus > 0) {
      // 年终奖单独计税
      const salaryTaxableIncome = Math.max(0, 
        annualSalary + otherIncome - basicDeduction - annualSocialInsurance - annualHousingFund - totalSpecialDeductions.total
      );
      const salaryTax = this.calculateTaxByBrackets(salaryTaxableIncome, taxConfig.getAnnualTaxBrackets());
      const bonusTax = this.calculateBonusTaxSeparate(annualBonus);
      
      totalTax = salaryTax + bonusTax;
      taxDetails = {
        salaryTax: Math.round(salaryTax * 100) / 100,
        bonusTax: Math.round(bonusTax * 100) / 100,
        method: 'separate'
      };
    } else {
      // 并入综合所得计税
      const totalTaxableIncome = Math.max(0,
        annualSalary + annualBonus + otherIncome - basicDeduction - annualSocialInsurance - annualHousingFund - totalSpecialDeductions.total
      );
      totalTax = this.calculateTaxByBrackets(totalTaxableIncome, taxConfig.getAnnualTaxBrackets());
      taxDetails = {
        totalTax: Math.round(totalTax * 100) / 100,
        method: 'combined'
      };
    }

    const totalGrossIncome = annualSalary + annualBonus + otherIncome;
    const afterTaxIncome = totalGrossIncome - totalTax - annualSocialInsurance - annualHousingFund;

    return {
      grossIncome: totalGrossIncome,
      taxableIncome: Math.max(0, totalGrossIncome - basicDeduction - annualSocialInsurance - annualHousingFund - totalSpecialDeductions.total),
      tax: Math.round(totalTax * 100) / 100,
      afterTaxIncome: Math.round(afterTaxIncome * 100) / 100,
      taxDetails,
      deductions: {
        basicDeduction,
        socialInsurance: annualSocialInsurance,
        housingFund: annualHousingFund,
        specialDeductions: totalSpecialDeductions,
        totalDeductions: basicDeduction + annualSocialInsurance + annualHousingFund + totalSpecialDeductions.total
      },
      effectiveTaxRate: totalGrossIncome > 0 ? Math.round((totalTax / totalGrossIncome) * 10000) / 100 : 0
    };
  }

  /**
   * 根据税率表计算税额
   * @param {number} taxableIncome 应纳税所得额
   * @param {Array} brackets 税率表
   * @returns {number} 税额
   */
  static calculateTaxByBrackets(taxableIncome, brackets) {
    if (taxableIncome <= 0) return 0;

    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        return taxableIncome * bracket.rate - bracket.quickDeduction;
      }
    }
    
    // 如果超出最高档，使用最高档税率
    const highestBracket = brackets[brackets.length - 1];
    return taxableIncome * highestBracket.rate - highestBracket.quickDeduction;
  }

  /**
   * 计算年终奖单独计税
   * @param {number} bonus 年终奖金额
   * @returns {number} 税额
   */
  static calculateBonusTaxSeparate(bonus) {
    if (bonus <= 0) return 0;

    const monthlyAmount = bonus / 12;
    const brackets = taxConfig.getMonthlyTaxBrackets();
    
    for (const bracket of brackets) {
      if (monthlyAmount >= bracket.min && monthlyAmount <= bracket.max) {
        return bonus * bracket.rate - bracket.quickDeduction;
      }
    }
    
    const highestBracket = brackets[brackets.length - 1];
    return bonus * highestBracket.rate - highestBracket.quickDeduction;
  }

  /**
   * 计算专项扣除总额
   * @param {Object} deductions 专项扣除项目
   * @param {boolean} isAnnual 是否为年度计算
   * @returns {Object} 专项扣除详情
   */
  static calculateSpecialDeductions(deductions, isAnnual = false) {
    const config = taxConfig.getSpecialDeductions();
    const result = {
      items: {},
      total: 0
    };

    const multiplier = isAnnual ? 12 : 1;

    // 子女教育
    if (deductions.childEducation && deductions.childEducation.count > 0) {
      const amount = Math.min(
        deductions.childEducation.count * config.childEducation.maxAmount * multiplier,
        deductions.childEducation.amount || (deductions.childEducation.count * config.childEducation.maxAmount * multiplier)
      );
      result.items.childEducation = {
        name: config.childEducation.name,
        amount,
        count: deductions.childEducation.count
      };
      result.total += amount;
    }

    // 继续教育
    if (deductions.continuingEducation && deductions.continuingEducation.amount > 0) {
      const maxAmount = config.continuingEducation.maxAmount * multiplier;
      const amount = Math.min(deductions.continuingEducation.amount, maxAmount);
      result.items.continuingEducation = {
        name: config.continuingEducation.name,
        amount
      };
      result.total += amount;
    }

    // 大病医疗（仅年度计算）
    if (isAnnual && deductions.medicalExpenses && deductions.medicalExpenses.amount > config.medicalExpenses.minAmount) {
      const amount = Math.min(
        deductions.medicalExpenses.amount - config.medicalExpenses.minAmount,
        config.medicalExpenses.maxAmount
      );
      result.items.medicalExpenses = {
        name: config.medicalExpenses.name,
        amount
      };
      result.total += amount;
    }

    // 住房贷款利息
    if (deductions.housingLoanInterest && deductions.housingLoanInterest.amount > 0) {
      const maxAmount = config.housingLoanInterest.maxAmount * multiplier;
      const amount = Math.min(deductions.housingLoanInterest.amount, maxAmount);
      result.items.housingLoanInterest = {
        name: config.housingLoanInterest.name,
        amount
      };
      result.total += amount;
    }

    // 住房租金
    if (deductions.housingRent && deductions.housingRent.amount > 0) {
      const cityTier = deductions.housingRent.cityTier || 'tier3';
      const maxAmount = config.housingRent.amounts[cityTier] * multiplier;
      const amount = Math.min(deductions.housingRent.amount, maxAmount);
      result.items.housingRent = {
        name: config.housingRent.name,
        amount,
        cityTier
      };
      result.total += amount;
    }

    // 赡养老人
    if (deductions.elderCare && deductions.elderCare.amount > 0) {
      const maxAmount = config.elderCare.maxAmount * multiplier;
      const amount = Math.min(deductions.elderCare.amount, maxAmount);
      result.items.elderCare = {
        name: config.elderCare.name,
        amount
      };
      result.total += amount;
    }

    // 3岁以下婴幼儿照护
    if (deductions.infantCare && deductions.infantCare.count > 0) {
      const amount = Math.min(
        deductions.infantCare.count * config.infantCare.maxAmount * multiplier,
        deductions.infantCare.amount || (deductions.infantCare.count * config.infantCare.maxAmount * multiplier)
      );
      result.items.infantCare = {
        name: config.infantCare.name,
        amount,
        count: deductions.infantCare.count
      };
      result.total += amount;
    }

    return result;
  }

  /**
   * 获取边际税率
   * @param {number} taxableIncome 应纳税所得额
   * @param {Array} brackets 税率表
   * @returns {number} 边际税率（百分比）
   */
  static getMarginalTaxRate(taxableIncome, brackets) {
    if (taxableIncome <= 0) return 0;

    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        return bracket.rate * 100;
      }
    }
    
    const highestBracket = brackets[brackets.length - 1];
    return highestBracket.rate * 100;
  }

  /**
   * 计算社保公积金
   * @param {Object} params 计算参数
   * @returns {Object} 社保公积金详情
   */
  static calculateSocialInsurance(params) {
    const {
      salary,
      city = 'national',
      customRates = {}
    } = params;

    const limits = taxConfig.getSocialInsuranceLimits(city);
    const result = {
      items: {},
      total: 0
    };

    // 计算各项社保公积金
    Object.keys(limits).forEach(key => {
      const config = limits[key];
      const rate = customRates[key] || config.rate;
      const base = Math.min(Math.max(salary, config.minBase), config.maxBase);
      const amount = Math.round(base * rate * 100) / 100;
      
      result.items[key] = {
        name: this.getSocialInsuranceName(key),
        base,
        rate: rate * 100, // 转换为百分比
        amount
      };
      result.total += amount;
    });

    result.total = Math.round(result.total * 100) / 100;
    return result;
  }

  /**
   * 获取社保公积金项目名称
   * @param {string} key 项目键
   * @returns {string} 项目名称
   */
  static getSocialInsuranceName(key) {
    const names = {
      pensionInsurance: '养老保险',
      medicalInsurance: '医疗保险',
      unemploymentInsurance: '失业保险',
      housingFund: '住房公积金'
    };
    return names[key] || key;
  }

  /**
   * 税收优化建议
   * @param {Object} taxResult 税收计算结果
   * @returns {Array} 优化建议
   */
  static getTaxOptimizationSuggestions(taxResult) {
    const suggestions = [];
    const { deductions, effectiveTaxRate, marginalTaxRate } = taxResult;

    // 专项扣除建议
    if (!deductions.specialDeductions || deductions.specialDeductions.total < 2000) {
      suggestions.push({
        type: 'specialDeductions',
        title: '完善专项扣除申报',
        description: '建议完善子女教育、住房租金/贷款利息、赡养老人等专项扣除申报，可有效降低税负',
        priority: 'high'
      });
    }

    // 年终奖计税方式建议
    if (marginalTaxRate > 10) {
      suggestions.push({
        type: 'bonusMethod',
        title: '优化年终奖计税方式',
        description: '建议对比年终奖单独计税和并入综合所得计税两种方式，选择税负较低的方案',
        priority: 'medium'
      });
    }

    // 社保公积金优化
    suggestions.push({
      type: 'socialInsurance',
      title: '合理规划社保公积金缴费',
      description: '在政策允许范围内，适当提高公积金缴费比例可以减少应纳税所得额',
      priority: 'low'
    });

    return suggestions;
  }
}

module.exports = TaxCalculator;