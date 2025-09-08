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
            const calculatorPage = document.getElementById(`${calculatorType}-calculator`);
            
            if (calculatorPage) {
                // 添加页面切换动画
                document.getElementById('home-page').style.transition = 'opacity 0.3s ease';
                document.getElementById('home-page').style.opacity = '0';
                
                setTimeout(() => {
                    // 隐藏首页
                    document.getElementById('home-page').classList.remove('active');
                    document.getElementById('home-page').style.opacity = '1';
                    
                    // 隐藏所有计算器页面
                    const panels = document.querySelectorAll('.calculator-panel');
                    panels.forEach(panel => {
                        panel.style.display = 'none';
                        panel.style.opacity = '0';
                    });
                    
                    // 显示当前计算器页面
                    calculatorPage.style.display = 'block';
                    setTimeout(() => {
                        calculatorPage.style.transition = 'opacity 0.3s ease';
                        calculatorPage.style.opacity = '1';
                    }, 10);
                    
                    // 根据计算器类型执行特定初始化
                    switch(calculatorType) {
                        case 'basic':
                            if (basicCalculator) basicCalculator.updateDisplay();
                            break;
                        case 'scientific':
                            if (scientificCalculator) scientificCalculator.updateDisplay();
                            break;
                        case 'housing-fund':
                            toggleRentField();
                            break;
                    }
                }, 300);
            }
        });
    });
    
    // 返回首页按钮事件
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            const panels = document.querySelectorAll('.calculator-panel');
            panels.forEach(panel => {
                panel.style.transition = 'opacity 0.3s ease';
                panel.style.opacity = '0';
            });
            
            setTimeout(() => {
                panels.forEach(panel => {
                    panel.style.display = 'none';
                    panel.style.opacity = '1';
                });
                document.getElementById('home-page').classList.add('active');
            }, 300);
        });
    }
});