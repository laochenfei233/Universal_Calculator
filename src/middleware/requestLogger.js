/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // 记录请求开始
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);

  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${status} - ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;