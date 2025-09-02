const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { globalCache, CacheUtil } = require('../utils/cache');
const BMICalculator = require('../utils/bmiCalculator');

/**
 * BMI计算路由 - 增强版
 */
router.post('/', asyncHandler(async (req, res) => {
  const { 
    weight, 
    height, 
    weightUnit = 'kg', 
    heightUnit = 'cm',
    // 向后兼容旧的unit参数
    unit 
  } = req.body;

  // 处理向后兼容性
  let finalWeightUnit = weightUnit;
  let finalHeightUnit = heightUnit;
  
  if (unit) {
    if (unit === 'imperial') {
      finalWeightUnit = 'lb';
      finalHeightUnit = 'in';
    } else if (unit === 'metric') {
      finalWeightUnit = 'kg';
      finalHeightUnit = 'cm';
    }
  }

  // 使用增强的验证
  const validation = BMICalculator.validateInput(weight, height, finalWeightUnit, finalHeightUnit);
  
  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('bmi_enhanced', {
    weight,
    height,
    weightUnit: finalWeightUnit,
    heightUnit: finalHeightUnit
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, 'BMI计算完成（缓存）');
  }

  try {
    // 使用增强的BMI计算器
    const result = BMICalculator.calculateBMI(weight, height, finalWeightUnit, finalHeightUnit);

    // 缓存结果（缓存1小时）
    globalCache.set(cacheKey, result, 3600);

    ResponseUtil.success(res, result, 'BMI计算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, 'BMI计算失败', error.message);
  }
}));

/**
 * 获取支持的单位列表
 */
router.get('/units', asyncHandler(async (req, res) => {
  const supportedUnits = BMICalculator.getSupportedUnits();
  ResponseUtil.success(res, supportedUnits, '获取支持的单位列表成功');
}));

/**
 * BMI分类信息
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = Object.entries(BMICalculator.BMI_CATEGORIES).map(([key, category]) => ({
    key,
    name: category.name,
    range: `${category.min} - ${category.max === Infinity ? '∞' : category.max}`,
    color: category.color,
    min: category.min,
    max: category.max
  }));
  
  ResponseUtil.success(res, { categories }, '获取BMI分类信息成功');
}));

/**
 * 批量BMI计算（用于趋势分析）
 */
router.post('/batch', asyncHandler(async (req, res) => {
  const { measurements } = req.body;
  
  if (!Array.isArray(measurements) || measurements.length === 0) {
    return ResponseUtil.validationError(res, ['measurements必须是非空数组']);
  }
  
  if (measurements.length > 100) {
    return ResponseUtil.validationError(res, ['批量计算最多支持100条记录']);
  }
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];
    const { weight, height, weightUnit = 'kg', heightUnit = 'cm', date } = measurement;
    
    try {
      const validation = BMICalculator.validateInput(weight, height, weightUnit, heightUnit);
      
      if (!validation.isValid) {
        errors.push({
          index: i,
          errors: validation.errors
        });
        continue;
      }
      
      const result = BMICalculator.calculateBMI(weight, height, weightUnit, heightUnit);
      results.push({
        ...result,
        date: date || new Date().toISOString(),
        index: i
      });
    } catch (error) {
      errors.push({
        index: i,
        errors: [error.message]
      });
    }
  }
  
  ResponseUtil.success(res, {
    results,
    errors,
    summary: {
      total: measurements.length,
      successful: results.length,
      failed: errors.length
    }
  }, '批量BMI计算完成');
}));

module.exports = router;