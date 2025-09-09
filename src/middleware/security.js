const { SECURITY } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * SQL注入防护中间件
 */
const sqlInjectionProtection = (req, res, next) => {
  // 如果是纯数字字符串，直接返回false（不是SQL注入）
  if (/^\d+(\.\d+)?$/.test(value)) return false;
    const checkForSQLInjection = (value, path = '') => {
      if (typeof value !== 'string') return false;
      
      // 特定字段验证 - salary字段必须是数字
      if (path.includes('salary') && !/^\d+$/.test(value)) {
        return true;
      }
    
      const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
        /(\b(OR|AND)\s+['"]?\d+['"]?\s*[=<>])/i,
        /(--|#|\\*)/, // SQL注释
        /(;|\|\||&&)/, // 命令分隔符
        /(\b(WAITFOR|DELAY)\b)/i,
        /(\b(XP_|SP_|MS_)\w+)/i, // SQL Server扩展存储过程
        /(\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b)/i
      ];

      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
      
        if (value && typeof value === 'object') {
          if (checkObject(value, currentPath)) {
            return true;
          }
        } else if (value && checkForSQLInjection(value.toString(), currentPath)) {
          logger.securityLog('SQL injection attempt', 'warn', {
            path: currentPath,
            value: value.toString().substring(0, 100),
            ip: req.ip,
            url: req.url,
            headers: JSON.stringify(req.headers),
            body: JSON.stringify(req.body).substring(0, 200)
          });
        return true;
      }
    }
    return false;
  };

  // 检查请求体、查询参数和路由参数
  const sources = [req.body, req.query, req.params];
  for (const source of sources) {
    if (source && typeof source === 'object' && checkObject(source)) {
      // 确保响应头设置为application/json
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: '请求包含可疑内容',
        code: 'SECURITY_VIOLATION',
        details: '检测到潜在的安全威胁',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

/**
 * XSS攻击防护中间件
 */
const xssProtection = (req, res, next) => {
  const checkForXSS = (value) => {
    if (typeof value !== 'string') return false;
    
    const xssPatterns = [
      /<script\b[^>]*>(.*?)<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /expression\s*\(/i,
      /<iframe\b[^>]*>(.*?)<\/iframe>/i,
      /<object\b[^>]*>(.*?)<\/object>/i,
      /<embed\b[^>]*>(.*?)<\/embed>/i,
      /<applet\b[^>]*>(.*?)<\/applet>/i
    ];

    return xssPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value && typeof value === 'object') {
        if (checkObject(value, currentPath)) {
          return true;
        }
      } else if (value && checkForXSS(value.toString())) {
        logger.securityLog('XSS attempt', 'warn', {
          path: currentPath,
          value: value.toString().substring(0, 100),
          ip: req.ip,
          url: req.url
        });
        return true;
      }
    }
    return false;
  };

  const sources = [req.body, req.query, req.params];
  for (const source of sources) {
    if (source && typeof source === 'object' && checkObject(source)) {
      return res.status(400).json({
        success: false,
        error: '请求包含可疑内容',
        code: 'SECURITY_VIOLATION'
      });
    }
  }

  next();
};

/**
 * 输入验证中间件
 */
const inputValidation = (req, res, next) => {
  const { INPUT_VALIDATION } = SECURITY;

  const validateObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value === null || value === undefined) {
        continue;
      }

      // 验证字符串长度
      if (typeof value === 'string' && value.length > INPUT_VALIDATION.MAX_STRING_LENGTH) {
        return `字段 ${currentPath} 长度超过限制`;
      }

      // 验证数字范围
      if (typeof value === 'number') {
        if (value > INPUT_VALIDATION.MAX_NUMBER_VALUE) {
          return `字段 ${currentPath} 数值过大`;
        }
        if (value < INPUT_VALIDATION.MIN_NUMBER_VALUE) {
          return `字段 ${currentPath} 数值过小`;
        }
      }

      // 验证数组长度
      if (Array.isArray(value) && value.length > INPUT_VALIDATION.MAX_ARRAY_LENGTH) {
        return `字段 ${currentPath} 数组长度超过限制`;
      }

      // 递归验证嵌套对象
      if (typeof value === 'object' && !Array.isArray(value)) {
        const depth = currentPath.split('.').length;
        if (depth > INPUT_VALIDATION.MAX_OBJECT_DEPTH) {
          return `字段 ${currentPath} 嵌套深度超过限制`;
        }
        
        const nestedError = validateObject(value, currentPath);
        if (nestedError) {
          return nestedError;
        }
      }
    }
    return null;
  };

  const sources = [req.body, req.query, req.params];
  for (const source of sources) {
    if (source && typeof source === 'object') {
      const error = validateObject(source);
      if (error) {
        return res.status(400).json({
          success: false,
          error,
          code: 'VALIDATION_ERROR'
        });
      }
    }
  }

  next();
};

/**
 * 安全头部中间件
 */
const securityHeaders = (req, res, next) => {
  // 设置安全头部
  Object.entries(SECURITY.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // 额外的安全措施
  res.setHeader('X-Powered-By', 'Calculator API');
  
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
};

/**
 * CORS配置中间件
 */
const corsConfig = (req, res, next) => {
  const { CORS } = SECURITY;
  const origin = req.headers.origin;

  // 检查来源是否允许
  if (origin && CORS.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (CORS.ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', CORS.ALLOWED_METHODS.join(','));
    res.setHeader('Access-Control-Allow-Headers', CORS.ALLOWED_HEADERS.join(','));
    res.setHeader('Access-Control-Max-Age', CORS.MAX_AGE);
    return res.status(200).end();
  }

  next();
};

/**
 * 速率限制增强中间件
 */
const enhancedRateLimit = (req, res, next) => {
  const { RATE_LIMIT } = require('../config/constants');
  const rateLimiter = require('./rateLimiter');
  
  // 检查IP黑名单
  if (RATE_LIMIT.BLACKLIST.includes(req.ip)) {
    logger.securityLog('Blacklisted IP attempt', 'warn', {
      ip: req.ip,
      url: req.url
    });
    return res.status(403).json({
      success: false,
      error: '访问被拒绝',
      code: 'ACCESS_DENIED'
    });
  }

  // 使用现有的速率限制器
  rateLimiter(req, res, next);
};

module.exports = {
  sqlInjectionProtection,
  xssProtection,
  inputValidation,
  securityHeaders,
  corsConfig,
  enhancedRateLimit
};