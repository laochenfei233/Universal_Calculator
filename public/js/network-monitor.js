/**
 * 网络状态监控器
 */

class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionType = this.getConnectionType();
        this.offlineQueue = [];
        this.retryAttempts = 0;
        this.maxRetryAttempts = 3;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createOfflineIndicator();
        this.monitorConnectionQuality();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });

        // 监听连接变化
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
    }

    handleOnline() {
        console.log('Network: Back online');
        this.isOnline = true;
        this.retryAttempts = 0;
        
        document.body.classList.remove('offline');
        this.hideOfflineIndicator();
        
        showSuccess('网络连接已恢复');
        
        // 处理离线队列
        this.processOfflineQueue();
    }

    handleOffline() {
        console.log('Network: Gone offline');
        this.isOnline = false;
        
        document.body.classList.add('offline');
        this.showOfflineIndicator();
        
        showWarning('网络连接已断开，部分功能可能不可用', 0);
    }

    handleConnectionChange() {
        const connection = navigator.connection;
        const oldType = this.connectionType;
        this.connectionType = this.getConnectionType();
        
        console.log(`Network: Connection changed from ${oldType} to ${this.connectionType}`);
        
        // 根据连接类型调整行为
        if (this.connectionType === 'slow') {
            this.enableDataSavingMode();
        } else {
            this.disableDataSavingMode();
        }
    }

    getConnectionType() {
        if (!('connection' in navigator)) {
            return 'unknown';
        }

        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            return 'slow';
        } else if (effectiveType === '3g') {
            return 'medium';
        } else if (effectiveType === '4g') {
            return 'fast';
        }
        
        return 'unknown';
    }

    createOfflineIndicator() {
        this.offlineIndicator = document.createElement('div');
        this.offlineIndicator.className = 'offline-indicator';
        this.offlineIndicator.innerHTML = `
            <span>⚠️ 网络连接已断开</span>
            <button onclick="networkMonitor.checkConnection()" style="margin-left: 10px; background: none; border: 1px solid white; color: white; padding: 2px 8px; border-radius: 4px; cursor: pointer;">重试</button>
        `;
        document.body.appendChild(this.offlineIndicator);
    }

    showOfflineIndicator() {
        if (this.offlineIndicator) {
            this.offlineIndicator.style.display = 'block';
        }
    }

    hideOfflineIndicator() {
        if (this.offlineIndicator) {
            this.offlineIndicator.style.display = 'none';
        }
    }

    // 检查网络连接
    async checkConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                if (!this.isOnline) {
                    this.handleOnline();
                }
                return true;
            }
        } catch (error) {
            console.log('Connection check failed:', error);
        }
        
        if (this.isOnline) {
            this.handleOffline();
        }
        return false;
    }

    // 监控连接质量
    monitorConnectionQuality() {
        setInterval(async () => {
            if (this.isOnline) {
                const startTime = Date.now();
                try {
                    await fetch('/api/health', { 
                        method: 'HEAD',
                        cache: 'no-cache'
                    });
                    const latency = Date.now() - startTime;
                    this.updateConnectionQuality(latency);
                } catch (error) {
                    this.checkConnection();
                }
            }
        }, 30000); // 每30秒检查一次
    }

    updateConnectionQuality(latency) {
        let quality = 'good';
        
        if (latency > 1000) {
            quality = 'poor';
        } else if (latency > 500) {
            quality = 'fair';
        }
        
        // 根据连接质量调整行为
        if (quality === 'poor' && !document.body.classList.contains('slow-connection')) {
            document.body.classList.add('slow-connection');
            this.enableDataSavingMode();
        } else if (quality === 'good' && document.body.classList.contains('slow-connection')) {
            document.body.classList.remove('slow-connection');
            this.disableDataSavingMode();
        }
    }

    // 启用数据节省模式
    enableDataSavingMode() {
        console.log('Network: Enabling data saving mode');
        
        // 禁用自动预加载
        if (window.lazyLoader) {
            window.lazyLoader.preloadNextRoute = () => {}; // 禁用预加载
        }
        
        // 减少缓存大小
        if (window.performanceManager) {
            window.performanceManager.maxCacheSize = 20;
        }
        
        showInfo('检测到网络较慢，已启用数据节省模式');
    }

    // 禁用数据节省模式
    disableDataSavingMode() {
        console.log('Network: Disabling data saving mode');
        
        // 恢复预加载
        if (window.lazyLoader && window.lazyLoader.preloadNextRoute) {
            // 恢复原始预加载功能
        }
        
        // 恢复缓存大小
        if (window.performanceManager) {
            window.performanceManager.maxCacheSize = 50;
        }
    }

    // 添加到离线队列
    addToOfflineQueue(request) {
        this.offlineQueue.push({
            ...request,
            timestamp: Date.now()
        });
        
        // 限制队列大小
        if (this.offlineQueue.length > 100) {
            this.offlineQueue.shift();
        }
        
        console.log(`Added request to offline queue. Queue size: ${this.offlineQueue.length}`);
    }

    // 处理离线队列
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.offlineQueue.length} offline requests`);
        
        const requests = [...this.offlineQueue];
        this.offlineQueue = [];
        
        for (const request of requests) {
            try {
                // 检查请求是否过期（超过5分钟）
                if (Date.now() - request.timestamp > 5 * 60 * 1000) {
                    console.log('Skipping expired offline request');
                    continue;
                }
                
                await this.retryRequest(request);
            } catch (error) {
                console.error('Failed to process offline request:', error);
                // 重新加入队列（如果重试次数未超限）
                if (request.retryCount < this.maxRetryAttempts) {
                    request.retryCount = (request.retryCount || 0) + 1;
                    this.offlineQueue.push(request);
                }
            }
        }
        
        if (this.offlineQueue.length > 0) {
            showWarning(`${this.offlineQueue.length} 个请求同步失败，将稍后重试`);
        } else {
            showSuccess('所有离线数据已同步');
        }
    }

    // 重试请求
    async retryRequest(request) {
        const response = await fetch(request.url, {
            method: request.method || 'GET',
            headers: request.headers || {},
            body: request.body
        });
        
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        
        return response;
    }

    // 获取网络状态
    getNetworkStatus() {
        return {
            isOnline: this.isOnline,
            connectionType: this.connectionType,
            offlineQueueSize: this.offlineQueue.length,
            effectiveType: navigator.connection?.effectiveType || 'unknown',
            downlink: navigator.connection?.downlink || 0,
            rtt: navigator.connection?.rtt || 0
        };
    }

    // 清理离线队列
    clearOfflineQueue() {
        this.offlineQueue = [];
        console.log('Offline queue cleared');
    }
}

// 创建全局网络监控器实例
const networkMonitor = new NetworkMonitor();

// 导出供其他模块使用
window.networkMonitor = networkMonitor;
window.NetworkMonitor = NetworkMonitor;