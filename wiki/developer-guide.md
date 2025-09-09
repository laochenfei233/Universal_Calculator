# 开发者指南

## 目录
- [项目结构](#项目结构)
- [开发环境设置](#开发环境设置)
- [API开发规范](#api开发规范)
- [前端开发](#前端开发)
- [测试](#测试)
- [部署](#部署)

## 项目结构

```
src/
├── app.js              # Express应用入口
├── config/             # 配置文件和常量
├── middleware/        # Express中间件
├── routes/            # API路由
├── utils/             # 工具函数和辅助类
└── server.js          # 服务器启动脚本
```

## 开发环境设置

1. **安装依赖**
```bash
npm install
```

2. **环境变量配置**
创建 `.env` 文件：
```
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

3. **启动开发服务器**
```bash
npm run dev
```

## API开发规范

### 路由定义
- 使用RESTful风格
- 资源名使用复数形式
- 版本控制通过路径前缀实现 (`/api/v1/...`)

### 错误处理
- 使用统一的错误处理中间件
- 错误响应格式：
```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 前端开发

### 页面结构
项目采用简洁的HTML+CSS+JavaScript技术栈，无外部框架依赖：
- 每个计算器功能作为一个独立的HTML页面
- 公共样式内联在HTML文件中，避免外部CSS加载问题
- JavaScript用于实现交互功能和动态内容生成

### 首页九宫格布局
首页采用CSS Grid实现响应式九宫格布局：
- 使用`grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`实现自适应网格
- 在不同屏幕尺寸下自动调整列数：
  - 桌面端：尽可能多的列
  - 平板端（<768px）：3列
  - 手机端（<576px）：2列

### CSS优化策略
为了提升性能和可靠性，我们采取了以下优化措施：
1. 内联关键CSS样式，减少HTTP请求
2. 简化CSS结构，移除不必要的样式规则
3. 使用CSS变量管理主题颜色，便于主题切换
4. 保持所有视觉效果和交互功能的完整性

### 主题切换实现
主题切换通过以下方式实现：
1. 使用CSS变量定义浅色和深色主题的颜色值
2. 通过JavaScript切换body元素的`dark-theme`类
3. 将用户主题偏好保存在localStorage中
4. 支持根据系统偏好自动设置初始主题

### 响应式设计
所有页面都采用响应式设计：
1. 使用CSS Grid和Flexbox实现灵活布局
2. 通过媒体查询适配不同屏幕尺寸
3. 确保在桌面、平板和手机上都有良好的用户体验

### 公积金计算器
公积金计算器是一个多标签页的计算器，包含以下功能：

1. **页面结构**
   - 使用标签页切换不同计算功能
   - 每个标签页包含独立的表单和计算逻辑
   - 结果显示在专门的结果区域

2. **功能模块**
   - 公积金缴费计算
   - 基数调整计算
   - 贷款额度计算
   - 提取额度计算

3. **技术实现**
   - 使用原生JavaScript实现计算逻辑
   - 通过localStorage保存主题设置
   - 支持响应式设计，适配各种设备

4. **用户体验**
   - 提供清晰的表单标签和占位符
   - 实时计算结果显示
   - 支持深色/浅色主题切换

## 测试

### 单元测试
```bash
npm test
```

### 集成测试
```bash
npm run test:integration
```

### E2E测试
```bash
npm run test:e2e
```

## 部署指南

### 生产环境部署
1. 构建前端资源
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

### Docker部署
```bash
docker build -t calculator .
docker run -p 3000:3000 calculator
```