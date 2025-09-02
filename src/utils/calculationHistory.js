/**
 * 计算历史记录管理工具
 * 使用内存存储，支持基本的CRUD操作
 */

class CalculationHistory {
  constructor() {
    this.history = [];
    this.maxEntries = 1000; // 最大历史记录数
    this.nextId = 1;
  }

  /**
   * 添加计算记录
   * @param {Object} entry - 计算记录
   * @param {string} entry.expression - 表达式
   * @param {number} entry.result - 计算结果
   * @param {string} entry.type - 计算类型
   * @param {Date} entry.timestamp - 时间戳
   * @returns {Object} 添加的记录（包含ID）
   */
  addEntry(entry) {
    const newEntry = {
      id: this.nextId++,
      expression: entry.expression,
      result: entry.result,
      type: entry.type || 'basic',
      timestamp: entry.timestamp || new Date(),
      duration: entry.duration || 0 // 计算耗时（毫秒）
    };

    // 添加到历史记录开头
    this.history.unshift(newEntry);

    // 限制历史记录数量
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    return newEntry;
  }

  /**
   * 获取历史记录
   * @param {Object} options - 查询选项
   * @param {number} options.limit - 限制数量
   * @param {number} options.offset - 偏移量
   * @param {string} options.type - 计算类型过滤
   * @param {Date} options.startDate - 开始日期
   * @param {Date} options.endDate - 结束日期
   * @returns {Object} 历史记录和总数
   */
  getHistory(options = {}) {
    const {
      limit = 10,
      offset = 0,
      type,
      startDate,
      endDate
    } = options;

    let filteredHistory = [...this.history];

    // 按类型过滤
    if (type) {
      filteredHistory = filteredHistory.filter(entry => entry.type === type);
    }

    // 按日期范围过滤
    if (startDate) {
      filteredHistory = filteredHistory.filter(entry => entry.timestamp >= startDate);
    }
    if (endDate) {
      filteredHistory = filteredHistory.filter(entry => entry.timestamp <= endDate);
    }

    const total = filteredHistory.length;
    const entries = filteredHistory.slice(offset, offset + limit);

    return {
      entries,
      total,
      hasMore: offset + limit < total
    };
  }

  /**
   * 根据ID获取特定记录
   * @param {number} id - 记录ID
   * @returns {Object|null} 历史记录或null
   */
  getEntry(id) {
    return this.history.find(entry => entry.id === parseInt(id)) || null;
  }

  /**
   * 删除特定记录
   * @param {number} id - 记录ID
   * @returns {boolean} 是否删除成功
   */
  deleteEntry(id) {
    const index = this.history.findIndex(entry => entry.id === parseInt(id));
    if (index !== -1) {
      this.history.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 清除所有历史记录
   */
  clearHistory() {
    this.history = [];
    this.nextId = 1;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStatistics() {
    const totalCalculations = this.history.length;
    const typeStats = {};
    let totalDuration = 0;

    this.history.forEach(entry => {
      // 统计各类型计算数量
      typeStats[entry.type] = (typeStats[entry.type] || 0) + 1;
      totalDuration += entry.duration || 0;
    });

    const avgDuration = totalCalculations > 0 ? totalDuration / totalCalculations : 0;

    return {
      totalCalculations,
      typeStats,
      avgDuration: Math.round(avgDuration * 100) / 100, // 保留2位小数
      oldestEntry: this.history[this.history.length - 1]?.timestamp,
      newestEntry: this.history[0]?.timestamp
    };
  }

  /**
   * 搜索历史记录
   * @param {string} query - 搜索关键词
   * @param {Object} options - 搜索选项
   * @returns {Array} 匹配的记录
   */
  searchHistory(query, options = {}) {
    const { limit = 50 } = options;
    
    if (!query || typeof query !== 'string') {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const matches = this.history.filter(entry => {
      return entry.expression.toLowerCase().includes(searchTerm) ||
             entry.result.toString().includes(searchTerm);
    });

    return matches.slice(0, limit);
  }

  /**
   * 导出历史记录
   * @param {string} format - 导出格式 ('json' | 'csv')
   * @returns {string} 导出的数据
   */
  exportHistory(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.history, null, 2);
      
      case 'csv':
        if (this.history.length === 0) {
          return 'ID,Expression,Result,Type,Timestamp,Duration\n';
        }
        
        const headers = 'ID,Expression,Result,Type,Timestamp,Duration\n';
        const rows = this.history.map(entry => {
          return [
            entry.id,
            `"${entry.expression}"`,
            entry.result,
            entry.type,
            entry.timestamp.toISOString(),
            entry.duration
          ].join(',');
        }).join('\n');
        
        return headers + rows;
      
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 导入历史记录
   * @param {string} data - 导入的数据
   * @param {string} format - 数据格式
   * @returns {number} 导入的记录数
   */
  importHistory(data, format = 'json') {
    let importedEntries = [];

    try {
      switch (format.toLowerCase()) {
        case 'json':
          importedEntries = JSON.parse(data);
          break;
        
        default:
          throw new Error(`不支持的导入格式: ${format}`);
      }

      if (!Array.isArray(importedEntries)) {
        throw new Error('导入数据格式错误');
      }

      let importCount = 0;
      importedEntries.forEach(entry => {
        if (entry.expression && entry.result !== undefined) {
          this.addEntry({
            expression: entry.expression,
            result: entry.result,
            type: entry.type || 'basic',
            timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
            duration: entry.duration || 0
          });
          importCount++;
        }
      });

      return importCount;
    } catch (error) {
      throw new Error(`导入失败: ${error.message}`);
    }
  }
}

// 创建单例实例
const calculationHistory = new CalculationHistory();

module.exports = calculationHistory;