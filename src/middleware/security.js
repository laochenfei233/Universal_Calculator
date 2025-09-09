const { SECURITY } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * SQL注入防护中间件
 */
const sqlInjectionProtection = (req, res, next) => {
  const checkForSQLInjection = (value, path = '') => {
    if (typeof value !== 'string') return false;
    
    // 如果是纯数字字符串，直接返回false（不是SQL注入）
    if (/^\d+(\.\d+)?$/.test(value)) return false;

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

module.exports = {
  sqlInjectionProtection
};