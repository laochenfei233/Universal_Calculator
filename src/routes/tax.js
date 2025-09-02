const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { globalCache, CacheUtil } = require('../utils/cache');
const TaxCalculator = require('../utils/taxCalculator');

/**
 * 月度工资个税计算路由
 */
router.post('/', asyncHandler(async (req, res) => {
  const { 
    salary, 
    socialInsurance = 0, 
    housingFund = 0, 
    specialDeductions = {},
    year = new Date().getFullYear()
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(salary, '工资'),
    () => ValidationUtil.validatePositive(salary, '工资'),
    () => ValidationUtil.validateNumber(socialInsurance, '社保'),
    () => ValidationUtil.validateNumber(housingFund, '公积金'),
    () => ValidationUtil.validateNumber(year, '年份')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('tax-monthly', {
    salary,
    socialInsurance,
    housingFund,
    specialDeductions,
    year
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '个税计算完成（缓存）');
  }

  try {
    const result = TaxCalculator.calculateMonthlySalaryTax({
      salary,
      socialInsurance,
      housingFund,
      specialDeductions,
      year
    });

    // 添加优化建议
    result.suggestions = TaxCalculator.getTaxOptimizationSuggestions(result);

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '个税计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '个税计算失败', error.message);
  }
}));

module.exports = router;
/**
 * 年
度综合所得个税计算路由
 */
router.post('/annual', asyncHandler(async (req, res) => {
  const {
    annualSalary,
    annualBonus = 0,
    otherIncome = 0,
    annualSocialInsurance = 0,
    annualHousingFund = 0,
    specialDeductions = {},
    bonusTaxMethod = 'combined',
    year = new Date().getFullYear()
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(annualSalary, '年度工资'),
    () => ValidationUtil.validatePositive(annualSalary, '年度工资'),
    () => ValidationUtil.validateNumber(annualBonus, '年终奖'),
    () => ValidationUtil.validateNumber(otherIncome, '其他收入'),
    () => ValidationUtil.validateNumber(annualSocialInsurance, '年度社保'),
    () => ValidationUtil.validateNumber(annualHousingFund, '年度公积金'),
    () => ValidationUtil.validateNumber(year, '年份')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 验证年终奖计税方式
  if (!['separate', 'combined'].includes(bonusTaxMethod)) {
    return ResponseUtil.validationError(res, ['年终奖计税方式必须为 separate 或 combined']);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('tax-annual', {
    annualSalary,
    annualBonus,
    otherIncome,
    annualSocialInsurance,
    annualHousingFund,
    specialDeductions,
    bonusTaxMethod,
    year
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '年度个税计算完成（缓存）');
  }

  try {
    const result = TaxCalculator.calculateAnnualTax({
      annualSalary,
      annualBonus,
      otherIncome,
      annualSocialInsurance,
      annualHousingFund,
      specialDeductions,
      bonusTaxMethod,
      year
    });

    // 添加优化建议
    result.suggestions = TaxCalculator.getTaxOptimizationSuggestions(result);

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '年度个税计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '年度个税计算失败', error.message);
  }
}));

/**
 * 社保公积金计算路由
 */
router.post('/social-insurance', asyncHandler(async (req, res) => {
  const {
    salary,
    city = 'national',
    customRates = {}
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(salary, '工资'),
    () => ValidationUtil.validatePositive(salary, '工资')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('social-insurance', {
    salary,
    city,
    customRates
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '社保公积金计算完成（缓存）');
  }

  try {
    const result = TaxCalculator.calculateSocialInsurance({
      salary,
      city,
      customRates
    });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '社保公积金计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '社保公积金计算失败', error.message);
  }
}));

/**
 * 获取个税配置信息路由
 */
router.get('/config', asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;

  try {
    const taxConfig = require('../config/taxConfig');
    
    const config = {
      basicDeduction: taxConfig.getBasicDeduction(year),
      monthlyTaxBrackets: taxConfig.getMonthlyTaxBrackets(),
      annualTaxBrackets: taxConfig.getAnnualTaxBrackets(),
      specialDeductions: taxConfig.getSpecialDeductions(),
      socialInsuranceLimits: {
        beijing: taxConfig.getSocialInsuranceLimits('beijing'),
        national: taxConfig.getSocialInsuranceLimits('national')
      },
      bonusTaxMethods: taxConfig.BONUS_TAX_METHODS
    };

    ResponseUtil.success(res, config, '个税配置获取成功');
  } catch (error) {
    ResponseUtil.error(res, '获取个税配置失败', error.message);
  }
}));

/**
 * 年终奖计税方式对比路由
 */
router.post('/bonus-comparison', asyncHandler(async (req, res) => {
  const {
    annualSalary,
    annualBonus,
    otherIncome = 0,
    annualSocialInsurance = 0,
    annualHousingFund = 0,
    specialDeductions = {},
    year = new Date().getFullYear()
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(annualSalary, '年度工资'),
    () => ValidationUtil.validatePositive(annualSalary, '年度工资'),
    () => ValidationUtil.validateNumber(annualBonus, '年终奖'),
    () => ValidationUtil.validatePositive(annualBonus, '年终奖')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  try {
    // 计算两种方式的税额
    const separateResult = TaxCalculator.calculateAnnualTax({
      annualSalary,
      annualBonus,
      otherIncome,
      annualSocialInsurance,
      annualHousingFund,
      specialDeductions,
      bonusTaxMethod: 'separate',
      year
    });

    const combinedResult = TaxCalculator.calculateAnnualTax({
      annualSalary,
      annualBonus,
      otherIncome,
      annualSocialInsurance,
      annualHousingFund,
      specialDeductions,
      bonusTaxMethod: 'combined',
      year
    });

    const comparison = {
      separate: {
        method: '年终奖单独计税',
        tax: separateResult.tax,
        afterTaxIncome: separateResult.afterTaxIncome,
        effectiveTaxRate: separateResult.effectiveTaxRate
      },
      combined: {
        method: '并入综合所得计税',
        tax: combinedResult.tax,
        afterTaxIncome: combinedResult.afterTaxIncome,
        effectiveTaxRate: combinedResult.effectiveTaxRate
      },
      recommendation: separateResult.tax < combinedResult.tax ? 'separate' : 'combined',
      taxDifference: Math.abs(separateResult.tax - combinedResult.tax),
      incomeDifference: Math.abs(separateResult.afterTaxIncome - combinedResult.afterTaxIncome)
    };

    ResponseUtil.success(res, comparison, '年终奖计税方式对比完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '年终奖计税方式对比失败', error.message);
  }
}));