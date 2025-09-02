/**
 * 计算器设置功能
 */

// 设置状态
const settings = {
    appearance: {
        darkTheme: false
    },
    calculator: {
        enableKeyboardShortcuts: true
    }
};

// 初始化设置
function initSettings() {
    // 从本地存储加载设置
    try {
        const savedSettings = localStorage.getItem('calculatorSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            Object.assign(settings, parsed);
        }
    } catch (error) {
        console.warn('无法加载设置:', error);
    }

    // 应用设置
    applySettings();
}

// 应用设置
function applySettings() {
    // 应用深色主题
    if (settings.appearance.darkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // 应用键盘快捷键设置
    if (settings.calculator.enableKeyboardShortcuts) {
        document.body.classList.add('keyboard-enabled');
    } else {
        document.body.classList.remove('keyboard-enabled');
    }
}

// 保存设置
function saveSettings() {
    try {
        localStorage.setItem('calculatorSettings', JSON.stringify(settings));
    } catch (error) {
        console.warn('无法保存设置:', error);
    }
}

// 更新设置
function updateSetting(category, name, value) {
    if (settings[category] && settings[category][name] !== undefined) {
        settings[category][name] = value;
        applySettings();
        saveSettings();
    }
}

// 显示设置弹窗
function showSettings() {
    const content = `
        <div class="settings-modal">
            <div class="settings-group">
                <h4>外观</h4>
                <div class="setting-item">
                    <span>深色主题</span>
                    <label class="switch">
                        <input type="checkbox" id="setting-dark-theme" ${settings.appearance.darkTheme ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="settings-group">
                <h4>计算器</h4>
                <div class="setting-item">
                    <span>启用键盘快捷键</span>
                    <label class="switch">
                        <input type="checkbox" id="setting-keyboard-shortcuts" ${settings.calculator.enableKeyboardShortcuts ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    `;

    showModal('设置', content);

    // 添加事件监听器
    document.getElementById('setting-dark-theme').addEventListener('change', function() {
        updateSetting('appearance', 'darkTheme', this.checked);
    });

    document.getElementById('setting-keyboard-shortcuts').addEventListener('change', function() {
        updateSetting('calculator', 'enableKeyboardShortcuts', this.checked);
    });
}

// 检查网络连接状态
function checkNetworkConnection() {
    const networkStatus = document.querySelectorAll('.network-status');
    const isOnline = navigator.onLine;
    
    networkStatus.forEach(status => {
        if (isOnline) {
            status.innerHTML = '✅ 网络连接正常';
            status.classList.add('online');
            status.classList.remove('offline');
        } else {
            status.innerHTML = '⚠️ 网络连接已断开 <a href="#" class="retry-link" onclick="checkNetworkConnection()">重试</a>';
            status.classList.add('offline');
            status.classList.remove('online');
        }
    });
    
    return isOnline;
}

// 页面加载完成后初始化设置
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    checkNetworkConnection();
    
    // 监听网络状态变化
    window.addEventListener('online', checkNetworkConnection);
    window.addEventListener('offline', checkNetworkConnection);
});