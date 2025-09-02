const request = require('supertest');
const app = require('../src/app');

describe('Number Converter API Integration Tests', () => {
  describe('POST /api/convert/number', () => {
    test('应该转换阿拉伯数字到中文', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 123,
          type: 'chinese'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.result).toBe('一百二十三');
      expect(response.body.data.inputType).toBe('arabic');
      expect(response.body.data.targetType).toBe('chinese');
    });

    test('应该转换中文数字到阿拉伯数字', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: '一千二百三十四',
          type: 'arabic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe(1234);
      expect(response.body.data.inputType).toBe('chinese');
    });

    test('应该转换为财务大写格式', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 12345,
          type: 'financial'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe('壹万贰仟叁佰肆拾伍');
    });

    test('应该转换为财务金额格式', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 1234.56,
          type: 'financial-amount'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe('壹仟贰佰叁拾肆元伍角陆分');
    });

    test('应该处理字符串形式的阿拉伯数字', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: '999',
          type: 'chinese'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe('九百九十九');
    });

    test('应该处理负数', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: -123,
          type: 'chinese'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.result).toBe('负一百二十三');
    });

    test('应该验证空输入', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: '',
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('输入验证失败');
    });

    test('应该验证无效转换类型', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 123,
          type: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('输入验证失败');
    });

    test('应该处理转换错误', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 'invalid input',
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('数字转换失败');
    });

    test('应该处理超出范围的数字', async () => {
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 1000000000000000, // 16位数，超出范围
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/convert/number/batch', () => {
    test('应该批量转换数字', async () => {
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs: [1, 2, 3, '四', '五'],
          type: 'chinese'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(5);
      expect(response.body.data.summary.total).toBe(5);
      expect(response.body.data.summary.success).toBe(5); // All should succeed
      expect(response.body.data.results[0].result).toBe('一');
      expect(response.body.data.results[1].result).toBe('二');
    });

    test('应该处理混合成功和失败的情况', async () => {
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs: [123, 'invalid', '四百五十六'],
          type: 'arabic'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toHaveLength(3);
      expect(response.body.data.summary.success).toBeGreaterThan(0);
      expect(response.body.data.summary.failure).toBeGreaterThan(0);
    });

    test('应该验证输入为数组', async () => {
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs: 'not an array',
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('输入验证失败');
    });

    test('应该验证数组不为空', async () => {
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs: [],
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('输入验证失败');
    });

    test('应该限制批量转换数量', async () => {
      const largeArray = new Array(101).fill(1);
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs: largeArray,
          type: 'chinese'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('输入验证失败');
    });
  });

  describe('GET /api/convert/number/types', () => {
    test('应该返回支持的转换类型', async () => {
      const response = await request(app)
        .get('/api/convert/number/types');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inputTypes).toContain('arabic');
      expect(response.body.data.inputTypes).toContain('chinese');
      expect(response.body.data.outputTypes).toContain('chinese');
      expect(response.body.data.outputTypes).toContain('financial');
      expect(response.body.data.outputTypes).toContain('arabic');
      expect(response.body.data.outputTypes).toContain('financial-amount');
      expect(response.body.data.maxNumber).toBeDefined();
      expect(response.body.data.minNumber).toBeDefined();
      expect(response.body.data.description).toBeDefined();
    });
  });

  describe('缓存功能测试', () => {
    test('应该缓存转换结果', async () => {
      // 第一次请求
      const response1 = await request(app)
        .post('/api/convert/number')
        .send({
          input: 12345,
          type: 'chinese'
        });

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('数字转换完成');

      // 第二次相同请求应该使用缓存
      const response2 = await request(app)
        .post('/api/convert/number')
        .send({
          input: 12345,
          type: 'chinese'
        });

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('数字转换完成（缓存）');
      expect(response2.body.data.result).toBe(response1.body.data.result);
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成转换', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/convert/number')
        .send({
          input: 123456789,
          type: 'chinese'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('批量转换应该在合理时间内完成', async () => {
      const inputs = Array.from({ length: 50 }, (_, i) => i + 1);
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/convert/number/batch')
        .send({
          inputs,
          type: 'chinese'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // 应该在2秒内完成
    });
  });

  describe('双向转换一致性测试', () => {
    const testCases = [
      { arabic: 0, chinese: '零' },
      { arabic: 1, chinese: '一' },
      { arabic: 10, chinese: '十' },
      { arabic: 11, chinese: '十一' },
      { arabic: 100, chinese: '一百' },
      { arabic: 101, chinese: '一百零一' },
      { arabic: 1000, chinese: '一千' },
      { arabic: 1001, chinese: '一千零一' },
      { arabic: 10000, chinese: '一万' },
      { arabic: 12345, chinese: '一万二千三百四十五' }
    ];

    testCases.forEach(({ arabic, chinese }) => {
      test(`数字 ${arabic} 和 "${chinese}" 应该双向转换一致`, async () => {
        // 阿拉伯数字转中文
        const response1 = await request(app)
          .post('/api/convert/number')
          .send({
            input: arabic,
            type: 'chinese'
          });

        expect(response1.status).toBe(200);
        expect(response1.body.data.result).toBe(chinese);

        // 中文转阿拉伯数字
        const response2 = await request(app)
          .post('/api/convert/number')
          .send({
            input: chinese,
            type: 'arabic'
          });

        expect(response2.status).toBe(200);
        expect(response2.body.data.result).toBe(arabic);
      });
    });
  });
});