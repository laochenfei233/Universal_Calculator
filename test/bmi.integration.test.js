/**
 * BMI API集成测试
 */

const request = require('supertest');
const express = require('express');
const bmiRouter = require('../src/routes/bmi');
const ResponseUtil = require('../src/utils/response');
const { errorHandler } = require('../src/middleware/errorHandler');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/bmi', bmiRouter);
app.use(errorHandler);

describe('BMI API Integration Tests', () => {
  describe('POST /api/bmi', () => {
    test('应该正确计算BMI（公制）', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175,
          weightUnit: 'kg',
          heightUnit: 'cm'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bmi).toBeCloseTo(22.86, 2);
      expect(response.body.data.category).toBe('正常');
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
      expect(response.body.data.idealWeightRange).toBeDefined();
      expect(response.body.data.healthRisk).toBeDefined();
    });

    test('应该正确计算BMI（英制）', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 154,
          height: 69,
          weightUnit: 'lb',
          heightUnit: 'in'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bmi).toBeCloseTo(22.74, 2);
      expect(response.body.data.category).toBe('正常');
      expect(response.body.data.converted.weightKg).toBeCloseTo(69.85, 2);
      expect(response.body.data.converted.heightM).toBeCloseTo(1.75, 2);
    });

    test('应该支持向后兼容的unit参数', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 154,
          height: 69,
          unit: 'imperial'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bmi).toBeCloseTo(22.74, 2);
    });

    test('应该支持公制unit参数', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175,
          unit: 'metric'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bmi).toBeCloseTo(22.86, 2);
    });

    test('应该默认使用公制单位', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.input.weightUnit).toBe('kg');
      expect(response.body.data.input.heightUnit).toBe('cm');
    });

    test('应该拒绝无效的体重', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 0,
          height: 175
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('体重必须是大于0的数字');
    });

    test('应该拒绝无效的身高', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: -175
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('身高必须是大于0的数字');
    });

    test('应该拒绝不支持的单位', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175,
          weightUnit: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('不支持的体重单位: invalid');
    });

    test('应该拒绝超出范围的数值', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 1500,
          height: 175
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('体重超出合理范围（1-1000千克）');
    });

    test('应该包含详细的健康分析', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 95,
          height: 175
        });

      expect(response.status).toBe(200);
      const { data } = response.body;
      
      expect(data.category).toBe('轻度肥胖');
      expect(data.analysis.status).toBe('轻度肥胖');
      expect(data.analysis.description).toContain('轻度肥胖');
      expect(data.analysis.percentile).toBeGreaterThan(80);
      expect(data.analysis.bodyFatEstimate.estimated).toBeGreaterThan(20);
      expect(data.analysis.metabolicAge.estimated).toBeGreaterThan(25);
    });

    test('应该提供针对性的健康建议', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 50,
          height: 175
        });

      expect(response.status).toBe(200);
      const { data } = response.body;
      
      expect(data.category).toBe('偏瘦');
      expect(data.recommendations.diet).toContain('增加健康脂肪摄入（坚果、牛油果、橄榄油）');
      expect(data.recommendations.exercise).toContain('进行力量训练增加肌肉量');
      expect(data.recommendations.lifestyle.length).toBeGreaterThan(0);
    });

    test('应该计算理想体重范围', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175
        });

      expect(response.status).toBe(200);
      const { data } = response.body;
      
      expect(data.idealWeightRange.min).toBeCloseTo(56.66, 1);
      expect(data.idealWeightRange.max).toBeCloseTo(76.26, 1);
      expect(data.idealWeightRange.unit).toBe('kg');
    });

    test('应该评估健康风险', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 130,
          height: 175
        });

      expect(response.status).toBe(200);
      const { data } = response.body;
      
      expect(data.healthRisk.level).toBe('very_high');
      expect(data.healthRisk.conditions).toContain('心血管疾病');
      expect(data.healthRisk.description).toContain('严重肥胖');
    });

    test('应该包含时间戳', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175
        });

      expect(response.status).toBe(200);
      expect(response.body.data.calculatedAt).toBeDefined();
      expect(new Date(response.body.data.calculatedAt)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/bmi/units', () => {
    test('应该返回支持的单位列表', async () => {
      const response = await request(app)
        .get('/api/bmi/units');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.weight).toContain('kg');
      expect(response.body.data.weight).toContain('lb');
      expect(response.body.data.height).toContain('cm');
      expect(response.body.data.height).toContain('in');
    });
  });

  describe('GET /api/bmi/categories', () => {
    test('应该返回BMI分类信息', async () => {
      const response = await request(app)
        .get('/api/bmi/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeInstanceOf(Array);
      expect(response.body.data.categories.length).toBeGreaterThan(0);
      
      const normalCategory = response.body.data.categories.find(c => c.name === '正常');
      expect(normalCategory).toBeDefined();
      expect(normalCategory.min).toBe(18.5);
      expect(normalCategory.max).toBe(24.9);
      expect(normalCategory.color).toBeDefined();
    });
  });

  describe('POST /api/bmi/batch', () => {
    test('应该处理批量BMI计算', async () => {
      const measurements = [
        { weight: 70, height: 175, date: '2024-01-01' },
        { weight: 72, height: 175, date: '2024-02-01' },
        { weight: 68, height: 175, date: '2024-03-01' }
      ];

      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(3);
      expect(response.body.data.summary.total).toBe(3);
      expect(response.body.data.summary.successful).toBe(3);
      expect(response.body.data.summary.failed).toBe(0);
      
      // 检查结果包含日期
      expect(response.body.data.results[0].date).toBe('2024-01-01');
    });

    test('应该处理混合有效和无效数据', async () => {
      const measurements = [
        { weight: 70, height: 175 },
        { weight: 0, height: 175 }, // 无效
        { weight: 72, height: 175 }
      ];

      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(2);
      expect(response.body.data.errors).toHaveLength(1);
      expect(response.body.data.summary.successful).toBe(2);
      expect(response.body.data.summary.failed).toBe(1);
      
      // 检查错误信息
      expect(response.body.data.errors[0].index).toBe(1);
      expect(response.body.data.errors[0].errors).toContain('体重必须是大于0的数字');
    });

    test('应该拒绝空数组', async () => {
      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements: [] });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('measurements必须是非空数组');
    });

    test('应该拒绝过大的批量请求', async () => {
      const measurements = Array(101).fill({ weight: 70, height: 175 });

      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('批量计算最多支持100条记录');
    });

    test('应该支持不同单位的批量计算', async () => {
      const measurements = [
        { weight: 70, height: 175, weightUnit: 'kg', heightUnit: 'cm' },
        { weight: 154, height: 69, weightUnit: 'lb', heightUnit: 'in' }
      ];

      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements });

      expect(response.status).toBe(200);
      expect(response.body.data.results).toHaveLength(2);
      expect(response.body.data.results[0].input.weightUnit).toBe('kg');
      expect(response.body.data.results[1].input.weightUnit).toBe('lb');
    });
  });

  describe('缓存功能', () => {
    test('应该缓存计算结果', async () => {
      const requestData = {
        weight: 71, // 使用不同的值避免之前测试的缓存
        height: 176,
        weightUnit: 'kg',
        heightUnit: 'cm'
      };

      // 第一次请求
      const response1 = await request(app)
        .post('/api/bmi')
        .send(requestData);

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('BMI计算完成');

      // 第二次请求应该使用缓存
      const response2 = await request(app)
        .post('/api/bmi')
        .send(requestData);

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('BMI计算完成（缓存）');
      
      // 结果应该相同
      expect(response2.body.data.bmi).toBe(response1.body.data.bmi);
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成单次计算', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70,
          height: 175
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    test('应该在合理时间内完成批量计算', async () => {
      const measurements = Array(50).fill().map((_, i) => ({
        weight: 60 + i,
        height: 170 + i,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`
      }));

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/bmi/batch')
        .send({ measurements });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.data.results).toHaveLength(50);
      expect(duration).toBeLessThan(500); // 50条记录应该在500ms内完成
    });
  });

  describe('边界情况', () => {
    test('应该处理极端BMI值', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 30,
          height: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.data.category).toBe('偏瘦');
      expect(response.body.data.healthRisk.level).toBe('moderate');
    });

    test('应该处理精度问题', async () => {
      const response = await request(app)
        .post('/api/bmi')
        .send({
          weight: 70.123456,
          height: 175.987654
        });

      expect(response.status).toBe(200);
      // BMI应该被正确舍入
      expect(response.body.data.bmi.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });
});