/**
 * 图形化公式编辑器核心组件
 */

class FormulaEditor {
    constructor() {
        this.currentFormula = [];
        this.mathSymbols = this.initMathSymbols();
        this.mathFunctions = this.initMathFunctions();
        this.variables = new Set();
        this.savedFormulas = this.loadSavedFormulas();
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.renderSymbolPalette();
        this.renderFunctionPalette();
        this.renderVariablePalette();
        this.renderSavedFormulas();
    }

    // 初始化数学符号
    initMathSymbols() {
        return [
            { symbol: '+', name: '加法', type: 'operator', latex: '+' },
            { symbol: '−', name: '减法', type: 'operator', latex: '-' },
            { symbol: '×', name: '乘法', type: 'operator', latex: '\\times' },
            { symbol: '÷', name: '除法', type: 'operator', latex: '\\div' },
            { symbol: '=', name: '等于', type: 'operator', latex: '=' },
            { symbol: '≠', name: '不等于', type: 'operator', latex: '\\neq' },
            { symbol: '<', name: '小于', type: 'operator', latex: '<' },
            { symbol: '>', name: '大于', type: 'operator', latex: '>' },
            { symbol: '≤', name: '小于等于', type: 'operator', latex: '\\leq' },
            { symbol: '≥', name: '大于等于', type: 'operator', latex: '\\geq' },
            { symbol: '±', name: '正负', type: 'operator', latex: '\\pm' },
            { symbol: '∞', name: '无穷大', type: 'operator', latex: '\\infty' },
            { symbol: '√', name: '平方根', type: 'operator', latex: '\\sqrt{}' },
            { symbol: '∛', name: '立方根', type: 'operator', latex: '\\sqrt[3]{}' },
            { symbol: 'x²', name: '平方', type: 'operator', latex: '^2' },
            { symbol: 'x³', name: '立方', type: 'operator', latex: '^3' },
            { symbol: 'xⁿ', name: '幂', type: 'operator', latex: '^{}' },
            { symbol: '(', name: '左括号', type: 'operator', latex: '(' },
            { symbol: ')', name: '右括号', type: 'operator', latex: ')' },
            { symbol: 'π', name: '圆周率', type: 'constant', latex: '\\pi' },
            { symbol: 'e', name: '自然常数', type: 'constant', latex: 'e' },
            { symbol: '∑', name: '求和', type: 'operator', latex: '\\sum' },
            { symbol: '∏', name: '求积', type: 'operator', latex: '\\prod' },
            { symbol: '∫', name: '积分', type: 'operator', latex: '\\int' },
            { symbol: '∂', name: '偏导数', type: 'operator', latex: '\\partial' }
        ];
    }

    // 初始化数学函数
    initMathFunctions() {
        return [
            { name: 'sin', display: 'sin(x)', type: 'function', latex: '\\sin()', args: 1 },
            { name: 'cos', display: 'cos(x)', type: 'function', latex: '\\cos()', args: 1 },
            { name: 'tan', display: 'tan(x)', type: 'function', latex: '\\tan()', args: 1 },
            { name: 'asin', display: 'arcsin(x)', type: 'function', latex: '\\arcsin()', args: 1 },
            { name: 'acos', display: 'arccos(x)', type: 'function', latex: '\\arccos()', args: 1 },
            { name: 'atan', display: 'arctan(x)', type: 'function', latex: '\\arctan()', args: 1 },
            { name: 'log', display: 'log(x)', type: 'function', latex: '\\log()', args: 1 },
            { name: 'ln', display: 'ln(x)', type: 'function', latex: '\\ln()', args: 1 },
            { name: 'exp', display: 'exp(x)', type: 'function', latex: '\\exp()', args: 1 },
            { name: 'sqrt', display: '√(x)', type: 'function', latex: '\\sqrt{}', args: 1 },
            { name: 'abs', display: '|x|', type: 'function', latex: '|{}|', args: 1 },
            { name: 'floor', display: '⌊x⌋', type: 'function', latex: '\\lfloor{}\\rfloor', args: 1 },
            { name: 'ceil', display: '⌈x⌉', type: 'function', latex: '\\lceil{}\\rceil', args: 1 },
            { name: 'round', display: 'round(x)', type: 'function', latex: '\\text{round}()', args: 1 },
            { name: 'max', display: 'max(x,y)', type: 'function', latex: '\\max(,)', args: 2 },
            { name: 'min', display: 'min(x,y)', type: 'function', latex: '\\min(,)', args: 2 },
            { name: 'pow', display: 'pow(x,y)', type: 'function', latex: '{}^{}', args: 2 },
            { name: 'mod', display: 'x mod y', type: 'function', latex: '{} \\bmod {}', args: 2 }
        ];
    }

    // 渲染符号面板
    renderSymbolPalette() {
        const container = document.getElementById('math-symbols');
        container.innerHTML = '';

        this.mathSymbols.forEach(symbol => {
            const element = document.createElement('div');
            element.className = `draggable-item ${symbol.type}`;
            element.draggable = true;
            element.textContent = symbol.symbol;
            element.title = symbol.name;
            element.dataset.type = 'symbol';
            element.dataset.value = symbol.symbol;
            element.dataset.latex = symbol.latex;
            element.dataset.tooltip = symbol.name;
            
            container.appendChild(element);
        });
    }

    // 渲染函数面板
    renderFunctionPalette() {
        const container = document.getElementById('math-functions');
        container.innerHTML = '';

        this.mathFunctions.forEach(func => {
            const element = document.createElement('div');
            element.className = 'draggable-item function';
            element.draggable = true;
            element.textContent = func.display;
            element.title = func.name;
            element.dataset.type = 'function';
            element.dataset.name = func.name;
            element.dataset.display = func.display;
            element.dataset.latex = func.latex;
            element.dataset.args = func.args;
            element.dataset.tooltip = func.name;
            
            container.appendChild(element);
        });
    }

    // 渲染变量面板
    renderVariablePalette() {
        const container = document.getElementById('variables');
        container.innerHTML = '';

        // 默认变量
        const defaultVars = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 't'];
        
        defaultVars.forEach(varName => {
            this.variables.add(varName);
        });

        // 添加自定义变量按钮
        const addVarBtn = document.createElement('button');
        addVarBtn.className = 'btn btn-small btn-secondary';
        addVarBtn.textContent = '+ 添加变量';
        addVarBtn.onclick = () => this.addCustomVariable();
        container.appendChild(addVarBtn);

        // 渲染变量
        this.variables.forEach(varName => {
            const element = document.createElement('div');
            element.className = 'draggable-item variable';
            element.draggable = true;
            element.textContent = varName;
            element.title = `变量 ${varName}`;
            element.dataset.type = 'variable';
            element.dataset.name = varName;
            element.dataset.latex = varName;
            element.dataset.tooltip = `变量 ${varName}`;
            
            container.appendChild(element);
        });
    }

    // 添加自定义变量
    addCustomVariable() {
        const varName = prompt('请输入变量名（单个字母或字母数字组合）:');
        if (varName && /^[a-zA-Z][a-zA-Z0-9]*$/.test(varName)) {
            this.variables.add(varName);
            this.renderVariablePalette();
        } else if (varName) {
            alert('变量名格式不正确，请使用字母开头的字母数字组合');
        }
    }

    // 设置拖拽功能
    setupDragAndDrop() {
        const canvas = document.getElementById('formula-canvas');
        const dropZone = document.getElementById('main-drop-zone');

        // 拖拽开始
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: e.target.dataset.type,
                    value: e.target.dataset.value || e.target.dataset.name,
                    display: e.target.dataset.display || e.target.textContent,
                    latex: e.target.dataset.latex,
                    args: e.target.dataset.args
                }));
            }
        });

        // 拖拽结束
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('draggable-item')) {
                e.target.classList.remove('dragging');
            }
        });

        // 拖拽进入
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        // 拖拽离开
        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        // 放置
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                this.addFormulaElement(data);
            } catch (error) {
                console.error('拖拽数据解析失败:', error);
            }
        });
    }

    // 添加公式元素
    addFormulaElement(elementData) {
        const element = {
            id: Date.now() + Math.random(),
            type: elementData.type,
            value: elementData.value,
            display: elementData.display,
            latex: elementData.latex,
            args: elementData.args ? parseInt(elementData.args) : 0
        };

        this.currentFormula.push(element);
        this.renderFormula();
        this.updatePreview();
        this.validateFormula();
    }

    // 渲染公式
    renderFormula() {
        const dropZone = document.getElementById('main-drop-zone');
        
        if (this.currentFormula.length === 0) {
            dropZone.innerHTML = '<p class="drop-hint">拖拽符号和函数到这里构建公式</p>';
            return;
        }

        const container = document.createElement('div');
        container.className = 'formula-container';

        this.currentFormula.forEach((element, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'formula-element';
            elementDiv.textContent = element.display;
            elementDiv.title = `${element.type}: ${element.value}`;

            // 添加删除按钮
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeFormulaElement(index);
            };
            elementDiv.appendChild(removeBtn);

            // 点击编辑
            elementDiv.onclick = () => this.editFormulaElement(index);

            container.appendChild(elementDiv);
        });

        dropZone.innerHTML = '';
        dropZone.appendChild(container);
    }

    // 移除公式元素
    removeFormulaElement(index) {
        this.currentFormula.splice(index, 1);
        this.renderFormula();
        this.updatePreview();
        this.validateFormula();
    }

    // 编辑公式元素
    editFormulaElement(index) {
        const element = this.currentFormula[index];
        
        if (element.type === 'variable') {
            const newValue = prompt('编辑变量名:', element.value);
            if (newValue && /^[a-zA-Z][a-zA-Z0-9]*$/.test(newValue)) {
                element.value = newValue;
                element.display = newValue;
                element.latex = newValue;
                this.renderFormula();
                this.updatePreview();
            }
        } else if (element.type === 'function' && element.args > 0) {
            // 对于有参数的函数，可以编辑参数
            alert('函数参数编辑功能将在后续版本中实现');
        }
    }

    // 更新预览
    updatePreview() {
        const previewDisplay = document.getElementById('formula-preview');
        const latexCode = document.getElementById('latex-code');
        const latexContainer = document.getElementById('formula-latex');

        if (this.currentFormula.length === 0) {
            previewDisplay.innerHTML = '<span class="preview-placeholder">公式将在这里显示</span>';
            latexContainer.style.display = 'none';
            return;
        }

        // 生成显示文本
        const displayText = this.currentFormula.map(el => el.display).join(' ');
        previewDisplay.textContent = displayText;

        // 生成LaTeX代码
        const latexText = this.generateLatex();
        latexCode.textContent = latexText;
        latexContainer.style.display = 'block';
    }

    // 生成LaTeX代码
    generateLatex() {
        return this.currentFormula.map(el => el.latex).join(' ');
    }

    // 验证公式
    async validateFormula() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const errorsContainer = document.getElementById('validation-errors');

        // 基本验证
        if (this.currentFormula.length === 0) {
            statusIndicator.className = 'status-indicator pending';
            statusText.textContent = '准备就绪';
            errorsContainer.style.display = 'none';
            return true;
        }

        // 设置验证中状态
        statusIndicator.className = 'status-indicator pending';
        statusText.textContent = '验证中...';
        errorsContainer.style.display = 'none';

        try {
            // 使用后端API验证
            const response = await api.formula.validateFormula(this.currentFormula);
            const result = response.data || response;

            if (result.valid) {
                statusIndicator.className = 'status-indicator valid';
                statusText.textContent = '公式有效';
                errorsContainer.style.display = 'none';
                return true;
            } else {
                statusIndicator.className = 'status-indicator invalid';
                statusText.textContent = `发现 ${result.errors.length} 个错误`;
                errorsContainer.innerHTML = `
                    <ul>
                        ${result.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                `;
                errorsContainer.style.display = 'block';
                return false;
            }
        } catch (error) {
            console.error('公式验证失败:', error);
            
            // 回退到客户端验证
            const errors = this.validateFormulaLocally();
            
            if (errors.length === 0) {
                statusIndicator.className = 'status-indicator valid';
                statusText.textContent = '公式有效 (离线验证)';
                errorsContainer.style.display = 'none';
                return true;
            } else {
                statusIndicator.className = 'status-indicator invalid';
                statusText.textContent = `发现 ${errors.length} 个错误 (离线验证)`;
                errorsContainer.innerHTML = `
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                `;
                errorsContainer.style.display = 'block';
                return false;
            }
        }
    }

    // 本地验证公式（备用方法）
    validateFormulaLocally() {
        const errors = [];

        // 检查括号匹配
        const brackets = this.currentFormula.filter(el => 
            el.value === '(' || el.value === ')'
        );
        let openCount = 0;
        for (const bracket of brackets) {
            if (bracket.value === '(') {
                openCount++;
            } else {
                openCount--;
                if (openCount < 0) {
                    errors.push('括号不匹配：右括号多于左括号');
                    break;
                }
            }
        }
        if (openCount > 0) {
            errors.push('括号不匹配：左括号多于右括号');
        }

        // 检查运算符连续
        for (let i = 0; i < this.currentFormula.length - 1; i++) {
            const current = this.currentFormula[i];
            const next = this.currentFormula[i + 1];
            
            if (current.type === 'operator' && next.type === 'operator' &&
                !['(', ')'].includes(current.value) && !['(', ')'].includes(next.value)) {
                errors.push(`位置 ${i + 1}-${i + 2}: 运算符不能连续`);
            }
        }

        return errors;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 验证公式按钮
        document.getElementById('validate-formula').onclick = async () => {
            await this.validateFormula();
        };

        // 清空公式按钮
        document.getElementById('clear-formula').onclick = () => {
            this.clearFormula();
        };

        // 保存公式按钮
        document.getElementById('save-formula').onclick = () => {
            this.saveFormula();
        };

        // 创建计算器按钮
        document.getElementById('create-calculator').onclick = () => {
            this.createCalculator();
        };
    }

    // 清空公式
    clearFormula() {
        if (this.currentFormula.length > 0 && 
            !confirm('确定要清空当前公式吗？')) {
            return;
        }
        
        this.currentFormula = [];
        this.renderFormula();
        this.updatePreview();
        this.validateFormula();
    }

    // 保存公式
    async saveFormula() {
        if (this.currentFormula.length === 0) {
            alert('请先构建公式');
            return;
        }

        const isValid = await this.validateFormula();
        if (!isValid) {
            if (!confirm('公式存在错误，确定要保存吗？')) {
                return;
            }
        }

        const name = prompt('请输入公式名称:');
        if (!name) return;

        const formula = {
            id: Date.now(),
            name: name.trim(),
            formula: [...this.currentFormula],
            latex: this.generateLatex(),
            display: this.currentFormula.map(el => el.display).join(' '),
            created: new Date().toISOString()
        };

        this.savedFormulas.push(formula);
        this.saveTolocalStorage();
        this.renderSavedFormulas();
        
        showMessage('公式保存成功', 'success');
    }

    // 创建计算器
    async createCalculator() {
        if (this.currentFormula.length === 0) {
            alert('请先构建公式');
            return;
        }

        const isValid = await this.validateFormula();
        if (!isValid) {
            alert('请先修复公式中的错误');
            return;
        }

        // 切换到计算器生成器标签页
        if (window.switchTab) {
            window.switchTab('calculator-generator');
            showMessage('公式已准备就绪，请在计算器生成器中配置输入字段', 'success');
        } else {
            alert('请切换到"计算器生成器"标签页继续配置');
        }
    }

    // 渲染已保存的公式
    renderSavedFormulas() {
        const container = document.getElementById('saved-formula-list');
        
        if (this.savedFormulas.length === 0) {
            container.innerHTML = '<p class="no-formulas">暂无保存的公式</p>';
            return;
        }

        container.innerHTML = '';
        
        this.savedFormulas.forEach(formula => {
            const item = document.createElement('div');
            item.className = 'formula-item';
            
            item.innerHTML = `
                <div class="formula-item-header">
                    <h4 class="formula-item-name">${formula.name}</h4>
                    <div class="formula-item-actions">
                        <button class="btn btn-small btn-primary" onclick="formulaEditor.loadFormula('${formula.id}')">加载</button>
                        <button class="btn btn-small btn-info" onclick="formulaEditor.duplicateFormula('${formula.id}')">复制</button>
                        <button class="btn btn-small btn-danger" onclick="formulaEditor.deleteFormula('${formula.id}')">删除</button>
                    </div>
                </div>
                <div class="formula-item-preview">${formula.display}</div>
                <div class="formula-item-meta">
                    <span>创建时间: ${new Date(formula.created).toLocaleString()}</span>
                    <span>元素数量: ${formula.formula.length}</span>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // 加载公式
    loadFormula(formulaId) {
        const formula = this.savedFormulas.find(f => f.id == formulaId);
        if (!formula) return;

        if (this.currentFormula.length > 0 && 
            !confirm('当前公式将被替换，确定要加载吗？')) {
            return;
        }

        this.currentFormula = [...formula.formula];
        this.renderFormula();
        this.updatePreview();
        this.validateFormula();
        
        showMessage('公式加载成功', 'success');
    }

    // 复制公式
    duplicateFormula(formulaId) {
        const formula = this.savedFormulas.find(f => f.id == formulaId);
        if (!formula) return;

        const name = prompt('请输入新公式名称:', formula.name + ' (副本)');
        if (!name) return;

        const newFormula = {
            ...formula,
            id: Date.now(),
            name: name.trim(),
            created: new Date().toISOString()
        };

        this.savedFormulas.push(newFormula);
        this.saveTolocalStorage();
        this.renderSavedFormulas();
        
        showMessage('公式复制成功', 'success');
    }

    // 删除公式
    deleteFormula(formulaId) {
        const formula = this.savedFormulas.find(f => f.id == formulaId);
        if (!formula) return;

        if (!confirm(`确定要删除公式"${formula.name}"吗？`)) {
            return;
        }

        this.savedFormulas = this.savedFormulas.filter(f => f.id != formulaId);
        this.saveTolocalStorage();
        this.renderSavedFormulas();
        
        showMessage('公式删除成功', 'success');
    }

    // 保存到本地存储
    saveTolocalStorage() {
        try {
            localStorage.setItem('formula-editor-formulas', JSON.stringify(this.savedFormulas));
        } catch (error) {
            console.error('保存公式到本地存储失败:', error);
        }
    }

    // 从本地存储加载
    loadSavedFormulas() {
        try {
            const saved = localStorage.getItem('formula-editor-formulas');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('从本地存储加载公式失败:', error);
            return [];
        }
    }

    // 导出公式
    exportFormulas() {
        if (this.savedFormulas.length === 0) {
            alert('没有可导出的公式');
            return;
        }

        const data = {
            version: '1.0',
            exported: new Date().toISOString(),
            formulas: this.savedFormulas
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `formulas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('公式导出成功', 'success');
    }

    // 导入公式
    importFormulas() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.formulas || !Array.isArray(data.formulas)) {
                        throw new Error('无效的公式文件格式');
                    }

                    const importCount = data.formulas.length;
                    if (!confirm(`将导入 ${importCount} 个公式，确定继续吗？`)) {
                        return;
                    }

                    // 为导入的公式生成新ID避免冲突
                    data.formulas.forEach(formula => {
                        formula.id = Date.now() + Math.random();
                        formula.imported = new Date().toISOString();
                    });

                    this.savedFormulas.push(...data.formulas);
                    this.saveTolocalStorage();
                    this.renderSavedFormulas();
                    
                    showMessage(`成功导入 ${importCount} 个公式`, 'success');
                } catch (error) {
                    console.error('导入公式失败:', error);
                    alert('导入失败：' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
}

// 全局实例
let formulaEditor;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('formula-calculator')) {
        formulaEditor = new FormulaEditor();
        window.formulaEditor = formulaEditor; // 供全局访问
    }
});