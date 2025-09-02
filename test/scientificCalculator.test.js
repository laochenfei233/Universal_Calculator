const ScientificCalculator = require('../src/utils/scientificCalculator');

describe('ScientificCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new ScientificCalculator();
  });

  describe('三角函数', () => {
    test('应该正确计算sin函数（弧度）', () => {
      calculator.setAngleMode('radians');
      expect(calculator.sin(Math.PI / 2)).toBeCloseTo(1);
    });

    test('应该正确计算cos函数（弧度）', () => {
      calculator.setAngleMode('radians');
      expect(calculator.cos(Math.PI)).toBeCloseTo(-1);
    });

    test('应该正确计算tan函数（弧度）', () => {
      calculator.setAngleMode('radians');
      expect(calculator.tan(Math.PI / 4)).toBeCloseTo(1);
    });

    test('应该正确计算sin函数（角度）', () => {
      calculator.setAngleMode('degrees');
      expect(calculator.sin(90)).toBeCloseTo(1);
    });

    test('应该正确计算cos函数（角度）', () => {
      calculator.setAngleMode('degrees');
      expect(calculator.cos(180)).toBeCloseTo(-1);
    });

    test('应该正确计算tan函数（角度）', () => {
      calculator.setAngleMode('degrees');
      expect(calculator.tan(45)).toBeCloseTo(1);
    });
  });

  describe('对数函数', () => {
    test('应该正确计算自然对数', () => {
      expect(calculator.ln(Math.E)).toBeCloseTo(1);
    });

    test('应该正确计算常用对数', () => {
      expect(calculator.log(100)).toBeCloseTo(2);
    });

    test('应该处理对数负数输入', () => {
      expect(() => calculator.ln(-1)).toThrow('对数函数的参数必须为正数');
    });

    test('应该处理对数零输入', () => {
      expect(() => calculator.ln(0)).toThrow('对数函数的参数必须为正数');
    });
  });

  describe('指数函数', () => {
    test('应该正确计算e的幂', () => {
      expect(calculator.exp(1)).toBeCloseTo(Math.E);
    });

    test('应该正确计算任意幂', () => {
      expect(calculator.pow(2, 3)).toBe(8);
    });

    test('应该正确计算平方根', () => {
      expect(calculator.sqrt(16)).toBe(4);
    });

    test('应该处理负数平方根', () => {
      expect(() => calculator.sqrt(-1)).toThrow('平方根函数的参数必须为非负数');
    });
  });

  describe('角度转换', () => {
    test('应该正确将角度转换为弧度', () => {
      expect(calculator.degreesToRadians(180)).toBeCloseTo(Math.PI);
    });

    test('应该正确将弧度转换为角度', () => {
      expect(calculator.radiansToDegrees(Math.PI)).toBeCloseTo(180);
    });
  });

  describe('阶乘', () => {
    test('应该正确计算正整数阶乘', () => {
      expect(calculator.factorial(5)).toBe(120);
    });

    test('应该处理零阶乘', () => {
      expect(calculator.factorial(0)).toBe(1);
    });

    test('应该处理负数阶乘', () => {
      expect(() => calculator.factorial(-1)).toThrow('阶乘函数的参数必须为非负整数');
    });

    test('应该处理非整数阶乘', () => {
      expect(() => calculator.factorial(1.5)).toThrow('阶乘函数的参数必须为非负整数');
    });
  });

  describe('组合数学', () => {
    test('应该正确计算组合数', () => {
      expect(calculator.combination(5, 2)).toBe(10);
    });

    test('应该正确计算排列数', () => {
      expect(calculator.permutation(5, 2)).toBe(20);
    });

    test('应该处理无效组合数参数', () => {
      expect(() => calculator.combination(2, 5)).toThrow('组合数参数无效');
    });

    test('应该处理无效排列数参数', () => {
      expect(() => calculator.permutation(2, 5)).toThrow('排列数参数无效');
    });
  });

  describe('统计函数', () => {
    test('应该正确计算平均值', () => {
      expect(calculator.mean([1, 2, 3, 4, 5])).toBe(3);
    });

    test('应该正确计算标准差', () => {
      expect(calculator.stdDev([1, 2, 3, 4, 5])).toBeCloseTo(1.4142);
    });

    test('应该处理空数组', () => {
      expect(() => calculator.mean([])).toThrow('数组不能为空');
    });
  });

  describe('常量', () => {
    test('应该正确返回PI值', () => {
      expect(calculator.PI).toBeCloseTo(Math.PI);
    });

    test('应该正确返回E值', () => {
      expect(calculator.E).toBeCloseTo(Math.E);
    });
  });

  describe('错误处理', () => {
    test('应该处理无效角度模式', () => {
      expect(() => calculator.setAngleMode('invalid')).toThrow('无效的角度模式');
    });

    test('应该处理无效数学表达式', () => {
      expect(() => calculator.evaluate('sin(x)')).toThrow('无效的表达式');
    });
  });
});