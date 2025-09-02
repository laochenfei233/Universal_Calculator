/**
 * 房贷计算API集成测试
 */

const request = require('supertest');
const app = require('../src/app');

describe('Mortgage API Integration Tests', () => {
  describe('POST /api/mortgage', () => {
    test('应该成功计算等额本息房贷', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: 1000000,
          rate: 4.5,
          years: 30,
          type: 'equal'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('等额本息');
      expect(response.body.data.monthlyPayment).toBeCloseTo(5066.85, 2);
      expect(response.body.data.totalInterest).toBeGreaterThan(0);
    });

    test('应该成功计算等额本金房贷', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: 1000000,
          rate: 4.5,
          years: 30,
          type: 'principal'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('等额本金');
      expect(response.body.data.firstPayment).toBeGreaterThan(response.body.data.lastPayment);
    });

    test('应该包含还款计划当请求时', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: 100000,
          rate: 5.0,
          years: 2,
          type: 'equal',
          includeSchedule: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data.schedule).toBeDefined();
      expect(response.body.data.schedule).toHaveLength(24);
    });

    test('应该验证输入参数', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: -100000, // 负数本金
          rate: 4.5,
          years: 30
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('贷款本金必须大于0');
    });

    test('应该验证利率范围', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: 100000,
          rate: 25, // 超出范围的利率
          years: 30
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/mortgage/schedule', () => {
    test('应该成功生成详细还款计划', async () => {
      const response = await request(app)
        .post('/api/mortgage/schedule')
        .send({
          principal: 100000,
          rate: 5.0,
          years: 2,
          type: 'equal',
          groupBy: 1
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.loanSummary).toBeDefined();
      expect(response.body.data.schedule).toHaveLength(24);
      expect(response.body.data.schedule[0]).toHaveProperty('month');
      expect(response.body.data.schedule[0]).toHaveProperty('monthlyPayment');
      expect(response.body.data.schedule[0]).toHaveProperty('principalPayment');
      expect(response.body.data.schedule[0]).toHaveProperty('interestPayment');
    });

    test('应该支持按年分组', async () => {
      const response = await request(app)
        .post('/api/mortgage/schedule')
        .send({
          principal: 100000,
          rate: 5.0,
          years: 3,
          type: 'equal',
          groupBy: 12
        });

      expect(response.status).toBe(200);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary).toHaveLength(3); // 3年
      expect(response.body.data.summary[0]).toHaveProperty('year', 1);
      expect(response.body.data.summary[0]).toHaveProperty('totalPayment');
    });
  });

  describe('POST /api/mortgage/prepayment', () => {
    test('应该成功计算提前还款（缩短年限）', async () => {
      const response = await request(app)
        .post('/api/mortgage/prepayment')
        .send({
          principal: 1000000,
          rate: 4.5,
          years: 30,
          type: 'equal',
          prepaymentAmount: 200000,
          prepaymentMonth: 12,
          prepaymentType: 'reduce_term'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prepaymentAmount).toBe(200000);
      expect(response.body.data.savings.interestSaved).toBeGreaterThan(0);
      expect(response.body.data.savings.termReduction.months).toBeGreaterThan(0);
    });

    test('应该成功计算提前还款（减少月供）', async () => {
      const response = await request(app)
        .post('/api/mortgage/prepayment')
        .send({
          principal: 1000000,
          rate: 4.5,
          years: 30,
          type: 'equal',
          prepaymentAmount: 100000,
          prepaymentMonth: 24,
          prepaymentType: 'reduce_payment'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.savings.paymentReduction).toBeGreaterThan(0);
    });

    test('应该拒绝过大的提前还款金额', async () => {
      const response = await request(app)
        .post('/api/mortgage/prepayment')
        .send({
          principal: 100000,
          rate: 4.5,
          years: 30,
          type: 'equal',
          prepaymentAmount: 100000, // 等于本金
          prepaymentMonth: 1,
          prepaymentType: 'reduce_term'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该验证提前还款月份', async () => {
      const response = await request(app)
        .post('/api/mortgage/prepayment')
        .send({
          principal: 100000,
          rate: 4.5,
          years: 10,
          type: 'equal',
          prepaymentAmount: 10000,
          prepaymentMonth: 150, // 超过贷款总月数
          prepaymentType: 'reduce_term'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('提前还款月份不能超过贷款总月数');
    });
  });

  describe('POST /api/mortgage/compare', () => {
    test('应该成功对比两种还款方式', async () => {
      const response = await request(app)
        .post('/api/mortgage/compare')
        .send({
          principal: 1000000,
          rate: 4.5,
          years: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equalPayment).toBeDefined();
      expect(response.body.data.equalPrincipal).toBeDefined();
      expect(response.body.data.comparison).toBeDefined();
      
      expect(response.body.data.equalPayment.type).toBe('等额本息');
      expect(response.body.data.equalPrincipal.type).toBe('等额本金');
      expect(response.body.data.comparison.recommendation).toBe('equalPrincipal');
      
      expect(response.body.data.equalPayment.pros).toContain('月供固定，便于规划');
      expect(response.body.data.equalPrincipal.pros).toContain('总利息较少');
    });
  });

  describe('POST /api/mortgage/affordability', () => {
    test('应该成功分析房贷承受能力', async () => {
      const response = await request(app)
        .post('/api/mortgage/affordability')
        .send({
          monthlyIncome: 20000,
          monthlyExpenses: 8000,
          rate: 4.5,
          years: 30,
          debtToIncomeRatio: 0.5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.monthlyIncome).toBe(20000);
      expect(response.body.data.availableIncome).toBe(12000);
      expect(response.body.data.maxLoanAmount).toBeGreaterThan(0);
      expect(response.body.data.recommendations).toHaveProperty('conservative');
      expect(response.body.data.riskAssessment).toHaveProperty('level');
    });

    test('应该验证收入支出关系', async () => {
      const response = await request(app)
        .post('/api/mortgage/affordability')
        .send({
          monthlyIncome: 10000,
          monthlyExpenses: 12000, // 支出大于收入
          rate: 4.5,
          years: 30
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('月支出不能大于或等于月收入');
    });
  });

  describe('POST /api/mortgage/scenarios', () => {
    test('应该成功对比多个贷款方案', async () => {
      const response = await request(app)
        .post('/api/mortgage/scenarios')
        .send({
          scenarios: [
            {
              name: '方案A',
              principal: 1000000,
              rate: 4.5,
              years: 30,
              type: 'equal'
            },
            {
              name: '方案B',
              principal: 800000,
              rate: 4.0,
              years: 25,
              type: 'equal'
            },
            {
              name: '方案C',
              principal: 1000000,
              rate: 4.5,
              years: 30,
              type: 'principal'
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scenarios).toHaveLength(3);
      expect(response.body.data.bestScenario).toBeDefined();
      expect(response.body.data.analysis).toHaveProperty('lowestTotalInterest');
      
      response.body.data.scenarios.forEach(scenario => {
        expect(scenario).toHaveProperty('name');
        expect(scenario).toHaveProperty('totalInterest');
        expect(scenario).toHaveProperty('costEffectiveness');
      });
    });

    test('应该限制方案数量', async () => {
      const scenarios = Array(6).fill().map((_, i) => ({
        name: `方案${i + 1}`,
        principal: 100000,
        rate: 4.5,
        years: 30
      }));

      const response = await request(app)
        .post('/api/mortgage/scenarios')
        .send({ scenarios });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('最多支持对比5个贷款方案');
    });

    test('应该验证方案参数', async () => {
      const response = await request(app)
        .post('/api/mortgage/scenarios')
        .send({
          scenarios: [
            {
              principal: -100000, // 负数本金
              rate: 4.5,
              years: 30
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('缓存机制测试', () => {
    test('应该使用缓存机制', async () => {
      const requestData = {
        principal: 500000,
        rate: 4.2,
        years: 25,
        type: 'equal'
      };

      // 第一次请求
      const response1 = await request(app)
        .post('/api/mortgage')
        .send(requestData);

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('房贷计算完成');

      // 第二次相同请求应该使用缓存
      const response2 = await request(app)
        .post('/api/mortgage')
        .send(requestData);

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('房贷计算完成（缓存）');
      expect(response2.body.data).toEqual(response1.body.data);
    });
  });

  describe('错误处理测试', () => {
    test('应该正确处理无效的还款类型', async () => {
      const response = await request(app)
        .post('/api/mortgage')
        .send({
          principal: 100000,
          rate: 4.5,
          years: 30,
          type: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('还款类型必须是 equal 或 principal');
    });

    test('应该正确处理无效的提前还款类型', async () => {
      const response = await request(app)
        .post('/api/mortgage/prepayment')
        .send({
          principal: 100000,
          rate: 4.5,
          years: 30,
          type: 'equal',
          prepaymentAmount: 10000,
          prepaymentMonth: 12,
          prepaymentType: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContain('提前还款类型必须是 reduce_term 或 reduce_payment');
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成复杂计算', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/mortgage/schedule')
        .send({
          principal: 2000000,
          rate: 4.5,
          years: 30,
          type: 'equal',
          groupBy: 1
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(2000); // 应该在2秒内完成
      expect(response.body.data.schedule).toHaveLength(360); // 30年 * 12月
    });

    test('应该支持并发请求', async () => {
      const requests = Array(5).fill().map((_, i) => 
        request(app)
          .post('/api/mortgage')
          .send({
            principal: 100000 + i * 50000,
            rate: 4.5,
            years: 30,
            type: 'equal'
          })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});