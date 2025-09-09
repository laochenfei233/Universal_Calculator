# universal calculator 多功能计算器

![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.x-green)
![Deploy](https://img.shields.io/badge/deploy-vercel%20%7C%20docker-brightgreen)

一个集常规计算、科学计算、单位换算、个税计算、房贷计算等功能于一体的全能计算器。

## ✨ 功能特性

### 计算功能
- **基础计算器**：四则运算、百分比、历史记录
- **科学计算器**：三角函数、对数、幂运算
- **单位换算**：长度、重量、温度等常用单位
- **个税计算**：支持国内最新个税政策
- **房贷计算**：等额本息/等额本金计算
- **公积金计算**：缴费计算、基数调整、贷款额度、提取额度计算
- **称呼计算**：中文亲属关系计算
- **数字转换**：阿拉伯数字与中文大写互转
- **BMI计算**：体重指数计算与健康建议

### 高级功能
- **图形化公式编辑器**：拖拽式创建自定义公式
- **多主题支持**：深色/浅色模式切换
- **离线使用**：PWA应用支持
- **响应式设计**：适配各种设备

## 🚀 快速开始

### 本地开发
```bash
# 克隆项目
git clone https://github.com/yourusername/universal_calculator.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产构建
```bash
npm run build
```

## 🛠️ 部署方式

### 1. Vercel 部署
**一键部署**  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/laochenfei233/universal_calculator&project-name=universal_calculator&repo-name=universal_calculator)

**手动部署**
```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
npm run vercel-build
```

### 2. Docker 部署
```bash
# 构建镜像
docker build -t universal_calculator .

# 运行容器
docker run -p 3000:3000 universal_calculator

# 或使用快捷命令
npm run docker:deploy
```

### 3. 传统服务器部署
```bash
# 安装生产依赖
npm install --production

# 启动服务
npm start

# 使用PM2守护进程
pm2 start src/server.js --name "calculator"
```

## 📚 文档
- [用户手册](wiki/用户手册.md)
- [开发者指南](wiki/开发者指南.md)
- [API参考](wiki/API参考.md)

## 🔧 最近更新

### 首页九宫格布局优化
- 重新设计了首页的九宫格布局，确保在所有设备上都能正确显示
- 将CSS样式内联到HTML文件中，避免外部CSS文件加载问题
- 优化了响应式设计，在桌面、平板和手机上都有良好的显示效果

### CSS性能优化
- 简化了CSS结构，移除了不必要的外部依赖
- 通过内联关键CSS样式提升页面渲染速度
- 保持了所有视觉效果和交互功能的完整性

## 📜 许可证
MIT © 2023 YourName