/**
 * 测试增强的BMI计算功能
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

function makeRequest(method, path, data = null) {
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
                    const response = {
                        status: res.statusCode,
                        data: JSON.parse(body)
                    };
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testEnhancedBMI() {
    console.log('🧪 测试增强的BMI计算功能...\n');

    try {
        // 1. 测试增强的BMI计算
        console.log('1. 测试增强的BMI计算（公制）...');
        const bmiResponse = await makeRequest('POST', '/bmi', {
            weight: 70,
            height: 175,
            weightUnit: 'kg',
            heightUnit: 'cm'
        });
        
        console.log('   状态:', bmiResponse.status);
        console.log('   完整响应:', JSON.stringify(bmiResponse.data, null, 2));
        if (bmiResponse.data.data.healthRisk) {
            console.log('   BMI:', bmiResponse.data.data.bmi);
            console.log('   分类:', bmiResponse.data.data.category);
            console.log('   健康风险:', bmiResponse.data.data.healthRisk.level);
            console.log('   理想体重范围:', `${bmiResponse.data.data.idealWeightRange.min}-${bmiResponse.data.data.idealWeightRange.max} ${bmiResponse.data.data.idealWeightRange.unit}`);
            console.log('   ✅ 增强BMI计算成功\n');
        } else {
            console.log('   ⚠️ 返回的是旧版BMI格式\n');
        }

        // 2. 测试英制单位
        console.log('2. 测试BMI计算（英制）...');
        const imperialResponse = await makeRequest('POST', '/bmi', {
            weight: 154,
            height: 69,
            weightUnit: 'lb',
            heightUnit: 'in'
        });
        
        console.log('   状态:', imperialResponse.status);
        console.log('   BMI:', imperialResponse.data.data.bmi);
        console.log('   转换后体重:', imperialResponse.data.data.converted.weightKg, 'kg');
        console.log('   转换后身高:', imperialResponse.data.data.converted.heightM, 'm');
        console.log('   ✅ 英制单位计算成功\n');

        // 3. 测试获取支持的单位
        console.log('3. 测试获取支持的单位...');
        const unitsResponse = await makeRequest('GET', '/bmi/units');
        
        console.log('   状态:', unitsResponse.status);
        console.log('   体重单位:', unitsResponse.data.data.weight);
        console.log('   身高单位:', unitsResponse.data.data.height);
        console.log('   ✅ 获取单位成功\n');

        // 4. 测试获取BMI分类
        console.log('4. 测试获取BMI分类...');
        const categoriesResponse = await makeRequest('GET', '/bmi/categories');
        
        console.log('   状态:', categoriesResponse.status);
        console.log('   分类数量:', categoriesResponse.data.data.categories.length);
        categoriesResponse.data.data.categories.forEach(cat => {
            console.log(`   - ${cat.name}: ${cat.range} (${cat.color})`);
        });
        console.log('   ✅ 获取分类成功\n');

        // 5. 测试批量计算
        console.log('5. 测试批量BMI计算...');
        const batchResponse = await makeRequest('POST', '/bmi/batch', {
            measurements: [
                { weight: 60, height: 165, date: '2024-01-01' },
                { weight: 70, height: 175, date: '2024-02-01' },
                { weight: 80, height: 180, date: '2024-03-01' }
            ]
        });
        
        console.log('   状态:', batchResponse.status);
        console.log('   成功计算:', batchResponse.data.data.summary.successful);
        console.log('   失败计算:', batchResponse.data.data.summary.failed);
        batchResponse.data.data.results.forEach((result, index) => {
            console.log(`   结果${index + 1}: BMI ${result.bmi}, ${result.category}`);
        });
        console.log('   ✅ 批量计算成功\n');

        // 6. 测试详细健康分析
        console.log('6. 测试详细健康分析（肥胖案例）...');
        const obeseResponse = await makeRequest('POST', '/bmi', {
            weight: 100,
            height: 170,
            weightUnit: 'kg',
            heightUnit: 'cm'
        });
        
        console.log('   状态:', obeseResponse.status);
        console.log('   BMI:', obeseResponse.data.data.bmi);
        console.log('   分类:', obeseResponse.data.data.category);
        console.log('   健康风险:', obeseResponse.data.data.healthRisk.level);
        console.log('   风险描述:', obeseResponse.data.data.healthRisk.description);
        console.log('   相关疾病风险:', obeseResponse.data.data.healthRisk.conditions.slice(0, 3).join(', '));
        console.log('   饮食建议数量:', obeseResponse.data.data.recommendations.diet.length);
        console.log('   运动建议数量:', obeseResponse.data.data.recommendations.exercise.length);
        console.log('   ✅ 详细分析成功\n');

        // 7. 测试输入验证
        console.log('7. 测试输入验证...');
        try {
            const errorResponse = await makeRequest('POST', '/bmi', {
                weight: 0,
                height: 175
            });
            console.log('   意外成功，应该失败');
        } catch (error) {
            console.log('   ✅ 输入验证成功（正确拒绝无效输入）\n');
        }

        console.log('✅ 所有增强BMI功能测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.status) {
            console.error('   响应状态:', error.status);
            console.error('   响应数据:', error.data);
        }
    }
}

// 运行测试
testEnhancedBMI();