/**
 * 亲属关系计算器测试
 */

const RelationshipCalculator = require('../src/utils/relationshipCalculator');

describe('RelationshipCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new RelationshipCalculator();
  });

  describe('基础功能测试', () => {
    test('应该正确计算直接关系', () => {
      const result = calculator.calculateRelationship(['父亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('父亲');
    });

    test('应该正确处理别名', () => {
      const result1 = calculator.calculateRelationship(['爸爸']);
      const result2 = calculator.calculateRelationship(['父亲']);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.result).toBe(result2.result);
    });

    test('应该拒绝空路径', () => {
      const result = calculator.calculateRelationship([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('关系路径不能为空');
    });

    test('应该拒绝无效关系', () => {
      const result = calculator.calculateRelationship(['无效关系']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('未知的关系');
    });
  });

  describe('复合关系计算', () => {
    test('应该正确计算父亲的父亲', () => {
      const result = calculator.calculateRelationship(['父亲', '父亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('爷爷');
    });

    test('应该正确计算父亲的母亲', () => {
      const result = calculator.calculateRelationship(['父亲', '母亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('奶奶');
    });

    test('应该正确计算母亲的父亲', () => {
      const result = calculator.calculateRelationship(['母亲', '父亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('外公');
    });

    test('应该正确计算母亲的母亲', () => {
      const result = calculator.calculateRelationship(['母亲', '母亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('外婆');
    });

    test('应该正确计算哥哥的儿子', () => {
      const result = calculator.calculateRelationship(['哥哥', '儿子']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('侄子');
    });

    test('应该正确计算姐姐的女儿', () => {
      const result = calculator.calculateRelationship(['姐姐', '女儿']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('外甥女');
    });

    test('应该正确计算儿子的儿子', () => {
      const result = calculator.calculateRelationship(['儿子', '儿子']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('孙子');
    });

    test('应该正确计算女儿的女儿', () => {
      const result = calculator.calculateRelationship(['女儿', '女儿']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('外孙女');
    });
    
    // 三层关系测试
    test('应该正确计算父亲的父亲的父亲', () => {
      const result = calculator.calculateRelationship(['父亲', '父亲', '父亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('太爷爷');
    });
    
    test('应该正确计算父亲的父亲的母亲', () => {
      const result = calculator.calculateRelationship(['父亲', '父亲', '母亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('太奶奶');
    });
    
    test('应该正确计算母亲的父亲的父亲', () => {
      const result = calculator.calculateRelationship(['母亲', '父亲', '父亲']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('太外公');
    });
  });

  describe('配偶关系计算', () => {
    test('应该正确计算哥哥的妻子', () => {
      const result = calculator.calculateRelationship(['哥哥', '妻子']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('嫂子');
    });

    test('应该正确计算弟弟的妻子', () => {
      const result = calculator.calculateRelationship(['弟弟', '妻子']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('弟媳');
    });

    test('应该正确计算姐姐的丈夫', () => {
      const result = calculator.calculateRelationship(['姐姐', '丈夫']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('姐夫');
    });

    test('应该正确计算儿子的妻子', () => {
      const result = calculator.calculateRelationship(['儿子', '妻子']);
      expect(result.success).toBe(true);
      expect(result.result).toBe('儿媳');
    });
  });

  describe('地区差异测试', () => {
    test('应该支持北方称呼', () => {
      const result = calculator.calculateRelationship(['母亲', '父亲'], 'male', 'northern');
      expect(result.success).toBe(true);
      expect(result.result).toBe('姥爷');
    });

    test('应该支持北方称呼 - 外婆', () => {
      const result = calculator.calculateRelationship(['母亲', '母亲'], 'male', 'northern');
      expect(result.success).toBe(true);
      expect(result.result).toBe('姥姥');
    });

    test('标准称呼应该保持不变', () => {
      const result = calculator.calculateRelationship(['母亲', '父亲'], 'male', 'standard');
      expect(result.success).toBe(true);
      expect(result.result).toBe('外公');
    });
  });

  describe('反向查询测试', () => {
    test('应该能够反向查询爷爷', () => {
      const result = calculator.reverseQuery('爷爷');
      expect(result.success).toBe(true);
      expect(result.possiblePaths).toContainEqual(['父亲', '父亲']);
    });

    test('应该能够反向查询侄子', () => {
      const result = calculator.reverseQuery('侄子');
      expect(result.success).toBe(true);
      expect(result.possiblePaths).toEqual(
        expect.arrayContaining([
          ['哥哥', '儿子'],
          ['弟弟', '儿子']
        ])
      );
    });

    test('应该处理未知称呼的反向查询', () => {
      const result = calculator.reverseQuery('未知称呼');
      expect(result.success).toBe(true);
      expect(result.possiblePaths).toEqual([]);
    });
  });

  describe('关系验证测试', () => {
    test('应该验证正确的关系路径', () => {
      const result = calculator.validateRelationship(['父亲', '父亲'], '爷爷');
      expect(result.valid).toBe(true);
    });

    test('应该识别错误的关系路径', () => {
      const result = calculator.validateRelationship(['父亲', '父亲'], '外公');
      expect(result.valid).toBe(false);
      expect(result.actualResult).toBe('爷爷');
    });

    test('应该处理无效路径的验证', () => {
      const result = calculator.validateRelationship(['无效关系'], '爷爷');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('工具方法测试', () => {
    test('应该返回支持的关系列表', () => {
      const relations = calculator.getSupportedRelations();
      expect(Array.isArray(relations)).toBe(true);
      expect(relations).toContain('父亲');
      expect(relations).toContain('母亲');
      expect(relations).toContain('哥哥');
    });

    test('应该返回支持的地区列表', () => {
      const regions = calculator.getSupportedRegions();
      expect(Array.isArray(regions)).toBe(true);
      expect(regions.some(r => r.key === 'standard')).toBe(true);
      expect(regions.some(r => r.key === 'northern')).toBe(true);
    });

    test('应该能够清除缓存', () => {
      // 先计算一个结果以填充缓存
      calculator.calculateRelationship(['父亲', '父亲']);
      expect(calculator.cache.size).toBeGreaterThan(0);
      
      // 清除缓存
      calculator.clearCache();
      expect(calculator.cache.size).toBe(0);
    });
  });

  describe('性能和缓存测试', () => {
    test('应该缓存计算结果', () => {
      const path = ['父亲', '父亲'];
      
      // 第一次计算
      const result1 = calculator.calculateRelationship(path);
      expect(calculator.cache.size).toBe(1);
      
      // 第二次计算应该使用缓存
      const result2 = calculator.calculateRelationship(path);
      expect(result1).toEqual(result2);
      expect(calculator.cache.size).toBe(1);
    });

    test('不同参数应该产生不同的缓存键', () => {
      calculator.calculateRelationship(['父亲'], 'male', 'standard');
      calculator.calculateRelationship(['父亲'], 'female', 'standard');
      calculator.calculateRelationship(['父亲'], 'male', 'northern');
      
      expect(calculator.cache.size).toBe(3);
    });
  });
});