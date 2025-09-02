/**
 * 个税计算器测试
 */

const TaxCalculator = require('../src/utils/taxCalculator');
const taxConfig = require('../src/config/taxConfig');

describe('TaxCalculator', () => {
  describe('calculateMonthlySalaryTax', () => {
    test('应该正确计算基础月度工资个税', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: 10000,
        socialInsurance: 800,
        housingFund: 500,
        specialDeductions: {}
      });

      expect(result.grossSalary).toBe(10000);
      expect(result.taxableIncome).toBe(3700); // 10000 - 5000 - 800 - 500
      expect(result.tax).toBe(160); // 3700 * 0.1 - 210 = 370 - 210 = 160 (3700在3000-12000档)
      expect(result.afterTaxIncome).toBe(8540); // 10000 - 160 - 800 - 500
      expect(result.effectiveTaxRate).toBe(1.6); // 160/10000 * 100
      expect(result.marginalTaxRate).toBe(10); // 10%档
    });

    test('应该正确处理专项扣除', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: 15000,
        socialInsurance: 1200,
        housingFund: 800,
        specialDeductions: {
          childEducation: { count: 1, amount: 1000 },
          housingLoanInterest: { amount: 1000 },
          elderCare: { amount: 2000 }
        }
      });

      expect(result.deductions.specialDeductions.total).toBe(4000);
      expect(result.taxableIncome).toBe(4000); // 15000 - 5000 - 1200 - 800 - 4000
      expect(result.tax).toBe(190); // 4000 * 0.1 - 210 = 400 - 210 = 190 (4000在3000-12000档)
    });

    test('应该正确处理零税收情况', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: 5000,
        socialInsurance: 400,
        housingFund: 300,
        specialDeductions: {}
      });

      expect(result.taxableIncome).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
      expect(result.marginalTaxRate).toBe(0);
    });

    test('应该正确计算高收入税收', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: 100000,
        socialInsurance: 3000,
        housingFund: 2000,
        specialDeductions: {}
      });

      expect(result.taxableIncome).toBe(90000);
      expect(result.tax).toBe(25340); // 90000 * 0.45 - 15160 = 40500 - 15160 = 25340
      expect(result.marginalTaxRate).toBe(45);
    });
  });

  describe('calculateAnnualTax', () => {
    test('应该正确计算年度综合所得税（并入计税）', () => {
      const result = TaxCalculator.calculateAnnualTax({
        annualSalary: 120000,
        annualBonus: 24000,
        otherIncome: 0,
        annualSocialInsurance: 9600,
        annualHousingFund: 6000,
        specialDeductions: {
          childEducation: { count: 1 }
        },
        bonusTaxMethod: 'combined'
      });

      expect(result.grossIncome).toBe(144000);
      expect(result.deductions.basicDeduction).toBe(60000); // 5000 * 12
      expect(result.deductions.specialDeductions.total).toBe(12000); // 1000 * 12
      expect(result.taxableIncome).toBe(56400); // 144000 - 60000 - 9600 - 6000 - 12000
      expect(result.taxDetails.method).toBe('combined');
    });

    test('应该正确计算年终奖单独计税', () => {
      const result = TaxCalculator.calculateAnnualTax({
        annualSalary: 120000,
        annualBonus: 24000,
        otherIncome: 0,
        annualSocialInsurance: 9600,
        annualHousingFund: 6000,
        specialDeductions: {},
        bonusTaxMethod: 'separate'
      });

      expect(result.taxDetails.method).toBe('separate');
      expect(result.taxDetails.salaryTax).toBeGreaterThan(0);
      expect(result.taxDetails.bonusTax).toBeGreaterThan(0);
    });
  });

  describe('calculateSpecialDeductions', () => {
    test('应该正确计算子女教育扣除', () => {
      const result = TaxCalculator.calculateSpecialDeductions({
        childEducation: { count: 2 }
      });

      expect(result.items.childEducation.amount).toBe(2000); // 2 * 1000
      expect(result.total).toBe(2000);
    });

    test('应该正确计算住房租金扣除（不同城市）', () => {
      const tier1Result = TaxCalculator.calculateSpecialDeductions({
        housingRent: { amount: 2000, cityTier: 'tier1' }
      });

      const tier3Result = TaxCalculator.calculateSpecialDeductions({
        housingRent: { amount: 2000, cityTier: 'tier3' }
      });

      expect(tier1Result.items.housingRent.amount).toBe(1500); // 限额1500
      expect(tier3Result.items.housingRent.amount).toBe(800);  // 限额800
    });

    test('应该正确计算年度大病医疗扣除', () => {
      const result = TaxCalculator.calculateSpecialDeductions({
        medicalExpenses: { amount: 50000 }
      }, true);

      expect(result.items.medicalExpenses.amount).toBe(35000); // 50000 - 15000
    });

    test('应该限制大病医疗扣除上限', () => {
      const result = TaxCalculator.calculateSpecialDeductions({
        medicalExpenses: { amount: 120000 }
      }, true);

      expect(result.items.medicalExpenses.amount).toBe(80000); // 最高80000
    });
  });

  describe('calculateSocialInsurance', () => {
    test('应该正确计算社保公积金（全国标准）', () => {
      const result = TaxCalculator.calculateSocialInsurance({
        salary: 10000,
        city: 'national'
      });

      expect(result.items.pensionInsurance.rate).toBe(8); // 8%
      expect(result.items.pensionInsurance.amount).toBe(800); // 10000 * 0.08
      expect(result.items.housingFund.rate).toBe(12); // 12%
      expect(result.items.housingFund.amount).toBe(1200); // 10000 * 0.12
      expect(result.total).toBeGreaterThan(0);
    });

    test('应该正确处理缴费基数上下限', () => {
      // 测试低于最低基数
      const lowResult = TaxCalculator.calculateSocialInsurance({
        salary: 2000,
        city: 'national'
      });

      expect(lowResult.items.pensionInsurance.base).toBe(3000); // 使用最低基数

      // 测试高于最高基数
      const highResult = TaxCalculator.calculateSocialInsurance({
        salary: 50000,
        city: 'national'
      });

      expect(highResult.items.pensionInsurance.base).toBe(30000); // 使用最高基数
    });

    test('应该支持自定义缴费比例', () => {
      const result = TaxCalculator.calculateSocialInsurance({
        salary: 10000,
        city: 'national',
        customRates: {
          housingFund: 0.15 // 自定义15%
        }
      });

      expect(result.items.housingFund.rate).toBe(15);
      expect(result.items.housingFund.amount).toBe(1500);
    });
  });

  describe('calculateBonusTaxSeparate', () => {
    test('应该正确计算年终奖单独计税', () => {
      const tax1 = TaxCalculator.calculateBonusTaxSeparate(12000);
      expect(tax1).toBe(360); // 12000 * 0.03

      const tax2 = TaxCalculator.calculateBonusTaxSeparate(60000);
      expect(tax2).toBe(5790); // 60000 * 0.1 - 210

      const tax3 = TaxCalculator.calculateBonusTaxSeparate(300000);
      expect(tax3).toBe(58590); // 300000 * 0.2 - 1410
    });

    test('应该正确处理零年终奖', () => {
      const tax = TaxCalculator.calculateBonusTaxSeparate(0);
      expect(tax).toBe(0);
    });
  });

  describe('getMarginalTaxRate', () => {
    test('应该正确返回边际税率', () => {
      const brackets = taxConfig.getMonthlyTaxBrackets();
      
      expect(TaxCalculator.getMarginalTaxRate(1000, brackets)).toBe(3);
      expect(TaxCalculator.getMarginalTaxRate(5000, brackets)).toBe(10);
      expect(TaxCalculator.getMarginalTaxRate(20000, brackets)).toBe(20);
      expect(TaxCalculator.getMarginalTaxRate(100000, brackets)).toBe(45);
    });

    test('应该正确处理零收入', () => {
      const brackets = taxConfig.getMonthlyTaxBrackets();
      expect(TaxCalculator.getMarginalTaxRate(0, brackets)).toBe(0);
    });
  });

  describe('getTaxOptimizationSuggestions', () => {
    test('应该为低专项扣除提供建议', () => {
      const taxResult = {
        deductions: {
          specialDeductions: { total: 500 }
        },
        effectiveTaxRate: 5,
        marginalTaxRate: 10
      };

      const suggestions = TaxCalculator.getTaxOptimizationSuggestions(taxResult);
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].type).toBe('specialDeductions');
      expect(suggestions[0].priority).toBe('high');
    });

    test('应该为高边际税率提供年终奖优化建议', () => {
      const taxResult = {
        deductions: {
          specialDeductions: { total: 3000 }
        },
        effectiveTaxRate: 15,
        marginalTaxRate: 25
      };

      const suggestions = TaxCalculator.getTaxOptimizationSuggestions(taxResult);
      
      const bonusSuggestion = suggestions.find(s => s.type === 'bonusMethod');
      expect(bonusSuggestion).toBeDefined();
      expect(bonusSuggestion.priority).toBe('medium');
    });
  });

  describe('边界情况测试', () => {
    test('应该正确处理负数输入', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: -1000,
        socialInsurance: 0,
        housingFund: 0,
        specialDeductions: {}
      });

      expect(result.taxableIncome).toBe(0);
      expect(result.tax).toBe(0);
    });

    test('应该正确处理极大数值', () => {
      const result = TaxCalculator.calculateMonthlySalaryTax({
        salary: 1000000,
        socialInsurance: 10000,
        housingFund: 5000,
        specialDeductions: {}
      });

      expect(result.tax).toBeGreaterThan(0);
      expect(result.marginalTaxRate).toBe(45);
    });

    test('应该正确处理空的专项扣除', () => {
      const result = TaxCalculator.calculateSpecialDeductions({});
      
      expect(result.total).toBe(0);
      expect(Object.keys(result.items)).toHaveLength(0);
    });
  });
});