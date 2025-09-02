/**
 * 自定义计算器集成测试
 */

const request = require('supertest');
const app = require('../src/app');

describe('自定义计算器 API', () => {
    // 测试数据
    const testCalculator = {
        id: Date.now(),
        name: '圆面积计算器',
        description: '计算圆的面积',
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
                min: '0',
                step: '0.1'
            }
        ],
        template: 'default',
        styles: {
            primaryColor: '#007bff',
            backgroundColor: '#ffffff',
            textColor: '#333333'
        }
    };

    describe('POST /api/formula/save-calculator', () => {
        test('应该成功保存有效的计算器配置', async () => {
            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: testCalculator })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.message).toBe('计算器保存成功');
            expect(response.body.data.calculator.name).toBe(testCalculator.name);
        });

        test('应该拒绝无效的计算器配置', async () => {
            const invalidCalculator = {
                name: 'Test Calculator', // 有名称但其他配置无效
                inputFields: [], // 空字段
                formula: [] // 空公式
            };

            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: invalidCalculator })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('计算器配置错误');
            expect(response.body.error.details).toBeInstanceOf(Array);
            expect(response.body.error.details.length).toBeGreaterThan(0);
        });

        test('应该拒绝缺少必要字段的计算器', async () => {
            const incompleteCalculator = {
                name: '测试计算器'
                // 缺少 inputFields 和 formula
            };

            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: incompleteCalculator })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/formula/execute-custom', () => {
        test('应该成功执行简单的数学计算', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];
            const values = { x: 5, y: 3 };

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe(8);
        });

        test('应该成功执行圆面积计算', async () => {
            const formula = [
                { type: 'constant', value: 'π', display: 'π', latex: '\\pi' },
                { type: 'operator', value: '×', display: '×', latex: '\\times' },
                { type: 'variable', value: 'radius', display: 'radius', latex: 'radius' },
                { type: 'operator', value: 'x²', display: 'x²', latex: '^2' }
            ];
            const values = { radius: 5 };

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBeCloseTo(78.54, 1); // π * 5² ≈ 78.54
        });

        test('应该成功执行科学函数计算', async () => {
            const formula = [
                { type: 'function', name: 'sin', display: 'sin', latex: '\\sin' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'angle', display: 'angle', latex: 'angle' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ];
            const values = { angle: Math.PI / 2 }; // 90度

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBeCloseTo(1, 5); // sin(π/2) = 1
        });

        test('应该拒绝空公式', async () => {
            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula: [], values: {} })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('公式数据格式无效');
        });

        test('应该拒绝无效的输入值格式', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' }
            ];

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values: null })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('输入值格式无效');
        });

        test('应该处理除零错误', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '÷', display: '÷', latex: '\\div' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];
            const values = { x: 10, y: 0 };

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('计算失败');
        });
    });

    describe('GET /api/formula/functions', () => {
        test('应该返回支持的函数列表', async () => {
            const response = await request(app)
                .get('/api/formula/functions')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('trigonometric');
            expect(response.body.data).toHaveProperty('logarithmic');
            expect(response.body.data).toHaveProperty('algebraic');
            expect(response.body.data).toHaveProperty('rounding');
            expect(response.body.data).toHaveProperty('comparison');

            // 检查三角函数
            expect(response.body.data.trigonometric).toBeInstanceOf(Array);
            expect(response.body.data.trigonometric.length).toBeGreaterThan(0);
            
            const sinFunction = response.body.data.trigonometric.find(f => f.name === 'sin');
            expect(sinFunction).toBeDefined();
            expect(sinFunction.description).toBe('正弦函数');
            expect(sinFunction.args).toBe(1);
        });
    });

    describe('复杂公式测试', () => {
        test('应该处理带括号的复杂表达式', async () => {
            const formula = [
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'a', display: 'a', latex: 'a' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'b', display: 'b', latex: 'b' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: '×', display: '×', latex: '\\times' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'c', display: 'c', latex: 'c' },
                { type: 'operator', value: '−', display: '−', latex: '-' },
                { type: 'variable', value: 'd', display: 'd', latex: 'd' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ];
            const values = { a: 2, b: 3, c: 4, d: 1 };

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe(15); // (2+3) * (4-1) = 5 * 3 = 15
        });

        test('应该处理嵌套函数调用', async () => {
            const formula = [
                { type: 'function', name: 'sqrt', display: 'sqrt', latex: '\\sqrt{}' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'function', name: 'pow', display: 'pow', latex: '{}^{}' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: ',', display: ',', latex: ',' },
                { type: 'variable', value: 'two', display: '2', latex: '2' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'function', name: 'pow', display: 'pow', latex: '{}^{}' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' },
                { type: 'operator', value: ',', display: ',', latex: ',' },
                { type: 'variable', value: 'two', display: '2', latex: '2' },
                { type: 'operator', value: ')', display: ')', latex: ')' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ];
            const values = { x: 3, y: 4, two: 2 };

            const response = await request(app)
                .post('/api/formula/execute-custom')
                .send({ formula, values })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe(5); // sqrt(3² + 4²) = sqrt(9 + 16) = sqrt(25) = 5
        });
    });

    describe('输入字段验证测试', () => {
        test('应该验证选择类型字段必须有选项', async () => {
            const invalidCalculator = {
                name: '测试计算器',
                inputFields: [
                    {
                        name: 'choice',
                        label: '选择',
                        type: 'select',
                        options: [] // 空选项
                    }
                ],
                formula: [
                    { type: 'variable', value: 'choice', display: 'choice', latex: 'choice' }
                ]
            };

            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: invalidCalculator })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toContain('字段 1: 选择类型字段必须配置选项');
        });

        test('应该验证字段名称和标签不能为空', async () => {
            const invalidCalculator = {
                name: '测试计算器',
                inputFields: [
                    {
                        name: '', // 空名称
                        label: '', // 空标签
                        type: 'number'
                    }
                ],
                formula: [
                    { type: 'variable', value: 'x', display: 'x', latex: 'x' }
                ]
            };

            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: invalidCalculator })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.details).toContain('字段 1: 字段名称不能为空');
            expect(response.body.error.details).toContain('字段 1: 显示标签不能为空');
        });
    });

    describe('计算器管理功能', () => {
        let savedCalculatorId;

        beforeEach(async () => {
            // 保存一个测试计算器
            const response = await request(app)
                .post('/api/formula/save-calculator')
                .send({ calculator: testCalculator });
            
            savedCalculatorId = response.body.data.id;
        });

        describe('GET /api/formula/calculators', () => {
            test('应该返回所有保存的计算器', async () => {
                const response = await request(app)
                    .get('/api/formula/calculators')
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeInstanceOf(Array);
                expect(response.body.data.length).toBeGreaterThan(0);
                
                const calculator = response.body.data.find(c => c.id === savedCalculatorId);
                expect(calculator).toBeDefined();
                expect(calculator.name).toBe(testCalculator.name);
            });
        });

        describe('GET /api/formula/calculator/:id', () => {
            test('应该返回指定的计算器', async () => {
                const response = await request(app)
                    .get(`/api/formula/calculator/${savedCalculatorId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBe(savedCalculatorId);
                expect(response.body.data.name).toBe(testCalculator.name);
                expect(response.body.data.inputFields).toHaveLength(1);
            });

            test('应该返回404当计算器不存在时', async () => {
                const response = await request(app)
                    .get('/api/formula/calculator/nonexistent')
                    .expect(404);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('计算器不存在');
            });
        });

        describe('PUT /api/formula/calculator/:id', () => {
            test('应该成功更新计算器', async () => {
                const updatedCalculator = {
                    ...testCalculator,
                    name: '更新后的圆面积计算器',
                    description: '更新后的描述'
                };

                const response = await request(app)
                    .put(`/api/formula/calculator/${savedCalculatorId}`)
                    .send({ calculator: updatedCalculator })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.calculator.name).toBe('更新后的圆面积计算器');
                expect(response.body.data.calculator.description).toBe('更新后的描述');
                expect(response.body.data.calculator.updated).toBeDefined();
            });

            test('应该拒绝无效的更新数据', async () => {
                const invalidUpdate = {
                    name: 'Test Calculator', // 有名称但其他配置无效
                    inputFields: [],
                    formula: []
                };

                const response = await request(app)
                    .put(`/api/formula/calculator/${savedCalculatorId}`)
                    .send({ calculator: invalidUpdate })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('计算器配置错误');
            });
        });

        describe('DELETE /api/formula/calculator/:id', () => {
            test('应该成功删除计算器', async () => {
                const response = await request(app)
                    .delete(`/api/formula/calculator/${savedCalculatorId}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.message).toBe('计算器删除成功');

                // 验证计算器已被删除
                await request(app)
                    .get(`/api/formula/calculator/${savedCalculatorId}`)
                    .expect(404);
            });

            test('应该返回404当删除不存在的计算器时', async () => {
                const response = await request(app)
                    .delete('/api/formula/calculator/nonexistent')
                    .expect(404);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('计算器不存在');
            });
        });

        describe('POST /api/formula/calculator/:id/copy', () => {
            test('应该成功复制计算器', async () => {
                const response = await request(app)
                    .post(`/api/formula/calculator/${savedCalculatorId}/copy`)
                    .send({ name: '复制的圆面积计算器' })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.calculator.name).toBe('复制的圆面积计算器');
                expect(response.body.data.calculator.id).not.toBe(savedCalculatorId);
                expect(response.body.data.calculator.formula).toEqual(testCalculator.formula);
                expect(response.body.data.calculator.inputFields).toEqual(testCalculator.inputFields);
            });

            test('应该使用默认名称当未提供名称时', async () => {
                const response = await request(app)
                    .post(`/api/formula/calculator/${savedCalculatorId}/copy`)
                    .send({})
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.calculator.name).toBe(`${testCalculator.name} (副本)`);
            });

            test('应该返回404当复制不存在的计算器时', async () => {
                const response = await request(app)
                    .post('/api/formula/calculator/nonexistent/copy')
                    .send({ name: '复制测试' })
                    .expect(404);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('原计算器不存在');
            });
        });

        describe('POST /api/formula/export', () => {
            test('应该成功导出计算器', async () => {
                const response = await request(app)
                    .post('/api/formula/export')
                    .send({ calculatorIds: [savedCalculatorId] })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.version).toBe('1.0');
                expect(response.body.data.exported).toBeDefined();
                expect(response.body.data.calculators).toHaveLength(1);
                expect(response.body.data.calculators[0].name).toBe(testCalculator.name);
            });

            test('应该拒绝无效的计算器ID列表', async () => {
                const response = await request(app)
                    .post('/api/formula/export')
                    .send({ calculatorIds: 'invalid' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('计算器ID列表无效');
            });

            test('应该返回404当没有找到计算器时', async () => {
                const response = await request(app)
                    .post('/api/formula/export')
                    .send({ calculatorIds: ['nonexistent'] })
                    .expect(404);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('没有找到要导出的计算器');
            });
        });

        describe('POST /api/formula/import', () => {
            test('应该成功导入计算器', async () => {
                const importData = {
                    version: '1.0',
                    exported: new Date().toISOString(),
                    calculators: [
                        {
                            ...testCalculator,
                            id: 'import-test-1',
                            name: '导入的计算器1'
                        },
                        {
                            ...testCalculator,
                            id: 'import-test-2',
                            name: '导入的计算器2'
                        }
                    ]
                };

                const response = await request(app)
                    .post('/api/formula/import')
                    .send({ data: importData })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.results.imported).toBe(2);
                expect(response.body.data.results.skipped).toBe(0);
                expect(response.body.data.results.errors).toHaveLength(0);
            });

            test('应该跳过已存在的计算器当不覆盖时', async () => {
                const importData = {
                    version: '1.0',
                    exported: new Date().toISOString(),
                    calculators: [
                        {
                            ...testCalculator,
                            id: savedCalculatorId, // 使用已存在的ID
                            name: '重复的计算器'
                        }
                    ]
                };

                const response = await request(app)
                    .post('/api/formula/import')
                    .send({ data: importData, overwrite: false })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.results.imported).toBe(0);
                expect(response.body.data.results.skipped).toBe(1);
            });

            test('应该覆盖已存在的计算器当设置覆盖时', async () => {
                const importData = {
                    version: '1.0',
                    exported: new Date().toISOString(),
                    calculators: [
                        {
                            ...testCalculator,
                            id: savedCalculatorId,
                            name: '覆盖的计算器'
                        }
                    ]
                };

                const response = await request(app)
                    .post('/api/formula/import')
                    .send({ data: importData, overwrite: true })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.results.imported).toBe(1);
                expect(response.body.data.results.skipped).toBe(0);

                // 验证计算器已被覆盖
                const getResponse = await request(app)
                    .get(`/api/formula/calculator/${savedCalculatorId}`)
                    .expect(200);

                expect(getResponse.body.data.name).toBe('覆盖的计算器');
            });

            test('应该拒绝无效的导入数据格式', async () => {
                const response = await request(app)
                    .post('/api/formula/import')
                    .send({ data: { invalid: 'format' } })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.error.message).toBe('导入数据格式无效');
            });

            test('应该处理包含错误的计算器', async () => {
                const importData = {
                    version: '1.0',
                    exported: new Date().toISOString(),
                    calculators: [
                        {
                            name: '', // 无效：空名称
                            inputFields: [],
                            formula: []
                        },
                        {
                            ...testCalculator,
                            name: '有效的计算器'
                        }
                    ]
                };

                const response = await request(app)
                    .post('/api/formula/import')
                    .send({ data: importData })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.results.imported).toBe(1);
                expect(response.body.data.results.skipped).toBe(1);
                expect(response.body.data.results.errors).toHaveLength(1);
            });
        });
    });
});