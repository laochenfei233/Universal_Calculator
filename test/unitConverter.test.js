// 单位换算功能测试
const {
  convertUnit,
  convertTemperature,
  convertToMultipleUnits,
  validateConversionParams,
  formatConversionResult
} = require('../src/utils/unitConverter');

const {
  getSupportedCategories,
  getUnitsForCategory,
  isValidUnit
} = require('../src/config/unitConversions');

describe('单位换算数据模型测试', () => {
  test('应该返回所有支持的单位类别', () => {
    const categories = getSupportedCategories();
    expect(categories).toBeInstanceOf(Array);
    expect(categories.length).toBeGreaterThan(0);
    
    const categoryKeys = categories.map(c => c.key);
    expect(categoryKeys).toContain('length');
    expect(categoryKeys).toContain('weight');
    expect(categoryKeys).toContain('temperature');
  });

  test('应该返回指定类别的所有单位', () => {
    const lengthUnits = getUnitsForCategory('length');
    expect(lengthUnits).toBeInstanceOf(Array);
    expect(lengthUnits.length).toBeGreaterThan(0);
    
    const unitKeys = lengthUnits.map(u => u.key);
    expect(unitKeys).toContain('m');
    expect(unitKeys).toContain('cm');
    expect(unitKeys).toContain('km');
  });

  test('应该正确验证单位有效性', () => {
    expect(isValidUnit('length', 'm')).toBe(true);
    expect(isValidUnit('length', 'invalid')).toBe(false);
    expect(isValidUnit('invalid_category', 'm')).toBe(false);
  });
});

describe('基础单位换算测试', () => {
  test('长度单位换算 - 米到厘米', () => {
    const result = convertUnit(1, 'm', 'cm', 'length');
    expect(result.convertedValue).toBe(100);
    expect(result.fromUnit).toBe('m');
    expect(result.toUnit).toBe('cm');
    expect(result.category).toBe('length');
  });

  test('长度单位换算 - 厘米到米', () => {
    const result = convertUnit(100, 'cm', 'm', 'length');
    expect(result.convertedValue).toBe(1);
  });

  test('长度单位换算 - 英制单位', () => {
    const result = convertUnit(1, 'ft', 'inch', 'length');
    expect(result.convertedValue).toBeCloseTo(12, 2);
  });

  test('重量单位换算 - 千克到克', () => {
    const result = convertUnit(1, 'kg', 'g', 'weight');
    expect(result.convertedValue).toBe(1000);
  });

  test('重量单位换算 - 磅到千克', () => {
    const result = convertUnit(1, 'lb', 'kg', 'weight');
    expect(result.convertedValue).toBeCloseTo(0.453592, 5);
  });

  test('相同单位转换应该返回原值', () => {
    const result = convertUnit(100, 'm', 'm', 'length');
    expect(result.convertedValue).toBe(100);
    expect(result.originalValue).toBe(100);
  });
});

describe('温度单位换算测试', () => {
  test('摄氏度到华氏度', () => {
    const result = convertUnit(0, 'celsius', 'fahrenheit', 'temperature');
    expect(result.convertedValue).toBe(32);
  });

  test('华氏度到摄氏度', () => {
    const result = convertUnit(32, 'fahrenheit', 'celsius', 'temperature');
    expect(result.convertedValue).toBe(0);
  });

  test('摄氏度到开尔文', () => {
    const result = convertUnit(0, 'celsius', 'kelvin', 'temperature');
    expect(result.convertedValue).toBe(273.15);
  });

  test('开尔文到摄氏度', () => {
    const result = convertUnit(273.15, 'kelvin', 'celsius', 'temperature');
    expect(result.convertedValue).toBeCloseTo(0, 2);
  });

  test('华氏度到开尔文', () => {
    const result = convertUnit(32, 'fahrenheit', 'kelvin', 'temperature');
    expect(result.convertedValue).toBeCloseTo(273.15, 2);
  });
});

describe('面积和体积单位换算测试', () => {
  test('平方米到平方厘米', () => {
    const result = convertUnit(1, 'm2', 'cm2', 'area');
    expect(result.convertedValue).toBe(10000);
  });

  test('立方米到升', () => {
    const result = convertUnit(1, 'm3', 'l', 'volume');
    expect(result.convertedValue).toBe(1000);
  });

  test('升到毫升', () => {
    const result = convertUnit(1, 'l', 'ml', 'volume');
    expect(result.convertedValue).toBe(1000);
  });
});

describe('时间和速度单位换算测试', () => {
  test('小时到分钟', () => {
    const result = convertUnit(1, 'hour', 'min', 'time');
    expect(result.convertedValue).toBe(60);
  });

  test('千米每小时到米每秒', () => {
    const result = convertUnit(36, 'kmh', 'mps', 'speed');
    expect(result.convertedValue).toBeCloseTo(10, 2);
  });

  test('英里每小时到千米每小时', () => {
    const result = convertUnit(60, 'mph', 'kmh', 'speed');
    expect(result.convertedValue).toBeCloseTo(96.56, 2);
  });
});

describe('批量单位换算测试', () => {
  test('应该转换为多个目标单位', () => {
    const results = convertToMultipleUnits(1, 'm', 'length', ['cm', 'mm', 'km']);
    expect(results).toHaveLength(3);
    
    const cmResult = results.find(r => r.toUnit === 'cm');
    expect(cmResult.convertedValue).toBe(100);
    
    const mmResult = results.find(r => r.toUnit === 'mm');
    expect(mmResult.convertedValue).toBe(1000);
    
    const kmResult = results.find(r => r.toUnit === 'km');
    expect(kmResult.convertedValue).toBe(0.001);
  });

  test('应该转换为类别中的所有单位', () => {
    const results = convertToMultipleUnits(1, 'kg', 'weight');
    expect(results.length).toBeGreaterThan(0);
    
    // 应该包含常见的重量单位
    const unitKeys = results.map(r => r.toUnit);
    expect(unitKeys).toContain('g');
    expect(unitKeys).toContain('lb');
  });
});

describe('参数验证测试', () => {
  test('应该验证有效参数', () => {
    const validation = validateConversionParams({
      value: 100,
      fromUnit: 'm',
      toUnit: 'cm',
      category: 'length'
    });
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('应该检测无效数值', () => {
    const validation = validateConversionParams({
      value: 'invalid',
      fromUnit: 'm',
      toUnit: 'cm',
      category: 'length'
    });
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('转换数值必须是有效数字');
  });

  test('应该检测缺失参数', () => {
    const validation = validateConversionParams({
      value: 100
      // 缺少其他参数
    });
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  test('应该检测无效单位类别', () => {
    const validation = validateConversionParams({
      value: 100,
      fromUnit: 'm',
      toUnit: 'cm',
      category: 'invalid_category'
    });
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('不支持的单位类别: invalid_category');
  });

  test('应该检测无效单位', () => {
    const validation = validateConversionParams({
      value: 100,
      fromUnit: 'invalid_unit',
      toUnit: 'cm',
      category: 'length'
    });
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('无效的源单位: invalid_unit');
  });
});

describe('错误处理测试', () => {
  test('应该处理无效数值', () => {
    expect(() => {
      convertUnit(NaN, 'm', 'cm', 'length');
    }).toThrow('输入值必须是有效数字');
  });

  test('应该处理无效类别', () => {
    expect(() => {
      convertUnit(100, 'm', 'cm', 'invalid_category');
    }).toThrow('不支持的单位类别: invalid_category');
  });

  test('应该处理无效源单位', () => {
    expect(() => {
      convertUnit(100, 'invalid_unit', 'cm', 'length');
    }).toThrow('无效的源单位: invalid_unit');
  });

  test('应该处理无效目标单位', () => {
    expect(() => {
      convertUnit(100, 'm', 'invalid_unit', 'length');
    }).toThrow('无效的目标单位: invalid_unit');
  });
});

describe('结果格式化测试', () => {
  test('应该格式化转换结果', () => {
    const result = convertUnit(1000, 'm', 'km', 'length');
    const formatted = formatConversionResult(result);
    
    expect(formatted).toHaveProperty('formattedOriginal');
    expect(formatted).toHaveProperty('formattedConverted');
    expect(formatted).toHaveProperty('fromSymbol');
    expect(formatted).toHaveProperty('toSymbol');
    expect(formatted).toHaveProperty('fromName');
    expect(formatted).toHaveProperty('toName');
  });

  test('应该支持格式化选项', () => {
    const result = convertUnit(1000, 'm', 'km', 'length');
    const formatted = formatConversionResult(result, {
      includeSymbols: false,
      includeNames: false
    });
    
    expect(formatted).not.toHaveProperty('fromSymbol');
    expect(formatted).not.toHaveProperty('toSymbol');
    expect(formatted).not.toHaveProperty('fromName');
    expect(formatted).not.toHaveProperty('toName');
  });
});

describe('精度处理测试', () => {
  test('应该正确处理小数精度', () => {
    const result = convertUnit(1, 'inch', 'cm', 'length');
    expect(result.convertedValue).toBeCloseTo(2.54, 3);
  });

  test('应该根据数值大小调整精度', () => {
    // 大数值应该有较少的小数位
    const largeResult = convertUnit(10000, 'm', 'km', 'length');
    expect(largeResult.precision).toBeLessThanOrEqual(2);
    
    // 小数值应该有较多的小数位
    const smallResult = convertUnit(0.001, 'm', 'mm', 'length');
    expect(smallResult.precision).toBeGreaterThanOrEqual(2);
  });
});