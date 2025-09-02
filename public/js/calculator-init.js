/**
 * 计算器初始化脚本
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化基础计算器
    if (typeof basicCalculator === 'undefined') {
        basicCalculator = new BasicCalculator();
    }
    
    // 添加计算器切换事件
    const calculatorCards = document.querySelectorAll('.calculator-card');
    calculatorCards.forEach(card => {
        card.addEventListener('click', function() {
            const calculatorType = this.dataset.calculator;
            if (calculatorType === 'basic') {
                // 确保基础计算器已初始化
                if (basicCalculator) {
                    basicCalculator.updateDisplay();
                }
            }
        });
    });
});