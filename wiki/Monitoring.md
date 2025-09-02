# 监控与运维

## 监控系统

### 健康检查端点
- `GET /health` - 应用健康状态
- `GET /metrics` - Prometheus格式的指标

### 关键指标
1. **应用性能**
   - 请求响应时间
   - 请求率
   - 错误率

2. **系统资源**
   - CPU使用率
   - 内存使用量
   - 磁盘空间

3. **业务指标**
   - 计算请求数
   - 计算类型分布
   - 平均计算时间

## 告警配置

### 告警规则
1. **关键错误**
   - 5分钟内错误率 > 1%
   - 健康检查失败

2. **性能问题**
   - 平均响应时间 > 500ms
   - CPU使用率 > 80% 持续5分钟

3. **资源问题**
   - 内存使用 > 90%
   - 磁盘空间 < 10%

### 告警渠道
- Email: devops@example.com
- Slack: #alerts-calculator

## 日志收集

### 日志类型
1. **应用日志**
   - 访问日志
   - 错误日志
   - 调试日志

2. **审计日志**
   - 用户操作
   - 安全事件

### 日志查询
```bash
# 查找错误
grep "ERROR" /var/log/calculator/app.log

# 按时间过滤
sed -n '/2023-01-01T10:00:00/,/2023-01-01T11:00:00/p' /var/log/calculator/app.log
```

## 运维手册

### 常见问题处理
1. **服务不可用**
   ```bash
   # 检查服务状态
   systemctl status calculator
   
   # 重启服务
   systemctl restart calculator
   ```

2. **性能下降**
   ```bash
   # 查看资源使用
   top
   htop
   
   # 分析慢查询
   node --prof app.js
   ```

3. **磁盘空间不足**
   ```bash
   # 查找大文件
   du -ah / | sort -rh | head -n 20
   
   # 清理日志
   find /var/log/calculator -type f -name "*.log" -mtime +30 -delete
   ```

### 联系支持
- 紧急问题: +1 555-123-4567
- 非紧急问题: support@calculator.com