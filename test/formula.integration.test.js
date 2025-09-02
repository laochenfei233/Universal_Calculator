/**
 * 公式编辑器集成测试
 */

const request = require('supertest');
const app = require('../src/app');

describe('公式编辑器 API', () => {
    describe('POST /api/formula/validate', () => {
        it('应该验证有效的公式', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];

            const response = await request(app)
                .post('/api/formula/validate')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(true);
            expect(response.body.data.errors).toHaveLength(0);
        });

        it('应该检测括号不匹配的错误', async () => {
            const formula = [
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
                // 缺少右括号
            ];

            const response = await request(app)
                .post('/api/formula/validate')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(false);
            expect(response.body.data.errors).toContain('括号不匹配：左括号多于右括号');
        });

        it('应该检测连续运算符的错误', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'operator', value: '*', display: '*', latex: '*' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];

            const response = await request(app)
                .post('/api/formula/validate')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(false);
            expect(response.body.data.errors.length).toBeGreaterThan(0);
        });

        it('应该处理空公式', async () => {
            const response = await request(app)
                .post('/api/formula/validate')
                .send({ formula: [] })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.valid).toBe(true);
            expect(response.body.data.errors).toHaveLength(0);
        });

        it('应该拒绝无效的输入格式', async () => {
            const response = await request(app)
                .post('/api/formula/validate')
                .send({ formula: 'invalid' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('公式数据格式无效');
        });
    });

    describe('POST /api/formula/execute', () => {
        it('应该执行简单的数学表达式', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];
            const variables = { x: 5, y: 3 };

            const response = await request(app)
                .post('/api/formula/execute')
                .send({ formula, variables })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBe(8);
        });

        it('应该执行包含函数的表达式', async () => {
            const formula = [
                { type: 'function', value: 'sin', name: 'sin', display: 'sin(x)', latex: '\\sin()' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ];
            const variables = { x: 0 };

            const response = await request(app)
                .post('/api/formula/execute')
                .send({ formula, variables })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBeCloseTo(0, 5);
        });

        it('应该处理数学常数', async () => {
            const formula = [
                { type: 'constant', value: 'π', display: 'π', latex: '\\pi' },
                { type: 'operator', value: '*', display: '*', latex: '*' },
                { type: 'variable', value: 'r', display: 'r', latex: 'r' },
                { type: 'operator', value: '*', display: '*', latex: '*' },
                { type: 'variable', value: 'r', display: 'r', latex: 'r' }
            ];
            const variables = { r: 2 };

            const response = await request(app)
                .post('/api/formula/execute')
                .send({ formula, variables })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.result).toBeCloseTo(Math.PI * 4, 5);
        });

        it('应该拒绝无效的公式', async () => {
            const formula = [
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'x', display: 'x', latex: 'x' }
                // 缺少右括号
            ];
            const variables = { x: 5 };

            const response = await request(app)
                .post('/api/formula/execute')
                .send({ formula, variables })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('应该处理缺少变量的情况', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];
            const variables = { x: 5 }; // 缺少 y

            const response = await request(app)
                .post('/api/formula/execute')
                .send({ formula, variables })
                .expect(500);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/formula/to-javascript', () => {
        it('应该转换简单表达式为JavaScript', async () => {
            const formula = [
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: '+', display: '+', latex: '+' },
                { type: 'variable', value: 'y', display: 'y', latex: 'y' }
            ];

            const response = await request(app)
                .post('/api/formula/to-javascript')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.javascript).toBe('x + y');
        });

        it('应该转换数学函数', async () => {
            const formula = [
                { type: 'function', value: 'sin', name: 'sin', display: 'sin(x)', latex: '\\sin()' },
                { type: 'operator', value: '(', display: '(', latex: '(' },
                { type: 'variable', value: 'x', display: 'x', latex: 'x' },
                { type: 'operator', value: ')', display: ')', latex: ')' }
            ];

            const response = await request(app)
                .post('/api/formula/to-javascript')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.javascript).toBe('Math.sin ( x )');
        });

        it('应该转换数学常数', async () => {
            const formula = [
                { type: 'constant', value: 'π', display: 'π', latex: '\\pi' }
            ];

            const response = await request(app)
                .post('/api/formula/to-javascript')
                .send({ formula })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.javascript).toBe('Math.PI');
        });
    });

    describe('GET /api/formula/functions', () => {
        it('应该返回支持的函数列表', async () => {
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
            expect(response.body.data.trigonometric).toContainEqual(
                expect.objectContaining({
                    name: 'sin',
                    description: '正弦函数',
                    args: 1
                })
            );
        });
    });
});