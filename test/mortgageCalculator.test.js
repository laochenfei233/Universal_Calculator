/**
 * 房贷计算器测试
 */

const MortgageCalculator = require('../src/utils/mortgageCalculator');

describe('MortgageCalculator', () => {
  describe('calculateEqualPayment', () => {
    test('应该正确计算等额本息还款', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 1000000,
        rate: 4.5,
        years: 30
      });

      expect(result.type).toBe('等额本息');
      expect(result.principal).toBe(1000000);
      expect(result.rate).toBe(4.5);
      expect(result.years).toBe(30);
      expect(result.months).toBe(360);
      expect(result.monthlyPayment).toBeCloseTo(5066.85, 2);
      expect(result.totalPayment).toBeCloseTo(1824067, 0);
      expect(result.totalInterest).toBeCloseTo(824067, 0);
    });

    test('应该包含还款计划当请求时', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 5.0,
        years: 2,
        includeSchedule: true
      });

      expect(result.schedule).toBeDefined();
      expect(result.schedule).toHaveLength(24);
      expect(result.schedule[0]).toHaveProperty('month', 1);
      expect(result.schedule[0]).toHaveProperty('monthlyPayment');
      expect(result.schedule[0]).toHaveProperty('principalPayment');
      expect(result.schedule[0]).toHaveProperty('interestPayment');
      expect(result.schedule[0]).toHaveProperty('remainingPrincipal');
    });
  });

  describe('calculateEqualPrincipal', () => {
    test('应该正确计算等额本金还款', () => {
      const result = MortgageCalculator.calculateEqualPrincipal({
        principal: 1000000,
        rate: 4.5,
        years: 30
      });

      expect(result.type).toBe('等额本金');
      expect(result.principal).toBe(1000000);
      expect(result.monthlyPrincipal).toBeCloseTo(2777.78, 2);
      expect(result.firstPayment).toBeCloseTo(6527.78, 2);
      expect(result.lastPayment).toBeCloseTo(2788.19, 2);
      expect(result.totalInterest).toBeCloseTo(676875, 2);
    });

    test('应该包含还款计划当请求时', () => {
      const result = MortgageCalculator.calculateEqualPrincipal({
        principal: 100000,
        rate: 5.0,
        years: 2,
        includeSchedule: true
      });

      expect(result.schedule).toBeDefined();
      expect(result.schedule).toHaveLength(24);
      
      // 验证第一期
      const firstPayment = result.schedule[0];
      expect(firstPayment.month).toBe(1);
      expect(firstPayment.principalPayment).toBeCloseTo(4166.67, 2);
      expect(firstPayment.interestPayment).toBeCloseTo(416.67, 2);
      
      // 验证最后一期
      const lastPayment = result.schedule[23];
      expect(lastPayment.month).toBe(24);
      expect(lastPayment.remainingPrincipal).toBe(0);
    });
  });

  describe('calculatePrepayment', () => {
    test('应该正确计算提前还款（缩短年限）', () => {
      const result = MortgageCalculator.calculatePrepayment({
        principal: 1000000,
        rate: 4.5,
        years: 30,
        type: 'equal',
        prepaymentAmount: 200000,
        prepaymentMonth: 12,
        prepaymentType: 'reduce_term'
      });

      expect(result.prepaymentAmount).toBe(200000);
      expect(result.prepaymentMonth).toBe(12);
      expect(result.prepaymentType).toBe('reduce_term');
      expect(result.savings.interestSaved).toBeGreaterThan(0);
      expect(result.newLoan.reducedMonths).toBeGreaterThan(0);
      expect(result.newLoan.reducedYears).toBeGreaterThan(0);
    });

    test('应该正确计算提前还款（减少月供）', () => {
      const result = MortgageCalculator.calculatePrepayment({
        principal: 1000000,
        rate: 4.5,
        years: 30,
        type: 'equal',
        prepaymentAmount: 100000,
        prepaymentMonth: 24,
        prepaymentType: 'reduce_payment'
      });

      expect(result.prepaymentType).toBe('reduce_payment');
      expect(result.newLoan.monthlyPaymentReduction).toBeGreaterThan(0);
      expect(result.savings.paymentReduction).toBeGreaterThan(0);
    });

    test('应该拒绝过大的提前还款金额', () => {
      const result = MortgageCalculator.calculatePrepayment({
        principal: 100000,
        rate: 4.5,
        years: 30,
        type: 'equal',
        prepaymentAmount: 100000, // 等于本金
        prepaymentMonth: 1,
        prepaymentType: 'reduce_term'
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('提前还款金额不能大于或等于剩余本金');
    });
  });

  describe('comparePaymentMethods', () => {
    test('应该正确对比两种还款方式', () => {
      const result = MortgageCalculator.comparePaymentMethods({
        principal: 1000000,
        rate: 4.5,
        years: 30
      });

      expect(result.equalPayment).toBeDefined();
      expect(result.equalPrincipal).toBeDefined();
      expect(result.comparison).toBeDefined();
      
      expect(result.equalPayment.type).toBe('等额本息');
      expect(result.equalPrincipal.type).toBe('等额本金');
      
      expect(result.comparison.interestDifference).toBeGreaterThan(0);
      expect(result.comparison.recommendation).toBe('equalPrincipal'); // 等额本金利息更少
      
      expect(result.equalPayment.pros).toContain('月供固定，便于规划');
      expect(result.equalPrincipal.pros).toContain('总利息较少');
    });
  });

  describe('calculateAffordability', () => {
    test('应该正确计算房贷承受能力', () => {
      const result = MortgageCalculator.calculateAffordability({
        monthlyIncome: 20000,
        monthlyExpenses: 8000,
        rate: 4.5,
        years: 30,
        debtToIncomeRatio: 0.5
      });

      expect(result.monthlyIncome).toBe(20000);
      expect(result.monthlyExpenses).toBe(8000);
      expect(result.availableIncome).toBe(12000);
      expect(result.maxMonthlyPayment).toBeLessThanOrEqual(10000); // 不超过收入的50%
      expect(result.maxLoanAmount).toBeGreaterThan(0);
      
      expect(result.recommendations).toHaveProperty('conservative');
      expect(result.recommendations).toHaveProperty('moderate');
      expect(result.recommendations).toHaveProperty('aggressive');
      
      expect(result.riskAssessment).toHaveProperty('level');
      expect(result.riskAssessment).toHaveProperty('description');
      expect(result.riskAssessment).toHaveProperty('advice');
    });

    test('应该正确评估风险等级', () => {
      // 低风险
      const lowRisk = MortgageCalculator.calculateAffordability({
        monthlyIncome: 20000,
        monthlyExpenses: 5000,
        rate: 4.5,
        years: 30,
        debtToIncomeRatio: 0.25
      });
      expect(lowRisk.riskAssessment.level).toBe('low');

      // 中等风险
      const mediumRisk = MortgageCalculator.calculateAffordability({
        monthlyIncome: 20000,
        monthlyExpenses: 8000,
        rate: 4.5,
        years: 30,
        debtToIncomeRatio: 0.4
      });
      expect(mediumRisk.riskAssessment.level).toBe('medium');

      // 高风险
      const highRisk = MortgageCalculator.calculateAffordability({
        monthlyIncome: 20000,
        monthlyExpenses: 5000,
        rate: 4.5,
        years: 30,
        debtToIncomeRatio: 0.6
      });
      expect(highRisk.riskAssessment.level).toBe('high');
    });
  });

  describe('generateScheduleSummary', () => {
    test('应该正确生成年度还款摘要', () => {
      const schedule = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 5.0,
        years: 2,
        includeSchedule: true
      }).schedule;

      const summary = MortgageCalculator.generateScheduleSummary(schedule, 12);
      
      expect(summary).toHaveLength(2); // 2年
      expect(summary[0].year).toBe(1);
      expect(summary[0].startMonth).toBe(1);
      expect(summary[0].endMonth).toBe(12);
      expect(summary[0]).toHaveProperty('totalPayment');
      expect(summary[0]).toHaveProperty('totalPrincipal');
      expect(summary[0]).toHaveProperty('totalInterest');
      
      expect(summary[1].year).toBe(2);
      expect(summary[1].startMonth).toBe(13);
      expect(summary[1].endMonth).toBe(24);
    });
  });

  describe('边界情况测试', () => {
    test('应该处理极小贷款金额', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 1000,
        rate: 4.5,
        years: 1
      });

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    test('应该处理极高利率', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 15.0,
        years: 10
      });

      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(result.principal * 0.5); // 高利率应产生大量利息
    });

    test('应该处理短期贷款', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 4.5,
        years: 1
      });

      expect(result.months).toBe(12);
      expect(result.monthlyPayment).toBeCloseTo(8537.85, 2);
    });

    test('应该处理长期贷款', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 4.5,
        years: 50
      });

      expect(result.months).toBe(600);
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(result.principal);
    });
  });

  describe('精度测试', () => {
    test('还款计划的本金和利息应该准确', () => {
      const result = MortgageCalculator.calculateEqualPayment({
        principal: 100000,
        rate: 5.0,
        years: 2,
        includeSchedule: true
      });

      // 验证最后一期剩余本金为0
      const lastPayment = result.schedule[result.schedule.length - 1];
      expect(lastPayment.remainingPrincipal).toBe(0);

      // 验证累计本金等于贷款本金
      expect(lastPayment.cumulativePrincipal).toBeCloseTo(result.principal, 2);

      // 验证累计利息等于总利息
      expect(lastPayment.cumulativeInterest).toBeCloseTo(result.totalInterest, 2);
    });

    test('等额本金还款计划应该准确', () => {
      const result = MortgageCalculator.calculateEqualPrincipal({
        principal: 100000,
        rate: 5.0,
        years: 2,
        includeSchedule: true
      });

      // 验证每期本金相等
      const firstPrincipal = result.schedule[0].principalPayment;
      const lastPrincipal = result.schedule[result.schedule.length - 1].principalPayment;
      expect(Math.abs(firstPrincipal - lastPrincipal)).toBeLessThan(0.01);

      // 验证利息递减
      const firstInterest = result.schedule[0].interestPayment;
      const lastInterest = result.schedule[result.schedule.length - 1].interestPayment;
      expect(firstInterest).toBeGreaterThan(lastInterest);
    });
  });
});