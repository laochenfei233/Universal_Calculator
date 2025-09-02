const request = require('supertest');
const app = require('../src/app');
const { CalculationHistory } = require('../src/utils/calculationHistory');

describe('API集成测试', () => {
  beforeEach(() => {
    // 清除历史记录
    CalculationHistory.clearHistory();
  });

  describe('GET /health', () => {
    test('应该返回健康状态', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('POST /api/calculator', () => {
    test('应该正确计算基础表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({ expression: '2 + 3 * 4' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(14);
    });

    test('应该正确计算科学表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({ 
          expression: 'sin(pi/2) + sqrt(16)', 
          type: 'scientific'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(5);
    });

    test('应该处理无效表达式', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({ expression: '2 + ' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该记录计算历史', async () => {
      await request(app)
        .post('/api/calculator')
        .send({ expression: '1 + 1' });
      
      const historyResponse = await request(app)
        .get('/api/calculator/history');
      
      expect(historyResponse.body.data.history).toHaveLength(1);
    });
  });

  describe('GET /api/calculator/history', () => {
    test('应该返回空历史记录', async () => {
      const response = await request(app)
        .get('/api/calculator/history');
      
      expect(response.status).toBe(200);
      expect(response.body.data.history).toEqual([]);
    });

    test('应该支持分页查询', async () => {
      // 添加多个计算记录
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/calculator')
          .send({ expression: `${i} + ${i}` });
      }

      const response = await request(app)
        .get('/api/calculator/history?limit=2&offset=1');
      
      expect(response.status).toBe(200);
      expect(response.body.data.history).toHaveLength(2);
      expect(response.body.data.total).toBe(5);
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

      // 验证历史记录已清除
      const historyResponse = await request(app)
        .get('/api/calculator/history');
      
      expect(historyResponse.body.data.total).toBe(0);
    });
  });

  describe('安全测试', () => {
    test('应该拒绝SQL注入尝试', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({ expression: "1; DROP TABLE calculations;" });
      
      expect(response.status).toBe(400);
    });

    test('应该拒绝XSS尝试', async () => {
      const response = await request(app)
        .post('/api/calculator')
        .send({ expression: "<script>alert(1)</script>" });
      
      expect(response.status).toBe(400);
    });

    test('应该限制请求频率', async () => {
      // 发送多个请求
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/calculator')
            .send({ expression: `${i} + ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });
});