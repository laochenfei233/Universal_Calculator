module.exports = {
  // 应用性能监控
  apm: {
    enabled: process.env.APM_ENABLED === 'true',
    serviceName: 'calculator',
    serverUrl: process.env.APM_SERVER_URL || 'http://localhost:8200',
    environment: process.env.NODE_ENV || 'development'
  },

  // 健康检查配置
  healthChecks: {
    path: '/health',
    interval: 5000,
    timeout: 3000
  },

  // 日志收集
  logCollection: {
    enabled: process.env.LOG_COLLECTION_ENABLED === 'true',
    type: process.env.LOG_COLLECTION_TYPE || 'elasticsearch', // elasticsearch | splunk | datadog
    endpoint: process.env.LOG_COLLECTION_ENDPOINT,
    index: process.env.LOG_COLLECTION_INDEX || 'calculator-logs'
  },

  // 指标监控
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
    port: process.env.METRICS_PORT || 9090,
    path: '/metrics',
    collectDefaultMetrics: true,
    timeout: 5000
  },

  // 告警配置
  alerts: {
    enabled: process.env.ALERTS_ENABLED === 'true',
    providers: {
      email: {
        enabled: process.env.EMAIL_ALERTS_ENABLED === 'true',
        recipients: process.env.EMAIL_RECIPIENTS 
          ? process.env.EMAIL_RECIPIENTS.split(',') 
          : ['devops@example.com']
      },
      slack: {
        enabled: process.env.SLACK_ALERTS_ENABLED === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL
      }
    }
  }
};