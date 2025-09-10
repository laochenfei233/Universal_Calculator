/**
 * 亲属关系计算器
 * 实现关系路径解析和称呼计算功能
 */

const {
  BASIC_RELATIONS,
  RELATIONSHIP_MAP,
  REVERSE_RELATIONSHIP_MAP,
  REGIONAL_VARIATIONS
} = require('../config/relationshipConfig');

class RelationshipCalculator {
  constructor() {
    this.cache = new Map(); // 缓存计算结果
  }

  /**
   * 计算亲属关系称呼
   * @param {Array} path - 关系路径数组，如 ['父亲', '哥哥', '儿子']
   * @param {string} gender - 询问者性别 ('male' | 'female')
   * @param {string} region - 地区 ('standard' | 'northern' | 'southern')
   * @returns {Object} 计算结果
   */
  calculateRelationship(path, gender = 'male', region = 'standard') {
    // 输入验证
    if (!Array.isArray(path) || path.length === 0) {
      return {
        success: false,
        error: '关系路径不能为空',
        path: path,
        gender: gender,
        region: region
      };
    }

    // 检查缓存
    const cacheKey = `${path.join('-')}-${gender}-${region}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 验证路径中的每个关系
      this.validatePath(path);

      // 计算最终称呼
      const result = this.resolvePath(path, gender, region);
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        path: path,
        gender: gender,
        region: region
      };
      
      // 也缓存错误结果以避免重复计算
      this.cache.set(cacheKey, errorResult);
      
      return errorResult;
    }
  }

  /**
   * 验证关系路径的有效性
   * @param {Array} path - 关系路径
   */
  validatePath(path) {
    for (const relation of path) {
      // 处理别名
      const normalizedRelation = this.normalizeRelation(relation);
      if (!BASIC_RELATIONS[normalizedRelation]) {
        throw new Error(`未知的关系: ${relation}`);
      }
    }
  }

  /**
   * 标准化关系名称（处理别名）
   * @param {string} relation - 关系名称
   * @returns {string} 标准化后的关系名称
   */
  normalizeRelation(relation) {
    const relationInfo = BASIC_RELATIONS[relation];
    if (relationInfo && relationInfo.alias) {
      return relationInfo.alias;
    }
    return relation;
  }

  /**
   * 解析关系路径
   * @param {Array} path - 关系路径
   * @param {string} gender - 性别
   * @param {string} region - 地区
   * @returns {Object} 解析结果
   */
  resolvePath(path, gender, region) {
    if (path.length === 1) {
      // 直接关系
      return this.getDirectRelation(path[0], gender, region);
    }

    // 复合关系解析
    let currentRelation = this.normalizeRelation(path[0]);
    let steps = [currentRelation];

    for (let i = 1; i < path.length; i++) {
      const nextRelation = this.normalizeRelation(path[i]);
      
      // 查找当前关系的映射
      if (!RELATIONSHIP_MAP[currentRelation] || !RELATIONSHIP_MAP[currentRelation][nextRelation]) {
        throw new Error(`无法解析关系路径: ${currentRelation} -> ${nextRelation}`);
      } else {
        // 直接映射
        const mapping = RELATIONSHIP_MAP[currentRelation][nextRelation];
        currentRelation = mapping[gender] || mapping.male;
        steps.push(currentRelation);
      }
    }

    // 应用地区差异
    const finalRelation = this.applyRegionalVariation(currentRelation, region);

    return {
      success: true,
      result: finalRelation,
      originalPath: path,
      resolvedSteps: steps,
      gender: gender,
      region: region,
      explanation: this.generateExplanation(path, finalRelation)
    };
  }

  /**
   * 获取直接关系
   * @param {string} relation - 关系名称
   * @param {string} gender - 性别
   * @param {string} region - 地区
   * @returns {Object} 关系结果
   */
  getDirectRelation(relation, gender, region) {
    const normalizedRelation = this.normalizeRelation(relation);
    const finalRelation = this.applyRegionalVariation(normalizedRelation, region);

    return {
      success: true,
      result: finalRelation,
      originalPath: [relation],
      resolvedSteps: [finalRelation],
      gender: gender,
      region: region,
      explanation: `直接关系: ${finalRelation}`
    };
  }

  /**
   * 应用地区差异
   * @param {string} relation - 关系名称
   * @param {string} region - 地区
   * @returns {string} 应用地区差异后的关系名称
   */
  applyRegionalVariation(relation, region) {
    if (region === 'standard' || !REGIONAL_VARIATIONS[region]) {
      return relation;
    }

    const variations = REGIONAL_VARIATIONS[region].variations;
    return variations[relation] || relation;
  }

  /**
   * 生成解释说明
   * @param {Array} path - 关系路径
   * @param {string} result - 最终结果
   * @returns {string} 解释说明
   */
  generateExplanation(path, result) {
    if (path.length === 1) {
      return `直接关系: ${result}`;
    }

    const pathStr = path.join('的');
    return `${pathStr}称为${result}`;
  }

  /**
   * 反向查询关系路径
   * @param {string} targetRelation - 目标称呼
   * @param {string} region - 地区
   * @returns {Array} 可能的关系路径
   */
  reverseQuery(targetRelation, region = 'standard') {
    // 先处理地区差异的反向映射
    let normalizedTarget = targetRelation;
    if (region !== 'standard' && REGIONAL_VARIATIONS[region]) {
      const variations = REGIONAL_VARIATIONS[region].variations;
      for (const [standard, regional] of Object.entries(variations)) {
        if (regional === targetRelation) {
          normalizedTarget = standard;
          break;
        }
      }
    }

    const paths = REVERSE_RELATIONSHIP_MAP[normalizedTarget] || [];
    
    return {
      success: true,
      targetRelation: targetRelation,
      possiblePaths: paths,
      region: region,
      explanation: paths.length > 0 
        ? `"${targetRelation}"可能的关系路径有${paths.length}种`
        : `未找到"${targetRelation}"的关系路径`
    };
  }

  /**
   * 验证关系路径是否正确
   * @param {Array} path - 关系路径
   * @param {string} expectedResult - 期望结果
   * @param {string} gender - 性别
   * @param {string} region - 地区
   * @returns {Object} 验证结果
   */
  validateRelationship(path, expectedResult, gender = 'male', region = 'standard') {
    try {
      const result = this.calculateRelationship(path, gender, region);
      
      if (!result.success) {
        return {
          valid: false,
          error: result.error,
          path: path,
          expectedResult: expectedResult
        };
      }

      const isValid = result.result === expectedResult;
      
      return {
        valid: isValid,
        actualResult: result.result,
        expectedResult: expectedResult,
        path: path,
        explanation: isValid 
          ? '关系路径验证正确' 
          : `关系路径验证失败，实际结果为: ${result.result}`
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        path: path,
        expectedResult: expectedResult
      };
    }
  }

  /**
   * 获取所有支持的关系
   * @returns {Array} 支持的关系列表
   */
  getSupportedRelations() {
    return Object.keys(BASIC_RELATIONS);
  }

  /**
   * 获取所有支持的地区
   * @returns {Array} 支持的地区列表
   */
  getSupportedRegions() {
    return Object.keys(REGIONAL_VARIATIONS).map(key => ({
      key: key,
      name: REGIONAL_VARIATIONS[key].name
    }));
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = RelationshipCalculator;