/**
 * 自定义计算器生成器测试
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testCalculator = {
    id: Date.now(),
    name: '圆面积计算器',
    description: '计算圆的面积和周长',
    formula: [
        { type: 'constant', value: 'π', display: 'π', latex: '\\pi' },
        { type: 'operator', value: '×', display: '×', latex: '\\times' },
        { type: 'variable', value: 'radius', display: 'radius', latex: 'radius' },
        { type: 'operator', value: 'x²', display: 'x²', latex: '^2' }
    ],
    inputFields: [
        {
            id: 1,
            name: 'radius',
            label: '半径',
            type: 'number',
            required: true,
            placeholder: '请输入圆的半径',
            defaultValue: '',
            min: '0',
            max: '',
            step: '0.1'
        }
    ],
    template: 'default',
    styles: {
        theme: 'default',
        primaryColor: '#007bff',
        backgroundColor: '#ffffff',
        textColor: '#333333'
    }
};

const testValues = {
    radius: 5
};

async function testCustomCalculatorAPI() {
    console.log('开始测试自定义计算器API...\n');

    try {
        // 测试保存自定义计算器
        console.log('1. 测试保存自定义计算器');
        const saveResponse = await axios.post(`${BASE_URL}/api/formula/save-calculator`, {
            calculator: testCalculator
        });
        console.log('保存结果:', saveResponse.data);
        console.log('✓ 保存测试通过\n');

        // 测试执行自定义计算器
        console.log('2. 测试执行自定义计算器');
        const executeResponse = await axios.post(`${BASE_URL}/api/formula/execute-custom`, {
            formula: testCalculator.formula,
            values: testValues
        });
        console.log('计算结果:', executeResponse.data);
        console.log('✓ 执行测试通过\n');

        // 测试公式验证
        console.log('3. 测试公式验证');
        const validateResponse = await axios.post(`${BASE_URL}/api/formula/validate`, {
            formula: testCalculator.formula
        });
        console.log('验证结果:', validateResponse.data);
        console.log('✓ 验证测试通过\n');

        // 测试获取支持的函数
        console.log('4. 测试获取支持的函数');
        const functionsResponse = await axios.get(`${BASE_URL}/api/formula/functions`);
        console.log('支持的函数:', Object.keys(functionsResponse.data.data));
        console.log('✓ 函数列表测试通过\n');

        console.log('🎉 所有测试通过！');

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            console.log('\n💡 提示: 请确保服务器正在运行 (npm start)');
        }
    }
}

async function testErrorCases() {
    console.log('\n开始测试错误情况...\n');

    try {
        // 测试无效的计算器配置
        console.log('1. 测试无效的计算器配置');
        try {
            await axios.post(`${BASE_URL}/api/formula/save-calculator`, {
                calculator: {
                    name: '', // 空名称
                    inputFields: [], // 空字段
                    formula: [] // 空公式
                }
            });
        } catch (error) {
            console.log('预期错误:', error.response.data.message);
            console.log('✓ 无效配置测试通过\n');
        }

        // 测试无效的公式执行
        console.log('2. 测试无效的公式执行');
        try {
            await axios.post(`${BASE_URL}/api/formula/execute-custom`, {
                formula: [], // 空公式
                values: {}
            });
        } catch (error) {
            console.log('预期错误:', error.response.data.message);
            console.log('✓ 无效执行测试通过\n');
        }

        // 测试除零错误
        console.log('3. 测试除零错误');
        try {
            const divideByZeroFormula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '÷', display: '÷', latex: '\\div' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];
            
            await axios.post(`${BASE_URL}/api/formula/execute-custom`, {
                formula: divideByZeroFormula,
                values: { x: 10, y: 0 }
            });
        } catch (error) {
            console.log('预期错误:', error.response.data.message);
            console.log('✓ 除零错误测试通过\n');
        }

        console.log('🎉 错误情况测试完成！');

    } catch (error) {
        console.error('❌ 错误测试失败:', error.message);
    }
}

async function testComplexFormulas() {
    console.log('\n开始测试复杂公式...\n');

    const complexFormulas = [
        {
            name: '二次方程求解',
            formula: [
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'operator', value: '−', display: '−', latex: '-' },
                { type: 'variable', value: 'b', display: 'b', latex: 'b' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'function', name: 'sqrt', display: 'sqrt', latex: '\\sqrt{}' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'b', display: 'b', latex: 'b' },
                { type: 'operator', value: 'x²', display: 'x²', latex: '^2' },
                { type: 'operator', value: '−', display: '−', latex: '-' },
                { type: 'variable', value: 'a', display: 'a', latex: 'a' },
                { type: 'operator', value: '×', display: '×', latex: '\\times' },
                { type: 'variable', value: 'c', display: 'c', latex: 'c' },
                { type: 'operator', value: '×', display: '×', latex: '\\times' },
                { type: 'variable', value: 'four', display: '4', latex: '4' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: '÷', display: '÷', latex: '\\div' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'two', display: '2', latex: '2' },
                { type: 'operator', value: '×', display: '×', latex: '\\times' },
                { type: 'variable', value: 'a', display: 'a', latex: 'a' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ],
            values: { a: 1, b: -5, c: 6, four: 4, two: 2 }
        },
        {
            name: '三角函数计算',
            formula: [
                { type: 'function', name: 'sin', display: 'sin', latex: '\\sin' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'angle', display: 'angle', latex: 'angle' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'function', name: 'cos', display: 'cos', latex: '\\cos' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'angle', display: 'angle', latex: 'angle' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ],
            values: { angle: Math.PI / 4 } // 45度
        }
    ];

    for (const test of complexFormulas) {
        try {
            console.log(`测试: ${test.name}`);
            const response = await axios.post(`${BASE_URL}/api/formula/execute-custom`, {
                formula: test.formula,
                values: test.values
            });
            console.log(`结果: ${response.data.data.result}`);
            console.log('✓ 通过\n');
        } catch (error) {
            console.error(`❌ ${test.name} 失败:`, error.response?.data?.message || error.message);
        }
    }
}

// 运行所有测试
async function runAllTests() {
    await testCustomCalculatorAPI();
    await testErrorCases();
    await testComplexFormulas();
}

// 如果直接运行此文件
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testCustomCalculatorAPI,
    testErrorCases,
    testComplexFormulas,
    runAllTests
};