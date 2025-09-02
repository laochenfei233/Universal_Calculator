/**
 * 公式编辑器相关路由
 */

const express = require('express');
const router = express.Router();
const { validateInput } = require('../utils/validation');
const ResponseUtil = require('../utils/response');
const cache = require('../utils/cache');

// 验证公式语法
router.post('/validate', (req, res) => {
    try {
        const { formula } = req.body;
        
        if (!formula || !Array.isArray(formula)) {
            return ResponseUtil.error(res, '公式数据格式无效', 'VALIDATION_ERROR', 400);
        }

        const errors = validateFormulaStructure(formula);
        
        return ResponseUtil.success(res, {
            valid: errors.length === 0,
            errors: errors,
            formula: formula
        });
    } catch (error) {
        console.error('公式验证错误:', error);
        return ResponseUtil.error(res, '公式验证失败', 'CALCULATION_ERROR', 500);
    }
});

// 执行自定义公式计算
router.post('/execute', (req, res) => {
    try {
        const { formula, variables } = req.body;
        
        if (!formula || !Array.isArray(formula)) {
            return ResponseUtil.error(res, '公式数据格式无效', 'VALIDATION_ERROR', 400);
        }

        if (!variables || typeof variables !== 'object') {
            return ResponseUtil.error(res, '变量数据格式无效', 'VALIDATION_ERROR', 400);
        }

        // 验证公式
        const validationErrors = validateFormulaStructure(formula);
        if (validationErrors.length > 0) {
            return ResponseUtil.error(res, '公式包含错误', 'VALIDATION_ERROR', 400, validationErrors);
        }

        // 执行计算
        const result = executeFormula(formula, variables);
        
        return ResponseUtil.success(res, {
            result: result,
            formula: formula,
            variables: variables
        });
    } catch (error) {
        console.error('公式执行错误:', error);
        return ResponseUtil.error(res, '公式执行失败: ' + error.message, 'CALCULATION_ERROR', 500);
    }
});

// 转换公式为JavaScript表达式
router.post('/to-javascript', (req, res) => {
    try {
        const { formula } = req.body;
        
        if (!formula || !Array.isArray(formula)) {
            return ResponseUtil.error(res, '公式数据格式无效', 'VALIDATION_ERROR', 400);
        }

        const jsExpression = convertToJavaScript(formula);
        
        return ResponseUtil.success(res, {
            javascript: jsExpression,
            formula: formula
        });
    } catch (error) {
        console.error('公式转换错误:', error);
        return ResponseUtil.error(res, '公式转换失败', 'CALCULATION_ERROR', 500);
    }
});

// 获取支持的函数列表
router.get('/functions', (req, res) => {
    const functions = getSupportedFunctions();
    return ResponseUtil.success(res, functions);
});

// 内存存储（生产环境应使用数据库）
const calculatorStorage = new Map();

// 保存自定义计算器
router.post('/save-calculator', (req, res) => {
    try {
        const { calculator } = req.body;
        
        if (!calculator || !calculator.name) {
            return ResponseUtil.error(res, '计算器数据无效', 'VALIDATION_ERROR', 400);
        }

        // 验证计算器配置
        const validationErrors = validateCalculatorConfig(calculator);
        if (validationErrors.length > 0) {
            return ResponseUtil.error(res, '计算器配置错误', 'VALIDATION_ERROR', 400, validationErrors);
        }

        // 生成ID或使用现有ID
        const calculatorId = calculator.id ? calculator.id.toString() : Date.now().toString();
        const savedCalculator = {
            ...calculator,
            id: calculatorId,
            created: calculator.created || new Date().toISOString(),
            updated: new Date().toISOString()
        };

        // 保存到内存存储
        calculatorStorage.set(calculatorId, savedCalculator);
        
        return ResponseUtil.success(res, {
            id: calculatorId,
            message: '计算器保存成功',
            calculator: savedCalculator
        });
    } catch (error) {
        console.error('保存自定义计算器错误:', error);
        return ResponseUtil.error(res, '保存失败', 'SAVE_ERROR', 500);
    }
});

// 获取所有计算器
router.get('/calculators', (req, res) => {
    try {
        const calculators = Array.from(calculatorStorage.values());
        return ResponseUtil.success(res, calculators);
    } catch (error) {
        console.error('获取计算器列表错误:', error);
        return ResponseUtil.error(res, '获取失败', 'FETCH_ERROR', 500);
    }
});

// 获取单个计算器
router.get('/calculator/:id', (req, res) => {
    try {
        const { id } = req.params;
        const calculator = calculatorStorage.get(id);
        
        if (!calculator) {
            return ResponseUtil.error(res, '计算器不存在', 'NOT_FOUND', 404);
        }
        
        return ResponseUtil.success(res, calculator);
    } catch (error) {
        console.error('获取计算器错误:', error);
        return ResponseUtil.error(res, '获取失败', 'FETCH_ERROR', 500);
    }
});

// 更新计算器
router.put('/calculator/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { calculator } = req.body;
        
        if (!calculatorStorage.has(id)) {
            return ResponseUtil.error(res, '计算器不存在', 'NOT_FOUND', 404);
        }
        
        if (!calculator || !calculator.name) {
            return ResponseUtil.error(res, '计算器数据无效', 'VALIDATION_ERROR', 400);
        }

        // 验证计算器配置
        const validationErrors = validateCalculatorConfig(calculator);
        if (validationErrors.length > 0) {
            return ResponseUtil.error(res, '计算器配置错误', 'VALIDATION_ERROR', 400, validationErrors);
        }

        const existingCalculator = calculatorStorage.get(id);
        const updatedCalculator = {
            ...calculator,
            id: id,
            created: existingCalculator.created,
            updated: new Date().toISOString()
        };

        calculatorStorage.set(id, updatedCalculator);
        
        return ResponseUtil.success(res, {
            message: '计算器更新成功',
            calculator: updatedCalculator
        });
    } catch (error) {
        console.error('更新计算器错误:', error);
        return ResponseUtil.error(res, '更新失败', 'UPDATE_ERROR', 500);
    }
});

// 删除计算器
router.delete('/calculator/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!calculatorStorage.has(id)) {
            return ResponseUtil.error(res, '计算器不存在', 'NOT_FOUND', 404);
        }
        
        calculatorStorage.delete(id);
        
        return ResponseUtil.success(res, {
            message: '计算器删除成功'
        });
    } catch (error) {
        console.error('删除计算器错误:', error);
        return ResponseUtil.error(res, '删除失败', 'DELETE_ERROR', 500);
    }
});

// 复制计算器
router.post('/calculator/:id/copy', (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        const originalCalculator = calculatorStorage.get(id);
        if (!originalCalculator) {
            return ResponseUtil.error(res, '原计算器不存在', 'NOT_FOUND', 404);
        }
        
        const newId = Date.now().toString();
        const copiedCalculator = {
            ...originalCalculator,
            id: newId,
            name: name || `${originalCalculator.name} (副本)`,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        calculatorStorage.set(newId, copiedCalculator);
        
        return ResponseUtil.success(res, {
            message: '计算器复制成功',
            calculator: copiedCalculator
        });
    } catch (error) {
        console.error('复制计算器错误:', error);
        return ResponseUtil.error(res, '复制失败', 'COPY_ERROR', 500);
    }
});

// 导出计算器
router.post('/export', (req, res) => {
    try {
        const { calculatorIds } = req.body;
        
        if (!calculatorIds || !Array.isArray(calculatorIds)) {
            return ResponseUtil.error(res, '计算器ID列表无效', 'VALIDATION_ERROR', 400);
        }
        
        const calculators = calculatorIds
            .map(id => calculatorStorage.get(id))
            .filter(calc => calc !== undefined);
        
        if (calculators.length === 0) {
            return ResponseUtil.error(res, '没有找到要导出的计算器', 'NOT_FOUND', 404);
        }
        
        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            calculators: calculators
        };
        
        return ResponseUtil.success(res, exportData);
    } catch (error) {
        console.error('导出计算器错误:', error);
        return ResponseUtil.error(res, '导出失败', 'EXPORT_ERROR', 500);
    }
});

// 导入计算器
router.post('/import', (req, res) => {
    try {
        const { data, overwrite = false } = req.body;
        
        if (!data || !data.calculators || !Array.isArray(data.calculators)) {
            return ResponseUtil.error(res, '导入数据格式无效', 'VALIDATION_ERROR', 400);
        }
        
        const importResults = {
            imported: 0,
            skipped: 0,
            errors: []
        };
        
        data.calculators.forEach((calculator, index) => {
            try {
                // 验证计算器配置
                const validationErrors = validateCalculatorConfig(calculator);
                if (validationErrors.length > 0) {
                    importResults.errors.push(`计算器 ${index + 1}: ${validationErrors.join(', ')}`);
                    importResults.skipped++;
                    return;
                }
                
                // 检查是否已存在
                const existingId = calculator.id;
                if (existingId && calculatorStorage.has(existingId) && !overwrite) {
                    importResults.skipped++;
                    return;
                }
                
                // 生成新ID或使用现有ID
                const calculatorId = (existingId && overwrite) ? existingId : Date.now().toString() + Math.random();
                const importedCalculator = {
                    ...calculator,
                    id: calculatorId,
                    imported: new Date().toISOString(),
                    updated: new Date().toISOString()
                };
                
                calculatorStorage.set(calculatorId, importedCalculator);
                importResults.imported++;
            } catch (error) {
                importResults.errors.push(`计算器 ${index + 1}: ${error.message}`);
                importResults.skipped++;
            }
        });
        
        return ResponseUtil.success(res, {
            message: `导入完成：成功 ${importResults.imported} 个，跳过 ${importResults.skipped} 个`,
            results: importResults
        });
    } catch (error) {
        console.error('导入计算器错误:', error);
        return ResponseUtil.error(res, '导入失败', 'IMPORT_ERROR', 500);
    }
});

// 执行自定义计算器计算
router.post('/execute-custom', (req, res) => {
    try {
        const { formula, values } = req.body;
        
        if (!formula || !Array.isArray(formula) || formula.length === 0) {
            return ResponseUtil.error(res, '公式数据格式无效', 'VALIDATION_ERROR', 400);
        }

        if (!values || typeof values !== 'object') {
            return ResponseUtil.error(res, '输入值格式无效', 'VALIDATION_ERROR', 400);
        }

        // 执行计算
        const result = executeFormula(formula, values);
        
        return ResponseUtil.success(res, {
            result: result,
            formula: formula,
            values: values
        });
    } catch (error) {
        console.error('自定义计算器执行错误:', error);
        return ResponseUtil.error(res, '计算失败: ' + error.message, 'CALCULATION_ERROR', 500);
    }
});

// 验证公式结构
function validateFormulaStructure(formula) {
    const errors = [];
    
    if (formula.length === 0) {
        return errors; // 空公式是有效的
    }

    // 检查括号匹配
    let openParens = 0;
    const parenElements = formula.filter(el => el.value === '(' || el.value === ')');
    
    for (const element of parenElements) {
        if (element.value === '(') {
            openParens++;
        } else if (element.value === ')') {
            openParens--;
            if (openParens < 0) {
                errors.push('括号不匹配：右括号多于左括号');
                break;
            }
        }
    }
    
    if (openParens > 0) {
        errors.push('括号不匹配：左括号多于右括号');
    }

    // 检查运算符连续
    for (let i = 0; i < formula.length - 1; i++) {
        const current = formula[i];
        const next = formula[i + 1];
        
        if (isOperator(current) && isOperator(next) &&
            !['(', ')'].includes(current.value) && !['(', ')'].includes(next.value)) {
            errors.push(`位置 ${i + 1}-${i + 2}: 运算符不能连续`);
        }
    }

    // 检查函数参数
    for (let i = 0; i < formula.length; i++) {
        const element = formula[i];
        if (element.type === 'function') {
            // 简单检查：函数应该有合理的上下文
            if (element.args > 0) {
                // 这里可以添加更复杂的参数验证
            }
        }
    }

    return errors;
}

// 执行公式计算
function executeFormula(formula, variables) {
    try {
        const jsExpression = convertToJavaScript(formula);
        console.log('Generated JS expression:', jsExpression);
        
        // 创建安全的执行环境
        const context = createSafeContext(variables);
        
        // 使用Function构造器创建函数并执行
        const func = new Function('values', 'Math', `return ${jsExpression}`);
        const result = func(variables, Math);
        
        console.log('Calculation result:', result);
        
        // 验证结果
        if (typeof result !== 'number') {
            throw new Error(`计算结果类型错误: ${typeof result}`);
        }
        
        if (!isFinite(result)) {
            if (isNaN(result)) {
                throw new Error('计算结果为NaN');
            } else {
                throw new Error('计算结果为无穷大');
            }
        }
        
        return result;
    } catch (error) {
        throw new Error(`计算错误: ${error.message}`);
    }
}

// 转换公式为JavaScript表达式
function convertToJavaScript(formula) {
    if (!formula || formula.length === 0) {
        throw new Error('公式不能为空');
    }
    
    let expression = '';
    
    for (let i = 0; i < formula.length; i++) {
        const element = formula[i];
        
        switch (element.type) {
            case 'operator':
                if (element.value === 'x²') {
                    // 处理平方运算符，需要前面有操作数
                    expression = expression.trim() + '**2';
                } else if (element.value === 'x³') {
                    expression = expression.trim() + '**3';
                } else {
                    expression += convertOperator(element.value);
                }
                break;
            case 'function':
                expression += convertFunction(element.value || element.name);
                break;
            case 'variable':
                expression += `values.${element.value}`;
                break;
            case 'constant':
                expression += convertConstant(element.value);
                break;
            default:
                expression += element.value;
        }
        
        // 在某些情况下不添加空格
        if (element.value !== '(' && 
            i < formula.length - 1 && 
            formula[i + 1].value !== ')' &&
            element.value &&
            !element.value.toString().endsWith('²') &&
            !element.value.toString().endsWith('³')) {
            expression += ' ';
        }
    }
    
    return expression.trim();
}

// 转换运算符
function convertOperator(operator) {
    const operatorMap = {
        '×': '*',
        '÷': '/',
        '−': '-',
        '√': 'Math.sqrt',
        '∛': '(x) => Math.pow(x, 1/3)',
        'x²': '**2',
        'x³': '**3',
        'xⁿ': '**',
        '±': '+', // 简化处理
        '∞': 'Infinity'
    };
    
    return operatorMap[operator] || operator;
}

// 转换函数
function convertFunction(funcName) {
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
        'pow': 'Math.pow',
        'mod': '%'
    };
    
    return functionMap[funcName] || funcName;
}

// 转换常数
function convertConstant(constant) {
    const constantMap = {
        'π': 'Math.PI',
        'e': 'Math.E'
    };
    
    return constantMap[constant] || constant;
}

// 创建安全的执行上下文
function createSafeContext(variables) {
    const context = {
        // 数学函数
        Math: Math,
        // 用户变量
        ...variables
    };
    
    // 移除危险的全局对象
    delete context.eval;
    delete context.Function;
    delete context.setTimeout;
    delete context.setInterval;
    
    return context;
}

// 检查是否为运算符
function isOperator(element) {
    const operators = ['+', '-', '×', '÷', '*', '/', '=', '≠', '<', '>', '≤', '≥', '±'];
    return element.type === 'operator' && operators.includes(element.value);
}

// 验证计算器配置
function validateCalculatorConfig(calculator) {
    const errors = [];
    
    if (!calculator.name || !calculator.name.trim()) {
        errors.push('计算器名称不能为空');
    }
    
    if (!calculator.inputFields || !Array.isArray(calculator.inputFields)) {
        errors.push('输入字段配置无效');
    } else if (calculator.inputFields.length === 0) {
        errors.push('至少需要一个输入字段');
    } else {
        // 验证每个输入字段
        calculator.inputFields.forEach((field, index) => {
            if (!field.name || !field.name.trim()) {
                errors.push(`字段 ${index + 1}: 字段名称不能为空`);
            }
            
            if (!field.label || !field.label.trim()) {
                errors.push(`字段 ${index + 1}: 显示标签不能为空`);
            }
            
            if (!field.type) {
                errors.push(`字段 ${index + 1}: 字段类型不能为空`);
            }
            
            // 验证选择类型字段的选项
            if ((field.type === 'select' || field.type === 'radio') && 
                (!field.options || field.options.length === 0)) {
                errors.push(`字段 ${index + 1}: 选择类型字段必须配置选项`);
            }
        });
    }
    
    if (!calculator.formula || !Array.isArray(calculator.formula) || calculator.formula.length === 0) {
        errors.push('计算公式不能为空');
    }
    
    return errors;
}

// 获取支持的函数列表
function getSupportedFunctions() {
    return {
        trigonometric: [
            { name: 'sin', description: '正弦函数', args: 1 },
            { name: 'cos', description: '余弦函数', args: 1 },
            { name: 'tan', description: '正切函数', args: 1 },
            { name: 'asin', description: '反正弦函数', args: 1 },
            { name: 'acos', description: '反余弦函数', args: 1 },
            { name: 'atan', description: '反正切函数', args: 1 }
        ],
        logarithmic: [
            { name: 'log', description: '常用对数', args: 1 },
            { name: 'ln', description: '自然对数', args: 1 },
            { name: 'exp', description: '指数函数', args: 1 }
        ],
        algebraic: [
            { name: 'sqrt', description: '平方根', args: 1 },
            { name: 'pow', description: '幂函数', args: 2 },
            { name: 'abs', description: '绝对值', args: 1 }
        ],
        rounding: [
            { name: 'floor', description: '向下取整', args: 1 },
            { name: 'ceil', description: '向上取整', args: 1 },
            { name: 'round', description: '四舍五入', args: 1 }
        ],
        comparison: [
            { name: 'max', description: '最大值', args: 2 },
            { name: 'min', description: '最小值', args: 2 }
        ]
    };
}

module.exports = router;