// Web Worker处理复杂计算
self.addEventListener('message', (e) => {
  const { expression, type, angleMode } = e.data;
  
  try {
    // 模拟复杂计算
    const startTime = performance.now();
    const result = evaluateExpression(expression, type, angleMode);
    const duration = performance.now() - startTime;
    
    self.postMessage({
      success: true,
      result,
      duration
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
});

// 模拟表达式求值
function evaluateExpression(expression, type, angleMode) {
  // 这里应该是实际的表达式解析和计算逻辑
  // 为了示例简化处理
  
  if (type === 'basic') {
    // 简单四则运算
    return eval(expression); // 注意: 实际应用中应使用更安全的解析器
  } else {
    // 科学计算
    const radians = angleMode === 'degrees' ? 
      degrees => degrees * Math.PI / 180 : 
      radians => radians;
      
    const funcs = {
      sin: x => Math.sin(radians(x)),
      cos: x => Math.cos(radians(x)),
      tan: x => Math.tan(radians(x)),
      sqrt: Math.sqrt,
      log: Math.log10,
      ln: Math.log,
      pi: Math.PI,
      e: Math.E
    };
    
    // 替换表达式中的函数调用
    let evalExpr = expression;
    for (const [name, fn] of Object.entries(funcs)) {
      evalExpr = evalExpr.replace(new RegExp(name + '\\(([^)]+)\\)', 'g'), 
        (match, arg) => `funcs.${name}(${arg})`);
    }
    
    return eval(evalExpr); // 注意: 实际应用中应使用更安全的解析器
  }
}