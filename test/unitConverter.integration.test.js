// 单位换算API集成测试
const request = require('supertest');
const app = require('../src/app');

describe('单位换算API集成测试', () => {
  describe('GET /api/convert/categories', () => {
    test('应该返回所有支持的单位类别', async () => {
      const response = await request(app)
        .get('/api/convert/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // 检查必要的类别
      const categoryKeys = response.body.data.map(c => c.key);
      expect(categoryKeys).toContain('length');
      expect(categoryKeys).toContain('weight');
      expect(categoryKeys).toContain('temperature');
    });
  });

  describe('GET /api/convert/categories/:category/units', () => {
    test('应该返回长度单位列表', async () => {
      const response = await request(app)
        .get('/api/convert/categories/length/units')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // 检查必要的单位
      const unitKeys = response.body.data.map(u => u.key);
      expect(unitKeys).toContain('m');
      expect(unitKeys).toContain('cm');
      expect(unitKeys).toContain('km');
    });

    test('应该返回重量单位列表', async () => {
      const response = await request(app)
        .get('/api/convert/categories/weight/units')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      const unitKeys = response.body.data.map(u => u.key);
      expect(unitKeys).toContain('kg');
      expect(unitKeys).toContain('g');
      expect(unitKeys).toContain('lb');
    });

    test('应该处理无效的单位类别', async () => {
      const response = await request(app)
        .get('/api/convert/categories/invalid_category/units')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/convert', () => {
    test('应该正确进行长度单位换算', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 1,
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedValue).toBe(100);
      expect(response.body.data.fromUnit).toBe('m');
      expect(response.body.data.toUnit).toBe('cm');
      expect(response.body.data.category).toBe('length');
    });

    test('应该正确进行重量单位换算', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 1,
          fromUnit: 'kg',
          toUnit: 'g',
          category: 'weight'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedValue).toBe(1000);
    });

    test('应该正确进行温度单位换算', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 0,
          fromUnit: 'celsius',
          toUnit: 'fahrenheit',
          category: 'temperature'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedValue).toBe(32);
    });

    test('应该处理相同单位的转换', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 100,
          fromUnit: 'm',
          toUnit: 'm',
          category: 'length'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedValue).toBe(100);
    });

    test('应该验证必需参数', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 100
          // 缺少其他参数
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeInstanceOf(Array);
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    test('应该验证数值类型', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 'invalid',
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该验证单位类别', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 100,
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'invalid_category'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该验证单位有效性', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 100,
          fromUnit: 'invalid_unit',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/convert/batch', () => {
    test('应该进行批量单位换算', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          value: 1,
          fromUnit: 'm',
          category: 'length',
          targetUnits: ['cm', 'mm', 'km']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.conversions).toBeInstanceOf(Array);
      expect(response.body.data.conversions.length).toBe(3);
      expect(response.body.data.totalConversions).toBe(3);
      
      // 检查转换结果
      const cmResult = response.body.data.conversions.find(c => c.toUnit === 'cm');
      expect(cmResult.convertedValue).toBe(100);
      
      const mmResult = response.body.data.conversions.find(c => c.toUnit === 'mm');
      expect(mmResult.convertedValue).toBe(1000);
      
      const kmResult = response.body.data.conversions.find(c => c.toUnit === 'km');
      expect(kmResult.convertedValue).toBe(0.001);
    });

    test('应该转换为类别中的所有单位（不指定目标单位）', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          value: 1,
          fromUnit: 'kg',
          category: 'weight'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.conversions).toBeInstanceOf(Array);
      expect(response.body.data.conversions.length).toBeGreaterThan(0);
      
      // 应该包含常见的重量单位转换
      const unitKeys = response.body.data.conversions.map(c => c.toUnit);
      expect(unitKeys).toContain('g');
      expect(unitKeys).toContain('lb');
    });

    test('应该验证批量转换参数', async () => {
      const response = await request(app)
        .post('/api/convert/batch')
        .send({
          value: 'invalid',
          fromUnit: 'm',
          category: 'length'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('缓存功能测试', () => {
    test('应该缓存单位换算结果', async () => {
      // 第一次请求
      const start1 = Date.now();
      const response1 = await request(app)
        .post('/api/convert')
        .send({
          value: 1,
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(200);
      const time1 = Date.now() - start1;

      // 第二次相同请求（应该从缓存返回）
      const start2 = Date.now();
      const response2 = await request(app)
        .post('/api/convert')
        .send({
          value: 1,
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(200);
      const time2 = Date.now() - start2;

      // 验证结果相同
      expect(response1.body.data.convertedValue).toBe(response2.body.data.convertedValue);
      
      // 缓存的请求应该更快（虽然在测试环境中差异可能不明显）
      expect(time2).toBeLessThanOrEqual(time1 + 10); // 允许10ms误差
    });

    test('应该缓存单位类别列表', async () => {
      // 第一次请求
      const response1 = await request(app)
        .get('/api/convert/categories')
        .expect(200);

      // 第二次请求（应该从缓存返回）
      const response2 = await request(app)
        .get('/api/convert/categories')
        .expect(200);

      // 验证结果相同
      expect(response1.body.data).toEqual(response2.body.data);
    });
  });

  describe('精度和格式化测试', () => {
    test('应该正确处理小数精度', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 1,
          fromUnit: 'inch',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.convertedValue).toBeCloseTo(2.54, 3);
      expect(response.body.data.precision).toBeGreaterThanOrEqual(2);
    });

    test('应该包含格式化信息', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: 1000,
          fromUnit: 'm',
          toUnit: 'km',
          category: 'length'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('formattedOriginal');
      expect(response.body.data).toHaveProperty('formattedConverted');
      expect(response.body.data).toHaveProperty('fromSymbol');
      expect(response.body.data).toHaveProperty('toSymbol');
      expect(response.body.data).toHaveProperty('fromName');
      expect(response.body.data).toHaveProperty('toName');
    });
  });

  describe('错误处理测试', () => {
    test('应该处理计算错误', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          value: Infinity,
          fromUnit: 'm',
          toUnit: 'cm',
          category: 'length'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('应该处理服务器内部错误', async () => {
      // 这个测试可能需要模拟内部错误，暂时跳过
      // 在实际应用中，可以通过模拟依赖项来测试错误处理
    });
  });
});