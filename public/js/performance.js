/**
 * 性能优化和缓存管理
 */

class PerformanceManager {
    constructor() {
        this.cache = new Map();
        this.cacheSize = 0;
        this.maxCacheSize = 50; // 最大缓存条目数
        this.maxCacheMemory = 10 * 1024 * 1024; // 10MB
        this.currentMemoryUsage = 0;
        
        this.init();
    }

    init() {
        this.setupServiceWorker();
        this.setupLazyLoading();
        this.setupPerformanceMonitoring();
        this.setupMemoryManagement();
        this.loadCacheFromStorage();
    }

    // Service Worker 设置
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                
                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    // 显示更新通知
    showUpdateNotification() {
        const notification = showMessage(
            '应用有新版本可用，点击刷新页面获取最新功能',
            'info',
            0
        );
        
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '刷新';
        refreshBtn.className = 'btn btn-primary btn-small';
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.onclick = () => {
            window.location.reload();
        };
        
        notification.appendChild(refreshBtn);
    }

    // 懒加载设置
    setupLazyLoading() {
        // 图片懒加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // 模块懒加载
        this.setupModuleLazyLoading();
    }

    // 模块懒加载
    setupModuleLazyLoading() {
        const moduleLoaders = {
            'formula-editor': () => import('./formula-editor.js'),
            'custom-calculator': () => import('./custom-calculator-generator.js'),
            'advanced-features': () => this.loadAdvancedFeatures()
        };

        window.loadModule = async (moduleName) => {
            if (moduleLoaders[moduleName]) {
                try {
                    await moduleLoaders[moduleName]();
                    console.log(`Module ${moduleName} loaded successfully`);
                } catch (error) {
                    console.error(`Failed to load module ${moduleName}:`, error);
                }
            }
        };
    }

    // 加载高级功能
    async loadAdvancedFeatures() {
        // 动态加载高级功能模块
        const features = [
            'chart-rendering',
            'data-export',
            'formula-validation'
        ];

        for (const feature of features) {
            try {
                // 这里可以动态加载具体的功能模块
                console.log(`Loading advanced feature: ${feature}`);
            } catch (error) {
                console.error(`Failed to load feature ${feature}:`, error);
            }
        }
    }

    // 性能监控
    setupPerformanceMonitoring() {
        // 页面加载性能
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        });

        // 监控长任务
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry);
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }

        // 内存使用监控
        this.monitorMemoryUsage();
    }

    // 内存使用监控
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usage = {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                };

                // 如果内存使用超过80%，触发清理
                if (usage.used / usage.limit > 0.8) {
                    this.performMemoryCleanup();
                }
            }, 30000); // 每30秒检查一次
        }
    }

    // 内存管理
    setupMemoryManagement() {
        // 页面可见性变化时的内存管理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performMemoryCleanup();
            }
        });

        // 定期清理缓存
        setInterval(() => {
            this.cleanupCache();
        }, 5 * 60 * 1000); // 每5分钟清理一次
    }

    // 执行内存清理
    performMemoryCleanup() {
        console.log('Performing memory cleanup...');
        
        // 清理过期缓存
        this.cleanupCache();
        
        // 清理DOM中的事件监听器
        this.cleanupEventListeners();
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
    }

    // 缓存管理
    setCache(key, value, ttl = 300000) { // 默认5分钟TTL
        const item = {
            value,
            timestamp: Date.now(),
            ttl,
            size: this.calculateSize(value)
        };

        // 检查缓存大小限制
        if (this.currentMemoryUsage + item.size > this.maxCacheMemory) {
            this.evictLRU();
        }

        this.cache.set(key, item);
        this.currentMemoryUsage += item.size;
        this.cacheSize++;

        // 保存到本地存储
        this.saveCacheToStorage(key, item);
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        // 检查是否过期
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            this.currentMemoryUsage -= item.size;
            this.cacheSize--;
            this.removeCacheFromStorage(key);
            return null;
        }

        // 更新访问时间（LRU）
        item.lastAccessed = Date.now();
        return item.value;
    }

    // 计算对象大小（估算）
    calculateSize(obj) {
        const str = JSON.stringify(obj);
        return str.length * 2; // 每个字符大约2字节
    }

    // LRU缓存淘汰
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, item] of this.cache.entries()) {
            const accessTime = item.lastAccessed || item.timestamp;
            if (accessTime < oldestTime) {
                oldestTime = accessTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const item = this.cache.get(oldestKey);
            this.cache.delete(oldestKey);
            this.currentMemoryUsage -= item.size;
            this.cacheSize--;
            this.removeCacheFromStorage(oldestKey);
        }
    }

    // 清理过期缓存
    cleanupCache() {
        const now = Date.now();
        const keysToDelete = [];

        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            const item = this.cache.get(key);
            this.cache.delete(key);
            this.currentMemoryUsage -= item.size;
            this.cacheSize--;
            this.removeCacheFromStorage(key);
        });

        console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }

    // 清理事件监听器
    cleanupEventListeners() {
        // 移除不再需要的事件监听器
        const elements = document.querySelectorAll('[data-temp-listener]');
        elements.forEach(element => {
            element.removeAttribute('data-temp-listener');
            // 这里可以添加具体的事件监听器清理逻辑
        });
    }

    // 本地存储缓存
    saveCacheToStorage(key, item) {
        try {
            const cacheData = {
                value: item.value,
                timestamp: item.timestamp,
                ttl: item.ttl
            };
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save cache to localStorage:', error);
        }
    }

    removeCacheFromStorage(key) {
        try {
            localStorage.removeItem(`cache_${key}`);
        } catch (error) {
            console.warn('Failed to remove cache from localStorage:', error);
        }
    }

    loadCacheFromStorage() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    const cacheKey = key.substring(6);
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    // 检查是否过期
                    if (Date.now() - data.timestamp <= data.ttl) {
                        this.setCache(cacheKey, data.value, data.ttl);
                    } else {
                        localStorage.removeItem(key);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load cache from localStorage:', error);
        }
    }

    // 预加载资源
    preloadResource(url, type = 'fetch') {
        return new Promise((resolve, reject) => {
            if (type === 'image') {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            } else if (type === 'script') {
                const script = document.createElement('script');
                script.onload = resolve;
                script.onerror = reject;
                script.src = url;
                document.head.appendChild(script);
            } else {
                fetch(url)
                    .then(response => response.ok ? resolve(response) : reject(response))
                    .catch(reject);
            }
        });
    }

    // 批量预加载
    async preloadResources(resources) {
        const promises = resources.map(resource => {
            return this.preloadResource(resource.url, resource.type)
                .catch(error => {
                    console.warn(`Failed to preload ${resource.url}:`, error);
                    return null;
                });
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Preloaded ${successful}/${resources.length} resources`);
    }

    // 获取性能指标
    getPerformanceMetrics() {
        const metrics = {};

        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                metrics.pageLoad = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    totalTime: navigation.loadEventEnd - navigation.fetchStart
                };
            }

            if ('memory' in performance) {
                metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
            }
        }

        metrics.cache = {
            size: this.cacheSize,
            memoryUsage: Math.round(this.currentMemoryUsage / 1024 / 1024),
            hitRate: this.calculateCacheHitRate()
        };

        return metrics;
    }

    // 计算缓存命中率
    calculateCacheHitRate() {
        // 这里可以实现缓存命中率的计算逻辑
        return 0; // 占位符
    }
}

// 创建全局性能管理器实例
const performanceManager = new PerformanceManager();

// 导出供其他模块使用
window.performanceManager = performanceManager;
window.PerformanceManager = PerformanceManager;