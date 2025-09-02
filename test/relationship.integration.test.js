/**
 * 亲属关系计算API集成测试
 */

const request = require('supertest');
const app = require('../src/app');

describe('Relationship API Integration Tests', () => {
  describe('POST /api/relationship/calculate', () => {
    test('应该正确计算简单关系', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['父亲'],
          gender: 'male',
          region: 'standard'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.result).toBe('父亲');
    });

    test('应该正确计算复合关系', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['父亲', '父亲'],
          gender: 'male',
          region: 'standard'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.result).toBe('爷爷');
    });

    test('应该支持地区差异', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['母亲', '父亲'],
          gender: 'male',
          region: 'northern'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.result).toBe('姥爷');
    });

    test('应该处理无效输入', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: [],
          gender: 'male'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该处理无效关系', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['无效关系'],
          gender: 'male'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该使用默认参数', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['母亲']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gender).toBe('male');
      expect(response.body.data.region).toBe('standard');
    });
  });

  describe('POST /api/relationship/reverse', () => {
    test('应该正确反向查询', async () => {
      const response = await request(app)
        .post('/api/relationship/reverse')
        .send({
          targetRelation: '爷爷',
          region: 'standard'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.possiblePaths).toContainEqual(['父亲', '父亲']);
    });

    test('应该处理未知称呼', async () => {
      const response = await request(app)
        .post('/api/relationship/reverse')
        .send({
          targetRelation: '未知称呼'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.possiblePaths).toEqual([]);
    });

    test('应该处理无效输入', async () => {
      const response = await request(app)
        .post('/api/relationship/reverse')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/relationship/validate', () => {
    test('应该验证正确的关系', async () => {
      const response = await request(app)
        .post('/api/relationship/validate')
        .send({
          path: ['父亲', '父亲'],
          expectedResult: '爷爷',
          gender: 'male'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
    });

    test('应该识别错误的关系', async () => {
      const response = await request(app)
        .post('/api/relationship/validate')
        .send({
          path: ['父亲', '父亲'],
          expectedResult: '外公',
          gender: 'male'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.actualResult).toBe('爷爷');
    });

    test('应该处理无效输入', async () => {
      const response = await request(app)
        .post('/api/relationship/validate')
        .send({
          path: ['父亲']
          // 缺少 expectedResult
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/relationship/relations', () => {
    test('应该返回支持的关系列表', async () => {
      const response = await request(app)
        .get('/api/relationship/relations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.relations)).toBe(true);
      expect(response.body.data.relations).toContain('父亲');
      expect(response.body.data.relations).toContain('母亲');
    });
  });

  describe('GET /api/relationship/regions', () => {
    test('应该返回支持的地区列表', async () => {
      const response = await request(app)
        .get('/api/relationship/regions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.regions)).toBe(true);
      expect(response.body.data.regions.some(r => r.key === 'standard')).toBe(true);
      expect(response.body.data.regions.some(r => r.key === 'northern')).toBe(true);
    });
  });

  describe('DELETE /api/relationship/cache', () => {
    test('应该清除缓存', async () => {
      // 先进行一次计算以填充缓存
      await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['父亲', '父亲']
        });

      // 清除缓存
      const response = await request(app)
        .delete('/api/relationship/cache');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('缓存功能测试', () => {
    test('应该使用缓存提高性能', async () => {
      const requestData = {
        path: ['父亲', '母亲'],
        gender: 'male',
        region: 'standard'
      };

      // 第一次请求
      const start1 = Date.now();
      const response1 = await request(app)
        .post('/api/relationship/calculate')
        .send(requestData);
      const time1 = Date.now() - start1;

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('计算成功');

      // 第二次请求应该使用缓存
      const start2 = Date.now();
      const response2 = await request(app)
        .post('/api/relationship/calculate')
        .send(requestData);
      const time2 = Date.now() - start2;

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('计算成功（缓存）');
      expect(response1.body.data.result).toBe(response2.body.data.result);
      
      // 缓存请求应该更快（虽然在测试环境中差异可能不明显）
      // expect(time2).toBeLessThan(time1);
    });
  });

  describe('边界情况测试', () => {
    test('应该处理最大路径长度', async () => {
      const longPath = new Array(10).fill('父亲');
      
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: longPath
        });

      // 应该返回错误，因为路径太长无法解析
      expect(response.status).toBe(400);
    });

    test('应该处理特殊字符', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['<script>alert("xss")</script>']
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该处理空字符串', async () => {
      const response = await request(app)
        .post('/api/relationship/calculate')
        .send({
          path: ['']
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});