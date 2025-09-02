/**
 * 基础计算功能单元测试
 */

const request = require('supertest');
const express = require('express');
const calculatorRouter = require('../src/routes/calculator');
const ResponseUtil = require('../src/utils/response');
const { errorHandler } = require('../src/middleware/errorHandler');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/calculator', calculatorRouter);
app.use(errorHandler);

describe('Calculator API', () => {
  beforeEach(() => {
    // 清除历史记录
    const CalculationHistory = require('../src/utils/calculationHistory');
    CalculationHistory.clearHistory();
  });

  describe('POST /api/calculator', () => {
    test('应该正确计算基础数学表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '2 + 3 * 4',
          type: 'basic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(14);
      expect(response.body.data.expression).toBe('2 + 3 * 4');
      expect(response.body.data.type).toBe('basic');
      expect(response.body.data.steps).toContain('2 + 3 * 4 = 14');
      expect(response.body.data.historyId).toBeDefined();
    });

    test('应该正确处理小数计算', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '1.5 + 2.3',
          type: 'basic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBeCloseTo(3.8);
    });

    test('应该正确处理括号优先级', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '(2 + 3) * 4',
          type: 'basic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(20);
    });

    test('应该正确处理负数', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '-5 + 3',
          type: 'basic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(-2);
    });

    test('应该处理除零错误', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '5 / 0',
          type: 'basic'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('除数不能为零');
    });

    test('应该处理无效表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '2 + @',
          type: 'basic'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该拒绝空表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '',
          type: 'basic'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该拒绝危险表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: 'eval("alert(1)")',
          type: 'basic'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该默认使用basic类型', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '1 + 1'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.type).toBe('basic');
    });
  });

  describe('GET /api/calculator/history', () => {
    test('应该返回空历史记录', async () => {
      const response = await request(app)
        .get('/api/calculator/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    test('应该返回计算历史记录', async () => {
      // 先进行一些计算
      await request(app)
        .post('/api/calculator')
        .send({ expression: '1 + 1' });
      
      await request(app)
        .post('/api/calculator')
        .send({ expression: '2 * 3' });

      const response = await request(app)
        .get('/api/calculator/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.history).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      
      // 检查历史记录顺序（最新的在前）
      expect(response.body.data.history[0].expression).toBe('2 * 3');
      expect(response.body.data.history[1].expression).toBe('1 + 1');
    });

    test('应该支持分页查询', async () => {
      // 添加多个计算记录
      for (let i = 1; i <= 15; i++) {
        await request(app)
          .post('/api/calculator')
          .send({ expression: `${i} + ${i}` });
      }

      const response = await request(app)
        .get('/api/calculator/history?limit=5&offset=0');

      expect(response.status).toBe(200);
      expect(response.body.data.history).toHaveLength(5);
      expect(response.body.data.total).toBe(15);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.offset).toBe(0);
    });
  });

  describe('DELETE /api/calculator/history', () => {
    test('应该清除所有历史记录', async () => {
      // 先添加一些记录
      await request(app)
        .post('/api/calculator')
        .send({ expression: '1 + 1' });

      // 清除历史记录
      const deleteResponse = await request(app)
        .delete('/api/calculator/history');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // 验证历史记录已清除
      const historyResponse = await request(app)
        .get('/api/calculator/history');

      expect(historyResponse.body.data.total).toBe(0);
    });
  });

  describe('DELETE /api/calculator/history/:id', () => {
    test('应该删除特定历史记录', async () => {
      // 添加计算记录
      const calcResponse = await request(app)
        .post('/api/calculator')
        .send({ expression: '1 + 1' });

      const historyId = calcResponse.body.data.historyId;

      // 删除特定记录
      const deleteResponse = await request(app)
        .delete(`/api/calculator/history/${historyId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // 验证记录已删除
      const historyResponse = await request(app)
        .get('/api/calculator/history');

      expect(historyResponse.body.data.total).toBe(0);
    });

    test('应该处理不存在的历史记录ID', async () => {
      const response = await request(app)
        .delete('/api/calculator/history/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('历史记录不存在');
    });
  });

  describe('精度处理', () => {
    test('应该正确处理浮点数精度问题', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '0.1 + 0.2'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.result).toBeCloseTo(0.3);
      // 确保结果不是 0.30000000000000004
      expect(response.body.data.result).not.toBe(0.30000000000000004);
    });

    test('应该限制结果精度位数', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '1 / 3'
        });

      expect(response.status).toBe(200);
      const resultStr = response.body.data.result.toString();
      expect(resultStr.length).toBeLessThan(15); // 限制精度
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成计算', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/calculator')
        .send({
          expression: '((2 + 3) * 4 - 1) / (5 + 2) + 4'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});