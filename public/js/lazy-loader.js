/**
 * 懒加载和代码分割管理器
 */

class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.observers = new Map();
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupModuleLoader();
        this.preloadCriticalModules();
    }

    // 设置交叉观察器
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            // 懒加载组件观察器
            this.componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadComponent(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // 预加载观察器（更大的边距）
            this.preloadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.preloadComponent(entry.target);
                    }
                });
            }, {
                rootMargin: '200px'
            });
        }
    }

    // 设置模块加载器
    setupModuleLoader() {
        // 定义模块映射
        this.moduleMap = {
            'formula-editor': {
                path: '/js/formula-editor.js',
                dependencies: ['math-parser'],
                critical: false
            },
            'custom-calculator': {
                path: '/js/custom-calculator-generator.js',
                dependencies: ['formula-editor'],
                critical: false
            },
            'chart-renderer': {
                path: '/js/chart-renderer.js',
                dependencies: [],
                critical: false
            },
            'data-export': {
                path: '/js/data-export.js',
                dependencies: [],
                critical: false
            },
            'advanced-math': {
                path: '/js/advanced-math.js',
                dependencies: [],
                critical: false
            }
        };
    }

    // 预加载关键模块
    async preloadCriticalModules() {
        const criticalModules = Object.entries(this.moduleMap)
            .filter(([_, config]) => config.critical)
            .map(([name, _]) => name);

        if (criticalModules.length > 0) {
            await this.loadModules(criticalModules);
        }
    }

    // 加载单个模块
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return true;
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const moduleConfig = this.moduleMap[moduleName];
        if (!moduleConfig) {
            console.warn(`Module ${moduleName} not found in module map`);
            return false;
        }

        const loadPromise = this.loadModuleWithDependencies(moduleName, moduleConfig);
        this.loadingPromises.set(moduleName, loadPromise);

        try {
            const result = await loadPromise;
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
            return result;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    // 加载模块及其依赖
    async loadModuleWithDependencies(moduleName, moduleConfig) {
        // 先加载依赖
        if (moduleConfig.dependencies && moduleConfig.dependencies.length > 0) {
            await this.loadModules(moduleConfig.dependencies);
        }

        // 加载主模块
        return this.loadScript(moduleConfig.path);
    }

    // 批量加载模块
    async loadModules(moduleNames) {
        const promises = moduleNames.map(name => this.loadModule(name));
        const results = await Promise.allSettled(promises);
        
        const failed = results
            .map((result, index) => ({ result, name: moduleNames[index] }))
            .filter(({ result }) => result.status === 'rejected')
            .map(({ name }) => name);

        if (failed.length > 0) {
            console.warn(`Failed to load modules: ${failed.join(', ')}`);
        }

        return results.every(result => result.status === 'fulfilled');
    }

    // 加载脚本
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                console.log(`Script loaded: ${src}`);
                resolve(true);
            };
            
            script.onerror = () => {
                console.error(`Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    // 加载CSS
    loadCSS(href) {
        return new Promise((resolve, reject) => {
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (existingLink) {
                resolve(true);
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => {
                console.log(`CSS loaded: ${href}`);
                resolve(true);
            };
            
            link.onerror = () => {
                console.error(`Failed to load CSS: ${href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            document.head.appendChild(link);
        });
    }

    // 观察元素进行懒加载
    observe(element, moduleName) {
        if (this.componentObserver) {
            element.dataset.lazyModule = moduleName;
            this.componentObserver.observe(element);
        } else {
            // 降级处理
            this.loadModule(moduleName);
        }
    }

    // 观察元素进行预加载
    observeForPreload(element, moduleName) {
        if (this.preloadObserver) {
            element.dataset.preloadModule = moduleName;
            this.preloadObserver.observe(element);
        }
    }

    // 加载组件
    async loadComponent(element) {
        const moduleName = element.dataset.lazyModule;
        if (moduleName) {
            try {
                await this.loadModule(moduleName);
                element.classList.add('loaded');
                this.componentObserver.unobserve(element);
            } catch (error) {
                console.error(`Failed to load component module ${moduleName}:`, error);
                element.classList.add('load-error');
            }
        }
    }

    // 预加载组件
    async preloadComponent(element) {
        const moduleName = element.dataset.preloadModule;
        if (moduleName) {
            try {
                await this.loadModule(moduleName);
                this.preloadObserver.unobserve(element);
            } catch (error) {
                console.error(`Failed to preload component module ${moduleName}:`, error);
            }
        }
    }

    // 根据路由懒加载
    async loadRouteModules(route) {
        const routeModules = {
            'formula': ['formula-editor', 'advanced-math'],
            'custom': ['custom-calculator', 'formula-editor'],
            'charts': ['chart-renderer'],
            'export': ['data-export']
        };

        const modules = routeModules[route];
        if (modules) {
            return this.loadModules(modules);
        }
        return true;
    }

    // 预加载下一个可能的路由
    preloadNextRoute(currentRoute) {
        const nextRoutes = {
            'basic': ['scientific'],
            'scientific': ['formula'],
            'tax': ['mortgage'],
            'mortgage': ['bmi'],
            'bmi': ['converter'],
            'converter': ['number'],
            'number': ['relationship'],
            'relationship': ['formula']
        };

        const next = nextRoutes[currentRoute];
        if (next) {
            next.forEach(route => {
                setTimeout(() => {
                    this.loadRouteModules(route);
                }, 1000); // 1秒后开始预加载
            });
        }
    }

    // 获取加载状态
    getLoadingStatus() {
        return {
            loadedModules: Array.from(this.loadedModules),
            loadingModules: Array.from(this.loadingPromises.keys()),
            totalModules: Object.keys(this.moduleMap).length
        };
    }

    // 清理资源
    cleanup() {
        if (this.componentObserver) {
            this.componentObserver.disconnect();
        }
        if (this.preloadObserver) {
            this.preloadObserver.disconnect();
        }
        this.loadingPromises.clear();
    }
}

// 图片懒加载
class ImageLazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            this.observeImages();
        } else {
            // 降级处理：直接加载所有图片
            this.loadAllImages();
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            
            img.onload = () => {
                img.classList.add('fade-in');
            };
            
            this.imageObserver.unobserve(img);
        }
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }
}

// 创建全局实例
const lazyLoader = new LazyLoader();
const imageLazyLoader = new ImageLazyLoader();

// 导出供其他模块使用
window.lazyLoader = lazyLoader;
window.imageLazyLoader = imageLazyLoader;
window.LazyLoader = LazyLoader;
window.ImageLazyLoader = ImageLazyLoader;