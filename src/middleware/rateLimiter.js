const { RATE_LIMIT } = require('../config/constants');
const ResponseUtil = require('../utils/response');
const CacheService = require('../utils/cacheService');

/**
 * 增强的速率限制器
 * 支持IP白名单和动态调整限制
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.whitelist = new Set();
    
    // 从缓存加载白名单
    this.loadWhitelist();
    
    // 定期清理过期记录
    setInterval(() => {
      this.cleanup();
    }, RATE_LIMIT.WINDOW_MS);
  }
  
  /**
   * 加载IP白名单
   */
  loadWhitelist() {
    const cachedWhitelist = CacheService.get('rateLimiter:whitelist');
    if (cachedWhitelist) {
      this.whitelist = new Set(cachedWhitelist);
    }
  }
  
  /**
   * 添加IP到白名单
   * @param {string} ip - IP地址
   */
  addToWhitelist(ip) {
    this.whitelist.add(ip);
    CacheService.set('rateLimiter:whitelist', [...this.whitelist], 86400); // 缓存24小时
  }
  
  /**
   * 从白名单移除IP
   * @param {string} ip - IP地址
   */
  removeFromWhitelist(ip) {
    this.whitelist.delete(ip);
    CacheService.set('rateLimiter:whitelist', [...this.whitelist], 86400);
  }
  
  /**
   * 检查IP是否在白名单
   * @param {string} ip - IP地址
   * @returns {boolean}
   */
  isWhitelisted(ip) {
    return this.whitelist.has(ip);
  }

  /**
   * 检查请求是否超过限制
   * @param {string} ip - 客户端IP
   * @returns {Object} 检查结果
   */
  checkLimit(ip) {
    // 白名单IP不受限制
    if (this.isWhitelisted(ip)) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now()
      };
    }

    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;

    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }

    const userRequests = this.requests.get(ip);
    
    // 过滤掉窗口期外的请求
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // 更新用户请求记录
    this.requests.set(ip, validRequests);

    // 检查是否超过限制
    if (validRequests.length >= RATE_LIMIT.MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + RATE_LIMIT.WINDOW_MS
      };
    }

    // 记录当前请求
    validRequests.push(now);
    
    return {
      allowed: true,
      remaining: RATE_LIMIT.MAX_REQUESTS - validRequests.length,
      resetTime: windowStart + RATE_LIMIT.WINDOW_MS
    };
  }

  /**
   * 清理过期的请求记录
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.WINDOW_MS;

    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

/**
 * 速率限制中间件
 */
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const result = rateLimiter.checkLimit(ip);

  // 设置响应头
  res.set({
    'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS,
    'X-RateLimit-Remaining': result.remaining,
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  });

  if (!result.allowed) {
    return ResponseUtil.error(
      res,
      '请求过于频繁，请稍后再试',
      'RATE_LIMIT_EXCEEDED',
      429,
      {
        resetTime: new Date(result.resetTime).toISOString()
      }
    );
  }

  next();
};

module.exports = rateLimitMiddleware;