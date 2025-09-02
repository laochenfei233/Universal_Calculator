const express = require('express');
const router = express.Router();

// 导入各个路由模块
const calculatorRoutes = require('./calculator');
const taxRoutes = require('./tax');
const mortgageRoutes = require('./mortgage');
const bmiRoutes = require('./bmi');
const converterRoutes = require('./converter');
const relationshipRoutes = require('./relationship');
const formulaRoutes = require('./formula');

const monitoringConfig = require('../../config/monitoring');

// 健康检查端点
router.get('/health', async (req, res) => {
  const checks = {
    database: {
      status: 'OK',
      timestamp: new Date().toISOString()
    },
    memory: {
      usage: process.memoryUsage(),
      status: process.memoryUsage().rss < monitoringConfig.memoryThreshold ? 'OK' : 'WARNING'
    },
    cpu: {
      usage: process.cpuUsage(),
      status: 'OK'
    }
  };

  try {
    // 实际检查数据库连接
    // const db = require('../utils/database');
    // await db.checkConnection();
  } catch (error) {
    checks.database.status = 'ERROR';
    checks.database.error = error.message;
  }

  const health = {
    status: checks.database.status === 'ERROR' ? 'ERROR' : 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    dependencies: {
      node: process.version,
      express: require('express/package.json').version,
      // 其他关键依赖
    }
  };

  // 根据健康状态设置状态码
  const statusCode = health.status === 'OK' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

// 详细健康检查端点
router.get('/health/detailed', (req, res) => {
  const detailedHealth = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      arch: process.arch
    },
    process: {
      pid: process.pid,
      version: process.version,
      title: process.title,
      argv: process.argv
    },
    environment: process.env.NODE_ENV || 'development',
    versions: process.versions
  };

  res.json(detailedHealth);
});

// 就绪检查端点
router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    services: {
      api: 'available',
      database: 'connected', // 这里可以添加实际的数据库就绪检查
      cache: 'connected' // 这里可以添加缓存服务就绪检查
    }
  });
});

// 存活检查端点
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// API信息端点
router.get('/info', (req, res) => {
  res.json({
    name: '多功能计算器 API',
    version: '1.0.0',
    description: '提供多种计算功能的RESTful API',
    endpoints: {
      calculator: '/api/calculate - 基础和科学计算',
      tax: '/api/tax - 个税计算',
      mortgage: '/api/mortgage - 房贷计算',
      bmi: '/api/bmi - BMI计算',
      converter: '/api/convert - 单位换算',
      numberConverter: '/api/convert-number - 数字转换',
      relationship: '/api/relationship - 称呼计算',
      formula: '/api/formula - 公式编辑器'
    }
  });
});

// 注册路由
router.use('/calculate', calculatorRoutes);
router.use('/tax', taxRoutes);
router.use('/mortgage', mortgageRoutes);
router.use('/bmi', bmiRoutes);
router.use('/convert', converterRoutes);
// Legacy route for backward compatibility
router.use('/convert-number', (req, res, next) => {
  // Redirect old /convert-number requests to /convert/number
  req.url = '/number' + req.url;
  converterRoutes(req, res, next);
});
router.use('/relationship', relationshipRoutes);
router.use('/formula', formulaRoutes);

module.exports = router;