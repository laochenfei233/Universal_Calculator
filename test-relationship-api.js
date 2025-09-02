/**
 * 测试称呼计算API
 */

const http = require('http');

// 测试数据
const testData = {
    path: ['父亲', '父亲'],
    gender: 'male',
    region: 'standard'
};

// 创建POST请求
const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/relationship/calculate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 测试称呼计算API...');
console.log('测试数据:', testData);

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('✅ API响应:', response);
            
            if (response.success && response.data.success) {
                console.log('🎉 测试成功！');
                console.log('计算结果:', response.data.result);
                console.log('解释:', response.data.explanation);
            } else {
                console.log('❌ 计算失败:', response.data ? response.data.error : '未知错误');
            }
        } catch (error) {
            console.error('❌ 解析响应失败:', error);
            console.log('原始响应:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ 请求失败:', error.message);
    console.log('请确保服务器正在运行 (npm start)');
});

req.write(postData);
req.end();