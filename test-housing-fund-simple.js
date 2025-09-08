/**
 * 公积金基数计算器功能测试脚本（简化版，不使用chalk）
 */

const axios = require('axios');

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 测试用例
const testCases = [
  {
    name: '基础公积金缴费计算',
    endpoint: '/housing-fund/calculate',
    method: 'post',
    data: {
      salary: 10000,
      city: 'beijing'
    },
    expectedStatus: 200
  },
  {
    name: '自定义比例公积金缴费计算',
    endpoint: '/housing-fund/calculate',
    method: 'post',
    data: {
      salary: 15000,
      rate: 0.12,
      city: 'national'
    },
    expectedStatus: 200
  },
  {
    name: '公积金基数调整计算',
    endpoint: '/housing-fund/base-adjustment',
    method: 'post',
    data: {
      averageSalary: 10000,
      personalSalary: 12000,
      currentBase: 8000,
      rate: 0.12
    },
    expectedStatus: 200
  },
  {
    name: '公积金贷款额度计算',
    endpoint: '/housing-fund/loan-limit',
    method: 'post',
    data: {
      base: 10000,
      balance: 50000,
      monthlyIncome: 15000,
      years: 30,
      rate: 0.031
    },
    expectedStatus: 200
  },
  {
    name: '公积金租房提取额度计算',
    endpoint: '/housing-fund/withdrawal-limit',
    method: 'post',
    data: {
      balance: 50000,
      monthlyRent: 3000,
      withdrawalType: 'rent'
    },
    expectedStatus: 200
  },
  {
    name: '公积金医疗提取额度计算',
    endpoint: '/housing-fund/withdrawal-limit',
    method: 'post',
    data: {
      balance: 50000,
      withdrawalType: 'medical'
    },
    expectedStatus: 200
  },
  {
    name: '获取公积金配置信息',
    endpoint: '/housing-fund/config',
    method: 'get',
    expectedStatus: 200
  }
];

// 执行测试
async function runTests() {
  console.log('===== 公积金基数计算器功能测试 =====');
  console.log(`API基础URL: ${API_BASE_URL}`);
  console.log('开始测试...\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`测试: ${testCase.name}`);
      
      let response;
      if (testCase.method.toLowerCase() === 'get') {
        response = await axios.get(`${API_BASE_URL}${testCase.endpoint}`);
      } else {
        response = await axios.post(`${API_BASE_URL}${testCase.endpoint}`, testCase.data);
      }

      if (response.status === testCase.expectedStatus) {
        console.log('✓ 状态码正确');
        console.log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);
        passedCount++;
      } else {
        console.log(`✗ 状态码错误: 期望 ${testCase.expectedStatus}, 实际 ${response.status}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`✗ 测试失败: ${error.message}`);
      if (error.response) {
        console.log(`响应状态: ${error.response.status}`);
        console.log(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      failedCount++;
    }
    console.log('-----------------------------------');
  }

  console.log('\n===== 测试结果摘要 =====');
  console.log(`通过: ${passedCount}`);
  console.log(`失败: ${failedCount}`);
  console.log(`总计: ${testCases.length}`);
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行错误:', error);
  process.exit(1);
});