/**
 * API调用工具类
 */
class ApiClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * 发送HTTP请求
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST请求
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 基础计算
     */
    async calculate(expression, type = 'basic') {
        return this.post('/calculate', { expression, type });
    }

    /**
     * 个税计算
     */
    async calculateTax(params) {
        return this.post('/tax', params);
    }

    /**
     * 房贷计算
     */
    async calculateMortgage(params) {
        return this.post('/mortgage', params);
    }

    /**
     * BMI计算
     */
    async calculateBMI(params) {
        return this.post('/bmi', params);
    }

    /**
     * 获取BMI支持的单位
     */
    async getBMIUnits() {
        return this.get('/bmi/units');
    }

    /**
     * 获取BMI分类信息
     */
    async getBMICategories() {
        return this.get('/bmi/categories');
    }

    /**
     * 批量BMI计算
     */
    async calculateBMIBatch(measurements) {
        return this.post('/bmi/batch', { measurements });
    }

    /**
     * 单位换算
     */
    async convertUnit(params) {
        return this.post('/convert', params);
    }

    /**
     * 批量单位换算
     */
    async convertUnitBatch(params) {
        return this.post('/convert/batch', params);
    }

    /**
     * 获取支持的单位类别
     */
    async getUnitCategories() {
        return this.get('/convert/categories');
    }

    /**
     * 获取指定类别的所有单位
     */
    async getUnitsForCategory(category) {
        return this.get(`/convert/categories/${category}/units`);
    }

    /**
     * 数字转换
     */
    async convertNumber(params) {
        return this.post('/convert/number', params);
    }

    /**
     * 批量数字转换
     */
    async batchConvertNumber(params) {
        return this.post('/convert/number/batch', params);
    }

    /**
     * 获取数字转换支持的类型
     */
    async getNumberConverterTypes() {
        return this.get('/convert/number/types');
    }

    /**
     * 称呼计算
     */
    async calculateRelationship(params) {
        return this.post('/convert/relationship', params);
    }

    /**
     * 获取健康检查信息
     */
    async getHealth() {
        return this.get('/health');
    }

    /**
     * 获取API信息
     */
    async getInfo() {
        return this.get('/info');
    }
}

// 创建全局API客户端实例
const api = new ApiClient();

// 导出供其他模块使用
window.api = api;
// 公式编辑器API
const formulaApi = {
    // 验证公式
    async validateFormula(formula) {
        return await api.post('/formula/validate', { formula });
    },

    // 执行公式计算
    async executeFormula(formula, variables) {
        return await api.post('/formula/execute', { formula, variables });
    },

    // 执行自定义计算器计算
    async executeCustomCalculator(formula, values) {
        return await api.post('/formula/execute-custom', { formula, values });
    },

    // 转换公式为JavaScript
    async convertToJavaScript(formula) {
        return await api.post('/formula/to-javascript', { formula });
    },

    // 获取支持的函数列表
    async getSupportedFunctions() {
        return await api.get('/formula/functions');
    },

    // 保存自定义计算器
    async saveCalculator(calculator) {
        return await api.post('/formula/save-calculator', { calculator });
    },

    // 获取所有计算器
    async getCalculators() {
        return await api.get('/formula/calculators');
    },

    // 获取单个计算器
    async getCalculator(id) {
        return await api.get(`/formula/calculator/${id}`);
    },

    // 更新计算器
    async updateCalculator(id, calculator) {
        return await api.request(`/formula/calculator/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ calculator })
        });
    },

    // 删除计算器
    async deleteCalculator(id) {
        return await api.request(`/formula/calculator/${id}`, {
            method: 'DELETE'
        });
    },

    // 复制计算器
    async copyCalculator(id, name) {
        return await api.post(`/formula/calculator/${id}/copy`, { name });
    },

    // 导出计算器
    async exportCalculators(calculatorIds) {
        return await api.post('/formula/export', { calculatorIds });
    },

    // 导入计算器
    async importCalculators(data, overwrite = false) {
        return await api.post('/formula/import', { data, overwrite });
    }
};

// 将公式API添加到全局api对象
api.formula = formulaApi;