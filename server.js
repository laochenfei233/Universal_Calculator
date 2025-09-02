// 重定向到新的模块化结构
console.log('⚠️  注意: server.js 已迁移到 src/server.js');
console.log('请使用 npm start 或 node src/server.js 启动服务器');

// 为了向后兼容，直接启动新的服务器
require('./src/server');