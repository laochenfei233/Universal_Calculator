/**
 * 主应用程序入口
 */

// 应用程序类
class CalculatorApp {
    constructor() {
        this.currentCalculator = null;
        this.currentPage = 'home';
        this.customCalculators = [];
        this.theme = 'light';
        this.keyboardShortcutsEnabled = true;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupTabNavigation();
        this.setupKeyboardShortcuts();
        this.setupThemeToggle();
        this.setupSettings();
        this.loadUserPreferences();
        this.loadCustomCalculators();
        this.checkApiHealth();
    }

    // 设置导航
    setupNavigation() {
        // 首页计算器卡片点击事件
        const calculatorCards = document.querySelectorAll('.calculator-card[data-calculator]');
        calculatorCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const calculatorType = e.currentTarget.dataset.calculator;
                this.switchToCalculator(calculatorType);
            });
        });

        // 返回首页按钮
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.switchToHome();
            });
        }

        // Logo点击返回首页
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.switchToHome();
            });
        }

        // 添加自定义计算器按钮
        const addCalculatorBtn = document.getElementById('add-calculator');
        if (addCalculatorBtn) {
            addCalculatorBtn.addEventListener('click', () => {
                this.switchToCalculator('formula');
            });
        }
    }

    // 切换到首页
    switchToHome() {
        document.getElementById('home-page').classList.add('active');
        document.getElementById('calculator-pages').classList.remove('active');
        
        // 隐藏所有计算器面板
        document.querySelectorAll('.calculator-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        this.currentPage = 'home';
        this.currentCalculator = null;
        
        // 保存状态
        Storage.set('currentPage', 'home');
        Storage.remove('currentCalculator');
    }

    // 切换到计算器
    switchToCalculator(type) {
        document.getElementById('home-page').classList.remove('active');
        document.getElementById('calculator-pages').classList.add('active');

        // 切换面板
        document.querySelectorAll('.calculator-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${type}-calculator`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        this.currentCalculator = type;
        this.currentPage = 'calculator';
        
        // 懒加载相关模块
        if (window.lazyLoader) {
            window.lazyLoader.loadRouteModules(type);
            window.lazyLoader.preloadNextRoute(type);
        }
        
        // 保存用户偏好
        Storage.set('currentCalculator', type);
        Storage.set('currentPage', 'calculator');
    }

    // 设置主题切换
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // 切换主题
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', this.theme === 'dark');
        
        // 更新主题图标
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
        
        // 保存主题偏好
        Storage.set('theme', this.theme);
    }

    // 设置设置面板
    setupSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleSettings();
            });
        }

        // 创建设置面板
        this.createSettingsPanel();
        // 加载键盘快捷键状态
        this.loadKeyboardShortcutsState();
    }

    // 创建设置面板
    createSettingsPanel() {
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        settingsPanel.id = 'settings-panel';
        
        settingsPanel.innerHTML = `
            <div class="settings-header">
                <h3>设置</h3>
                <button class="close-settings" id="close-settings">×</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <h4>外观</h4>
                    <label>
                        <input type="checkbox" id="dark-theme-checkbox" ${this.theme === 'dark' ? 'checked' : ''}>
                        深色主题
                    </label>
                </div>
                <div class="setting-group">
                    <h4>计算器</h4>
                    <label>
                        <input type="checkbox" id="keyboard-shortcuts" checked>
                        启用键盘快捷键
                    </label>
                </div>
                <div class="setting-group">
                    <h4>自定义计算器</h4>
                    <button class="btn btn-primary" id="manage-custom-calculators">管理自定义计算器</button>
                </div>
            </div>
        `;

        document.body.appendChild(settingsPanel);

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.id = 'settings-overlay';
        document.body.appendChild(overlay);

        // 设置事件监听
        document.getElementById('close-settings').addEventListener('click', () => {
            this.toggleSettings();
        });

        overlay.addEventListener('click', () => {
            this.toggleSettings();
        });

        // 深色主题复选框
        document.getElementById('dark-theme-checkbox').addEventListener('change', (e) => {
            if (e.target.checked !== (this.theme === 'dark')) {
                this.toggleTheme();
            }
        });
        
        // 键盘快捷键复选框
        document.getElementById('keyboard-shortcuts').addEventListener('change', (e) => {
            // 这里可以添加键盘快捷键的启用/禁用逻辑
            console.log('键盘快捷键设置:', e.target.checked);
        });
        
        // 管理自定义计算器按钮
        document.getElementById('manage-custom-calculators').addEventListener('click', () => {
            this.manageCustomCalculators();
        });
    }

    // 管理自定义计算器
    manageCustomCalculators() {
        // 先关闭设置面板
        this.toggleSettings();
        
        // 跳转到公式编辑器页面
        this.switchToCalculator('formula');
    }

    // 切换设置面板
    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        const overlay = document.getElementById('settings-overlay');
        
        if (panel && overlay) {
            panel.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    // 加载自定义计算器
    loadCustomCalculators() {
        const saved = Storage.get('customCalculators', []);
        this.customCalculators = saved;
        this.renderCustomCalculators();
    }

    // 渲染自定义计算器
    renderCustomCalculators() {
        const container = document.getElementById('custom-calculators-container');
        if (!container) return;

        container.innerHTML = '';

        this.customCalculators.forEach((calc, index) => {
            const card = document.createElement('div');
            card.className = 'calculator-card custom-calculator-card';
            card.dataset.calculator = `custom-${index}`;
            
            card.innerHTML = `
                <button class="delete-btn" onclick="calculatorApp.deleteCustomCalculator(${index})">×</button>
                <div class="card-icon">${calc.icon || '🧮'}</div>
                <h3>${calc.name}</h3>
                <p>${calc.description || '自定义计算器'}</p>
            `;

            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    this.openCustomCalculator(calc);
                }
            });

            container.appendChild(card);
        });
    }

    // 删除自定义计算器
    deleteCustomCalculator(index) {
        if (confirm('确定要删除这个自定义计算器吗？')) {
            this.customCalculators.splice(index, 1);
            Storage.set('customCalculators', this.customCalculators);
            this.renderCustomCalculators();
        }
    }

    // 打开自定义计算器
    openCustomCalculator(calculator) {
        // 这里将在后续任务中实现
        console.log('打开自定义计算器:', calculator);
        showMessage('自定义计算器功能将在后续版本中实现', 'info');
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 如果键盘快捷键被禁用，则直接返回
            if (!this.keyboardShortcutsEnabled) {
                return;
            }
            
            // 全局快捷键
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        this.switchToHome();
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchToCalculator('basic');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToCalculator('scientific');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToCalculator('tax');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToCalculator('mortgage');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchToCalculator('bmi');
                        break;
                    case '6':
                        e.preventDefault();
                        this.switchToCalculator('converter');
                        break;
                    case '7':
                        e.preventDefault();
                        this.switchToCalculator('number');
                        break;
                    case '8':
                        e.preventDefault();
                        this.switchToCalculator('relationship');
                        break;
                    case '9':
                        e.preventDefault();
                        this.switchToCalculator('formula');
                        break;
                }
            }

            // ESC键返回首页
            if (e.key === 'Escape' && this.currentPage === 'calculator') {
                this.switchToHome();
            }
        });
    }
    
    // 加载键盘快捷键状态
    loadKeyboardShortcutsState() {
        const savedState = Storage.get('keyboardShortcutsEnabled', true);
        this.keyboardShortcutsEnabled = savedState;
    }
    
    // 设置键盘快捷键启用状态
    setKeyboardShortcutsEnabled(enabled) {
        this.keyboardShortcutsEnabled = enabled;
        Storage.set('keyboardShortcutsEnabled', enabled);
        
        // 可以在这里添加额外的逻辑，比如显示提示信息
        console.log(`键盘快捷键 ${enabled ? '已启用' : '已禁用'}`);
    }

    // 设置标签页导航
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    // 切换标签页
    switchTab(tabId) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');

        // 切换标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
            targetTab.style.display = 'block';
        }
    }

    // 加载用户偏好设置
    loadUserPreferences() {
        // 加载主题
        const savedTheme = Storage.get('theme', 'light');
        this.theme = savedTheme;
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        
        // 更新主题图标
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }

        // 加载页面状态
        const savedPage = Storage.get('currentPage', 'home');
        const savedCalculator = Storage.get('currentCalculator');

        if (savedPage === 'calculator' && savedCalculator) {
            this.switchToCalculator(savedCalculator);
        } else {
            this.switchToHome();
        }
    }

    // 检查API健康状态
    async checkApiHealth() {
        try {
            const response = await api.getHealth();
            console.log('API健康检查:', response);
        } catch (error) {
            console.warn('API健康检查失败:', error);
            showMessage('服务连接异常，部分功能可能不可用', 'error', 5000);
        }
    }

    // 显示应用信息
    async showAppInfo() {
        try {
            const response = await api.getInfo();
            const info = response.data || response;
            
            const infoHtml = `
                <div class="app-info">
                    <h3>${info.name}</h3>
                    <p>版本: ${info.version}</p>
                    <p>${info.description}</p>
                    <h4>可用功能:</h4>
                    <ul>
                        ${Object.entries(info.endpoints).map(([key, desc]) => 
                            `<li><strong>${key}:</strong> ${desc}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
            
            console.log('应用信息:', info);
        } catch (error) {
            handleError(error, '获取应用信息');
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建应用实例
    window.calculatorApp = new CalculatorApp();
    
    // 初始化各个计算器
    if (typeof RelationshipCalculator !== 'undefined') {
        window.relationshipCalculator = new RelationshipCalculator();
    }
    
    // 添加一些全局事件监听
    window.addEventListener('online', () => {
        showMessage('网络连接已恢复', 'success');
    });
    
    window.addEventListener('offline', () => {
        showMessage('网络连接已断开，部分功能可能不可用', 'error');
    });
    
    // 添加错误监听
    window.addEventListener('error', (e) => {
        console.error('全局错误:', e.error);
        handleError(e.error, '应用运行');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的Promise拒绝:', e.reason);
        handleError(e.reason, 'Promise');
    });
    
    console.log('多功能计算器应用已启动');
});

// 导出应用类供其他模块使用
window.CalculatorApp = CalculatorApp;

// 全局切换标签页函数（向后兼容）
window.switchTab = function(tabId) {
    if (window.calculatorApp) {
        window.calculatorApp.switchTab(tabId);
    }
};