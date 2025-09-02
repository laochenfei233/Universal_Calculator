const express = require('express');
const router = express.Router();
const ResponseUtil = require('../utils/response');
const ValidationUtil = require('../utils/validation');
const ExpressionParser = require('../utils/expressionParser');
const CalculationHistory = require('../utils/calculationHistory');
const CacheService = require('../utils/cacheService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * 基础和科学计算路由
 */
router.post('/', asyncHandler(async (req, res) => {
  const { expression, type = 'basic', angleMode = 'radians' } = req.body;

  // 验证输入
  const validation = ValidationUtil.validateBatch([
    () => ValidationUtil.validateExpression(expression)
  ]);

  if (!validation.isValid) {
    return ResponseUtil.validationError(res, validation.errors);
  }

  // 验证角度模式
  if (angleMode && !['radians', 'degrees'].includes(angleMode)) {
    return ResponseUtil.validationError(res, ['角度模式必须是 radians 或 degrees']);
  }

  // 创建表达式解析器
  const parser = new ExpressionParser({ angleMode });
  
  // 检查缓存
  const cacheKey = CacheService.generateKey(expression, type, angleMode);
  const cachedResult = CacheService.get(cacheKey);
  
  if (cachedResult) {
    return ResponseUtil.success(res, {
      ...cachedResult,
      cached: true
    }, '计算结果(缓存)');
  }

  // 解析和计算表达式
  const parseResult = parser.parse(expression);
  
  if (!parseResult.success) {
    return ResponseUtil.error(res, parseResult.error, 'CALCULATION_ERROR', 400);
  }

  // 缓存结果
  CacheService.set(cacheKey, {
    result: parseResult.result,
    expression: expression,
    type: type,
    angleMode: parseResult.angleMode,
    steps: [`${expression} = ${parseResult.result}`]
  });

  // 记录计算历史
  const historyEntry = CalculationHistory.addEntry({
    expression: expression,
    result: parseResult.result,
    type: type,
    angleMode: angleMode,
    timestamp: new Date()
  });

  // 返回计算结果
  ResponseUtil.success(res, {
    result: parseResult.result,
    expression: expression,
    type: type,
    angleMode: parseResult.angleMode,
    steps: [`${expression} = ${parseResult.result}`],
    historyId: historyEntry.id
  }, '计算完成');
}));

/**
 * 获取计算历史
 */
router.get('/history', asyncHandler(async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  
  const history = CalculationHistory.getHistory({
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  ResponseUtil.success(res, {
    history: history.entries,
    total: history.total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  }, '获取历史记录成功');
}));

/**
 * 清除计算历史
 */
router.delete('/history', asyncHandler(async (req, res) => {
  CalculationHistory.clearHistory();
  ResponseUtil.success(res, null, '历史记录已清除');
}));

/**
 * 删除特定历史记录
 */
router.delete('/history/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = CalculationHistory.deleteEntry(id);
  
  if (!deleted) {
    return ResponseUtil.error(res, '历史记录不存在', 'NOT_FOUND', 404);
  }

  ResponseUtil.success(res, null, '历史记录已删除');
}));

module.exports = router;