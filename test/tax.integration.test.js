/**
 * 个税计算API集成测试
 */

const request = require('supertest');
const app = require('../src/app');

describe('Tax API Integration Tests', () => {
  describe('POST /api/tax', () => {
    test('应该成功计算月度工资个税', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send({
          salary: 10000,
          socialInsurance: 800,
          housingFund: 500,
          specialDeductions: {
            childEducation: { count: 1 }
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('grossSalary', 10000);
      expect(response.body.data).toHaveProperty('tax');
      expect(response.body.data).toHaveProperty('afterTaxIncome');
      expect(response.body.data).toHaveProperty('deductions');
      expect(response.body.data).toHaveProperty('suggestions');
      expect(response.body.data.deductions.specialDeductions.total).toBe(1000);
    });

    test('应该正确验证输入参数', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send({
          salary: -1000 // 负数工资
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('工资必须大于0');
    });

    test('应该正确处理缺少必需参数', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该使用缓存机制', async () => {
      const requestData = {
        salary: 8000,
        socialInsurance: 640,
        housingFund: 400
      };

      // 第一次请求
      const response1 = await request(app)
        .post('/api/tax')
        .send(requestData);

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('个税计算完成');

      // 第二次相同请求应该使用缓存
      const response2 = await request(app)
        .post('/api/tax')
        .send(requestData);

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('个税计算完成（缓存）');
      expect(response2.body.data).toEqual(response1.body.data);
    });
  });

  describe('POST /api/tax/annual', () => {
    test('应该成功计算年度综合所得税', async () => {
      const response = await request(app)
        .post('/api/tax/annual')
        .send({
          annualSalary: 120000,
          annualBonus: 24000,
          otherIncome: 6000,
          annualSocialInsurance: 9600,
          annualHousingFund: 6000,
          specialDeductions: {
            childEducation: { count: 1 },
            elderCare: { amount: 24000 }
          },
          bonusTaxMethod: 'combined'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('grossIncome', 150000);
      expect(response.body.data).toHaveProperty('tax');
      expect(response.body.data).toHaveProperty('afterTaxIncome');
      expect(response.body.data.taxDetails.method).toBe('combined');
      expect(response.body.data.deductions.specialDeductions.total).toBe(36000); // 12000 + 24000
    });

    test('应该支持年终奖单独计税', async () => {
      const response = await request(app)
        .post('/api/tax/annual')
        .send({
          annualSalary: 120000,
          annualBonus: 60000,
          annualSocialInsurance: 9600,
          annualHousingFund: 6000,
          bonusTaxMethod: 'separate'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.taxDetails.method).toBe('separate');
      expect(response.body.data.taxDetails).toHaveProperty('salaryTax');
      expect(response.body.data.taxDetails).toHaveProperty('bonusTax');
    });

    test('应该验证年终奖计税方式', async () => {
      const response = await request(app)
        .post('/api/tax/annual')
        .send({
          annualSalary: 120000,
          bonusTaxMethod: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tax/social-insurance', () => {
    test('应该成功计算社保公积金', async () => {
      const response = await request(app)
        .post('/api/tax/social-insurance')
        .send({
          salary: 10000,
          city: 'beijing'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.items).toHaveProperty('pensionInsurance');
      expect(response.body.data.items).toHaveProperty('medicalInsurance');
      expect(response.body.data.items).toHaveProperty('unemploymentInsurance');
      expect(response.body.data.items).toHaveProperty('housingFund');
    });

    test('应该支持自定义缴费比例', async () => {
      const response = await request(app)
        .post('/api/tax/social-insurance')
        .send({
          salary: 10000,
          city: 'national',
          customRates: {
            housingFund: 0.15
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.items.housingFund.rate).toBe(15);
    });
  });

  describe('GET /api/tax/config', () => {
    test('应该成功获取个税配置信息', async () => {
      const response = await request(app)
        .get('/api/tax/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('basicDeduction');
      expect(response.body.data).toHaveProperty('monthlyTaxBrackets');
      expect(response.body.data).toHaveProperty('annualTaxBrackets');
      expect(response.body.data).toHaveProperty('specialDeductions');
      expect(response.body.data).toHaveProperty('socialInsuranceLimits');
      expect(response.body.data).toHaveProperty('bonusTaxMethods');
    });

    test('应该支持指定年份查询', async () => {
      const response = await request(app)
        .get('/api/tax/config?year=2023');

      expect(response.status).toBe(200);
      expect(response.body.data.basicDeduction).toBe(5000);
    });
  });

  describe('POST /api/tax/bonus-comparison', () => {
    test('应该成功对比年终奖计税方式', async () => {
      const response = await request(app)
        .post('/api/tax/bonus-comparison')
        .send({
          annualSalary: 120000,
          annualBonus: 60000,
          annualSocialInsurance: 9600,
          annualHousingFund: 6000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('separate');
      expect(response.body.data).toHaveProperty('combined');
      expect(response.body.data).toHaveProperty('recommendation');
      expect(response.body.data).toHaveProperty('taxDifference');
      expect(response.body.data).toHaveProperty('incomeDifference');
      
      expect(response.body.data.separate.method).toBe('年终奖单独计税');
      expect(response.body.data.combined.method).toBe('并入综合所得计税');
      expect(['separate', 'combined']).toContain(response.body.data.recommendation);
    });

    test('应该验证年终奖金额', async () => {
      const response = await request(app)
        .post('/api/tax/bonus-comparison')
        .send({
          annualSalary: 120000,
          annualBonus: -1000 // 负数年终奖
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toContain('年终奖必须大于0');
    });
  });

  describe('错误处理测试', () => {
    test('应该正确处理服务器内部错误', async () => {
      // 模拟一个会导致计算错误的请求
      const response = await request(app)
        .post('/api/tax')
        .send({
          salary: 'invalid', // 非数字类型
          socialInsurance: 800,
          housingFund: 500
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('应该正确处理大数值计算', async () => {
      const response = await request(app)
        .post('/api/tax')
        .send({
          salary: 999999999,
          socialInsurance: 50000,
          housingFund: 30000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tax).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成计算', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/tax')
        .send({
          salary: 15000,
          socialInsurance: 1200,
          housingFund: 800,
          specialDeductions: {
            childEducation: { count: 2 },
            housingLoanInterest: { amount: 1000 },
            elderCare: { amount: 2000 }
          }
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('应该支持并发请求', async () => {
      const requests = Array(10).fill().map((_, i) => 
        request(app)
          .post('/api/tax')
          .send({
            salary: 10000 + i * 1000,
            socialInsurance: 800,
            housingFund: 500
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