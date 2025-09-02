/**
 * 科学计算器 - 全新实现
 */

class ScientificCalculator {
    constructor() {
        this.display = null;
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.angleMode = 'deg'; // 'deg' 或 'rad'
        this.memory = 0;
        this.history = [];
        this.maxHistoryLength = 100;
        this.constants = {
            pi: Math.PI,
            e: Math.E,
            phi: (1 + Math.sqrt(5)) / 2, // 黄金比例
            sqrt2: Math.sqrt(2),
            ln2: Math.LN2,
            ln10: Math.LN10
        };
        
        this.init();
    }

    init() {
        this.display = document.getElementById('scientific-display');
        this.setupEventListeners();
        this.loadHistory();
        this.loadSettings();
        this.updateDisplay();
        this.updateAngleModeDisplay();
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.isActive()) {
                this.handleKeyboard(e);
            }
        });
    }

    isActive() {
        const scientificPanel = document.getElementById('scientific-calculator');
        return scientificPanel && scientificPanel.classList.contains('active');
    }

    handleKeyboard(e) {
        const key = e.key;
        
        // 数字键
        if (/[0-9]/.test(key)) {
            e.preventDefault();
            this.inputNumber(key);
        }
        // 基本运算符
        else if (['+', '-', '*', '/'].includes(key)) {
            e.preventDefault();
            const operator = key === '*' ? '×' : key === '/' ? '÷' : key;
            this.inputOperator(operator);
        }
        // 小数点
        else if (key === '.') {
            e.preventDefault();
            this.inputDecimal();
        }
        // 括号
        else if (key === '(' || key === ')') {
            e.preventDefault();
            this.inputParenthesis(key);
        }
        // 等号
        else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        }
        // 清除
        else if (key === 'Escape') {
            e.preventDefault();
            this.clear();
        }
        // 删除
        else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
        }
        // 科学计算快捷键
        else if (e.ctrlKey) {
            switch (key) {
                case 's':
                    e.preventDefault();
                    this.inputFunction('sin');
                    break;
                case 'c':
                    e.preventDefault();
                    this.inputFunction('cos');
                    break;
                case 't':
                    e.preventDefault();
                    this.inputFunction('tan');
                    break;
                case 'l':
                    e.preventDefault();
                    this.inputFunction('log');
                    break;
                case 'n':
                    e.preventDefault();
                    this.inputFunction('ln');
                    break;
                case 'r':
                    e.preventDefault();
                    this.inputFunction('sqrt');
                    break;
                case 'p':
                    e.preventDefault();
                    this.inputConstant('pi');
                    break;
                case 'e':
                    e.preventDefault();
                    this.inputConstant('e');
                    break;
            }
        }
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
        this.addButtonFeedback(num);
    }

    inputOperator(nextOperator) {
        if (this.currentInput.includes('(') && !this.currentInput.includes(')')) {
            // 如果有未闭合的括号，直接添加运算符
            this.currentInput += nextOperator;
        } else {
            const inputValue = this.evaluateExpression(this.currentInput);

            if (this.previousInput === '') {
                this.previousInput = inputValue;
            } else if (this.operator) {
                const currentValue = this.previousInput || 0;
                const newValue = this.performBasicCalculation(currentValue, inputValue, this.operator);

                this.currentInput = String(newValue);
                this.previousInput = newValue;
            }

            this.waitingForOperand = true;
            this.operator = nextOperator;
        }
        this.updateDisplay();
        this.addButtonFeedback(nextOperator);
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        this.updateDisplay();
        this.addButtonFeedback('.');
    }

    inputParenthesis(paren) {
        if (paren === '(') {
            if (this.currentInput === '0' || this.waitingForOperand) {
                this.currentInput = '(';
                this.waitingForOperand = false;
            } else {
                this.currentInput += '×(';
            }
        } else if (paren === ')') {
            if (!this.currentInput.includes('(')) {
                return; // 没有开括号，不能添加闭括号
            }
            this.currentInput += ')';
        }
        this.updateDisplay();
        this.addButtonFeedback(paren);
    }

    inputFunction(funcName) {
        const func = funcName + '(';
        if (this.currentInput === '0' || this.waitingForOperand) {
            this.currentInput = func;
            this.waitingForOperand = false;
        } else {
            this.currentInput += '×' + func;
        }
        this.updateDisplay();
        this.addButtonFeedback(funcName);
    }

    inputConstant(constName) {
        const value = this.constants[constName];
        if (this.waitingForOperand || this.currentInput === '0') {
            this.currentInput = String(value);
            this.waitingForOperand = false;
        } else {
            this.currentInput += '×' + String(value);
        }
        this.updateDisplay();
        this.addButtonFeedback(constName);
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.addButtonFeedback('清除');
        this.triggerHapticFeedback();
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
        this.addButtonFeedback('删除');
    }

    calculate() {
        try {
            let expression = this.currentInput;
            
            // 如果有待处理的运算符
            if (this.operator && this.previousInput !== '') {
                const inputValue = this.evaluateExpression(this.currentInput);
                const result = this.performBasicCalculation(this.previousInput, inputValue, this.operator);
                expression = `${this.previousInput} ${this.operator} ${this.currentInput}`;
                this.currentInput = String(result);
            } else {
                const result = this.evaluateExpression(expression);
                this.currentInput = String(result);
            }

            // 添加到历史记录
            this.addToHistory({
                expression: expression,
                result: parseFloat(this.currentInput),
                timestamp: new Date(),
                angleMode: this.angleMode
            });

            this.previousInput = '';
            this.operator = null;
            this.waitingForOperand = true;
            this.updateDisplay();
            this.addButtonFeedback('=');
            this.triggerHapticFeedback();
        } catch (error) {
            this.handleError(error);
        }
    }

    evaluateExpression(expr) {
        try {
            // 替换数学符号
            let expression = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, Math.PI)
                .replace(/e/g, Math.E);

            // 处理数学函数
            expression = this.processMathFunctions(expression);

            // 安全计算
            const result = this.safeEvaluate(expression);
            
            if (!isFinite(result)) {
                throw new Error('结果无效');
            }

            return result;
        } catch (error) {
            throw new Error('表达式无效');
        }
    }

    processMathFunctions(expr) {
        const functions = {
            'sin': (x) => Math.sin(this.angleMode === 'deg' ? this.degToRad(x) : x),
            'cos': (x) => Math.cos(this.angleMode === 'deg' ? this.degToRad(x) : x),
            'tan': (x) => Math.tan(this.angleMode === 'deg' ? this.degToRad(x) : x),
            'asin': (x) => this.angleMode === 'deg' ? this.radToDeg(Math.asin(x)) : Math.asin(x),
            'acos': (x) => this.angleMode === 'deg' ? this.radToDeg(Math.acos(x)) : Math.acos(x),
            'atan': (x) => this.angleMode === 'deg' ? this.radToDeg(Math.atan(x)) : Math.atan(x),
            'log': (x) => Math.log10(x),
            'ln': (x) => Math.log(x),
            'sqrt': (x) => Math.sqrt(x),
            'abs': (x) => Math.abs(x),
            'exp': (x) => Math.exp(x),
            'pow': (x, y) => Math.pow(x, y),
            'factorial': (n) => this.factorial(n),
            'cbrt': (x) => Math.cbrt(x),
            'sinh': (x) => Math.sinh(x),
            'cosh': (x) => Math.cosh(x),
            'tanh': (x) => Math.tanh(x)
        };

        // 替换函数调用
        for (const [funcName, func] of Object.entries(functions)) {
            const regex = new RegExp(`${funcName}\\(([^)]+)\\)`, 'g');
            expr = expr.replace(regex, (match, args) => {
                try {
                    if (funcName === 'pow') {
                        const [x, y] = args.split(',').map(arg => this.safeEvaluate(arg.trim()));
                        return func(x, y);
                    } else {
                        const arg = this.safeEvaluate(args.trim());
                        return func(arg);
                    }
                } catch (e) {
                    throw new Error(`函数 ${funcName} 计算错误`);
                }
            });
        }

        return expr;
    }

    safeEvaluate(expr) {
        // 基本安全检查
        if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
            throw new Error('无效的表达式');
        }
        
        try {
            return Function('"use strict"; return (' + expr + ')')();
        } catch (e) {
            throw new Error('计算错误');
        }
    }

    performBasicCalculation(firstOperand, secondOperand, operator) {
        let result;
        
        switch (operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '×':
                result = firstOperand * secondOperand;
                break;
            case '÷':
                if (secondOperand === 0) {
                    throw new Error('除数不能为零');
                }
                result = firstOperand / secondOperand;
                break;
            default:
                return secondOperand;
        }

        return this.roundResult(result);
    }

    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error('阶乘只能计算非负整数');
        }
        if (n > 170) {
            throw new Error('数字太大');
        }
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    roundResult(result) {
        // 处理浮点数精度问题
        return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
    }

    toggleAngleMode() {
        this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
        this.updateAngleModeDisplay();
        this.saveSettings();
        showInfo(`已切换到${this.angleMode === 'deg' ? '度数' : '弧度'}模式`);
    }

    updateAngleModeDisplay() {
        const btn = document.getElementById('angle-mode-btn');
        if (btn) {
            btn.textContent = this.angleMode.toUpperCase();
            btn.title = this.angleMode === 'deg' ? '度数模式 (点击切换到弧度)' : '弧度模式 (点击切换到度数)';
        }
    }

    updateDisplay() {
        if (this.display) {
            const displayValue = this.formatNumber(this.currentInput);
            this.display.value = displayValue;
            this.updateHistoryDisplay();
        }
    }

    formatNumber(num) {
        if (typeof num === 'string' && (num.includes('(') || num.includes('sin') || num.includes('cos'))) {
            return num; // 返回表达式
        }

        const number = parseFloat(num);
        
        if (isNaN(number)) {
            return '0';
        }
        
        // 科学计数法显示大数或小数
        if (Math.abs(number) >= 1e10 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // 限制小数位数
        if (number % 1 !== 0) {
            const formatted = number.toFixed(10).replace(/\.?0+$/, '');
            return formatted;
        }
        
        return number.toLocaleString('zh-CN');
    }

    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.maxHistoryLength) {
            this.history = this.history.slice(0, this.maxHistoryLength);
        }
        this.saveHistory();
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('scientific-history');
        if (historyElement && this.history.length > 0) {
            const lastEntry = this.history[0];
            historyElement.textContent = `${lastEntry.expression} = ${this.formatNumber(lastEntry.result)}`;
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('scientificCalculatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('无法保存计算历史:', error);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('scientificCalculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('无法加载计算历史:', error);
            this.history = [];
        }
    }

    saveSettings() {
        try {
            const settings = {
                angleMode: this.angleMode,
                memory: this.memory
            };
            localStorage.setItem('scientificCalculatorSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('无法保存设置:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('scientificCalculatorSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.angleMode = settings.angleMode || 'deg';
                this.memory = settings.memory || 0;
            }
        } catch (error) {
            console.warn('无法加载设置:', error);
        }
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        const historyElement = document.getElementById('scientific-history');
        if (historyElement) {
            historyElement.textContent = '';
        }
        showSuccess('计算历史已清除');
    }

    addButtonFeedback(value) {
        // 视觉反馈
        const buttons = document.querySelectorAll('.scientific-calculator .btn');
        buttons.forEach(btn => {
            if (btn.textContent.trim() === value || 
                btn.textContent.includes(value)) {
                btn.classList.add('pressed');
                setTimeout(() => {
                    btn.classList.remove('pressed');
                }, 150);
            }
        });
    }

    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    handleError(error) {
        console.error('科学计算错误:', error);
        this.currentInput = 'Error';
        this.updateDisplay();
        showError(error.message || '计算出错');
        
        // 3秒后重置
        setTimeout(() => {
            this.clear();
        }, 3000);
    }
}

// 全局函数供HTML调用
window.scientificCalculatorInstance = null;

// 初始化科学计算器
function initScientificCalculator() {
    if (!window.scientificCalculatorInstance) {
        window.scientificCalculatorInstance = new ScientificCalculator();
    }
    return window.scientificCalculatorInstance;
}

// HTML按钮事件处理函数
window.scientificInputNumber = function(num) {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputNumber(num);
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificInputOperator = function(op) {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputOperator(op);
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificInputFunction = function(func) {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputFunction(func);
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificInputConstant = function(constant) {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputConstant(constant);
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificInputDecimal = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputDecimal();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificInputParenthesis = function(paren) {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.inputParenthesis(paren);
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificCalculate = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.calculate();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificClear = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.clear();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificBackspace = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.backspace();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificToggleAngleMode = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.toggleAngleMode();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

window.scientificClearHistory = function() {
    try {
        const calc = window.scientificCalculatorInstance || initScientificCalculator();
        calc.clearHistory();
    } catch (error) {
        window.scientificCalculatorInstance?.handleError(error);
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initScientificCalculator();
    }, 100);
});

// 导出类
window.ScientificCalculator = ScientificCalculator;