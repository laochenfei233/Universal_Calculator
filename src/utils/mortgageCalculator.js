/**
 * 房贷计算工具类
 * 提供详细的房贷计算功能，包括还款计划、提前还款等
 */

class MortgageCalculator {
  /**
   * 计算等额本息还款
   * @param {Object} params 计算参数
   * @param {number} params.principal 贷款本金
   * @param {number} params.rate 年利率（百分比）
   * @param {number} params.years 贷款年限
   * @param {boolean} params.includeSchedule 是否包含还款计划
   * @returns {Object} 计算结果
   */
  static calculateEqualPayment(params) {
    const { principal, rate, years, includeSchedule = false } = params;
    
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    
    // 计算月供
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    
    const result = {
      type: '等额本息',
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      principal,
      rate,
      years,
      months,
      averageMonthlyInterest: Math.round((totalInterest / months) * 100) / 100,
      interestRate: Math.round((totalInterest / principal) * 10000) / 100 // 百分比
    };
    
    if (includeSchedule) {
      result.schedule = this.generateEqualPaymentSchedule(principal, monthlyRate, months, monthlyPayment);
    }
    
    return result;
  }

  /**
   * 计算等额本金还款
   * @param {Object} params 计算参数
   * @returns {Object} 计算结果
   */
  static calculateEqualPrincipal(params) {
    const { principal, rate, years, includeSchedule = false } = params;
    
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;
    const monthlyPrincipal = principal / months;
    
    // 首月还款额
    const firstPayment = monthlyPrincipal + principal * monthlyRate;
    // 末月还款额
    const lastPayment = monthlyPrincipal + monthlyPrincipal * monthlyRate;
    // 总利息
    const totalInterest = principal * monthlyRate * (months + 1) / 2;
    const totalPayment = principal + totalInterest;
    
    const result = {
      type: '等额本金',
      firstPayment: Math.round(firstPayment * 100) / 100,
      lastPayment: Math.round(lastPayment * 100) / 100,
      monthlyPrincipal: Math.round(monthlyPrincipal * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      principal,
      rate,
      years,
      months,
      averageMonthlyPayment: Math.round(((firstPayment + lastPayment) / 2) * 100) / 100,
      interestRate: Math.round((totalInterest / principal) * 10000) / 100
    };
    
    if (includeSchedule) {
      result.schedule = this.generateEqualPrincipalSchedule(principal, monthlyRate, months, monthlyPrincipal);
    }
    
    return result;
  }

  /**
   * 生成等额本息还款计划
   * @param {number} principal 本金
   * @param {number} monthlyRate 月利率
   * @param {number} months 总月数
   * @param {number} monthlyPayment 月供
   * @returns {Array} 还款计划
   */
  static generateEqualPaymentSchedule(principal, monthlyRate, months, monthlyPayment) {
    const schedule = [];
    let remainingPrincipal = principal;
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingPrincipal -= principalPayment;
      
      // 处理最后一期的精度问题
      if (month === months) {
        remainingPrincipal = 0;
      }
      
      schedule.push({
        month,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        principalPayment: Math.round(principalPayment * 100) / 100,
        interestPayment: Math.round(interestPayment * 100) / 100,
        remainingPrincipal: Math.round(Math.max(0, remainingPrincipal) * 100) / 100,
        cumulativePrincipal: Math.round((principal - remainingPrincipal) * 100) / 100,
        cumulativeInterest: Math.round((monthlyPayment * month - (principal - remainingPrincipal)) * 100) / 100
      });
    }
    
    return schedule;
  }

  /**
   * 生成等额本金还款计划
   * @param {number} principal 本金
   * @param {number} monthlyRate 月利率
   * @param {number} months 总月数
   * @param {number} monthlyPrincipal 月还本金
   * @returns {Array} 还款计划
   */
  static generateEqualPrincipalSchedule(principal, monthlyRate, months, monthlyPrincipal) {
    const schedule = [];
    let remainingPrincipal = principal;
    let cumulativeInterest = 0;
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const monthlyPayment = monthlyPrincipal + interestPayment;
      remainingPrincipal -= monthlyPrincipal;
      cumulativeInterest += interestPayment;
      
      // 处理最后一期的精度问题
      if (month === months) {
        remainingPrincipal = 0;
      }
      
      schedule.push({
        month,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        principalPayment: Math.round(monthlyPrincipal * 100) / 100,
        interestPayment: Math.round(interestPayment * 100) / 100,
        remainingPrincipal: Math.round(Math.max(0, remainingPrincipal) * 100) / 100,
        cumulativePrincipal: Math.round((principal - remainingPrincipal) * 100) / 100,
        cumulativeInterest: Math.round(cumulativeInterest * 100) / 100
      });
    }
    
    return schedule;
  }

  /**
   * 计算提前还款
   * @param {Object} params 计算参数
   * @param {number} params.principal 原贷款本金
   * @param {number} params.rate 年利率
   * @param {number} params.years 原贷款年限
   * @param {string} params.type 还款类型
   * @param {number} params.prepaymentAmount 提前还款金额
   * @param {number} params.prepaymentMonth 提前还款月份
   * @param {string} params.prepaymentType 提前还款类型：'reduce_term'（缩短年限）或 'reduce_payment'（减少月供）
   * @returns {Object} 提前还款计算结果
   */
  static calculatePrepayment(params) {
    const {
      principal,
      rate,
      years,
      type,
      prepaymentAmount,
      prepaymentMonth,
      prepaymentType = 'reduce_term'
    } = params;

    // 先计算原始还款计划
    const originalLoan = type === 'equal' 
      ? this.calculateEqualPayment({ principal, rate, years, includeSchedule: true })
      : this.calculateEqualPrincipal({ principal, rate, years, includeSchedule: true });

    // 获取提前还款时点的剩余本金
    const scheduleBeforePrepayment = originalLoan.schedule.slice(0, prepaymentMonth - 1);
    const remainingPrincipalBeforePrepayment = prepaymentMonth === 1 
      ? principal 
      : originalLoan.schedule[prepaymentMonth - 2].remainingPrincipal;

    // 验证提前还款金额
    if (prepaymentAmount >= remainingPrincipalBeforePrepayment) {
      return {
        error: '提前还款金额不能大于或等于剩余本金',
        remainingPrincipal: remainingPrincipalBeforePrepayment
      };
    }

    const newPrincipal = remainingPrincipalBeforePrepayment - prepaymentAmount;
    const remainingMonths = originalLoan.months - prepaymentMonth + 1;
    const monthlyRate = rate / 100 / 12;

    let newLoanPlan;
    
    if (prepaymentType === 'reduce_term') {
      // 缩短年限，保持月供不变
      if (type === 'equal') {
        const originalMonthlyPayment = originalLoan.monthlyPayment;
        // 计算新的还款期数
        const newMonths = Math.ceil(
          Math.log(1 + (newPrincipal * monthlyRate) / originalMonthlyPayment) / 
          Math.log(1 + monthlyRate)
        );
        
        newLoanPlan = this.calculateEqualPayment({
          principal: newPrincipal,
          rate,
          years: newMonths / 12,
          includeSchedule: true
        });
        
        newLoanPlan.reducedMonths = remainingMonths - newMonths;
        newLoanPlan.reducedYears = Math.round((newLoanPlan.reducedMonths / 12) * 100) / 100;
      } else {
        // 等额本金缩短年限
        const originalMonthlyPrincipal = originalLoan.monthlyPrincipal;
        const newMonths = Math.ceil(newPrincipal / originalMonthlyPrincipal);
        
        newLoanPlan = this.calculateEqualPrincipal({
          principal: newPrincipal,
          rate,
          years: newMonths / 12,
          includeSchedule: true
        });
        
        newLoanPlan.reducedMonths = remainingMonths - newMonths;
        newLoanPlan.reducedYears = Math.round((newLoanPlan.reducedMonths / 12) * 100) / 100;
      }
    } else {
      // 减少月供，保持年限不变
      newLoanPlan = type === 'equal'
        ? this.calculateEqualPayment({
            principal: newPrincipal,
            rate,
            years: remainingMonths / 12,
            includeSchedule: true
          })
        : this.calculateEqualPrincipal({
            principal: newPrincipal,
            rate,
            years: remainingMonths / 12,
            includeSchedule: true
          });
      
      const originalRemainingPayment = type === 'equal' 
        ? originalLoan.monthlyPayment 
        : originalLoan.schedule[prepaymentMonth - 1].monthlyPayment;
      
      newLoanPlan.monthlyPaymentReduction = Math.round((originalRemainingPayment - (type === 'equal' ? newLoanPlan.monthlyPayment : newLoanPlan.firstPayment)) * 100) / 100;
    }

    // 计算节省的利息
    const originalRemainingInterest = originalLoan.schedule
      .slice(prepaymentMonth - 1)
      .reduce((sum, payment) => sum + payment.interestPayment, 0);
    
    const interestSaved = Math.round((originalRemainingInterest - newLoanPlan.totalInterest) * 100) / 100;

    return {
      prepaymentAmount,
      prepaymentMonth,
      prepaymentType,
      originalLoan: {
        totalInterest: originalLoan.totalInterest,
        totalPayment: originalLoan.totalPayment,
        remainingInterest: Math.round(originalRemainingInterest * 100) / 100,
        remainingPayment: Math.round((remainingPrincipalBeforePrepayment + originalRemainingInterest) * 100) / 100
      },
      newLoan: newLoanPlan,
      savings: {
        interestSaved,
        totalSaved: Math.round((interestSaved + prepaymentAmount) * 100) / 100,
        paymentReduction: newLoanPlan.monthlyPaymentReduction || 0,
        termReduction: {
          months: newLoanPlan.reducedMonths || 0,
          years: newLoanPlan.reducedYears || 0
        }
      },
      beforePrepayment: scheduleBeforePrepayment,
      afterPrepayment: newLoanPlan.schedule
    };
  }

  /**
   * 比较不同还款方式
   * @param {Object} params 计算参数
   * @returns {Object} 比较结果
   */
  static comparePaymentMethods(params) {
    const { principal, rate, years } = params;
    
    const equalPayment = this.calculateEqualPayment({ principal, rate, years });
    const equalPrincipal = this.calculateEqualPrincipal({ principal, rate, years });
    
    const interestDifference = equalPayment.totalInterest - equalPrincipal.totalInterest;
    const paymentDifference = equalPayment.monthlyPayment - equalPrincipal.firstPayment;
    
    return {
      equalPayment: {
        ...equalPayment,
        pros: ['月供固定，便于规划', '初期还款压力较小'],
        cons: ['总利息较高', '前期还本金较少']
      },
      equalPrincipal: {
        ...equalPrincipal,
        pros: ['总利息较少', '还款压力逐月递减'],
        cons: ['初期还款压力大', '月供不固定']
      },
      comparison: {
        interestDifference: Math.round(interestDifference * 100) / 100,
        initialPaymentDifference: Math.round(paymentDifference * 100) / 100,
        recommendation: interestDifference > 0 ? 'equalPrincipal' : 'equalPayment',
        analysis: {
          interestSavings: Math.round(Math.abs(interestDifference) * 100) / 100,
          percentageSavings: Math.round((Math.abs(interestDifference) / equalPayment.totalInterest) * 10000) / 100
        }
      }
    };
  }

  /**
   * 计算房贷承受能力
   * @param {Object} params 计算参数
   * @param {number} params.monthlyIncome 月收入
   * @param {number} params.monthlyExpenses 月支出
   * @param {number} params.rate 年利率
   * @param {number} params.years 贷款年限
   * @param {number} params.debtToIncomeRatio 负债收入比（默认0.5）
   * @returns {Object} 承受能力分析
   */
  static calculateAffordability(params) {
    const {
      monthlyIncome,
      monthlyExpenses = 0,
      rate,
      years,
      debtToIncomeRatio = 0.5
    } = params;

    const availableIncome = monthlyIncome - monthlyExpenses;
    const maxMonthlyPayment = Math.min(
      availableIncome * 0.7, // 不超过可支配收入的70%
      monthlyIncome * debtToIncomeRatio // 不超过总收入的50%
    );

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    // 根据月供能力计算最大贷款额
    const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, months));

    return {
      monthlyIncome,
      monthlyExpenses,
      availableIncome: Math.round(availableIncome * 100) / 100,
      maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
      debtToIncomeRatio: Math.round((maxMonthlyPayment / monthlyIncome) * 10000) / 100,
      recommendations: {
        conservative: Math.round(maxLoanAmount * 0.8 * 100) / 100,
        moderate: Math.round(maxLoanAmount * 0.9 * 100) / 100,
        aggressive: Math.round(maxLoanAmount * 100) / 100
      },
      riskAssessment: this.assessRisk(maxMonthlyPayment / monthlyIncome)
    };
  }

  /**
   * 风险评估
   * @param {number} ratio 负债收入比
   * @returns {Object} 风险评估结果
   */
  static assessRisk(ratio) {
    if (ratio <= 0.3) {
      return {
        level: 'low',
        description: '低风险',
        advice: '还款压力较小，财务状况良好'
      };
    } else if (ratio <= 0.5) {
      return {
        level: 'medium',
        description: '中等风险',
        advice: '还款压力适中，建议预留应急资金'
      };
    } else {
      return {
        level: 'high',
        description: '高风险',
        advice: '还款压力较大，建议降低贷款金额或延长还款期限'
      };
    }
  }

  /**
   * 生成还款计划摘要
   * @param {Array} schedule 还款计划
   * @param {number} groupBy 分组方式（月数）
   * @returns {Array} 摘要数据
   */
  static generateScheduleSummary(schedule, groupBy = 12) {
    const summary = [];
    
    for (let i = 0; i < schedule.length; i += groupBy) {
      const group = schedule.slice(i, i + groupBy);
      const yearNumber = Math.floor(i / groupBy) + 1;
      
      const yearSummary = {
        year: yearNumber,
        startMonth: group[0].month,
        endMonth: group[group.length - 1].month,
        totalPayment: Math.round(group.reduce((sum, month) => sum + month.monthlyPayment, 0) * 100) / 100,
        totalPrincipal: Math.round(group.reduce((sum, month) => sum + month.principalPayment, 0) * 100) / 100,
        totalInterest: Math.round(group.reduce((sum, month) => sum + month.interestPayment, 0) * 100) / 100,
        remainingPrincipal: group[group.length - 1].remainingPrincipal
      };
      
      summary.push(yearSummary);
    }
    
    return summary;
  }
}

module.exports = MortgageCalculator;