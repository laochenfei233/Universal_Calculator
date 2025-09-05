const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node', // 因为这是一个Node.js应用
  entry: './src/server.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'api/index.js', // 输出文件名，放在api目录下
    clean: true // 每次构建前清理输出目录
  },
  // 排除public目录下的文件
  externals: [
    fs.readdirSync('node_modules')
      .filter(x => !x.includes('.bin'))
      .reduce((acc, mod) => {
        acc[mod] = `commonjs ${mod}`;
        return acc;
      }, {}),
    function({ request }, callback) {
      if (/^\.\/public/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ],
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
        { 
          from: 'public', 
          to: 'public',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/*.js'] // 忽略JS文件，避免重复处理
          }
        },
        { from: 'config', to: 'config' },
        { from: 'src/app.js', to: 'api/app.js' }
      ],
    }),
  ],
  // 禁用对public目录下JS文件的处理
  module: {
    noParse: [/public\/js\/.*\.js$/]
  }
};