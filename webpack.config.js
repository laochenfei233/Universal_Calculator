const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node', // 因为这是一个Node.js应用
  entry: './src/server.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'server.js', // 输出文件名
    clean: true // 每次构建前清理输出目录
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  // 不打包这些Node.js核心模块，而是在运行时从环境中引入
  externals: fs.readdirSync('node_modules')
    .filter(x => !x.includes('.bin'))
    .reduce((acc, mod) => {
      acc[mod] = `commonjs ${mod}`;
      return acc;
    }, {}),
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: 'public' },
        { from: 'config', to: 'config' }
      ],
    }),
  ]
};