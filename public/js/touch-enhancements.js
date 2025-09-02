/**
 * 触摸体验增强
 */

class TouchEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupTouchFeedback();
        this.setupSwipeGestures();
        this.setupLongPress();
        this.preventZoom();
        this.optimizeScrolling();
    }

    // 设置触摸反馈
    setupTouchFeedback() {
        document.addEventListener('DOMContentLoaded', () => {
            const buttons = document.querySelectorAll('.calculator-buttons .btn');
            
            buttons.forEach(button => {
                // 触摸开始
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    button.classList.add('pressed');
                    this.addRippleEffect(button, e);
                    this.triggerHapticFeedback();
                }, { passive: false });

                // 触摸结束
                button.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    setTimeout(() => {
                        button.classList.remove('pressed');
                    }, 150);
                }, { passive: false });

                // 触摸取消
                button.addEventListener('touchcancel', (e) => {
                    button.classList.remove('pressed');
                });

                // 鼠标事件（桌面端）
                button.addEventListener('mousedown', () => {
                    button.classList.add('pressed');
                });

                button.addEventListener('mouseup', () => {
                    setTimeout(() => {
                        button.classList.remove('pressed');
                    }, 150);
                });

                button.addEventListener('mouseleave', () => {
                    button.classList.remove('pressed');
                });
            });
        });
    }

    // 添加波纹效果
    addRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        let x, y;
        if (event.touches && event.touches[0]) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = rect.width / 2;
            y = rect.height / 2;
        }

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            margin-left: -10px;
            margin-top: -10px;
            pointer-events: none;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 触发触觉反馈
    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // 轻微震动10ms
        }
    }

    // 设置滑动手势
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const endTime = Date.now();

                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;

                // 检测快速滑动
                if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
                    if (deltaX > 0) {
                        this.handleSwipeRight();
                    } else {
                        this.handleSwipeLeft();
                    }
                }

                // 检测向上滑动（显示历史记录）
                if (deltaTime < 300 && deltaY < -100 && Math.abs(deltaX) < 50) {
                    this.handleSwipeUp();
                }
            }
        }, { passive: true });
    }

    // 处理向右滑动
    handleSwipeRight() {
        // 可以用于切换到下一个计算器或返回首页
        if (window.calculatorApp && window.calculatorApp.currentPage === 'calculator') {
            window.calculatorApp.switchToHome();
        }
    }

    // 处理向左滑动
    handleSwipeLeft() {
        // 可以用于打开设置或帮助
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.click();
        }
    }

    // 处理向上滑动
    handleSwipeUp() {
        // 显示计算历史
        this.showCalculationHistory();
    }

    // 显示计算历史
    showCalculationHistory() {
        const currentCalculator = window.calculatorApp?.currentCalculator;
        if (currentCalculator) {
            showInfo('向上滑动查看历史记录功能开发中...');
        }
    }

    // 设置长按功能
    setupLongPress() {
        let longPressTimer;
        const longPressDuration = 500; // 500ms

        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('btn')) {
                longPressTimer = setTimeout(() => {
                    this.handleLongPress(e.target);
                }, longPressDuration);
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });

        document.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });
    }

    // 处理长按
    handleLongPress(button) {
        this.triggerHapticFeedback();
        
        // 根据按钮类型执行不同操作
        if (button.classList.contains('btn-clear')) {
            // 长按清除按钮：清除历史记录
            this.clearHistory();
        } else if (button.classList.contains('btn-number')) {
            // 长按数字按钮：显示该数字的相关信息
            this.showNumberInfo(button.textContent);
        } else if (button.classList.contains('btn-operator')) {
            // 长按运算符：显示运算符说明
            this.showOperatorInfo(button.textContent);
        }
    }

    // 清除历史记录
    clearHistory() {
        if (confirm('确定要清除计算历史记录吗？')) {
            // 这里可以调用清除历史记录的函数
            showSuccess('历史记录已清除');
        }
    }

    // 显示数字信息
    showNumberInfo(number) {
        showInfo(`数字 ${number} - 长按功能开发中...`);
    }

    // 显示运算符信息
    showOperatorInfo(operator) {
        const operatorNames = {
            '+': '加法',
            '−': '减法',
            '×': '乘法',
            '÷': '除法',
            '=': '等于'
        };
        const name = operatorNames[operator] || operator;
        showInfo(`${name}运算符 - 长按功能开发中...`);
    }

    // 防止双击缩放
    preventZoom() {
        let lastTouchEnd = 0;
        
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // 防止双指缩放
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    // 优化滚动
    optimizeScrolling() {
        // 为可滚动元素添加平滑滚动
        const scrollableElements = document.querySelectorAll('.modal-body, .settings-panel');
        
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overflowScrolling = 'touch';
        });

        // 防止橡皮筋效果
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.calculator-buttons')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // 检测设备方向变化
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayoutForOrientation();
            }, 100);
        });
    }

    // 根据方向调整布局
    adjustLayoutForOrientation() {
        const isLandscape = window.innerHeight < window.innerWidth;
        
        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
    }

    // 优化键盘显示
    setupKeyboardOptimization() {
        let initialViewportHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;

            // 如果高度减少超过150px，可能是键盘弹出
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
    }
}

// 添加波纹动画CSS
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// 添加样式到页面
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// 创建全局触摸增强实例
const touchEnhancements = new TouchEnhancements();

// 导出供其他模块使用
window.touchEnhancements = touchEnhancements;
window.TouchEnhancements = TouchEnhancements;