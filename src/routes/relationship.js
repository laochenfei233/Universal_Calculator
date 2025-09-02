/**
 * 亲属关系计算API路由
 */

const express = require('express');
const RelationshipCalculator = require('../utils/relationshipCalculator');
const ValidationUtil = require('../utils/validation');
const ResponseUtil = require('../utils/response');
const { globalCache } = require('../utils/cache');

const router = express.Router();
const calculator = new RelationshipCalculator();

/**
 * 简单的输入验证函数
 * @param {Object} data - 输入数据
 * @param {Object} rules - 验证规则
 * @returns {Object} 验证结果
 */
function validateInput(data, rules) {
  const errors = [];
  const validatedData = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // 检查必填字段
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} 是必填字段`);
      continue;
    }

    // 如果字段不存在且不是必填，使用默认值
    if (value === undefined || value === null) {
      if (rule.default !== undefined) {
        validatedData[field] = rule.default;
      }
      continue;
    }

    // 类型验证
    if (rule.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${field} 必须是数组`);
        continue;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} 长度不能少于 ${rule.minLength}`);
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} 长度不能超过 ${rule.maxLength}`);
        continue;
      }

      // 验证数组元素
      if (rule.items) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (rule.items.type === 'string') {
            if (typeof item !== 'string') {
              errors.push(`${field}[${i}] 必须是字符串`);
              continue;
            }
            if (rule.items.minLength && item.length < rule.items.minLength) {
              errors.push(`${field}[${i}] 长度不能少于 ${rule.items.minLength}`);
              continue;
            }
            if (rule.items.maxLength && item.length > rule.items.maxLength) {
              errors.push(`${field}[${i}] 长度不能超过 ${rule.items.maxLength}`);
              continue;
            }
          }
        }
      }
    } else if (rule.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`${field} 必须是字符串`);
        continue;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} 长度不能少于 ${rule.minLength}`);
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} 长度不能超过 ${rule.maxLength}`);
        continue;
      }
      
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} 必须是以下值之一: ${rule.enum.join(', ')}`);
        continue;
      }
    }

    validatedData[field] = value;
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    data: validatedData
  };
}

// 输入验证规则
const calculateValidationRules = {
  path: {
    required: true,
    type: 'array',
    minLength: 1,
    maxLength: 10,
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 10
    }
  },
  gender: {
    required: false,
    type: 'string',
    enum: ['male', 'female'],
    default: 'male'
  },
  region: {
    required: false,
    type: 'string',
    enum: ['standard', 'northern', 'southern'],
    default: 'standard'
  }
};

const reverseQueryValidationRules = {
  targetRelation: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 10
  },
  region: {
    required: false,
    type: 'string',
    enum: ['standard', 'northern', 'southern'],
    default: 'standard'
  }
};

const validateValidationRules = {
  path: {
    required: true,
    type: 'array',
    minLength: 1,
    maxLength: 10,
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 10
    }
  },
  expectedResult: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 10
  },
  gender: {
    required: false,
    type: 'string',
    enum: ['male', 'female'],
    default: 'male'
  },
  region: {
    required: false,
    type: 'string',
    enum: ['standard', 'northern', 'southern'],
    default: 'standard'
  }
};

/**
 * POST /api/relationship/calculate
 * 计算亲属关系称呼
 */
router.post('/calculate', async (req, res) => {
  try {
    // 输入验证
    const validation = validateInput(req.body, calculateValidationRules);
    if (!validation.isValid) {
      return ResponseUtil.validationError(res, validation.errors);
    }

    const { path, gender = 'male', region = 'standard' } = validation.data;

    // 检查缓存
    const cacheKey = `relationship:${path.join('-')}:${gender}:${region}`;
    const cachedResult = globalCache.get(cacheKey);
    if (cachedResult) {
      return ResponseUtil.success(res, cachedResult, '计算成功（缓存）');
    }

    // 计算关系
    const result = calculator.calculateRelationship(path, gender, region);

    if (!result.success) {
      return ResponseUtil.calculationError(res, result.error, {
        path: result.path,
        gender: result.gender,
        region: result.region
      });
    }

    // 缓存结果（5分钟）
    globalCache.set(cacheKey, result, 300);

    ResponseUtil.success(res, result, '计算成功');
  } catch (error) {
    console.error('关系计算错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

/**
 * POST /api/relationship/reverse
 * 反向查询关系路径
 */
router.post('/reverse', async (req, res) => {
  try {
    // 输入验证
    const validation = validateInput(req.body, reverseQueryValidationRules);
    if (!validation.isValid) {
      return ResponseUtil.validationError(res, validation.errors);
    }

    const { targetRelation, region = 'standard' } = validation.data;

    // 检查缓存
    const cacheKey = `relationship:reverse:${targetRelation}:${region}`;
    const cachedResult = globalCache.get(cacheKey);
    if (cachedResult) {
      return ResponseUtil.success(res, cachedResult, '查询成功（缓存）');
    }

    // 反向查询
    const result = calculator.reverseQuery(targetRelation, region);

    // 缓存结果（10分钟）
    globalCache.set(cacheKey, result, 600);

    ResponseUtil.success(res, result, '查询成功');
  } catch (error) {
    console.error('反向查询错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

/**
 * POST /api/relationship/validate
 * 验证关系路径是否正确
 */
router.post('/validate', async (req, res) => {
  try {
    // 输入验证
    const validation = validateInput(req.body, validateValidationRules);
    if (!validation.isValid) {
      return ResponseUtil.validationError(res, validation.errors);
    }

    const { path, expectedResult, gender = 'male', region = 'standard' } = validation.data;

    // 验证关系
    const result = calculator.validateRelationship(path, expectedResult, gender, region);

    ResponseUtil.success(res, result, '验证完成');
  } catch (error) {
    console.error('关系验证错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

/**
 * GET /api/relationship/relations
 * 获取所有支持的关系
 */
router.get('/relations', (req, res) => {
  try {
    const relations = calculator.getSupportedRelations();
    ResponseUtil.success(res, { relations }, '获取成功');
  } catch (error) {
    console.error('获取关系列表错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

/**
 * GET /api/relationship/regions
 * 获取所有支持的地区
 */
router.get('/regions', (req, res) => {
  try {
    const regions = calculator.getSupportedRegions();
    ResponseUtil.success(res, { regions }, '获取成功');
  } catch (error) {
    console.error('获取地区列表错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

/**
 * DELETE /api/relationship/cache
 * 清除缓存
 */
router.delete('/cache', (req, res) => {
  try {
    calculator.clearCache();
    // Clear relationship-related cache entries
    const stats = globalCache.getStats();
    const relationshipKeys = stats.keys.filter(key => key.startsWith('relationship:'));
    relationshipKeys.forEach(key => globalCache.delete(key));
    ResponseUtil.success(res, {}, '缓存清除成功');
  } catch (error) {
    console.error('清除缓存错误:', error);
    ResponseUtil.error(res, '服务器内部错误');
  }
});

module.exports = router;