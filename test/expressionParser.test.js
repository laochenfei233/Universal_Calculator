/**
 * 表达式解析器单元测试
 */

const ExpressionParser = require('../src/utils/expressionParser');

describe('ExpressionParser', () => {
  let parser;

  beforeEach(() => {
    parser = new ExpressionParser();
  });

  describe('基础算术运算', () => {
    test('应该正确计算加法', () => {
      const result = parser.parse('2 + 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });

    test('应该正确计算减法', () => {
      const result = parser.parse('10 - 4');
      expect(result.success).toBe(true);
      expect(result.result).toBe(6);
    });

    test('应该正确计算乘法', () => {
      const result = parser.parse('6 * 7');
      expect(result.success).toBe(true);
      expect(result.result).toBe(42);
    });

    test('应该正确计算除法', () => {
      const result = parser.parse('15 / 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });

    test('应该正确计算幂运算', () => {
      const result = parser.parse('2 ^ 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(8);
    });

    test('应该正确计算模运算', () => {
      const result = parser.parse('10 % 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(1);
    });
  });

  describe('运算符优先级', () => {
    test('应该正确处理乘法优先级', () => {
      const result = parser.parse('2 + 3 * 4');
      expect(result.success).toBe(true);
      expect(result.result).toBe(14);
    });

    test('应该正确处理除法优先级', () => {
      const result = parser.parse('20 - 12 / 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(16);
    });

    test('应该正确处理括号优先级', () => {
      const result = parser.parse('(2 + 3) * 4');
      expect(result.success).toBe(true);
      expect(result.result).toBe(20);
    });

    test('应该正确处理复杂表达式', () => {
      const result = parser.parse('2 + 3 * (4 - 1) / 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });
  });

  describe('小数运算', () => {
    test('应该正确处理小数加法', () => {
      const result = parser.parse('1.5 + 2.3');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(3.8);
    });

    test('应该正确处理小数乘法', () => {
      const result = parser.parse('2.5 * 4');
      expect(result.success).toBe(true);
      expect(result.result).toBe(10);
    });

    test('应该正确处理小数除法', () => {
      const result = parser.parse('7.5 / 2.5');
      expect(result.success).toBe(true);
      expect(result.result).toBe(3);
    });
  });

  describe('负数处理', () => {
    test('应该正确处理负数', () => {
      const result = parser.parse('-5 + 3');
      expect(result.success).toBe(true);
      expect(result.result).toBe(-2);
    });

    test('应该正确处理括号中的负数', () => {
      const result = parser.parse('(-5) * 2');
      expect(result.success).toBe(true);
      expect(result.result).toBe(-10);
    });

    test('应该正确处理多个负号', () => {
      const result = parser.parse('--5');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });
  });

  describe('数学函数', () => {
    test('应该正确计算sin函数', () => {
      const result = parser.parse('sin(0)');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(0);
    });

    test('应该正确计算cos函数', () => {
      const result = parser.parse('cos(0)');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(1);
    });

    test('应该正确计算sqrt函数', () => {
      const result = parser.parse('sqrt(16)');
      expect(result.success).toBe(true);
      expect(result.result).toBe(4);
    });

    test('应该正确计算log函数', () => {
      const result = parser.parse('log(100)');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(2);
    });

    test('应该正确计算ln函数', () => {
      const result = parser.parse('ln(e)');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(1);
    });

    test('应该正确计算abs函数', () => {
      const result = parser.parse('abs(-5)');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });
  });

  describe('数学常数', () => {
    test('应该正确使用pi常数', () => {
      const result = parser.parse('pi');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(Math.PI);
    });

    test('应该正确使用e常数', () => {
      const result = parser.parse('e');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(Math.E);
    });

    test('应该正确在表达式中使用常数', () => {
      const result = parser.parse('2 * pi');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('复杂表达式', () => {
    test('应该正确计算复杂科学表达式', () => {
      const result = parser.parse('sin(pi/2) + cos(0)');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(2);
    });

    test('应该正确计算嵌套函数', () => {
      const result = parser.parse('sqrt(abs(-16))');
      expect(result.success).toBe(true);
      expect(result.result).toBe(4);
    });

    test('应该正确计算混合运算', () => {
      const result = parser.parse('2 + 3 * sin(0) + sqrt(9)');
      expect(result.success).toBe(true);
      expect(result.result).toBe(5);
    });
  });

  describe('错误处理', () => {
    test('应该处理除零错误', () => {
      const result = parser.parse('5 / 0');
      expect(result.success).toBe(false);
      expect(result.error).toContain('除数不能为零');
    });

    test('应该处理模零错误', () => {
      const result = parser.parse('5 % 0');
      expect(result.success).toBe(false);
      expect(result.error).toContain('模运算的除数不能为零');
    });

    test('应该处理无效字符', () => {
      const result = parser.parse('2 + @');
      expect(result.success).toBe(false);
      expect(result.error).toContain('无效字符');
    });

    test('应该处理不匹配的括号', () => {
      const result = parser.parse('2 + (3 * 4');
      expect(result.success).toBe(false);
      expect(result.error).toContain('括号不匹配');
    });

    test('应该处理空表达式', () => {
      const result = parser.parse('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('表达式必须是非空字符串');
    });

    test('应该处理未知函数', () => {
      const result = parser.parse('unknown(5)');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持的函数');
    });
  });

  describe('安全验证', () => {
    test('应该拒绝eval注入', () => {
      const result = parser.parse('eval("alert(1)")');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不安全的内容');
    });

    test('应该拒绝function注入', () => {
      const result = parser.parse('function() { return 1; }');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不安全的内容');
    });

    test('应该拒绝require注入', () => {
      const result = parser.parse('require("fs")');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不安全的内容');
    });

    test('应该拒绝过长表达式', () => {
      const longExpression = '1+'.repeat(1000) + '1';
      const result = parser.parse(longExpression);
      expect(result.success).toBe(false);
      expect(result.error).toContain('长度不能超过');
    });
  });

  describe('精度处理', () => {
    test('应该正确处理浮点精度', () => {
      const result = parser.parse('0.1 + 0.2');
      expect(result.success).toBe(true);
      expect(result.result).toBeCloseTo(0.3);
    });

    test('应该限制结果精度', () => {
      const result = parser.parse('1 / 3');
      expect(result.success).toBe(true);
      expect(result.result.toString().length).toBeLessThan(15);
    });
  });

  describe('词法分析', () => {
    test('应该正确识别数字标记', () => {
      const result = parser.parse('123.45');
      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual({
        type: 'NUMBER',
        value: 123.45,
        raw: '123.45'
      });
    });

    test('应该正确识别运算符标记', () => {
      const result = parser.parse('1 + 2');
      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual({
        type: 'OPERATOR',
        value: '+',
        raw: '+'
      });
    });

    test('应该正确识别函数标记', () => {
      const result = parser.parse('sin(1)');
      expect(result.success).toBe(true);
      expect(result.tokens).toContainEqual({
        type: 'FUNCTION',
        value: 'sin',
        raw: 'sin'
      });
    });
  });
});