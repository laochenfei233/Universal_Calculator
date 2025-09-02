module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: 'production',
    trustProxy: true
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'calculator_prod'
  },
  
  logging: {
    level: 'info',
    file: {
      enabled: true,
      path: '/var/log/calculator/app.log'
    },
    rotation: {
      enabled: true,
      frequency: 'daily',
      maxFiles: '30d'
    }
  },
  
  security: {
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['https://calculator.example.com']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  cdn: {
    enabled: true,
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.example.com',
    assetsPath: '/static'
  }
};