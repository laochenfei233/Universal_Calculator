#!/bin/bash

# 部署脚本
# 使用: ./scripts/deploy.sh [environment]

set -e

ENV=${1:-production}

echo "🚀 开始部署到 $ENV 环境"

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 构建前端资源
echo "🔨 构建前端资源..."
npm run build

# 处理静态资源
if [ "$ENV" == "production" ]; then
  echo "📡 上传静态资源到CDN..."
  aws s3 sync ./public/ s3://calculator-static-assets/ --delete
fi

# 启动/重启服务
echo "🔄 重启服务..."
pm2 restart calculator --update-env

echo "✅ 部署完成!"