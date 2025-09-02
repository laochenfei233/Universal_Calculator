# 设计文档

## 概述

多功能计算器是一个基于Node.js和Express的轻量级Web应用，采用前后端分离架构。前端使用原生JavaScript和CSS构建，后端提供RESTful API服务。应用设计重点关注性能优化、资源占用最小化和用户体验。

## 架构

### 整体架构

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   前端 (SPA)    │ ◄──────────────► │  后端 API 服务   │
│                 │                  │                 │
│ - 计算器界面    │                  │ - Express 服务器 │
│ - 公式编辑器    │                  │ - 计算引擎       │
│ - 自定义计算器  │                  │ - 数据验证       │
└─────────────────┘                  └─────────────────┘
```

### 技术栈

**前端：**
- 原生JavaScript (ES6+)
- CSS3 (Flexbox/Grid)
- HTML5
- Web Components (用于自定义计算器)

**后端：**
- Node.js (>=18.0.0)
- Express.js
- 内存缓存 (避免数据库依赖)

**部署：**
- 支持Vercel、Heroku等平台
- 静态资源CDN优化

## 组件和接口

### 前端组件架构

```
App
├── CalculatorContainer
│   ├── BasicCalculator
│   ├── ScientificCalculator
│   ├── UnitConverter
│   ├── TaxCalculator
│   ├── MortgageCalculator
│   ├── RelationshipCalculator
│   ├── NumberConverter
│   └── BMICalculator
├── FormulaEditor
│   ├── DragDropInterface
│   ├── FormulaBuilder
│   └── CustomCalculatorGenerator
└── CustomCalculatorManager
    ├── CalculatorList
    ├── CalculatorEditor
    └── CalculatorRunner
```

### API 接口设计

#### 1. 基础计算 API
```javascript
POST /api/calculate
{
  "expression": "2 + 3 * 4",
  "type": "basic" | "scientific"
}

Response:
{
  "result": 14,
  "expression": "2 + 3 * 4",
  "steps": ["3 * 4 = 12", "2 + 12 = 14"]
}
```

#### 2. 单位换算 API
```javascript
POST /api/convert
{
  "value": 100,
  "fromUnit": "cm",
  "toUnit": "m",
  "category": "length"
}

Response:
{
  "result": 1,
  "fromValue": 100,
  "fromUnit": "cm",
  "toValue": 1,
  "toUnit": "m"
}
```

#### 3. 个税计算 API (已实现)
```javascript
POST /api/tax
{
  "salary": 10000,
  "socialInsurance": 800,
  "housingFund": 500,
  "specialDeduction": 1000
}
```

#### 4. 房贷计算 API (已实现)
```javascript
POST /api/mortgage
{
  "principal": 1000000,
  "rate": 4.5,
  "years": 30,
  "type": "equal" | "principal"
}
```

#### 5. 称呼计算 API
```javascript
POST /api/relationship
{
  "path": ["父亲", "兄弟", "儿子"],
  "gender": "male" | "female"
}

Response:
{
  "result": "侄子",
  "path": ["父亲", "兄弟", "儿子"],
  "explanation": "父亲的兄弟的儿子称为侄子"
}
```

#### 6. 数字转换 API (部分实现)
```javascript
POST /api/convert-number
{
  "number": 12345,
  "type": "chinese" | "financial" | "arabic"
}
```

#### 7. BMI计算 API (已实现)
```javascript
POST /api/bmi
{
  "weight": 70,
  "height": 175
}
```

#### 8. 自定义公式 API
```javascript
POST /api/custom-formula
{
  "name": "圆面积计算",
  "formula": "π * r²",
  "variables": [
    {"name": "r", "type": "number", "label": "半径"}
  ]
}

POST /api/custom-formula/execute
{
  "formulaId": "circle-area",
  "values": {"r": 5}
}
```

## 数据模型

### 计算器配置模型
```javascript
const CalculatorConfig = {
  id: String,
  name: String,
  type: 'basic' | 'scientific' | 'converter' | 'custom',
  formula: String,
  variables: [
    {
      name: String,
      type: 'number' | 'select' | 'text',
      label: String,
      options: Array, // for select type
      validation: Object
    }
  ],
  created: Date,
  updated: Date
}
```

### 单位换算配置
```javascript
const ConversionUnits = {
  length: {
    m: { name: '米', factor: 1 },
    cm: { name: '厘米', factor: 0.01 },
    mm: { name: '毫米', factor: 0.001 },
    km: { name: '千米', factor: 1000 },
    inch: { name: '英寸', factor: 0.0254 },
    ft: { name: '英尺', factor: 0.3048 }
  },
  weight: {
    kg: { name: '千克', factor: 1 },
    g: { name: '克', factor: 0.001 },
    lb: { name: '磅', factor: 0.453592 },
    oz: { name: '盎司', factor: 0.0283495 }
  },
  temperature: {
    celsius: { name: '摄氏度', convert: (c) => c },
    fahrenheit: { name: '华氏度', convert: (f) => (f - 32) * 5/9 },
    kelvin: { name: '开尔文', convert: (k) => k - 273.15 }
  }
}
```

### 亲属关系模型
```javascript
const RelationshipMap = {
  '父亲': {
    '儿子': '爷爷',
    '女儿': '爷爷',
    '兄弟': {
      '儿子': '堂兄弟',
      '女儿': '堂姐妹'
    }
  }
  // ... 更多关系定义
}
```

## 错误处理

### 错误类型定义
```javascript
const ErrorTypes = {
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  FORMULA_SYNTAX_ERROR: 'FORMULA_SYNTAX_ERROR',
  CONVERSION_ERROR: 'CONVERSION_ERROR',
  RELATIONSHIP_NOT_FOUND: 'RELATIONSHIP_NOT_FOUND'
}
```

### 统一错误响应格式
```javascript
{
  "error": true,
  "code": "CALCULATION_ERROR",
  "message": "计算表达式无效",
  "details": "除数不能为零"
}
```

### 前端错误处理策略
1. 输入验证：实时验证用户输入
2. 错误提示：友好的错误消息显示
3. 降级处理：计算失败时提供备选方案
4. 错误恢复：自动重试机制

## 测试策略

### 单元测试
- 计算引擎核心算法测试
- 单位换算精度测试
- 个税计算准确性测试
- 公式解析器测试

### 集成测试
- API端点功能测试
- 前后端数据交互测试
- 自定义计算器生成测试

### 性能测试
- 并发计算请求测试
- 内存使用监控
- 响应时间基准测试
- 资源占用优化验证

### 测试工具
- Jest (单元测试)
- Supertest (API测试)
- Puppeteer (E2E测试)
- Artillery (性能测试)

## 性能优化策略

### 前端优化
1. **代码分割**：按功能模块懒加载
2. **缓存策略**：计算结果本地缓存
3. **虚拟化**：大量数据列表虚拟滚动
4. **防抖节流**：输入事件优化
5. **Web Workers**：复杂计算后台处理

### 后端优化
1. **内存缓存**：常用计算结果缓存
2. **算法优化**：使用高效数学算法
3. **请求合并**：批量计算接口
4. **连接池**：HTTP连接复用
5. **压缩**：Gzip响应压缩

### 资源优化
1. **静态资源**：CSS/JS文件压缩
2. **图片优化**：WebP格式支持
3. **CDN加速**：静态资源分发
4. **HTTP/2**：多路复用支持

### 内存管理
1. **垃圾回收**：及时清理无用对象
2. **内存监控**：定期检查内存使用
3. **对象池**：重用计算对象
4. **流式处理**：大数据分块处理

## 安全考虑

### 输入验证
- 表达式安全解析（防止代码注入）
- 数值范围限制
- 特殊字符过滤
- 请求频率限制

### 数据保护
- 敏感计算结果不记录日志
- 用户自定义公式本地存储
- HTTPS强制使用
- CORS策略配置

## 部署架构

### 生产环境
```
Internet
    ↓
CDN (静态资源)
    ↓
Load Balancer
    ↓
Node.js App (多实例)
    ↓
内存缓存
```

### 环境配置
- 开发环境：本地开发服务器
- 测试环境：自动化测试部署
- 生产环境：多实例负载均衡

### 监控和日志
- 应用性能监控 (APM)
- 错误日志收集
- 用户行为分析
- 资源使用监控