// 应用常量配置
module.exports = {
  // API 响应状态码
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // 错误类型
  ERROR_TYPES: {
    CALCULATION_ERROR: 'CALCULATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    FORMULA_SYNTAX_ERROR: 'FORMULA_SYNTAX_ERROR',
    CONVERSION_ERROR: 'CONVERSION_ERROR',
    UNIT_CONVERSION_ERROR: 'UNIT_CONVERSION_ERROR',
    RELATIONSHIP_NOT_FOUND: 'RELATIONSHIP_NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    BUSINESS_ERROR: 'BUSINESS_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
  },

  // 计算器类型
  CALCULATOR_TYPES: {
    BASIC: 'basic',
    SCIENTIFIC: 'scientific',
    CONVERTER: 'converter',
    TAX: 'tax',
    MORTGAGE: 'mortgage',
    BMI: 'bmi',
    RELATIONSHIP: 'relationship',
    NUMBER_CONVERTER: 'number_converter',
    CUSTOM: 'custom'
  },

  // 缓存配置
  CACHE: {
    DEFAULT_TTL: 300, // 5分钟
    MAX_ENTRIES: 1000
  },

  // 请求限制
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15分钟
    MAX_REQUESTS: 100, // 每个IP最多100次请求
    WHITELIST: ['127.0.0.1', '::1'], // IP白名单
    BLACKLIST: [] // IP黑名单
  },

  // 安全配置
  SECURITY: {
    // CORS配置
    CORS: {
      ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS 
        ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
      CREDENTIALS: true,
      MAX_AGE: 86400 // 24小时
    },

    // 安全头部
    SECURITY_HEADERS: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },

    // 输入验证
    INPUT_VALIDATION: {
      MAX_STRING_LENGTH: 1000,
      MAX_NUMBER_VALUE: 1e15,
      MIN_NUMBER_VALUE: -1e15,
      MAX_ARRAY_LENGTH: 100,
      MAX_OBJECT_DEPTH: 10
    },

    // 密码策略
    PASSWORD_POLICY: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: true,
      MAX_AGE_DAYS: 90
    }
  },

  // 日志配置
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE_SIZE: '20m',
    RETAIN_DAYS: 30,
    AUDIT_RETAIN_DAYS: 90
  }
};