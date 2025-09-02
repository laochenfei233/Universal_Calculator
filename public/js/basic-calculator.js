/**
 * 基础计算器 - 全新设计
 * 专为移动端优化的触摸友好计算器
 */

class BasicCalculator {
    constructor() {
        this.display = null;
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.history = [];
        this.maxHistoryLength = 50;
        this.worker = null;
        this.debounceTimer = null;
        this.throttleLastTime = 0;
        
        // 初始化Web Worker
        if (window.Worker) {
            this.worker = new Worker('calculationWorker.js');
            this.worker.onmessage = (e) => {
                if (e.data.success) {
                    this.currentInput = e.data.result.toString();
                    this.updateDisplay();
                } else {
                    this.displayError(e.data.error);
                }
            };
        }
        
        this.init();
    }

    init() {
        this.createCalculatorHTML();
        this.setupEventListeners();
        this.loadHistory();
    }

    createCalculatorHTML() {
        const calculatorContainer = document.getElementById('basic-calculator');
        if (!calculatorContainer) return;

        calculatorContainer.innerHTML = `
            <div class="calculator-header">
                <div class="calculator-title">
                    <span class="calculator-icon">🔢</span>
                    <h2>基础计算器</h2>
                </div>
                <div class="calculator-actions">
                    <button class="btn btn-icon" onclick="basicCalculator.showHistory()" title="历史记录">
                        <span>📋</span>
                    </button>
                    <button class="btn btn-icon" onclick="showCalculatorHelp('basic')" title="帮助">
                        <span>❓</span>
                    </button>
                    <button class="btn btn-icon" onclick="calculatorApp.switchToHome()" title="返回首页">
                        <span>🏠</span>
                    </button>
                </div>
            </div>
            
            <div class="calculator-body">
                <!-- 显示屏区域 -->
                <div class="display-container">
                    <div class="display-secondary" id="basic-secondary-display"></div>
                    <div class="display-primary" id="basic-primary-display">0</div>
                </div>
                
                <!-- 按钮区域 -->
                <div class="button-grid basic-grid">
                    <!-- 第一行：功能按钮 -->
                    <button class="btn btn-function" data-action="clear">
                        <span class="btn-text">清除</span>
                    </button>
                    <button class="btn btn-function" data-action="backspace">
                        <span class="btn-text">删除</span>
                    </button>
                    <button class="btn btn-function" data-action="percent">
                        <span class="btn-symbol">%</span>
                    </button>
                    <button class="btn btn-operator" data-action="divide">
                        <span class="btn-symbol">÷</span>
                    </button>
                    
                    <!-- 第二行：7-9和乘法 -->
                    <button class="btn btn-number" data-number="7">
                        <span class="btn-number-text">7</span>
                    </button>
                    <button class="btn btn-number" data-number="8">
                        <span class="btn-number-text">8</span>
                    </button>
                    <button class="btn btn-number" data-number="9">
                        <span class="btn-number-text">9</span>
                    </button>
                    <button class="btn btn-operator" data-action="multiply">
                        <span class="btn-symbol">×</span>
                    </button>
                    
                    <!-- 第三行：4-6和减法 -->
                    <button class="btn btn-number" data-number="4">
                        <span class="btn-number-text">4</span>
                    </button>
                    <button class="btn btn-number" data-number="5">
                        <span class="btn-number-text">5</span>
                    </button>
                    <button class="btn btn-number" data-number="6">
                        <span class="btn-number-text">6</span>
                    </button>
                    <button class="btn btn-operator" data-action="subtract">
                        <span class="btn-symbol">−</span>
                    </button>
                    
                    <!-- 第四行：1-3和加法 -->
                    <button class="btn btn-number" data-number="1">
                        <span class="btn-number-text">1</span>
                    </button>
                    <button class="btn btn-number" data-number="2">
                        <span class="btn-number-text">2</span>
                    </button>
                    <button class="btn btn-number" data-number="3">
                        <span class="btn-number-text">3</span>
                    </button>
                    <button class="btn btn-operator btn-add" data-action="add">
                        <span class="btn-symbol">+</span>
                    </button>
                    
                    <!-- 第五行：0、小数点和等号 -->
                    <button class="btn btn-number btn-zero" data-number="0">
                        <span class="btn-number-text">0</span>
                    </button>
                    <button class="btn btn-number" data-action="decimal">
                        <span class="btn-symbol">.</span>
                    </button>
                    <button class="btn btn-equals" data-action="equals">
                        <span class="btn-symbol">=</span>
                    </button>
                </div>
                
                <!-- 快捷键提示 -->
                <div class="keyboard-hints">
                    <small>支持键盘输入：数字键、运算符、Enter(=)、Esc(清除)、Backspace(删除)</small>
                </div>
            </div>
            
            <!-- 底部footer -->
            <div class="calculator-footer">
                <div class="footer-main">© 2024 多功能计算器. 轻量级计算工具集合.</div>
                <div class="footer-actions">
                    <span class="network-status">⚠️ 网络连接已断开 <a href="#" class="retry-link" onclick="checkNetworkConnection()">重试</a></span>
                    <a href="#" class="settings-link" onclick="showSettings()"><span class="settings-icon">⚙️</span>设置</a>
                </div>
            </div>
        `;

        this.display = document.getElementById('basic-primary-display');
        this.secondaryDisplay = document.getElementById('basic-secondary-display');
    }

    setupEventListeners() {
        const calculator = document.getElementById('basic-calculator');
        if (!calculator) return;

        // 按钮点击事件
        calculator.addEventListener('click', (e) => {
            const button = e.target.closest('.btn');
            if (!button) return;

            e.preventDefault();
            this.handleButtonClick(button);
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('basic-calculator').classList.contains('active')) {
                this.handleKeyboard(e);
            }
        });

        // 触摸事件优化
        calculator.addEventListener('touchstart', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                button.classList.add('active');
                this.vibrate(10);
            }
        }, { passive: true });

        calculator.addEventListener('touchend', (e) => {
            const buttons = calculator.querySelectorAll('.btn.active');
            buttons.forEach(btn => btn.classList.remove('active'));
        }, { passive: true });
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const number = button.dataset.number;

        if (number !== undefined) {
            this.inputNumber(number);
        } else if (action) {
            this.performAction(action);
        }

        this.updateDisplay();
        this.vibrate(10);
    }

    handleKeyboard(e) {
        e.preventDefault();
        
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        } else if (key === '.') {
            this.performAction('decimal');
        } else if (key === '+') {
            this.performAction('add');
        } else if (key === '-') {
            this.performAction('subtract');
        } else if (key === '*') {
            this.performAction('multiply');
        } else if (key === '/') {
            this.performAction('divide');
        } else if (key === '%') {
            this.performAction('percent');
        } else if (key === 'Enter' || key === '=') {
            this.performAction('equals');
        } else if (key === 'Escape') {
            this.performAction('clear');
        } else if (key === 'Backspace') {
            this.performAction('backspace');
        }

        this.updateDisplay();
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
    }

    performAction(action) {
        const current = parseFloat(this.currentInput);

        switch (action) {
            case 'clear':
                this.clear();
                break;
                
            case 'backspace':
                this.backspace();
                break;
                
            case 'decimal':
                this.inputDecimal();
                break;
                
            case 'percent':
                this.currentInput = (current / 100).toString();
                break;
                
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.performOperation(action);
                break;
                
            case 'equals':
                this.calculate();
                break;
        }
    }

    performOperation(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.performCalculation(this.operator, currentValue, inputValue);

            this.currentInput = String(newValue);
            this.previousInput = newValue;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateSecondaryDisplay();
    }

    calculate() {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput !== '' && this.operator) {
            const currentValue = this.previousInput || 0;
            
            // 简单计算直接执行
            if (this.operator === 'add' || this.operator === 'subtract') {
                const newValue = this.performCalculation(this.operator, currentValue, inputValue);
                this.handleCalculationResult(currentValue, inputValue, newValue);
            } 
            // 复杂计算使用Web Worker
            else if (this.worker) {
                this.worker.postMessage({
                    expression: `${currentValue} ${this.operator} ${inputValue}`,
                    type: 'basic'
                });
            } 
            // 没有Web Worker支持时直接计算
            else {
                const newValue = this.performCalculation(this.operator, currentValue, inputValue);
                this.handleCalculationResult(currentValue, inputValue, newValue);
            }
        }
    }
    
    handleCalculationResult(operand1, operand2, result) {
        // 添加到历史记录
        this.addToHistory(operand1, this.operator, operand2, result);
        
        this.currentInput = String(result);
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = true;
        this.updateSecondaryDisplay();
    }

    performCalculation(operator, firstOperand, secondOperand) {
        switch (operator) {
            case 'add':
                return firstOperand + secondOperand;
            case 'subtract':
                return firstOperand - secondOperand;
            case 'multiply':
                return firstOperand * secondOperand;
            case 'divide':
                if (secondOperand === 0) {
                    throw new Error('除数不能为零');
                }
                return firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateSecondaryDisplay();
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
    }

    updateDisplay() {
        if (this.display) {
            // 使用防抖优化频繁更新
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            
            this.debounceTimer = setTimeout(() => {
                // 格式化显示数字
                const formattedNumber = this.formatNumber(this.currentInput);
                this.display.textContent = formattedNumber;
            }, 50);
        }
    }
    
    // 防抖方法
    debounce(func, delay) {
        return (...args) => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    
    // 节流方法
    throttle(func, limit) {
        return (...args) => {
            const now = Date.now();
            if (now - this.throttleLastTime >= limit) {
                func.apply(this, args);
                this.throttleLastTime = now;
            }
        };
    }

    updateSecondaryDisplay() {
        if (this.secondaryDisplay) {
            if (this.previousInput !== '' && this.operator) {
                const operatorSymbol = this.getOperatorSymbol(this.operator);
                this.secondaryDisplay.textContent = `${this.formatNumber(this.previousInput)} ${operatorSymbol}`;
            } else {
                this.secondaryDisplay.textContent = '';
            }
        }
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // 处理很大或很小的数字
        if (Math.abs(number) >= 1e15 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // 限制小数位数
        const formatted = number.toString();
        if (formatted.length > 12) {
            return number.toPrecision(8);
        }
        
        return formatted;
    }

    getOperatorSymbol(operator) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷'
        };
        return symbols[operator] || operator;
    }

    addToHistory(operand1, operator, operand2, result) {
        const historyItem = {
            expression: `${operand1} ${this.getOperatorSymbol(operator)} ${operand2}`,
            result: result,
            timestamp: new Date().toLocaleString()
        };
        
        this.history.unshift(historyItem);
        
        // 限制历史记录长度
        if (this.history.length > this.maxHistoryLength) {
            this.history = this.history.slice(0, this.maxHistoryLength);
        }
        
        this.saveHistory();
    }

    showHistory() {
        if (this.history.length === 0) {
            showInfo('暂无计算历史记录');
            return;
        }

        // 使用文档片段优化DOM操作
        const fragment = document.createDocumentFragment();
        
        // 创建容器
        const container = document.createElement('div');
        container.className = 'history-container';
        
        // 创建头部
        const header = document.createElement('div');
        header.className = 'history-header';
        header.innerHTML = `
            <h4>计算历史</h4>
            <button class="btn btn-small" onclick="basicCalculator.clearHistory()">清空历史</button>
        `;
        container.appendChild(header);
        
        // 创建列表
        const list = document.createElement('div');
        list.className = 'history-list';
        
        // 分批渲染历史记录
        const batchSize = 20;
        const renderBatch = (startIndex) => {
            const endIndex = Math.min(startIndex + batchSize, this.history.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = this.history[i];
                const itemElement = document.createElement('div');
                itemElement.className = 'history-item';
                itemElement.onclick = () => this.useHistoryResult(i);
                itemElement.innerHTML = `
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${this.formatNumber(item.result)}</div>
                    <div class="history-time">${item.timestamp}</div>
                `;
                list.appendChild(itemElement);
            }
            
            // 使用requestAnimationFrame分批渲染
            if (endIndex < this.history.length) {
                requestAnimationFrame(() => renderBatch(endIndex));
            }
        };
        
        renderBatch(0);
        container.appendChild(list);
        fragment.appendChild(container);
        
        // 显示模态框
        showModal('计算历史', '');
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = '';
        modalContent.appendChild(fragment);
    }

    useHistoryResult(index) {
        if (this.history[index]) {
            this.currentInput = this.history[index].result.toString();
            this.updateDisplay();
            closeModal();
        }
    }

    clearHistory() {
        if (confirm('确定要清空所有计算历史吗？')) {
            this.history = [];
            this.saveHistory();
            closeModal();
            showSuccess('历史记录已清空');
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('basicCalculatorHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('无法保存历史记录:', error);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('basicCalculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('无法加载历史记录:', error);
            this.history = [];
        }
    }

    vibrate(duration = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    // 公共方法供外部调用
    getValue() {
        return parseFloat(this.currentInput);
    }

    setValue(value) {
        this.currentInput = value.toString();
        this.updateDisplay();
    }

    reset() {
        this.clear();
        this.updateDisplay();
        
        // 清理Web Worker
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// 创建全局实例
let basicCalculator;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    basicCalculator = new BasicCalculator();
});

// 导出供其他模块使用
window.BasicCalculator = BasicCalculator;