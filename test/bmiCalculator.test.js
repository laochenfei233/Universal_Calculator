/**
 * BMI计算器单元测试
 */

const BMICalculator = require('../src/utils/bmiCalculator');

describe('BMICalculator', () => {
  describe('calculateBMI', () => {
    test('应该正确计算标准BMI（公制）', () => {
      const result = BMICalculator.calculateBMI(70, 175, 'kg', 'cm');
      
      expect(result.bmi).toBeCloseTo(22.86, 2);
      expect(result.category).toBe('正常');
      expect(result.converted.weightKg).toBe(70);
      expect(result.converted.heightM).toBe(1.75);
    });

    test('应该正确计算BMI（英制）', () => {
      const result = BMICalculator.calculateBMI(154, 69, 'lb', 'in');
      
      expect(result.bmi).toBeCloseTo(22.74, 2);
      expect(result.category).toBe('正常');
      expect(result.converted.weightKg).toBeCloseTo(69.85, 2);
      expect(result.converted.heightM).toBeCloseTo(1.75, 2);
    });

    test('应该正确分类偏瘦', () => {
      const result = BMICalculator.calculateBMI(50, 175, 'kg', 'cm');
      
      expect(result.bmi).toBeCloseTo(16.33, 2);
      expect(result.category).toBe('偏瘦');
      expect(result.healthRisk.level).toBe('moderate');
    });

    test('应该正确分类轻度肥胖', () => {
      const result = BMICalculator.calculateBMI(95, 175, 'kg', 'cm');
      
      expect(result.bmi).toBeCloseTo(31.02, 2);
      expect(result.category).toBe('轻度肥胖');
      expect(result.healthRisk.level).toBe('high');
    });

    test('应该正确分类重度肥胖', () => {
      const result = BMICalculator.calculateBMI(130, 175, 'kg', 'cm');
      
      expect(result.bmi).toBeCloseTo(42.45, 2);
      expect(result.category).toBe('重度肥胖');
      expect(result.healthRisk.level).toBe('very_high');
    });

    test('应该包含详细分析信息', () => {
      const result = BMICalculator.calculateBMI(70, 175, 'kg', 'cm');
      
      expect(result.analysis).toBeDefined();
      expect(result.analysis.status).toBe('正常');
      expect(result.analysis.description).toContain('健康范围');
      expect(result.analysis.percentile).toBeGreaterThan(0);
      expect(result.analysis.bodyFatEstimate).toBeDefined();
      expect(result.analysis.metabolicAge).toBeDefined();
    });

    test('应该包含健康建议', () => {
      const result = BMICalculator.calculateBMI(70, 175, 'kg', 'cm');
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.diet).toBeInstanceOf(Array);
      expect(result.recommendations.exercise).toBeInstanceOf(Array);
      expect(result.recommendations.lifestyle).toBeInstanceOf(Array);
      expect(result.recommendations.diet.length).toBeGreaterThan(0);
    });

    test('应该计算理想体重范围', () => {
      const result = BMICalculator.calculateBMI(70, 175, 'kg', 'cm');
      
      expect(result.idealWeightRange).toBeDefined();
      expect(result.idealWeightRange.min).toBeCloseTo(56.66, 1);
      expect(result.idealWeightRange.max).toBeCloseTo(76.26, 1);
      expect(result.idealWeightRange.unit).toBe('kg');
    });

    test('应该支持不同的目标单位', () => {
      const result = BMICalculator.calculateBMI(154, 69, 'lb', 'in');
      
      // 理想体重应该以磅为单位返回
      const idealWeightLb = BMICalculator.getIdealWeightRange(1.75, 'lb');
      expect(idealWeightLb.unit).toBe('lb');
      expect(idealWeightLb.min).toBeGreaterThan(100);
    });
  });

  describe('单位转换', () => {
    test('应该正确转换体重单位', () => {
      expect(BMICalculator.convertWeight(100, 'kg')).toBe(100);
      expect(BMICalculator.convertWeight(220, 'lb')).toBeCloseTo(99.79, 2);
      expect(BMICalculator.convertWeight(1000, 'g')).toBe(1);
      expect(BMICalculator.convertWeight(15, 'stone')).toBeCloseTo(95.25, 2);
    });

    test('应该正确转换身高单位', () => {
      expect(BMICalculator.convertHeight(175, 'cm')).toBe(1.75);
      expect(BMICalculator.convertHeight(1.75, 'm')).toBe(1.75);
      expect(BMICalculator.convertHeight(69, 'in')).toBeCloseTo(1.75, 2);
      expect(BMICalculator.convertHeight(5.75, 'ft')).toBeCloseTo(1.75, 2);
    });

    test('应该抛出不支持单位的错误', () => {
      expect(() => BMICalculator.convertWeight(70, 'invalid')).toThrow('不支持的体重单位');
      expect(() => BMICalculator.convertHeight(175, 'invalid')).toThrow('不支持的身高单位');
    });
  });

  describe('输入验证', () => {
    test('应该验证有效输入', () => {
      const validation = BMICalculator.validateInput(70, 175, 'kg', 'cm');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('应该拒绝无效的体重', () => {
      let validation = BMICalculator.validateInput(0, 175, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('体重必须是大于0的数字');

      validation = BMICalculator.validateInput(-10, 175, 'kg', 'cm');
      expect(validation.isValid).toBe(false);

      validation = BMICalculator.validateInput('abc', 175, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
    });

    test('应该拒绝无效的身高', () => {
      let validation = BMICalculator.validateInput(70, 0, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('身高必须是大于0的数字');

      validation = BMICalculator.validateInput(70, -175, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
    });

    test('应该拒绝不支持的单位', () => {
      let validation = BMICalculator.validateInput(70, 175, 'invalid', 'cm');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('不支持的体重单位: invalid');

      validation = BMICalculator.validateInput(70, 175, 'kg', 'invalid');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('不支持的身高单位: invalid');
    });

    test('应该拒绝超出合理范围的数值', () => {
      let validation = BMICalculator.validateInput(1500, 175, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('体重超出合理范围（1-1000千克）');

      validation = BMICalculator.validateInput(70, 500, 'kg', 'cm');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('身高超出合理范围（0.3-3米）');
    });
  });

  describe('BMI分类', () => {
    test('应该正确分类各个BMI范围', () => {
      expect(BMICalculator.getBMICategory(16).name).toBe('偏瘦');
      expect(BMICalculator.getBMICategory(20).name).toBe('正常');
      expect(BMICalculator.getBMICategory(27).name).toBe('偏胖');
      expect(BMICalculator.getBMICategory(32).name).toBe('轻度肥胖');
      expect(BMICalculator.getBMICategory(37).name).toBe('中度肥胖');
      expect(BMICalculator.getBMICategory(45).name).toBe('重度肥胖');
    });

    test('应该为每个分类提供颜色', () => {
      const category = BMICalculator.getBMICategory(20);
      expect(category.color).toBeDefined();
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('健康风险评估', () => {
    test('应该正确评估不同BMI的健康风险', () => {
      expect(BMICalculator.getHealthRisk(16).level).toBe('moderate');
      expect(BMICalculator.getHealthRisk(22).level).toBe('low');
      expect(BMICalculator.getHealthRisk(27).level).toBe('moderate');
      expect(BMICalculator.getHealthRisk(32).level).toBe('high');
      expect(BMICalculator.getHealthRisk(42).level).toBe('very_high');
    });

    test('应该提供相关疾病风险信息', () => {
      const risk = BMICalculator.getHealthRisk(32);
      expect(risk.conditions).toBeInstanceOf(Array);
      expect(risk.conditions.length).toBeGreaterThan(0);
      expect(risk.description).toBeDefined();
    });
  });

  describe('理想体重计算', () => {
    test('应该计算正确的理想体重范围', () => {
      const range = BMICalculator.getIdealWeightRange(1.75, 'kg');
      
      expect(range.min).toBeCloseTo(56.66, 1);
      expect(range.max).toBeCloseTo(76.26, 1);
      expect(range.unit).toBe('kg');
    });

    test('应该支持不同单位的理想体重', () => {
      const rangeLb = BMICalculator.getIdealWeightRange(1.75, 'lb');
      
      expect(rangeLb.min).toBeGreaterThan(100);
      expect(rangeLb.max).toBeGreaterThan(rangeLb.min);
      expect(rangeLb.unit).toBe('lb');
    });
  });

  describe('百分位数和估算', () => {
    test('应该计算BMI百分位数', () => {
      expect(BMICalculator.getBMIPercentile(16)).toBeLessThan(20);
      expect(BMICalculator.getBMIPercentile(22)).toBeGreaterThan(40);
      expect(BMICalculator.getBMIPercentile(22)).toBeLessThan(80);
      expect(BMICalculator.getBMIPercentile(35)).toBeGreaterThan(90);
    });

    test('应该估算体脂率', () => {
      const bodyFat = BMICalculator.estimateBodyFat(22);
      
      expect(bodyFat.estimated).toBeGreaterThan(0);
      expect(bodyFat.estimated).toBeLessThan(50);
      expect(bodyFat.note).toContain('粗略估算');
    });

    test('应该估算代谢年龄', () => {
      const metabolicAge = BMICalculator.estimateMetabolicAge(22, 70, 1.75);
      
      expect(metabolicAge.estimated).toBeGreaterThanOrEqual(18);
      expect(metabolicAge.estimated).toBeLessThanOrEqual(80);
      expect(metabolicAge.note).toContain('估算值');
    });
  });

  describe('支持的单位', () => {
    test('应该返回所有支持的单位', () => {
      const units = BMICalculator.getSupportedUnits();
      
      expect(units.weight).toContain('kg');
      expect(units.weight).toContain('lb');
      expect(units.height).toContain('cm');
      expect(units.height).toContain('in');
    });
  });

  describe('边界情况', () => {
    test('应该处理极端BMI值', () => {
      const veryLow = BMICalculator.calculateBMI(30, 200, 'kg', 'cm');
      expect(veryLow.category).toBe('偏瘦');
      
      const veryHigh = BMICalculator.calculateBMI(200, 150, 'kg', 'cm');
      expect(veryHigh.category).toBe('重度肥胖');
    });

    test('应该处理精度问题', () => {
      const result = BMICalculator.calculateBMI(70.123, 175.456, 'kg', 'cm');
      
      // BMI应该被正确舍入到两位小数
      expect(result.bmi.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });
});