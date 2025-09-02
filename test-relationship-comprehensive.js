/**
 * 全面测试称呼计算API
 */

const http = require('http');

// 测试用例
const testCases = [
    {
        name: '父亲的父亲',
        data: { path: ['父亲', '父亲'], gender: 'male', region: 'standard' },
        expected: '爷爷'
    },
    {
        name: '母亲的父亲',
        data: { path: ['母亲', '父亲'], gender: 'male', region: 'standard' },
        expected: '外公'
    },
    {
        name: '哥哥的儿子',
        data: { path: ['哥哥', '儿子'], gender: 'male', region: 'standard' },
        expected: '侄子'
    },
    {
        name: '北方称呼 - 母亲的父亲',
        data: { path: ['母亲', '父亲'], gender: 'male', region: 'northern' },
        expected: '姥爷'
    }
];

async function makeRequest(path, method = 'POST', data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : '';
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    reject(new Error(`解析响应失败: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 开始全面测试称呼计算API...\n');

    // 测试1: 关系计算
    console.log('📋 测试关系计算:');
    for (const testCase of testCases) {
        try {
            const response = await makeRequest('/api/relationship/calculate', 'POST', testCase.data);
            
            if (response.data.success && response.data.data.success) {
                const result = response.data.data.result;
                const success = result === testCase.expected;
                console.log(`${success ? '✅' : '❌'} ${testCase.name}: ${result} ${success ? '' : `(期望: ${testCase.expected})`}`);
            } else {
                console.log(`❌ ${testCase.name}: 计算失败 - ${response.data.data ? response.data.data.error : '未知错误'}`);
            }
        } catch (error) {
            console.log(`❌ ${testCase.name}: 请求失败 - ${error.message}`);
        }
    }

    console.log('\n📋 测试反向查询:');
    // 测试2: 反向查询
    try {
        const response = await makeRequest('/api/relationship/reverse', 'POST', {
            targetRelation: '爷爷',
            region: 'standard'
        });
        
        if (response.data.success) {
            const paths = response.data.data.possiblePaths;
            console.log(`✅ 反向查询 "爷爷": 找到 ${paths.length} 种路径`);
            paths.forEach(path => {
                console.log(`   - ${path.join(' → ')}`);
            });
        } else {
            console.log('❌ 反向查询失败');
        }
    } catch (error) {
        console.log(`❌ 反向查询请求失败: ${error.message}`);
    }

    console.log('\n📋 测试获取支持的关系:');
    // 测试3: 获取支持的关系
    try {
        const response = await makeRequest('/api/relationship/relations', 'GET');
        
        if (response.data.success) {
            const relations = response.data.data.relations;
            console.log(`✅ 获取关系列表: ${relations.length} 个关系`);
            console.log(`   前10个: ${relations.slice(0, 10).join(', ')}`);
        } else {
            console.log('❌ 获取关系列表失败');
        }
    } catch (error) {
        console.log(`❌ 获取关系列表请求失败: ${error.message}`);
    }

    console.log('\n📋 测试获取支持的地区:');
    // 测试4: 获取支持的地区
    try {
        const response = await makeRequest('/api/relationship/regions', 'GET');
        
        if (response.data.success) {
            const regions = response.data.data.regions;
            console.log(`✅ 获取地区列表: ${regions.length} 个地区`);
            regions.forEach(region => {
                console.log(`   - ${region.key}: ${region.name}`);
            });
        } else {
            console.log('❌ 获取地区列表失败');
        }
    } catch (error) {
        console.log(`❌ 获取地区列表请求失败: ${error.message}`);
    }

    console.log('\n🎉 测试完成！');
}

runTests().catch(error => {
    console.error('❌ 测试运行失败:', error);
});