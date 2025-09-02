/**
 * 消息提示系统
 */

class MessageSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'message-container';
        this.container.id = 'message-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        messageEl.innerHTML = `
            ${message}
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(messageEl);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (messageEl.parentElement) {
                    messageEl.remove();
                }
            }, duration);
        }

        return messageEl;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 创建全局消息系统实例
const messageSystem = new MessageSystem();

// 全局消息函数
window.showMessage = function(message, type = 'info', duration = 3000) {
    return messageSystem.show(message, type, duration);
};

window.showSuccess = function(message, duration = 3000) {
    return messageSystem.success(message, duration);
};

window.showError = function(message, duration = 5000) {
    return messageSystem.error(message, duration);
};

window.showWarning = function(message, duration = 4000) {
    return messageSystem.warning(message, duration);
};

window.showInfo = function(message, duration = 3000) {
    return messageSystem.info(message, duration);
};

// 导出消息系统
window.MessageSystem = MessageSystem;