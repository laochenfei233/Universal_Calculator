const { CACHE } = require('../config/constants');

/**
 * 内存缓存工具类
 */
class CacheUtil {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 过期时间（秒）
   */
  set(key, value, ttl = CACHE.DEFAULT_TTL) {
    // 清理旧的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // 检查缓存大小限制
    if (this.cache.size >= CACHE.MAX_ENTRIES && !this.cache.has(key)) {
      // 删除最旧的条目
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // 设置缓存值
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl: ttl * 1000
    });

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {*} 缓存值或null
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - item.createdAt > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    // 清理所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: CACHE.MAX_ENTRIES,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {Object} params - 参数对象
   * @returns {string} 缓存键
   */
  static generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }
}

// 创建全局缓存实例
const globalCache = new CacheUtil();

module.exports = { CacheUtil, globalCache };