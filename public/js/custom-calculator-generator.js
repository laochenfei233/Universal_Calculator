/**
 * 自定义计算器生成器
 */

class CustomCalculatorGenerator {
    constructor() {
        this.currentCalculator = {
            id: null,
            name: '',
            description: '',
            formula: [],
            inputFields: [],
            template: 'default',
            styles: {
                theme: 'default',
                primaryColor: '#007bff',
                backgroundColor: '#ffffff',
                textColor: '#333333'
            }
        };
        this.templates = this.initTemplates();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.renderTemplates();
        this.renderStyleOptions();
        await this.loadSavedCalculators();
    }

    // 初始化模板
    initTemplates() {
        return {
            default: {
                name: '默认模板',
                description: '简洁的默认样式',
                layout: 'vertical',
                preview: '/images/template-default.png'
            },
            compact: {
                name: '紧凑模板',
                description: '节省空间的紧凑布局',
                layout: 'horizontal',
                preview: '/images/template-compact.png'
            },
            card: {
                name: '卡片模板',
                description: '现代化的卡片式设计',
                layout: 'card',
                preview: '/images/template-card.png'
            },
            scientific: {
                name: '科学计算模板',
                description: '适合复杂计算的专业模板',
                layout: 'scientific',
                preview: '/images/template-scientific.png'
            }
        };
    }

    // 设置事件监听器
    setupEventListeners() {
        // 基本信息
        document.getElementById('calculator-name').addEventListener('input', (e) => {
            this.currentCalculator.name = e.target.value;
            this.updatePreview();
        });

        document.getElementById('calculator-description').addEventListener('input', (e) => {
            this.currentCalculator.description = e.target.value;
            this.updatePreview();
        });

        // 输入字段管理
        document.getElementById('add-input-field').addEventListener('click', () => {
            this.addInputField();
        });

        // 模板选择
        document.addEventListener('change', (e) => {
            if (e.target.name === 'template') {
                this.currentCalculator.template = e.target.value;
                this.updatePreview();
            }
        });

        // 样式自定义
        document.getElementById('primary-color').addEventListener('change', (e) => {
            this.currentCalculator.styles.primaryColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('background-color').addEventListener('change', (e) => {
            this.currentCalculator.styles.backgroundColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('text-color').addEventListener('change', (e) => {
            this.currentCalculator.styles.textColor = e.target.value;
            this.updatePreview();
        });

        // 操作按钮
        document.getElementById('preview-calculator').addEventListener('click', () => {
            this.previewCalculator();
        });

        document.getElementById('save-calculator').addEventListener('click', () => {
            this.saveCalculator();
        });

        document.getElementById('export-calculator').addEventListener('click', () => {
            this.exportCalculator();
        });

        document.getElementById('reset-generator').addEventListener('click', () => {
            this.resetGenerator();
        });

        // 计算器管理按钮
        document.getElementById('import-calculators')?.addEventListener('click', () => {
            this.importCalculators();
        });

        document.getElementById('export-all-calculators')?.addEventListener('click', () => {
            this.exportAllCalculators();
        });
    }

    // 添加输入字段
    addInputField() {
        const field = {
            id: Date.now() + Math.random(),
            name: '',
            label: '',
            type: 'number',
            required: true,
            placeholder: '',
            defaultValue: '',
            min: '',
            max: '',
            step: '',
            options: [], // for select type
            validation: {
                pattern: '',
                message: ''
            }
        };

        this.currentCalculator.inputFields.push(field);
        this.renderInputFields();
        this.updatePreview();
    }

    // 渲染输入字段配置
    renderInputFields() {
        const container = document.getElementById('input-fields-config');
        container.innerHTML = '';

        if (this.currentCalculator.inputFields.length === 0) {
            container.innerHTML = '<p class="no-fields">暂无输入字段，点击"添加字段"开始配置</p>';
            return;
        }

        this.currentCalculator.inputFields.forEach((field, index) => {
            const fieldElement = this.createFieldConfigElement(field, index);
            container.appendChild(fieldElement);
        });
    }

    // 创建字段配置元素
    createFieldConfigElement(field, index) {
        const div = document.createElement('div');
        div.className = 'field-config';
        div.innerHTML = `
            <div class="field-config-header">
                <h4>字段 ${index + 1}</h4>
                <div class="field-actions">
                    <button class="btn btn-small btn-secondary" onclick="customCalculatorGenerator.moveFieldUp(${index})" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn btn-small btn-secondary" onclick="customCalculatorGenerator.moveFieldDown(${index})" ${index === this.currentCalculator.inputFields.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="btn btn-small btn-danger" onclick="customCalculatorGenerator.removeField(${index})">删除</button>
                </div>
            </div>
            
            <div class="field-config-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>字段名称</label>
                        <input type="text" value="${field.name}" onchange="customCalculatorGenerator.updateField(${index}, 'name', this.value)" placeholder="变量名（如：radius）">
                    </div>
                    <div class="form-group">
                        <label>显示标签</label>
                        <input type="text" value="${field.label}" onchange="customCalculatorGenerator.updateField(${index}, 'label', this.value)" placeholder="显示名称（如：半径）">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>字段类型</label>
                        <select onchange="customCalculatorGenerator.updateFieldType(${index}, this.value)">
                            <option value="number" ${field.type === 'number' ? 'selected' : ''}>数字</option>
                            <option value="text" ${field.type === 'text' ? 'selected' : ''}>文本</option>
                            <option value="select" ${field.type === 'select' ? 'selected' : ''}>下拉选择</option>
                            <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>单选按钮</option>
                            <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>复选框</option>
                            <option value="range" ${field.type === 'range' ? 'selected' : ''}>滑块</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" ${field.required ? 'checked' : ''} onchange="customCalculatorGenerator.updateField(${index}, 'required', this.checked)">
                            必填字段
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>占位符文本</label>
                    <input type="text" value="${field.placeholder}" onchange="customCalculatorGenerator.updateField(${index}, 'placeholder', this.value)" placeholder="输入提示文本">
                </div>
                
                <div class="form-group">
                    <label>默认值</label>
                    <input type="text" value="${field.defaultValue}" onchange="customCalculatorGenerator.updateField(${index}, 'defaultValue', this.value)" placeholder="默认值">
                </div>
                
                ${this.renderFieldTypeSpecificOptions(field, index)}
            </div>
        `;
        
        return div;
    }

    // 渲染字段类型特定选项
    renderFieldTypeSpecificOptions(field, index) {
        switch (field.type) {
            case 'number':
            case 'range':
                return `
                    <div class="form-row">
                        <div class="form-group">
                            <label>最小值</label>
                            <input type="number" value="${field.min}" onchange="customCalculatorGenerator.updateField(${index}, 'min', this.value)" placeholder="最小值">
                        </div>
                        <div class="form-group">
                            <label>最大值</label>
                            <input type="number" value="${field.max}" onchange="customCalculatorGenerator.updateField(${index}, 'max', this.value)" placeholder="最大值">
                        </div>
                        <div class="form-group">
                            <label>步长</label>
                            <input type="number" value="${field.step}" onchange="customCalculatorGenerator.updateField(${index}, 'step', this.value)" placeholder="步长">
                        </div>
                    </div>
                `;
            case 'select':
            case 'radio':
                return `
                    <div class="form-group">
                        <label>选项配置</label>
                        <div class="options-config">
                            <textarea onchange="customCalculatorGenerator.updateFieldOptions(${index}, this.value)" placeholder="每行一个选项，格式：值|显示文本">${field.options.map(opt => `${opt.value}|${opt.text}`).join('\n')}</textarea>
                            <small class="form-help">示例：<br>1|选项一<br>2|选项二</small>
                        </div>
                    </div>
                `;
            case 'text':
                return `
                    <div class="form-group">
                        <label>验证规则</label>
                        <div class="form-row">
                            <div class="form-group">
                                <label>正则表达式</label>
                                <input type="text" value="${field.validation.pattern}" onchange="customCalculatorGenerator.updateFieldValidation(${index}, 'pattern', this.value)" placeholder="验证正则表达式">
                            </div>
                            <div class="form-group">
                                <label>错误提示</label>
                                <input type="text" value="${field.validation.message}" onchange="customCalculatorGenerator.updateFieldValidation(${index}, 'message', this.value)" placeholder="验证失败提示">
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    // 更新字段属性
    updateField(index, property, value) {
        if (this.currentCalculator.inputFields[index]) {
            this.currentCalculator.inputFields[index][property] = value;
            this.updatePreview();
        }
    }

    // 更新字段类型
    updateFieldType(index, type) {
        if (this.currentCalculator.inputFields[index]) {
            this.currentCalculator.inputFields[index].type = type;
            
            // 重置类型特定属性
            if (type !== 'number' && type !== 'range') {
                this.currentCalculator.inputFields[index].min = '';
                this.currentCalculator.inputFields[index].max = '';
                this.currentCalculator.inputFields[index].step = '';
            }
            
            if (type !== 'select' && type !== 'radio') {
                this.currentCalculator.inputFields[index].options = [];
            }
            
            if (type !== 'text') {
                this.currentCalculator.inputFields[index].validation = { pattern: '', message: '' };
            }
            
            this.renderInputFields();
            this.updatePreview();
        }
    }

    // 更新字段选项
    updateFieldOptions(index, optionsText) {
        if (this.currentCalculator.inputFields[index]) {
            const options = optionsText.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [value, text] = line.split('|');
                    return {
                        value: value ? value.trim() : '',
                        text: text ? text.trim() : value ? value.trim() : ''
                    };
                });
            
            this.currentCalculator.inputFields[index].options = options;
            this.updatePreview();
        }
    }

    // 更新字段验证规则
    updateFieldValidation(index, property, value) {
        if (this.currentCalculator.inputFields[index]) {
            this.currentCalculator.inputFields[index].validation[property] = value;
            this.updatePreview();
        }
    }

    // 移动字段位置
    moveFieldUp(index) {
        if (index > 0) {
            const fields = this.currentCalculator.inputFields;
            [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
            this.renderInputFields();
            this.updatePreview();
        }
    }

    moveFieldDown(index) {
        if (index < this.currentCalculator.inputFields.length - 1) {
            const fields = this.currentCalculator.inputFields;
            [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
            this.renderInputFields();
            this.updatePreview();
        }
    }

    // 删除字段
    removeField(index) {
        if (confirm('确定要删除这个字段吗？')) {
            this.currentCalculator.inputFields.splice(index, 1);
            this.renderInputFields();
            this.updatePreview();
        }
    }

    // 渲染模板选择
    renderTemplates() {
        const container = document.getElementById('template-selection');
        container.innerHTML = '';

        Object.entries(this.templates).forEach(([key, template]) => {
            const templateElement = document.createElement('div');
            templateElement.className = 'template-option';
            templateElement.innerHTML = `
                <label class="template-label">
                    <input type="radio" name="template" value="${key}" ${this.currentCalculator.template === key ? 'checked' : ''}>
                    <div class="template-card">
                        <div class="template-preview">
                            <div class="template-placeholder">${template.name}</div>
                        </div>
                        <div class="template-info">
                            <h4>${template.name}</h4>
                            <p>${template.description}</p>
                        </div>
                    </div>
                </label>
            `;
            container.appendChild(templateElement);
        });
    }

    // 渲染样式选项
    renderStyleOptions() {
        // 主题预设
        const themes = {
            default: { primary: '#007bff', background: '#ffffff', text: '#333333' },
            dark: { primary: '#17a2b8', background: '#343a40', text: '#ffffff' },
            green: { primary: '#28a745', background: '#f8f9fa', text: '#495057' },
            purple: { primary: '#6f42c1', background: '#ffffff', text: '#333333' }
        };

        const themeContainer = document.getElementById('theme-presets');
        themeContainer.innerHTML = '';

        Object.entries(themes).forEach(([key, theme]) => {
            const button = document.createElement('button');
            button.className = 'btn btn-small theme-preset';
            button.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            button.style.backgroundColor = theme.primary;
            button.style.color = theme.background;
            button.onclick = () => this.applyTheme(theme);
            themeContainer.appendChild(button);
        });
    }

    // 应用主题
    applyTheme(theme) {
        this.currentCalculator.styles.primaryColor = theme.primary;
        this.currentCalculator.styles.backgroundColor = theme.background;
        this.currentCalculator.styles.textColor = theme.text;

        // 更新颜色选择器
        document.getElementById('primary-color').value = theme.primary;
        document.getElementById('background-color').value = theme.background;
        document.getElementById('text-color').value = theme.text;

        this.updatePreview();
    }

    // 更新预览
    updatePreview() {
        const preview = document.getElementById('calculator-preview');
        const html = this.generateCalculatorHTML();
        preview.innerHTML = html;
        this.applyPreviewStyles();
    }

    // 生成计算器HTML
    generateCalculatorHTML() {
        const template = this.templates[this.currentCalculator.template];
        
        let html = `
            <div class="custom-calculator ${template.layout}">
                <div class="calculator-header">
                    <h3>${this.currentCalculator.name || '未命名计算器'}</h3>
                    ${this.currentCalculator.description ? `<p class="calculator-description">${this.currentCalculator.description}</p>` : ''}
                </div>
                
                <div class="calculator-body">
                    <form class="calculator-form" id="custom-calc-form">
        `;

        // 生成输入字段
        this.currentCalculator.inputFields.forEach(field => {
            html += this.generateFieldHTML(field);
        });

        html += `
                        <div class="calculator-actions">
                            <button type="button" class="btn btn-primary" onclick="executeCustomCalculation()">计算</button>
                            <button type="button" class="btn btn-secondary" onclick="clearCustomCalculation()">清除</button>
                        </div>
                    </form>
                    
                    <div class="calculator-result" id="custom-calc-result" style="display: none;">
                        <h4>计算结果</h4>
                        <div class="result-value" id="custom-calc-value"></div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // 生成字段HTML
    generateFieldHTML(field) {
        let html = `<div class="form-group">`;
        
        if (field.label) {
            html += `<label for="field-${field.id}">${field.label}${field.required ? ' *' : ''}</label>`;
        }

        switch (field.type) {
            case 'number':
                html += `<input type="number" id="field-${field.id}" name="${field.name}" 
                    placeholder="${field.placeholder}" 
                    ${field.defaultValue ? `value="${field.defaultValue}"` : ''}
                    ${field.min ? `min="${field.min}"` : ''}
                    ${field.max ? `max="${field.max}"` : ''}
                    ${field.step ? `step="${field.step}"` : ''}
                    ${field.required ? 'required' : ''}>`;
                break;
                
            case 'text':
                html += `<input type="text" id="field-${field.id}" name="${field.name}" 
                    placeholder="${field.placeholder}" 
                    ${field.defaultValue ? `value="${field.defaultValue}"` : ''}
                    ${field.validation.pattern ? `pattern="${field.validation.pattern}"` : ''}
                    ${field.required ? 'required' : ''}>`;
                break;
                
            case 'select':
                html += `<select id="field-${field.id}" name="${field.name}" ${field.required ? 'required' : ''}>`;
                if (!field.required) {
                    html += `<option value="">请选择...</option>`;
                }
                field.options.forEach(option => {
                    html += `<option value="${option.value}" ${option.value === field.defaultValue ? 'selected' : ''}>${option.text}</option>`;
                });
                html += `</select>`;
                break;
                
            case 'radio':
                field.options.forEach(option => {
                    html += `
                        <label class="radio-label">
                            <input type="radio" name="${field.name}" value="${option.value}" 
                                ${option.value === field.defaultValue ? 'checked' : ''}
                                ${field.required ? 'required' : ''}>
                            <span>${option.text}</span>
                        </label>
                    `;
                });
                break;
                
            case 'checkbox':
                html += `
                    <label class="checkbox-label">
                        <input type="checkbox" id="field-${field.id}" name="${field.name}" 
                            ${field.defaultValue === 'true' ? 'checked' : ''}
                            ${field.required ? 'required' : ''}>
                        <span>${field.placeholder || '选择此项'}</span>
                    </label>
                `;
                break;
                
            case 'range':
                html += `
                    <input type="range" id="field-${field.id}" name="${field.name}" 
                        ${field.min ? `min="${field.min}"` : 'min="0"'}
                        ${field.max ? `max="${field.max}"` : 'max="100"'}
                        ${field.step ? `step="${field.step}"` : 'step="1"'}
                        ${field.defaultValue ? `value="${field.defaultValue}"` : ''}
                        oninput="document.getElementById('range-value-${field.id}').textContent = this.value">
                    <div class="range-value">当前值: <span id="range-value-${field.id}">${field.defaultValue || field.min || '0'}</span></div>
                `;
                break;
        }

        html += `</div>`;
        return html;
    }

    // 应用预览样式
    applyPreviewStyles() {
        const preview = document.getElementById('calculator-preview');
        const styles = this.currentCalculator.styles;
        
        preview.style.setProperty('--primary-color', styles.primaryColor);
        preview.style.setProperty('--background-color', styles.backgroundColor);
        preview.style.setProperty('--text-color', styles.textColor);
    }

    // 预览计算器
    previewCalculator() {
        if (!this.validateCalculator()) {
            return;
        }

        // 在新窗口中打开预览
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        const html = this.generateFullCalculatorHTML();
        
        previewWindow.document.write(html);
        previewWindow.document.close();
    }

    // 生成完整的计算器HTML（用于预览和导出）
    generateFullCalculatorHTML() {
        return `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${this.currentCalculator.name || '自定义计算器'}</title>
                <style>
                    ${this.generateCalculatorCSS()}
                </style>
            </head>
            <body>
                ${this.generateCalculatorHTML()}
                <script>
                    ${this.generateCalculatorJS()}
                </script>
            </body>
            </html>
        `;
    }

    // 生成计算器CSS
    generateCalculatorCSS() {
        const styles = this.currentCalculator.styles;
        return `
            :root {
                --primary-color: ${styles.primaryColor};
                --background-color: ${styles.backgroundColor};
                --text-color: ${styles.textColor};
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            .custom-calculator {
                max-width: 600px;
                margin: 0 auto;
                background: var(--background-color);
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 20px;
            }
            
            .calculator-header h3 {
                margin: 0 0 10px 0;
                color: var(--primary-color);
            }
            
            .calculator-description {
                margin: 0 0 20px 0;
                opacity: 0.8;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
            }
            
            .radio-label,
            .checkbox-label {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                cursor: pointer;
            }
            
            .radio-label input,
            .checkbox-label input {
                width: auto;
                margin-right: 8px;
            }
            
            .range-value {
                margin-top: 5px;
                font-size: 12px;
                color: var(--primary-color);
            }
            
            .calculator-actions {
                margin-top: 20px;
                display: flex;
                gap: 10px;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background-color: var(--primary-color);
                color: white;
            }
            
            .btn-primary:hover {
                opacity: 0.9;
            }
            
            .btn-secondary {
                background-color: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background-color: #5a6268;
            }
            
            .calculator-result {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
                border-left: 4px solid var(--primary-color);
            }
            
            .result-value {
                font-size: 18px;
                font-weight: bold;
                color: var(--primary-color);
            }
            
            .compact {
                max-width: 400px;
            }
            
            .compact .form-group {
                margin-bottom: 10px;
            }
            
            .card {
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            
            .scientific {
                max-width: 800px;
            }
            
            .scientific .calculator-form {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .scientific .calculator-actions {
                grid-column: 1 / -1;
            }
        `;
    }

    // 生成计算器JavaScript
    generateCalculatorJS() {
        const formula = this.currentCalculator.formula;
        const formulaJS = formula.length > 0 ? this.convertFormulaToJS(formula) : 'return 0;';
        
        return `
            function executeCustomCalculation() {
                try {
                    const form = document.getElementById('custom-calc-form');
                    const formData = new FormData(form);
                    const values = {};
                    
                    // 收集表单数据
                    for (let [key, value] of formData.entries()) {
                        if (values[key]) {
                            // 处理多选情况
                            if (Array.isArray(values[key])) {
                                values[key].push(value);
                            } else {
                                values[key] = [values[key], value];
                            }
                        } else {
                            values[key] = value;
                        }
                    }
                    
                    // 转换数值类型
                    Object.keys(values).forEach(key => {
                        const value = values[key];
                        if (!isNaN(value) && value !== '') {
                            values[key] = parseFloat(value);
                        }
                    });
                    
                    // 执行计算
                    const result = calculateResult(values);
                    
                    // 显示结果
                    document.getElementById('custom-calc-result').style.display = 'block';
                    document.getElementById('custom-calc-value').textContent = result;
                    
                } catch (error) {
                    alert('计算错误: ' + error.message);
                }
            }
            
            function calculateResult(values) {
                // 自定义计算逻辑
                ${formulaJS}
            }
            
            function clearCustomCalculation() {
                document.getElementById('custom-calc-form').reset();
                document.getElementById('custom-calc-result').style.display = 'none';
            }
        `;
    }

    // 将公式转换为JavaScript代码
    convertFormulaToJS(formula) {
        if (formula.length === 0) {
            return 'return 0;';
        }

        // 这里应该使用与formula.js路由相同的转换逻辑
        // 简化版本，实际应该调用后端API
        let expression = '';
        
        for (const element of formula) {
            switch (element.type) {
                case 'operator':
                    expression += this.convertOperator(element.value);
                    break;
                case 'function':
                    expression += this.convertFunction(element.value || element.name);
                    break;
                case 'variable':
                    expression += `values.${element.value}`;
                    break;
                case 'constant':
                    expression += this.convertConstant(element.value);
                    break;
                default:
                    expression += element.value;
            }
            expression += ' ';
        }
        
        return `return ${expression.trim()};`;
    }

    // 转换运算符（与后端保持一致）
    convertOperator(operator) {
        const operatorMap = {
            '×': '*',
            '÷': '/',
            '−': '-',
            '√': 'Math.sqrt',
            'x²': '**2',
            'x³': '**3',
            'xⁿ': '**',
            '±': '+',
            '∞': 'Infinity'
        };
        
        return operatorMap[operator] || operator;
    }

    // 转换函数（与后端保持一致）
    convertFunction(funcName) {
        const functionMap = {
            'sin': 'Math.sin',
            'cos': 'Math.cos',
            'tan': 'Math.tan',
            'asin': 'Math.asin',
            'acos': 'Math.acos',
            'atan': 'Math.atan',
            'log': 'Math.log10',
            'ln': 'Math.log',
            'exp': 'Math.exp',
            'sqrt': 'Math.sqrt',
            'abs': 'Math.abs',
            'floor': 'Math.floor',
            'ceil': 'Math.ceil',
            'round': 'Math.round',
            'max': 'Math.max',
            'min': 'Math.min',
            'pow': 'Math.pow'
        };
        
        return functionMap[funcName] || funcName;
    }

    // 转换常数（与后端保持一致）
    convertConstant(constant) {
        const constantMap = {
            'π': 'Math.PI',
            'e': 'Math.E'
        };
        
        return constantMap[constant] || constant;
    }

    // 验证计算器配置
    validateCalculator() {
        const errors = [];

        if (!this.currentCalculator.name.trim()) {
            errors.push('请输入计算器名称');
        }

        if (this.currentCalculator.inputFields.length === 0) {
            errors.push('请至少添加一个输入字段');
        }

        // 验证字段配置
        this.currentCalculator.inputFields.forEach((field, index) => {
            if (!field.name.trim()) {
                errors.push(`字段 ${index + 1}: 请输入字段名称`);
            }
            
            if (!field.label.trim()) {
                errors.push(`字段 ${index + 1}: 请输入显示标签`);
            }
            
            if ((field.type === 'select' || field.type === 'radio') && field.options.length === 0) {
                errors.push(`字段 ${index + 1}: 请配置选项`);
            }
        });

        if (this.currentCalculator.formula.length === 0) {
            errors.push('请在公式编辑器中构建计算公式');
        }

        if (errors.length > 0) {
            alert('配置错误:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // 保存计算器
    async saveCalculator() {
        if (!this.validateCalculator()) {
            return;
        }

        try {
            const response = await api.formula.saveCalculator(this.currentCalculator);
            
            if (response.success) {
                this.currentCalculator.id = response.data.id;
                this.currentCalculator.created = response.data.calculator.created;
                this.currentCalculator.updated = response.data.calculator.updated;
                
                showMessage('计算器保存成功', 'success');
                this.loadSavedCalculators();
            } else {
                showMessage('保存失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('保存计算器失败:', error);
            // 回退到本地存储
            this.saveCalculatorLocally();
        }
    }

    // 本地保存计算器（备用方法）
    saveCalculatorLocally() {
        try {
            const calculatorData = {
                ...this.currentCalculator,
                id: this.currentCalculator.id || Date.now(),
                created: this.currentCalculator.created || new Date().toISOString(),
                updated: new Date().toISOString()
            };

            const savedCalculators = this.getSavedCalculators();
            const existingIndex = savedCalculators.findIndex(calc => calc.id === calculatorData.id);
            
            if (existingIndex >= 0) {
                savedCalculators[existingIndex] = calculatorData;
            } else {
                savedCalculators.push(calculatorData);
            }

            localStorage.setItem('custom-calculators', JSON.stringify(savedCalculators));
            this.currentCalculator.id = calculatorData.id;
            
            showMessage('计算器保存成功 (本地)', 'success');
        } catch (error) {
            console.error('本地保存失败:', error);
            showMessage('保存失败: ' + error.message, 'error');
        }
    }

    // 加载已保存的计算器列表
    async loadSavedCalculators() {
        try {
            const response = await api.formula.getCalculators();
            
            if (response.success) {
                this.savedCalculators = response.data || [];
                this.renderSavedCalculators();
            }
        } catch (error) {
            console.error('加载计算器列表失败:', error);
            // 回退到本地存储
            this.savedCalculators = this.getSavedCalculators();
            this.renderSavedCalculators();
        }
    }

    // 渲染已保存的计算器
    renderSavedCalculators() {
        const container = document.getElementById('saved-calculators-list');
        if (!container) return;
        
        if (this.savedCalculators.length === 0) {
            container.innerHTML = '<p class="no-calculators">暂无保存的计算器</p>';
            return;
        }

        container.innerHTML = '';
        
        this.savedCalculators.forEach(calculator => {
            const item = document.createElement('div');
            item.className = 'calculator-item';
            
            item.innerHTML = `
                <div class="calculator-item-header">
                    <h4 class="calculator-item-name">${calculator.name}</h4>
                    <div class="calculator-item-actions">
                        <button class="btn btn-small btn-primary" onclick="customCalculatorGenerator.loadCalculator('${calculator.id}')">编辑</button>
                        <button class="btn btn-small btn-info" onclick="customCalculatorGenerator.copyCalculator('${calculator.id}')">复制</button>
                        <button class="btn btn-small btn-secondary" onclick="customCalculatorGenerator.exportSingleCalculator('${calculator.id}')">导出</button>
                        <button class="btn btn-small btn-danger" onclick="customCalculatorGenerator.deleteCalculator('${calculator.id}')">删除</button>
                    </div>
                </div>
                <div class="calculator-item-preview">${calculator.description || '无描述'}</div>
                <div class="calculator-item-meta">
                    <span>创建时间: ${new Date(calculator.created).toLocaleString()}</span>
                    <span>字段数量: ${calculator.inputFields.length}</span>
                    <span>模板: ${calculator.template}</span>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // 加载计算器进行编辑
    async loadCalculator(calculatorId) {
        try {
            const response = await api.formula.getCalculator(calculatorId);
            
            if (response.success) {
                if (this.hasUnsavedChanges() && 
                    !confirm('当前计算器有未保存的更改，确定要加载其他计算器吗？')) {
                    return;
                }
                
                this.currentCalculator = { ...response.data };
                this.updateFormFields();
                this.renderInputFields();
                this.updatePreview();
                
                showMessage('计算器加载成功', 'success');
            } else {
                showMessage('加载失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('加载计算器失败:', error);
            // 回退到本地存储
            const localCalculators = this.getSavedCalculators();
            const calculator = localCalculators.find(c => c.id == calculatorId);
            if (calculator) {
                this.currentCalculator = { ...calculator };
                this.updateFormFields();
                this.renderInputFields();
                this.updatePreview();
                showMessage('计算器加载成功 (本地)', 'success');
            } else {
                showMessage('加载失败: 计算器不存在', 'error');
            }
        }
    }

    // 复制计算器
    async copyCalculator(calculatorId) {
        const name = prompt('请输入新计算器名称:');
        if (!name) return;

        try {
            const response = await api.formula.copyCalculator(calculatorId, name.trim());
            
            if (response.success) {
                showMessage('计算器复制成功', 'success');
                this.loadSavedCalculators();
            } else {
                showMessage('复制失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('复制计算器失败:', error);
            showMessage('复制失败: ' + error.message, 'error');
        }
    }

    // 删除计算器
    async deleteCalculator(calculatorId) {
        const calculator = this.savedCalculators.find(c => c.id == calculatorId);
        if (!calculator) return;

        if (!confirm(`确定要删除计算器"${calculator.name}"吗？此操作不可撤销。`)) {
            return;
        }

        try {
            const response = await api.formula.deleteCalculator(calculatorId);
            
            if (response.success) {
                showMessage('计算器删除成功', 'success');
                this.loadSavedCalculators();
                
                // 如果删除的是当前编辑的计算器，清空编辑器
                if (this.currentCalculator.id == calculatorId) {
                    this.resetGenerator();
                }
            } else {
                showMessage('删除失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('删除计算器失败:', error);
            showMessage('删除失败: ' + error.message, 'error');
        }
    }

    // 导出单个计算器
    async exportSingleCalculator(calculatorId) {
        try {
            const response = await api.formula.exportCalculators([calculatorId]);
            
            if (response.success) {
                this.downloadExportData(response.data, `calculator-${calculatorId}.json`);
                showMessage('计算器导出成功', 'success');
            } else {
                showMessage('导出失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('导出计算器失败:', error);
            showMessage('导出失败: ' + error.message, 'error');
        }
    }

    // 批量导出计算器
    async exportAllCalculators() {
        if (this.savedCalculators.length === 0) {
            alert('没有可导出的计算器');
            return;
        }

        const calculatorIds = this.savedCalculators.map(c => c.id);
        
        try {
            const response = await api.formula.exportCalculators(calculatorIds);
            
            if (response.success) {
                this.downloadExportData(response.data, `all-calculators-${new Date().toISOString().split('T')[0]}.json`);
                showMessage('所有计算器导出成功', 'success');
            } else {
                showMessage('导出失败: ' + response.message, 'error');
            }
        } catch (error) {
            console.error('导出计算器失败:', error);
            showMessage('导出失败: ' + error.message, 'error');
        }
    }

    // 导入计算器
    async importCalculators() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await this.readFileAsText(file);
                const data = JSON.parse(text);
                
                if (!data.calculators || !Array.isArray(data.calculators)) {
                    throw new Error('无效的计算器文件格式');
                }

                const overwrite = confirm(`将导入 ${data.calculators.length} 个计算器。是否覆盖同名计算器？`);
                
                const response = await api.formula.importCalculators(data, overwrite);
                
                if (response.success) {
                    showMessage(response.data.message, 'success');
                    this.loadSavedCalculators();
                    
                    if (response.data.results.errors.length > 0) {
                        console.warn('导入警告:', response.data.results.errors);
                    }
                } else {
                    showMessage('导入失败: ' + response.message, 'error');
                }
            } catch (error) {
                console.error('导入计算器失败:', error);
                showMessage('导入失败: ' + error.message, 'error');
            }
        };
        
        input.click();
    }

    // 检查是否有未保存的更改
    hasUnsavedChanges() {
        return this.currentCalculator.name && 
               (!this.currentCalculator.id || !this.currentCalculator.updated);
    }

    // 更新表单字段
    updateFormFields() {
        document.getElementById('calculator-name').value = this.currentCalculator.name || '';
        document.getElementById('calculator-description').value = this.currentCalculator.description || '';
        
        // 更新模板选择
        const templateRadios = document.querySelectorAll('input[name="template"]');
        templateRadios.forEach(radio => {
            radio.checked = radio.value === this.currentCalculator.template;
        });
        
        // 更新样式选择
        document.getElementById('primary-color').value = this.currentCalculator.styles.primaryColor;
        document.getElementById('background-color').value = this.currentCalculator.styles.backgroundColor;
        document.getElementById('text-color').value = this.currentCalculator.styles.textColor;
    }

    // 下载导出数据
    downloadExportData(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 读取文件为文本
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // 导出计算器
    exportCalculator() {
        if (!this.validateCalculator()) {
            return;
        }

        const html = this.generateFullCalculatorHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentCalculator.name || 'custom-calculator'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('计算器导出成功', 'success');
    }

    // 重置生成器
    resetGenerator() {
        if (confirm('确定要重置所有配置吗？这将清除当前的所有设置。')) {
            this.currentCalculator = {
                id: null,
                name: '',
                description: '',
                formula: [],
                inputFields: [],
                template: 'default',
                styles: {
                    theme: 'default',
                    primaryColor: '#007bff',
                    backgroundColor: '#ffffff',
                    textColor: '#333333'
                }
            };

            // 重置表单
            document.getElementById('calculator-name').value = '';
            document.getElementById('calculator-description').value = '';
            document.getElementById('primary-color').value = '#007bff';
            document.getElementById('background-color').value = '#ffffff';
            document.getElementById('text-color').value = '#333333';

            // 重新渲染
            this.renderInputFields();
            this.renderTemplates();
            this.updatePreview();
            
            showMessage('生成器已重置', 'info');
        }
    }

    // 获取本地保存的计算器（备用方法）
    getSavedCalculators() {
        try {
            const saved = localStorage.getItem('custom-calculators');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('获取本地计算器失败:', error);
            return [];
        }
    }

    // 从公式编辑器获取公式
    getFormulaFromEditor() {
        if (window.formulaEditor && window.formulaEditor.currentFormula) {
            this.currentCalculator.formula = [...window.formulaEditor.currentFormula];
            this.updatePreview();
            showMessage('公式已导入', 'success');
        } else {
            alert('请先在公式编辑器中构建公式');
        }
    }

    // 获取已保存的计算器
    getSavedCalculators() {
        try {
            const saved = localStorage.getItem('custom-calculators');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('加载已保存计算器失败:', error);
            return [];
        }
    }

    // 加载计算器配置
    loadCalculator(calculatorId) {
        const savedCalculators = this.getSavedCalculators();
        const calculator = savedCalculators.find(calc => calc.id === calculatorId);
        
        if (calculator) {
            this.currentCalculator = { ...calculator };
            
            // 更新表单
            document.getElementById('calculator-name').value = calculator.name;
            document.getElementById('calculator-description').value = calculator.description;
            document.getElementById('primary-color').value = calculator.styles.primaryColor;
            document.getElementById('background-color').value = calculator.styles.backgroundColor;
            document.getElementById('text-color').value = calculator.styles.textColor;
            
            // 重新渲染
            this.renderInputFields();
            this.renderTemplates();
            this.updatePreview();
            
            showMessage('计算器配置已加载', 'success');
        }
    }
}

// 全局实例
let customCalculatorGenerator;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('custom-calculator-generator')) {
        customCalculatorGenerator = new CustomCalculatorGenerator();
        window.customCalculatorGenerator = customCalculatorGenerator;
    }
});