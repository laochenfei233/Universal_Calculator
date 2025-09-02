/**
 * 安全的数学表达式解析器
 * 实现词法分析、语法分析和安全验证
 */

/**
 * 词法分析器 - 将表达式转换为标记流
 */
class Lexer {
  constructor(expression) {
    this.expression = expression.replace(/\s+/g, ''); // 移除空格
    this.position = 0;
    this.tokens = [];
  }

  /**
   * 词法分析主方法
   * @returns {Array} 标记数组
   */
  tokenize() {
    while (this.position < this.expression.length) {
      const char = this.expression[this.position];

      if (this.isDigit(char) || char === '.') {
        this.readNumber();
      } else if (this.isOperator(char)) {
        this.readOperator();
      } else if (char === '(' || char === ')') {
        this.readParenthesis();
      } else if (this.isLetter(char)) {
        this.readFunction();
      } else {
        throw new Error(`无效字符: ${char} 在位置 ${this.position}`);
      }
    }

    return this.tokens;
  }

  /**
   * 读取数字（包括小数）
   */
  readNumber() {
    let number = '';
    let hasDecimal = false;

    while (this.position < this.expression.length) {
      const char = this.expression[this.position];
      
      if (this.isDigit(char)) {
        number += char;
        this.position++;
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        number += char;
        this.position++;
      } else {
        break;
      }
    }

    if (number === '.' || number === '') {
      throw new Error('无效的数字格式');
    }

    this.tokens.push({
      type: 'NUMBER',
      value: parseFloat(number),
      raw: number
    });
  }

  /**
   * 读取运算符
   */
  readOperator() {
    const char = this.expression[this.position];
    this.tokens.push({
      type: 'OPERATOR',
      value: char,
      raw: char
    });
    this.position++;
  }

  /**
   * 读取括号
   */
  readParenthesis() {
    const char = this.expression[this.position];
    this.tokens.push({
      type: char === '(' ? 'LEFT_PAREN' : 'RIGHT_PAREN',
      value: char,
      raw: char
    });
    this.position++;
  }

  /**
   * 读取函数名或常数
   */
  readFunction() {
    let name = '';
    
    while (this.position < this.expression.length && 
           (this.isLetter(this.expression[this.position]) || 
            this.isDigit(this.expression[this.position]))) {
      name += this.expression[this.position];
      this.position++;
    }

    // 检查是否为支持的函数或常数
    const supportedFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh',
      'log', 'ln', 'log2',
      'exp', 'sqrt', 'cbrt',
      'abs', 'ceil', 'floor', 'round', 'sign',
      'deg', 'rad'
    ];
    const supportedConstants = ['pi', 'e'];

    if (supportedFunctions.includes(name.toLowerCase())) {
      this.tokens.push({
        type: 'FUNCTION',
        value: name.toLowerCase(),
        raw: name
      });
    } else if (supportedConstants.includes(name.toLowerCase())) {
      this.tokens.push({
        type: 'CONSTANT',
        value: name.toLowerCase(),
        raw: name
      });
    } else {
      throw new Error(`不支持的函数或常数: ${name}`);
    }
  }

  isDigit(char) {
    return char >= '0' && char <= '9';
  }

  isLetter(char) {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  isOperator(char) {
    return ['+', '-', '*', '/', '^', '%'].includes(char);
  }
}

/**
 * 语法分析器 - 将标记流转换为抽象语法树
 */
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  /**
   * 解析表达式
   * @returns {Object} 抽象语法树
   */
  parse() {
    if (this.tokens.length === 0) {
      throw new Error('空表达式');
    }

    const ast = this.parseExpression();
    
    if (this.position < this.tokens.length) {
      throw new Error(`意外的标记: ${this.tokens[this.position].raw}`);
    }

    return ast;
  }

  /**
   * 解析表达式（处理加法和减法）
   */
  parseExpression() {
    let left = this.parseTerm();

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      
      if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
        this.position++;
        const right = this.parseTerm();
        left = {
          type: 'BINARY_OP',
          operator: token.value,
          left,
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * 解析项（处理乘法和除法）
   */
  parseTerm() {
    let left = this.parseFactor();

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      
      if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/' || token.value === '%')) {
        this.position++;
        const right = this.parseFactor();
        left = {
          type: 'BINARY_OP',
          operator: token.value,
          left,
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * 解析因子（处理幂运算、函数、括号、数字）
   */
  parseFactor() {
    let left = this.parsePrimary();

    // 处理幂运算（右结合）
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];
      
      if (token.type === 'OPERATOR' && token.value === '^') {
        this.position++;
        const right = this.parseFactor(); // 右结合
        left = {
          type: 'BINARY_OP',
          operator: '^',
          left,
          right
        };
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * 解析基本元素（数字、常数、函数、括号）
   */
  parsePrimary() {
    const token = this.tokens[this.position];

    if (!token) {
      throw new Error('意外的表达式结束');
    }

    // 处理负号
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.position++;
      const operand = this.parseFactor();
      return {
        type: 'UNARY_OP',
        operator: '-',
        operand
      };
    }

    // 处理正号
    if (token.type === 'OPERATOR' && token.value === '+') {
      this.position++;
      return this.parseFactor();
    }

    // 处理数字
    if (token.type === 'NUMBER') {
      this.position++;
      return {
        type: 'NUMBER',
        value: token.value
      };
    }

    // 处理常数
    if (token.type === 'CONSTANT') {
      this.position++;
      return {
        type: 'CONSTANT',
        value: token.value
      };
    }

    // 处理函数
    if (token.type === 'FUNCTION') {
      this.position++;
      
      // 期望左括号
      if (this.position >= this.tokens.length || this.tokens[this.position].type !== 'LEFT_PAREN') {
        throw new Error(`函数 ${token.value} 后面必须跟括号`);
      }
      this.position++; // 跳过左括号

      const argument = this.parseExpression();

      // 期望右括号
      if (this.position >= this.tokens.length || this.tokens[this.position].type !== 'RIGHT_PAREN') {
        throw new Error(`函数 ${token.value} 缺少右括号`);
      }
      this.position++; // 跳过右括号

      return {
        type: 'FUNCTION',
        name: token.value,
        argument
      };
    }

    // 处理括号
    if (token.type === 'LEFT_PAREN') {
      this.position++;
      const expression = this.parseExpression();
      
      if (this.position >= this.tokens.length || this.tokens[this.position].type !== 'RIGHT_PAREN') {
        throw new Error('缺少右括号');
      }
      this.position++;

      return expression;
    }

    throw new Error(`意外的标记: ${token.raw}`);
  }
}

/**
 * 表达式求值器
 */
class Evaluator {
  constructor() {
    this.constants = {
      pi: Math.PI,
      e: Math.E
    };

    this.angleMode = 'radians'; // 'radians' or 'degrees'

    this.functions = {
      // 基础数学函数
      sin: (x) => Math.sin(this.angleMode === 'degrees' ? this.degreesToRadians(x) : x),
      cos: (x) => Math.cos(this.angleMode === 'degrees' ? this.degreesToRadians(x) : x),
      tan: (x) => Math.tan(this.angleMode === 'degrees' ? this.degreesToRadians(x) : x),
      asin: (x) => this.angleMode === 'degrees' ? this.radiansToDegrees(Math.asin(x)) : Math.asin(x),
      acos: (x) => this.angleMode === 'degrees' ? this.radiansToDegrees(Math.acos(x)) : Math.acos(x),
      atan: (x) => this.angleMode === 'degrees' ? this.radiansToDegrees(Math.atan(x)) : Math.atan(x),
      
      // 双曲函数
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      
      // 对数函数
      log: Math.log10,
      ln: Math.log,
      log2: Math.log2,
      
      // 指数和幂函数
      exp: Math.exp,
      sqrt: Math.sqrt,
      cbrt: Math.cbrt,
      
      // 其他数学函数
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round,
      sign: Math.sign,
      
      // 角度转换函数
      deg: this.radiansToDegrees.bind(this),
      rad: this.degreesToRadians.bind(this)
    };
  }

  /**
   * 设置角度模式
   * @param {string} mode - 'radians' 或 'degrees'
   */
  setAngleMode(mode) {
    if (mode === 'radians' || mode === 'degrees') {
      this.angleMode = mode;
    } else {
      throw new Error('角度模式必须是 "radians" 或 "degrees"');
    }
  }

  /**
   * 度数转弧度
   * @param {number} degrees - 度数
   * @returns {number} 弧度
   */
  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 弧度转度数
   * @param {number} radians - 弧度
   * @returns {number} 度数
   */
  radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  /**
   * 求值抽象语法树
   * @param {Object} ast - 抽象语法树
   * @returns {number} 计算结果
   */
  evaluate(ast) {
    switch (ast.type) {
      case 'NUMBER':
        return ast.value;

      case 'CONSTANT':
        if (this.constants[ast.value] !== undefined) {
          return this.constants[ast.value];
        }
        throw new Error(`未知常数: ${ast.value}`);

      case 'BINARY_OP':
        const left = this.evaluate(ast.left);
        const right = this.evaluate(ast.right);
        return this.evaluateBinaryOperation(ast.operator, left, right);

      case 'UNARY_OP':
        const operand = this.evaluate(ast.operand);
        return this.evaluateUnaryOperation(ast.operator, operand);

      case 'FUNCTION':
        const argument = this.evaluate(ast.argument);
        return this.evaluateFunction(ast.name, argument);

      default:
        throw new Error(`未知的AST节点类型: ${ast.type}`);
    }
  }

  /**
   * 求值二元运算
   */
  evaluateBinaryOperation(operator, left, right) {
    switch (operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        if (right === 0) {
          throw new Error('除数不能为零');
        }
        return left / right;
      case '^':
        return Math.pow(left, right);
      case '%':
        if (right === 0) {
          throw new Error('模运算的除数不能为零');
        }
        return left % right;
      default:
        throw new Error(`未知的二元运算符: ${operator}`);
    }
  }

  /**
   * 求值一元运算
   */
  evaluateUnaryOperation(operator, operand) {
    switch (operator) {
      case '-':
        return -operand;
      case '+':
        return operand;
      default:
        throw new Error(`未知的一元运算符: ${operator}`);
    }
  }

  /**
   * 求值函数
   */
  evaluateFunction(name, argument) {
    if (this.functions[name]) {
      // 特殊处理常见函数以提高性能
      switch (name) {
        case 'sin':
          return Math.sin(this.angleMode === 'degrees' ? this.degreesToRadians(argument) : argument);
        case 'cos':
          return Math.cos(this.angleMode === 'degrees' ? this.degreesToRadians(argument) : argument);
        case 'tan':
          return Math.tan(this.angleMode === 'degrees' ? this.degreesToRadians(argument) : argument);
        case 'sqrt':
          return Math.sqrt(argument);
        case 'log':
          return Math.log10(argument);
        case 'ln':
          return Math.log(argument);
        case 'abs':
          return Math.abs(argument);
        default:
          const result = this.functions[name](argument);
          
          // 检查结果是否有效
          if (!isFinite(result)) {
            throw new Error(`函数 ${name} 的计算结果无效`);
          }
          
          return result;
      }
    }
    throw new Error(`未知函数: ${name}`);
  }
}

/**
 * 主表达式解析器类
 */
class ExpressionParser {
  constructor(options = {}) {
    this.evaluator = new Evaluator();
    
    // 设置角度模式
    if (options.angleMode) {
      this.evaluator.setAngleMode(options.angleMode);
    }
  }

  /**
   * 设置角度模式
   * @param {string} mode - 'radians' 或 'degrees'
   */
  setAngleMode(mode) {
    this.evaluator.setAngleMode(mode);
  }

  /**
   * 获取当前角度模式
   * @returns {string} 当前角度模式
   */
  getAngleMode() {
    return this.evaluator.angleMode;
  }

  /**
   * 解析并计算表达式
   * @param {string} expression - 数学表达式
   * @param {Object} options - 解析选项
   * @returns {Object} 计算结果和步骤
   */
  parse(expression, options = {}) {
    try {
      // 安全验证
      this.validateSecurity(expression);

      // 词法分析
      const lexer = new Lexer(expression);
      const tokens = lexer.tokenize();

      // 语法分析
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // 求值
      const result = this.evaluator.evaluate(ast);

      // 精度处理
      const roundedResult = this.roundToPrecision(result, 10);

      return {
        success: true,
        result: roundedResult,
        expression: expression,
        tokens: tokens,
        ast: ast,
        angleMode: this.evaluator.angleMode
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        expression: expression
      };
    }
  }

  /**
   * 安全验证
   * @param {string} expression - 表达式
   */
  validateSecurity(expression) {
    if (!expression || typeof expression !== 'string') {
      throw new Error('表达式必须是非空字符串');
    }

    // 长度限制
    if (expression.length > 1000) {
      throw new Error('表达式长度不能超过1000个字符');
    }

    // 危险模式检查
    const dangerousPatterns = [
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>/,
      /import\s+/i,
      /require\s*\(/i,
      /process\./i,
      /global\./i,
      /__proto__/i,
      /constructor/i,
      /\$\{/,
      /javascript:/i,
      /data:/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(expression)) {
        throw new Error('表达式包含不安全的内容');
      }
    }

    // 括号平衡检查
    let parenCount = 0;
    for (const char of expression) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        throw new Error('括号不匹配');
      }
    }
    if (parenCount !== 0) {
      throw new Error('括号不匹配');
    }
  }

  /**
   * 精度处理
   * @param {number} value - 数值
   * @param {number} precision - 精度位数
   * @returns {number} 处理后的数值
   */
  roundToPrecision(value, precision) {
    if (!isFinite(value)) {
      throw new Error('计算结果无效');
    }

    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }
}

module.exports = ExpressionParser;