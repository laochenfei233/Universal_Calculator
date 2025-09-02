/**
 * 工具函数库
 */

// DOM操作工具
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// 显示消息
function showMessage(message, type = 'info', duration = 3000) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // 插入到页面顶部
    const main = $('.main');
    main.insertBefore(messageEl, main.firstChild);
    
    // 自动移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, duration);
}

// 显示加载状态
function showLoading(buttonEl) {
    const originalText = buttonEl.textContent;
    buttonEl.innerHTML = '<span class="loading"></span> 计算中...';
    buttonEl.disabled = true;
    
    return () => {
        buttonEl.textContent = originalText;
        buttonEl.disabled = false;
    };
}

// 格式化数字
function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    
    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

// 验证数字输入
function validateNumber(value, fieldName = '数值') {
    if (value === null || value === undefined || value === '') {
        return { isValid: false, error: `${fieldName}不能为空` };
    }
    
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
        return { isValid: false, error: `${fieldName}必须是有效数字` };
    }
    
    return { isValid: true, value: num };
}

// 验证数字范围
function validateRange(value, min, max, fieldName = '数值') {
    if (value < min || value > max) {
        return { 
            isValid: false, 
            error: `${fieldName}必须在${min}到${max}之间` 
        };
    }
    return { isValid: true };
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 本地存储工具
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('无法保存到本地存储:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('无法从本地存储读取:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('无法从本地存储删除:', e);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.warn('无法清空本地存储:', e);
        }
    }
};

// 历史记录管理
class HistoryManager {
    constructor(key, maxItems = 50) {
        this.key = key;
        this.maxItems = maxItems;
        this.items = Storage.get(key, []);
    }
    
    add(item) {
        this.items.unshift({
            ...item,
            timestamp: new Date().toISOString()
        });
        
        // 限制历史记录数量
        if (this.items.length > this.maxItems) {
            this.items = this.items.slice(0, this.maxItems);
        }
        
        this.save();
    }
    
    get(count = 10) {
        return this.items.slice(0, count);
    }
    
    clear() {
        this.items = [];
        this.save();
    }
    
    save() {
        Storage.set(this.key, this.items);
    }
}

// 错误处理
function handleError(error, context = '') {
    console.error(`错误 ${context}:`, error);
    
    let message = '操作失败，请重试';
    
    if (error.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    showMessage(message, 'error');
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        showMessage('已复制到剪贴板', 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showMessage('复制失败', 'error');
    }
}/
/ Number converter utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const text = element.textContent;
        copyText(text);
    }
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('已复制到剪贴板', 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyText(text);
        });
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showMessage('已复制到剪贴板', 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showMessage('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

function shareResult(original, result) {
    const text = `数字转换结果：${original} → ${result}`;
    
    if (navigator.share) {
        navigator.share({
            title: '数字转换结果',
            text: text,
            url: window.location.href
        }).catch(err => {
            console.log('分享失败:', err);
            copyText(text);
        });
    } else {
        copyText(text);
    }
}

function addToFavorites(original, result) {
    const favorites = JSON.parse(localStorage.getItem('number-converter-favorites') || '[]');
    const favorite = {
        original,
        result,
        timestamp: new Date().toISOString()
    };
    
    // 检查是否已存在
    const exists = favorites.some(fav => fav.original === original && fav.result === result);
    if (exists) {
        showMessage('该转换结果已在收藏中', 'info');
        return;
    }
    
    favorites.unshift(favorite);
    
    // 限制收藏数量
    if (favorites.length > 50) {
        favorites.splice(50);
    }
    
    localStorage.setItem('number-converter-favorites', JSON.stringify(favorites));
    showMessage('已添加到收藏', 'success');
}

function exportBatchResults(results) {
    const csvContent = convertBatchResultsToCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `批量转换结果_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('批量结果已导出', 'success');
}

function convertBatchResultsToCSV(results) {
    const headers = ['原输入', '转换结果', '状态', '错误信息'];
    const rows = results.map(result => [
        result.original,
        result.success ? result.result : '',
        result.success ? '成功' : '失败',
        result.success ? '' : result.error
    ]);

    return [headers, ...rows].map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function copyAllResults(results) {
    const text = results.join('\n');
    copyText(text);
}