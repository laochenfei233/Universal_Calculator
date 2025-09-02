const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { globalCache, CacheUtil } = require('../utils/cache');
const { 
  convertUnit, 
  convertToMultipleUnits, 
  validateConversionParams, 
  formatConversionResult 
} = require('../utils/unitConverter');
const { 
  getSupportedCategories, 
  getUnitsForCategory 
} = require('../config/unitConversions');
const NumberConverter = require('../utils/numberConverter');

/**
 * 单位换算和数字转换路由
 */

// 单位换算
router.post('/', asyncHandler(async (req, res) => {
  const { value, fromUnit, toUnit, category } = req.body;

  // 验证转换参数
  const validation = validateConversionParams({ value, fromUnit, toUnit, category });
  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('unit-convert', {
    value, fromUnit, toUnit, category
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '单位换算完成（缓存）');
  }

  try {
    // 执行单位换算
    const result = convertUnit(value, fromUnit, toUnit, category);
    
    // 格式化结果
    const formattedResult = formatConversionResult(result, {
      includeSymbols: true,
      includeNames: true,
      locale: 'zh-CN'
    });

    // 缓存结果
    globalCache.set(cacheKey, formattedResult);

    ResponseUtil.success(res, formattedResult, '单位换算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '单位换算失败', error.message);
  }
}));

// 批量单位换算
router.post('/batch', asyncHandler(async (req, res) => {
  const { value, fromUnit, category, targetUnits } = req.body;

  // 基础验证
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateNumber(value, '转换数值'),
    () => ValidationUtil.validateRequired(fromUnit, '源单位'),
    () => ValidationUtil.validateRequired(category, '单位类别')
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('unit-convert-batch', {
    value, fromUnit, category, targetUnits: targetUnits || 'all'
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '批量单位换算完成（缓存）');
  }

  try {
    // 执行批量单位换算
    const results = convertToMultipleUnits(value, fromUnit, category, targetUnits);
    
    // 格式化所有结果
    const formattedResults = results.map(result => 
      formatConversionResult(result, {
        includeSymbols: true,
        includeNames: true,
        locale: 'zh-CN'
      })
    );

    const response = {
      originalValue: value,
      fromUnit,
      category,
      conversions: formattedResults,
      totalConversions: formattedResults.length
    };

    // 缓存结果
    globalCache.set(cacheKey, response);

    ResponseUtil.success(res, response, '批量单位换算完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '批量单位换算失败', error.message);
  }
}));

// 获取支持的单位类别
router.get('/categories', asyncHandler(async (req, res) => {
  const cacheKey = 'unit-categories';
  
  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '获取单位类别完成（缓存）');
  }

  try {
    const categories = getSupportedCategories();
    
    // 缓存结果（长期缓存）
    globalCache.set(cacheKey, categories, 3600); // 1小时缓存

    ResponseUtil.success(res, categories, '获取单位类别完成');
  } catch (error) {
    ResponseUtil.error(res, '获取单位类别失败', error.message);
  }
}));

// 获取指定类别的所有单位
router.get('/categories/:category/units', asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const cacheKey = `unit-category-${category}`;
  
  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '获取单位列表完成（缓存）');
  }

  try {
    const units = getUnitsForCategory(category);
    
    // 缓存结果（长期缓存）
    globalCache.set(cacheKey, units, 3600); // 1小时缓存

    ResponseUtil.success(res, units, '获取单位列表完成');
  } catch (error) {
    ResponseUtil.error(res, '获取单位列表失败', error.message);
  }
}));

// 数字转换
router.post('/number', asyncHandler(async (req, res) => {
  const { input, type } = req.body;

  // 验证输入
  if (input === undefined || input === null || input === '') {
    return ResponseUtil.validationError(res, ['输入不能为空']);
  }

  // 验证转换类型
  const supportedTypes = ['chinese', 'financial', 'arabic', 'financial-amount'];
  if (!supportedTypes.includes(type)) {
    return ResponseUtil.validationError(res, [`转换类型必须是 ${supportedTypes.join('、')} 之一`]);
  }

  // 生成缓存键
  const cacheKey = CacheUtil.generateKey('number-convert', {
    input: String(input),
    type
  });

  // 检查缓存
  const cachedResult = globalCache.get(cacheKey);
  if (cachedResult) {
    return ResponseUtil.success(res, cachedResult, '数字转换完成（缓存）');
  }

  try {
    const converter = new NumberConverter();
    const result = converter.convert(input, type);

    if (!result.success) {
      return ResponseUtil.calculationError(res, '数字转换失败', result.error);
    }

    // 缓存结果
    globalCache.set(cacheKey, result);

    ResponseUtil.success(res, result, '数字转换完成');
  } catch (error) {
    ResponseUtil.calculationError(res, '数字转换失败', error.message);
  }
}));

// 批量数字转换
router.post('/number/batch', asyncHandler(async (req, res) => {
  const { inputs, type } = req.body;

  // 验证输入
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return ResponseUtil.validationError(res, ['输入必须是非空数组']);
  }

  if (inputs.length > 100) {
    return ResponseUtil.validationError(res, ['批量转换最多支持100个数字']);
  }

  // 验证转换类型
  const supportedTypes = ['chinese', 'financial', 'arabic', 'financial-amount'];
  if (!supportedTypes.includes(type)) {
    return ResponseUtil.validationError(res, [`转换类型必须是 ${supportedTypes.join('、')} 之一`]);
  }

  try {
    const converter = new NumberConverter();
    const results = converter.batchConvert(inputs, type);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    ResponseUtil.success(res, {
      results,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount
      }
    }, `批量转换完成，成功 ${successCount} 个，失败 ${failureCount} 个`);
  } catch (error) {
    ResponseUtil.calculationError(res, '批量数字转换失败', error.message);
  }
}));

// 获取数字转换支持的类型信息
router.get('/number/types', asyncHandler(async (req, res) => {
  try {
    const converter = new NumberConverter();
    const supportedTypes = converter.getSupportedTypes();
    
    ResponseUtil.success(res, supportedTypes, '获取支持类型成功');
  } catch (error) {
    ResponseUtil.error(res, '获取支持类型失败', error.message);
  }
}));

// 称呼计算
router.post('/relationship', asyncHandler(async (req, res) => {
  // 这里将在后续任务中实现具体的称呼计算逻辑
  ResponseUtil.success(res, {
    message: 'TODO: 实现称呼计算逻辑'
  }, '称呼计算接口已准备');
}));

module.exports = router;