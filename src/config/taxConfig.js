/**
 * 个人所得税配置文件
 * 支持配置化管理税率、起征点和专项扣除项目
 */

// 2024年个人所得税税率表（综合所得适用）
const TAX_BRACKETS_2024 = [
  { min: 0, max: 36000, rate: 0.03, quickDeduction: 0 },
  { min: 36000, max: 144000, rate: 0.10, quickDeduction: 2520 },
  { min: 144000, max: 300000, rate: 0.20, quickDeduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduction: 31920 },
  { min: 420000, max: 660000, rate: 0.30, quickDeduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, quickDeduction: 181920 }
];

// 月度税率表（工资薪金适用）
const MONTHLY_TAX_BRACKETS_2024 = [
  { min: 0, max: 3000, rate: 0.03, quickDeduction: 0 },
  { min: 3000, max: 12000, rate: 0.10, quickDeduction: 210 },
  { min: 12000, max: 25000, rate: 0.20, quickDeduction: 1410 },
  { min: 25000, max: 35000, rate: 0.25, quickDeduction: 2660 },
  { min: 35000, max: 55000, rate: 0.30, quickDeduction: 4410 },
  { min: 55000, max: 80000, rate: 0.35, quickDeduction: 7160 },
  { min: 80000, max: Infinity, rate: 0.45, quickDeduction: 15160 }
];

// 基本减除费用（起征点）
const BASIC_DEDUCTION = {
  2024: 5000, // 每月5000元
  2023: 5000,
  2022: 5000,
  2021: 5000,
  2020: 5000,
  2019: 5000,
  2018: 5000 // 2018年10月1日起调整为5000元
};

// 专项扣除项目配置
const SPECIAL_DEDUCTIONS = {
  // 子女教育
  childEducation: {
    name: '子女教育',
    maxAmount: 1000, // 每个子女每月1000元
    description: '纳税人的子女接受全日制学历教育的相关支出',
    conditions: ['子女年满3岁至博士研究生毕业']
  },
  
  // 继续教育
  continuingEducation: {
    name: '继续教育',
    maxAmount: 400, // 学历教育每月400元，职业资格继续教育每年3600元
    description: '纳税人在中国境内接受学历（学位）继续教育的支出',
    conditions: ['学历教育期间', '取得相关职业资格证书的年度']
  },
  
  // 大病医疗
  medicalExpenses: {
    name: '大病医疗',
    maxAmount: 80000, // 每年最高80000元
    minAmount: 15000, // 超过15000元的部分
    description: '纳税人在一个纳税年度内发生的医药费用支出',
    conditions: ['超过15000元的部分', '最高不超过80000元']
  },
  
  // 住房贷款利息
  housingLoanInterest: {
    name: '住房贷款利息',
    maxAmount: 1000, // 每月1000元
    description: '纳税人本人或配偶购买中国境内住房发生的首套住房贷款利息支出',
    conditions: ['首套住房贷款', '最长不超过240个月']
  },
  
  // 住房租金
  housingRent: {
    name: '住房租金',
    amounts: {
      tier1: 1500, // 直辖市、省会城市、计划单列市
      tier2: 1100, // 市辖区户籍人口超过100万的城市
      tier3: 800   // 其他城市
    },
    description: '纳税人在主要工作城市没有自有住房而发生的住房租金支出',
    conditions: ['在主要工作城市没有自有住房', '与住房贷款利息不能同时扣除']
  },
  
  // 赡养老人
  elderCare: {
    name: '赡养老人',
    maxAmount: 2000, // 每月2000元
    description: '纳税人赡养一位及以上被赡养人的赡养支出',
    conditions: ['被赡养人年满60岁', '独生子女按每月2000元扣除', '非独生子女与兄弟姐妹分摊每月2000元']
  },
  
  // 3岁以下婴幼儿照护
  infantCare: {
    name: '3岁以下婴幼儿照护',
    maxAmount: 1000, // 每个婴幼儿每月1000元
    description: '纳税人照护3岁以下婴幼儿子女的相关支出',
    conditions: ['从婴幼儿出生的当月至满3周岁的前一个月']
  }
};

// 社保和公积金扣除限额（各地可能不同，这里提供参考值）
const SOCIAL_INSURANCE_LIMITS = {
  // 以北京为例的2024年标准
  beijing: {
    pensionInsurance: { rate: 0.08, maxBase: 33891, minBase: 5869 },
    medicalInsurance: { rate: 0.02, maxBase: 33891, minBase: 5869 },
    unemploymentInsurance: { rate: 0.005, maxBase: 33891, minBase: 5869 },
    housingFund: { rate: 0.12, maxBase: 33891, minBase: 2420 }
  },
  
  // 全国通用参考标准
  national: {
    pensionInsurance: { rate: 0.08, maxBase: 30000, minBase: 3000 },
    medicalInsurance: { rate: 0.02, maxBase: 30000, minBase: 3000 },
    unemploymentInsurance: { rate: 0.005, maxBase: 30000, minBase: 3000 },
    housingFund: { rate: 0.12, maxBase: 30000, minBase: 2000 }
  }
};

// 年终奖计税方式
const BONUS_TAX_METHODS = {
  // 单独计税（2021年12月31日前可选择）
  separate: {
    name: '单独计税',
    description: '年终奖除以12个月，按对应税率计算',
    available: true
  },
  
  // 并入综合所得计税
  combined: {
    name: '并入综合所得',
    description: '年终奖并入当年综合所得一并计算纳税',
    available: true
  }
};

module.exports = {
  TAX_BRACKETS_2024,
  MONTHLY_TAX_BRACKETS_2024,
  BASIC_DEDUCTION,
  SPECIAL_DEDUCTIONS,
  SOCIAL_INSURANCE_LIMITS,
  BONUS_TAX_METHODS,
  
  // 获取指定年份的基本减除费用
  getBasicDeduction: (year = new Date().getFullYear()) => {
    return BASIC_DEDUCTION[year] || BASIC_DEDUCTION[2024];
  },
  
  // 获取月度税率表
  getMonthlyTaxBrackets: () => {
    return MONTHLY_TAX_BRACKETS_2024;
  },
  
  // 获取年度税率表
  getAnnualTaxBrackets: () => {
    return TAX_BRACKETS_2024;
  },
  
  // 获取专项扣除配置
  getSpecialDeductions: () => {
    return SPECIAL_DEDUCTIONS;
  },
  
  // 获取社保公积金限额
  getSocialInsuranceLimits: (city = 'national') => {
    return SOCIAL_INSURANCE_LIMITS[city] || SOCIAL_INSURANCE_LIMITS.national;
  }
};