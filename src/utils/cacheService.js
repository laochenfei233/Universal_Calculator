const { CACHE } = require('../config/constants');
const ResponseUtil = require('./response');

/**
 * 缓存服务 - 使用内存缓存计算结果
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 生成缓存键
   * @param {string} expression - 表达式
   * @param {string} type - 计算类型
   * @param {string} angleMode - 角度模式
   * @returns {string} 缓存键
   */
  generateKey(expression, type = 'basic', angleMode = 'radians') {
    return `${type}:${angleMode}:${expression}`;
  }

  /**
   * 获取缓存结果
   * @param {string} key - 缓存键
   * @returns {Object|null} 缓存结果或null
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (entry && entry.expiresAt > Date.now()) {
      this.hits++;
      return entry.value;
    }
    
    // 清除过期缓存
    if (entry) {
      this.cache.delete(key);
    }
    
    this.misses++;
    return null;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 缓存时间(秒)
   */
  set(key, value, ttl = CACHE.DEFAULT_TTL) {
    if (this.cache.size >= CACHE.MAX_ENTRIES) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000
    });
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 淘汰最旧的缓存
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = entry.expiresAt;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? Math.round(this.hits / (this.hits + this.misses) * 100) 
        : 0
    };
  }
}

// 创建单例实例
const cacheService = new CacheService();

module.exports = cacheService;