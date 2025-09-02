// 简单的API测试脚本
const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 开始API测试...\n');

  try {
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const health = await testEndpoint('/health');
    console.log(`   状态: ${health.status}`);
    console.log(`   响应: ${JSON.stringify(health.data, null, 2)}\n`);

    // 测试API信息
    console.log('2. 测试API信息...');
    const info = await testEndpoint('/info');
    console.log(`   状态: ${info.status}`);
    console.log(`   响应: ${JSON.stringify(info.data, null, 2)}\n`);

    // 测试个税计算
    console.log('3. 测试个税计算...');
    const tax = await testEndpoint('/tax', 'POST', {
      salary: 10000,
      socialInsurance: 800,
      housingFund: 500,
      specialDeduction: 1000
    });
    console.log(`   状态: ${tax.status}`);
    console.log(`   响应: ${JSON.stringify(tax.data, null, 2)}\n`);

    // 测试BMI计算
    console.log('4. 测试BMI计算...');
    const bmi = await testEndpoint('/bmi', 'POST', {
      weight: 70,
      height: 175
    });
    console.log(`   状态: ${bmi.status}`);
    console.log(`   响应: ${JSON.stringify(bmi.data, null, 2)}\n`);

    // 测试数字转换
    console.log('5. 测试数字转换...');
    const numberConvert = await testEndpoint('/convert/number', 'POST', {
      number: 12345,
      type: 'chinese'
    });
    console.log(`   状态: ${numberConvert.status}`);
    console.log(`   响应: ${JSON.stringify(numberConvert.data, null, 2)}\n`);

    console.log('✅ 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
runTests();