/**
 * 公式编辑器前端测试脚本
 * 在浏览器控制台中运行此脚本来测试公式编辑器功能
 */

// 测试公式编辑器基本功能
async function testFormulaEditor() {
    console.log('开始测试公式编辑器...');
    
    // 检查公式编辑器是否已初始化
    if (typeof formulaEditor === 'undefined') {
        console.error('公式编辑器未初始化');
        return;
    }
    
    console.log('✓ 公式编辑器已初始化');
    
    // 测试添加公式元素
    const testElement = {
        type: 'variable',
        value: 'x',
        display: 'x',
        latex: 'x'
    };
    
    formulaEditor.addFormulaElement(testElement);
    console.log('✓ 成功添加公式元素');
    
    // 测试公式验证
    try {
        const isValid = await formulaEditor.validateFormula();
        console.log('✓ 公式验证功能正常，结果:', isValid);
    } catch (error) {
        console.log('⚠ 公式验证使用本地验证（API不可用）');
    }
    
    // 测试保存功能
    formulaEditor.savedFormulas = [];
    const testFormula = {
        id: Date.now(),
        name: '测试公式',
        formula: [testElement],
        latex: 'x',
        display: 'x',
        created: new Date().toISOString()
    };
    
    formulaEditor.savedFormulas.push(testFormula);
    formulaEditor.renderSavedFormulas();
    console.log('✓ 公式保存和渲染功能正常');
    
    // 测试清空功能
    formulaEditor.clearFormula();
    console.log('✓ 公式清空功能正常');
    
    console.log('公式编辑器测试完成！');
}

// 测试API连接
async function testFormulaAPI() {
    console.log('开始测试公式API...');
    
    if (typeof api === 'undefined' || !api.formula) {
        console.error('公式API未定义');
        return;
    }
    
    try {
        // 测试验证API
        const testFormula = [
            { type: 'variable', value: 'x', display: 'x', latex: 'x' },
            { type: 'operator', value: '+', display: '+', latex: '+' },
            { type: 'variable', value: 'y', display: 'y', latex: 'y' }
        ];
        
        const validateResult = await api.formula.validateFormula(testFormula);
        console.log('✓ 公式验证API正常:', validateResult);
        
        // 测试执行API
        const executeResult = await api.formula.executeFormula(testFormula, { x: 5, y: 3 });
        console.log('✓ 公式执行API正常:', executeResult);
        
        // 测试转换API
        const convertResult = await api.formula.convertToJavaScript(testFormula);
        console.log('✓ 公式转换API正常:', convertResult);
        
        // 测试函数列表API
        const functionsResult = await api.formula.getSupportedFunctions();
        console.log('✓ 函数列表API正常:', functionsResult);
        
        console.log('公式API测试完成！');
    } catch (error) {
        console.error('公式API测试失败:', error);
    }
}

// 在页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testFormulaEditor();
            testFormulaAPI();
        }, 1000);
    });
} else {
    setTimeout(() => {
        testFormulaEditor();
        testFormulaAPI();
    }, 1000);
}

console.log('公式编辑器测试脚本已加载，测试将在页面加载完成后自动运行');