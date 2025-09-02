const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { globalCache, CacheUtil } = require('../utils/cache');
const MortgageCalculator = require('../utils/mortgageCalculator');

/**
 * 基础房贷计算路由
 */
router.post('/', asyncHandler(async (req, res) => {
  const { 
    principal, 
    rate, 
    years, 
    type = 'equal',
    includeSchedule = false 
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(principal, '贷款本金'),
    () => ValidationUtil.validatePositive(principal, '贷款本金'),
    () => ValidationUtil.validateNumber(rate, '利率'),
    () => ValidationUtil.validatePositive(rate, '利率'),
    () => ValidationUtil.validateRange(rate, 0.1, 20, '利率'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validatePositive(years, '贷款年限'),
    () => ValidationUtil.validateRange(years, 1, 50, '贷款年限')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 验证还款类型
  if (!['equal', 'principal'].includes(type)) {
    return ResponseUtil.validationError(res, ['还款类型必须是 equal 或 principal']);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-basic', {
    principal,
    rate,
    years,
    type,
    includeSchedule
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '房贷计算完成（缓存）');
  }

  try {
    const result = type === 'equal'
      ? MortgageCalculator.calculateEqualPayment({ principal, rate, years, includeSchedule })
      : MortgageCalculator.calculateEqualPrincipal({ principal, rate, years, includeSchedule });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '房贷计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '房贷计算失败', error.message);
  }
}));

module.exports = router;/**

 * 详细还款计划路由
 */
router.post('/schedule', asyncHandler(async (req, res) => {
  const { 
    principal, 
    rate, 
    years, 
    type = 'equal',
    groupBy = 1 // 分组方式：1=按月，12=按年
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(principal, '贷款本金'),
    () => ValidationUtil.validatePositive(principal, '贷款本金'),
    () => ValidationUtil.validateNumber(rate, '利率'),
    () => ValidationUtil.validatePositive(rate, '利率'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validatePositive(years, '贷款年限'),
    () => ValidationUtil.validateNumber(groupBy, '分组方式')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  if (!['equal', 'principal'].includes(type)) {
    return ResponseUtil.validationError(res, ['还款类型必须是 equal 或 principal']);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-schedule', {
    principal, rate, years, type, groupBy
  });

  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '还款计划生成完成（缓存）');
  }

  try {
    const loanDetails = type === 'equal'
      ? MortgageCalculator.calculateEqualPayment({ principal, rate, years, includeSchedule: true })
      : MortgageCalculator.calculateEqualPrincipal({ principal, rate, years, includeSchedule: true });

    const result = {
      loanSummary: {
        type: loanDetails.type,
        principal: loanDetails.principal,
        rate: loanDetails.rate,
        years: loanDetails.years,
        totalPayment: loanDetails.totalPayment,
        totalInterest: loanDetails.totalInterest
      },
      schedule: loanDetails.schedule,
      summary: groupBy > 1 
        ? MortgageCalculator.generateScheduleSummary(loanDetails.schedule, groupBy)
        : null
    };

    globalCache.set(cacheKey, result);
    ResponseUtil.success(res, result, '还款计划生成完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '还款计划生成失败', error.message);
  }
}));

/**
 * 提前还款计算路由
 */
router.post('/prepayment', asyncHandler(async (req, res) => {
  const {
    principal,
    rate,
    years,
    type = 'equal',
    prepaymentAmount,
    prepaymentMonth,
    prepaymentType = 'reduce_term'
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(principal, '贷款本金'),
    () => ValidationUtil.validatePositive(principal, '贷款本金'),
    () => ValidationUtil.validateNumber(rate, '利率'),
    () => ValidationUtil.validatePositive(rate, '利率'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validatePositive(years, '贷款年限'),
    () => ValidationUtil.validateNumber(prepaymentAmount, '提前还款金额'),
    () => ValidationUtil.validatePositive(prepaymentAmount, '提前还款金额'),
    () => ValidationUtil.validateNumber(prepaymentMonth, '提前还款月份'),
    () => ValidationUtil.validatePositive(prepaymentMonth, '提前还款月份')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  if (!['equal', 'principal'].includes(type)) {
    return ResponseUtil.validationError(res, ['还款类型必须是 equal 或 principal']);
  }

  if (!['reduce_term', 'reduce_payment'].includes(prepaymentType)) {
    return ResponseUtil.validationError(res, ['提前还款类型必须是 reduce_term 或 reduce_payment']);
  }

  if (prepaymentMonth > years * 12) {
    return ResponseUtil.validationError(res, ['提前还款月份不能超过贷款总月数']);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-prepayment', {
    principal, rate, years, type, prepaymentAmount, prepaymentMonth, prepaymentType
  });

  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '提前还款计算完成（缓存）');
  }

  try {
    const result = MortgageCalculator.calculatePrepayment({
      principal,
      rate,
      years,
      type,
      prepaymentAmount,
      prepaymentMonth,
      prepaymentType
    });

    if (result.error) {
      return ResponseUtil.validationError(res, [result.error]);
    }

    globalCache.set(cacheKey, result);
    ResponseUtil.success(res, result, '提前还款计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '提前还款计算失败', error.message);
  }
}));

/**
 * 还款方式对比路由
 */
router.post('/compare', asyncHandler(async (req, res) => {
  const { principal, rate, years } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(principal, '贷款本金'),
    () => ValidationUtil.validatePositive(principal, '贷款本金'),
    () => ValidationUtil.validateNumber(rate, '利率'),
    () => ValidationUtil.validatePositive(rate, '利率'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validatePositive(years, '贷款年限')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-compare', {
    principal, rate, years
  });

  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '还款方式对比完成（缓存）');
  }

  try {
    const result = MortgageCalculator.comparePaymentMethods({
      principal, rate, years
    });

    globalCache.set(cacheKey, result);
    ResponseUtil.success(res, result, '还款方式对比完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '还款方式对比失败', error.message);
  }
}));

/**
 * 房贷承受能力分析路由
 */
router.post('/affordability', asyncHandler(async (req, res) => {
  const {
    monthlyIncome,
    monthlyExpenses = 0,
    rate,
    years,
    debtToIncomeRatio = 0.5
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(monthlyIncome, '月收入'),
    () => ValidationUtil.validatePositive(monthlyIncome, '月收入'),
    () => ValidationUtil.validateNumber(monthlyExpenses, '月支出'),
    () => ValidationUtil.validateNumber(rate, '利率'),
    () => ValidationUtil.validatePositive(rate, '利率'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validatePositive(years, '贷款年限'),
    () => ValidationUtil.validateNumber(debtToIncomeRatio, '负债收入比'),
    () => ValidationUtil.validateRange(debtToIncomeRatio, 0.1, 0.8, '负债收入比')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  if (monthlyExpenses >= monthlyIncome) {
    return ResponseUtil.validationError(res, ['月支出不能大于或等于月收入']);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-affordability', {
    monthlyIncome, monthlyExpenses, rate, years, debtToIncomeRatio
  });

  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '承受能力分析完成（缓存）');
  }

  try {
    const result = MortgageCalculator.calculateAffordability({
      monthlyIncome,
      monthlyExpenses,
      rate,
      years,
      debtToIncomeRatio
    });

    globalCache.set(cacheKey, result);
    ResponseUtil.success(res, result, '承受能力分析完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '承受能力分析失败', error.message);
  }
}));

/**
 * 多种贷款方案对比路由
 */
router.post('/scenarios', asyncHandler(async (req, res) => {
  const { scenarios } = req.body;

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return ResponseUtil.validationError(res, ['请提供至少一个贷款方案']);
  }

  if (scenarios.length > 5) {
    return ResponseUtil.validationError(res, ['最多支持对比5个贷款方案']);
  }

  // 验证每个方案
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    const validation = ValidationUtil.validateBatch([
      () => ValidationUtil.validateNumber(scenario.principal, `方案${i + 1}贷款本金`),
      () => ValidationUtil.validatePositive(scenario.principal, `方案${i + 1}贷款本金`),
      () => ValidationUtil.validateNumber(scenario.rate, `方案${i + 1}利率`),
      () => ValidationUtil.validatePositive(scenario.rate, `方案${i + 1}利率`),
      () => ValidationUtil.validateNumber(scenario.years, `方案${i + 1}贷款年限`),
      () => ValidationUtil.validatePositive(scenario.years, `方案${i + 1}贷款年限`)
    ]);

    if (!validation.isValid) {
      return ResponseUtil.validationError(res, validation.errors);
    }

    if (scenario.type && !['equal', 'principal'].includes(scenario.type)) {
      return ResponseUtil.validationError(res, [`方案${i + 1}还款类型必须是 equal 或 principal`]);
    }
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('mortgage-scenarios', { scenarios });

  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '贷款方案对比完成（缓存）');
  }

  try {
    const results = scenarios.map((scenario, index) => {
      const { principal, rate, years, type = 'equal', name } = scenario;
      
      const calculation = type === 'equal'
        ? MortgageCalculator.calculateEqualPayment({ principal, rate, years })
        : MortgageCalculator.calculateEqualPrincipal({ principal, rate, years });

      return {
        name: name || `方案${index + 1}`,
        ...calculation,
        costEffectiveness: Math.round((calculation.totalInterest / calculation.principal) * 10000) / 100 // 成本效益比
      };
    });

    // 找出最优方案
    const bestScenario = results.reduce((best, current) => 
      current.totalInterest < best.totalInterest ? current : best
    );

    const comparison = {
      scenarios: results,
      bestScenario: bestScenario.name,
      analysis: {
        lowestTotalInterest: bestScenario.totalInterest,
        highestTotalInterest: Math.max(...results.map(r => r.totalInterest)),
        interestRange: Math.max(...results.map(r => r.totalInterest)) - bestScenario.totalInterest
      }
    };

    globalCache.set(cacheKey, comparison);
    ResponseUtil.success(res, comparison, '贷款方案对比完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '贷款方案对比失败', error.message);
  }
}));