const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { globalCache, CacheUtil } = require('../utils/cache');
const HousingFundCalculator = require('../utils/housingFundCalculator');

/**
 * 公积金缴费计算路由
 */
router.post('/calculate', asyncHandler(async (req, res) => {
  const { 
    salary, 
    base = 0, 
    rate = 0,
    city = 'national'
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(salary, '工资'),
    () => ValidationUtil.validatePositive(salary, '工资'),
    () => ValidationUtil.validateNumber(base, '缴费基数'),
    () => ValidationUtil.validateNumber(rate, '缴费比例')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('housing-fund-calculate', {
    salary,
    base,
    rate,
    city
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '公积金缴费计算完成（缓存）');
  }

  try {
    const result = HousingFundCalculator.calculateHousingFund({
      salary,
      base,
      rate,
      city
    });

    // 添加优化建议
    result.suggestions = HousingFundCalculator.getOptimizationSuggestions({
      salary,
      currentBase: result.base,
      currentRate: result.personalRate / 100
    });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '公积金缴费计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '公积金缴费计算失败', error.message);
  }
}));

/**
 * 公积金基数调整计算路由
 */
router.post('/base-adjustment', asyncHandler(async (req, res) => {
  const {
    averageSalary,
    personalSalary,
    currentBase = 0,
    rate = 0.12,
    city = 'national'
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(averageSalary, '社会平均工资'),
    () => ValidationUtil.validatePositive(averageSalary, '社会平均工资'),
    () => ValidationUtil.validateNumber(personalSalary, '个人平均工资'),
    () => ValidationUtil.validatePositive(personalSalary, '个人平均工资'),
    () => ValidationUtil.validateNumber(currentBase, '当前缴费基数'),
    () => ValidationUtil.validateNumber(rate, '缴费比例'),
    () => ValidationUtil.validateRange(rate, 0.05, 0.24, '缴费比例')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('housing-fund-adjustment', {
    averageSalary,
    personalSalary,
    currentBase,
    rate,
    city
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '公积金基数调整计算完成（缓存）');
  }

  try {
    const result = HousingFundCalculator.calculateBaseAdjustment({
      averageSalary,
      personalSalary,
      currentBase,
      rate,
      city
    });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '公积金基数调整计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '公积金基数调整计算失败', error.message);
  }
}));

/**
 * 公积金贷款额度计算路由
 */
router.post('/loan-limit', asyncHandler(async (req, res) => {
  const {
    base = 0,
    balance = 0,
    monthlyIncome = 0,
    years = 30,
    rate = 0.031
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(base, '缴费基数'),
    () => ValidationUtil.validateNumber(balance, '账户余额'),
    () => ValidationUtil.validatePositive(balance, '账户余额'),
    () => ValidationUtil.validateNumber(monthlyIncome, '月收入'),
    () => ValidationUtil.validatePositive(monthlyIncome, '月收入'),
    () => ValidationUtil.validateNumber(years, '贷款年限'),
    () => ValidationUtil.validateRange(years, 1, 30, '贷款年限'),
    () => ValidationUtil.validateNumber(rate, '贷款利率'),
    () => ValidationUtil.validatePositive(rate, '贷款利率')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('housing-fund-loan', {
    base,
    balance,
    monthlyIncome,
    years,
    rate
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '公积金贷款额度计算完成（缓存）');
  }

  try {
    const result = HousingFundCalculator.calculateLoanLimit({
      base,
      balance,
      monthlyIncome,
      years,
      rate
    });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '公积金贷款额度计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '公积金贷款额度计算失败', error.message);
  }
}));

/**
 * 公积金提取额度计算路由
 */
router.post('/withdrawal-limit', asyncHandler(async (req, res) => {
  const {
    balance = 0,
    monthlyRent = 0,
    withdrawalType = 'rent'
  } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(balance, '账户余额'),
    () => ValidationUtil.validatePositive(balance, '账户余额')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 验证提取类型
  if (!['rent', 'medical', 'education', 'other'].includes(withdrawalType)) {
    return ResponseUtil.validationError(res, ['提取类型必须是 rent、medical、education 或 other']);
  }

  // 如果是租房提取，验证月租金
  if (withdrawalType === 'rent') {
    const rentValidation = ValidationUtil.validateBatch([
      () => ValidationUtil.validateNumber(monthlyRent, '月租金'),
      () => ValidationUtil.validatePositive(monthlyRent, '月租金')
    ]);

    if (!rentValidation.isValid) {
      return ResponseUtil.validationError(res, rentValidation.errors);
    }
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('housing-fund-withdrawal', {
    balance,
    monthlyRent,
    withdrawalType
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '公积金提取额度计算完成（缓存）');
  }

  try {
    const result = HousingFundCalculator.calculateWithdrawalLimit({
      balance,
      monthlyRent,
      withdrawalType
    });

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '公积金提取额度计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '公积金提取额度计算失败', error.message);
  }
}));

/**
 * 获取公积金配置信息路由
 */
router.get('/config', asyncHandler(async (req, res) => {
  const { city = 'national' } = req.query;

  try {
    const taxConfig = require('../config/taxConfig');
    
    const config = {
      housingFundLimits: {
        beijing: taxConfig.getSocialInsuranceLimits('beijing').housingFund,
        national: taxConfig.getSocialInsuranceLimits('national').housingFund
      },
      withdrawalTypes: [
        { key: 'rent', name: '租房提取', description: '用于支付房租' },
        { key: 'medical', name: '医疗提取', description: '用于医疗支出' },
        { key: 'education', name: '教育提取', description: '用于教育支出' },
        { key: 'other', name: '其他提取', description: '其他符合政策的提取情形' }
      ],
      loanRates: [
        { term: '5年以下', rate: 2.75 },
        { term: '5年以上', rate: 3.10 }
      ]
    };

    ResponseUtil.success(res, config, '公积金配置获取成功');
  } catch (error) {
    ResponseUtil.error(res, '获取公积金配置失败', error.message);
  }
}));

module.exports = router;