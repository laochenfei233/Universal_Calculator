/**
 * 计算器辅助功能
 */

// 帮助系统
const CalculatorHelp = {
    basic: {
        title: '基础计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>支持基本的四则运算：加法(+)、减法(-)、乘法(×)、除法(÷)</p>
            
            <h4>快捷键</h4>
            <ul>
                <li><kbd>0-9</kbd> - 输入数字</li>
                <li><kbd>+</kbd><kbd>-</kbd><kbd>*</kbd><kbd>/</kbd> - 运算符</li>
                <li><kbd>Enter</kbd> - 计算结果</li>
                <li><kbd>Esc</kbd> - 清除所有</li>
                <li><kbd>Backspace</kbd> - 删除最后一位</li>
            </ul>
            
            <h4>使用技巧</h4>
            <ul>
                <li>支持小数运算</li>
                <li>支持连续运算</li>
                <li>自动处理运算优先级</li>
            </ul>
        `
    },
    
    scientific: {
        title: '科学计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>支持高级数学函数和科学计算</p>
            
            <h4>三角函数</h4>
            <ul>
                <li><code>sin(x)</code> - 正弦函数</li>
                <li><code>cos(x)</code> - 余弦函数</li>
                <li><code>tan(x)</code> - 正切函数</li>
                <li><code>asin(x)</code> - 反正弦函数</li>
                <li><code>acos(x)</code> - 反余弦函数</li>
                <li><code>atan(x)</code> - 反正切函数</li>
            </ul>
            
            <h4>对数和指数</h4>
            <ul>
                <li><code>log(x)</code> - 常用对数(以10为底)</li>
                <li><code>ln(x)</code> - 自然对数(以e为底)</li>
                <li><code>exp(x)</code> - e的x次方</li>
                <li><code>pow(x,y)</code> - x的y次方</li>
            </ul>
            
            <h4>常数</h4>
            <ul>
                <li><code>π</code> - 圆周率 (3.14159...)</li>
                <li><code>e</code> - 自然常数 (2.71828...)</li>
            </ul>
            
            <h4>其他函数</h4>
            <ul>
                <li><code>sqrt(x)</code> - 平方根</li>
                <li><code>abs(x)</code> - 绝对值</li>
                <li><code>factorial(n)</code> - 阶乘</li>
            </ul>
        `
    },
    
    tax: {
        title: '个税计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>根据中国个人所得税法计算个人所得税</p>
            
            <h4>计算公式</h4>
            <p>应纳税所得额 = 税前工资 - 社保 - 公积金 - 专项扣除 - 5000(起征点)</p>
            <p>个人所得税 = 应纳税所得额 × 税率 - 速算扣除数</p>
            
            <h4>税率表(月度)</h4>
            <table>
                <tr><th>应纳税所得额</th><th>税率</th><th>速算扣除数</th></tr>
                <tr><td>不超过3000元</td><td>3%</td><td>0</td></tr>
                <tr><td>3000-12000元</td><td>10%</td><td>210</td></tr>
                <tr><td>12000-25000元</td><td>20%</td><td>1410</td></tr>
                <tr><td>25000-35000元</td><td>25%</td><td>2660</td></tr>
                <tr><td>35000-55000元</td><td>30%</td><td>4410</td></tr>
                <tr><td>55000-80000元</td><td>35%</td><td>7160</td></tr>
                <tr><td>超过80000元</td><td>45%</td><td>15160</td></tr>
            </table>
        `
    },
    
    mortgage: {
        title: '房贷计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>计算房屋贷款的月供和总利息</p>
            
            <h4>还款方式</h4>
            <ul>
                <li><strong>等额本息</strong> - 每月还款金额相同</li>
                <li><strong>等额本金</strong> - 每月本金相同，利息递减</li>
            </ul>
            
            <h4>等额本息公式</h4>
            <p>月供 = [贷款本金 × 月利率 × (1+月利率)^还款月数] ÷ [(1+月利率)^还款月数 - 1]</p>
            
            <h4>等额本金公式</h4>
            <p>月供 = (贷款本金 ÷ 还款月数) + (本金 - 已归还本金累计额) × 月利率</p>
            
            <h4>使用建议</h4>
            <ul>
                <li>等额本息：前期压力小，总利息较高</li>
                <li>等额本金：前期压力大，总利息较低</li>
            </ul>
        `
    },
    
    bmi: {
        title: 'BMI计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>计算身体质量指数(Body Mass Index)</p>
            
            <h4>计算公式</h4>
            <p>BMI = 体重(kg) ÷ 身高²(m²)</p>
            
            <h4>BMI分类标准</h4>
            <table>
                <tr><th>BMI范围</th><th>分类</th><th>健康状况</th></tr>
                <tr><td>&lt; 18.5</td><td>偏瘦</td><td>体重不足</td></tr>
                <tr><td>18.5 - 23.9</td><td>正常</td><td>健康体重</td></tr>
                <tr><td>24.0 - 27.9</td><td>偏胖</td><td>超重</td></tr>
                <tr><td>≥ 28.0</td><td>肥胖</td><td>肥胖</td></tr>
            </table>
            
            <h4>注意事项</h4>
            <ul>
                <li>BMI仅供参考，不适用于孕妇、儿童</li>
                <li>肌肉发达者BMI可能偏高但不代表肥胖</li>
                <li>建议结合体脂率等指标综合判断</li>
            </ul>
        `
    },
    
    converter: {
        title: '单位换算帮助',
        content: `
            <h4>功能说明</h4>
            <p>支持多种单位之间的换算</p>
            
            <h4>支持的单位类别</h4>
            <ul>
                <li><strong>长度</strong>：米、厘米、毫米、千米、英寸、英尺、码</li>
                <li><strong>重量</strong>：千克、克、磅、盎司、吨</li>
                <li><strong>温度</strong>：摄氏度、华氏度、开尔文</li>
                <li><strong>面积</strong>：平方米、平方厘米、平方千米、英亩</li>
                <li><strong>体积</strong>：立方米、升、毫升、加仑</li>
            </ul>
            
            <h4>使用方法</h4>
            <ol>
                <li>选择单位类别</li>
                <li>输入要转换的数值</li>
                <li>选择源单位和目标单位</li>
                <li>点击换算按钮</li>
            </ol>
            
            <h4>快捷功能</h4>
            <ul>
                <li>点击交换按钮可快速交换源单位和目标单位</li>
                <li>支持批量换算功能</li>
            </ul>
        `
    },
    
    number: {
        title: '数字转换帮助',
        content: `
            <h4>功能说明</h4>
            <p>阿拉伯数字与中文数字之间的转换</p>
            
            <h4>支持的转换类型</h4>
            <ul>
                <li><strong>中文数字</strong>：一、二、三、十、百、千、万</li>
                <li><strong>财务大写</strong>：壹、贰、叁、拾、佰、仟、万</li>
                <li><strong>阿拉伯数字</strong>：1、2、3、10、100、1000、10000</li>
                <li><strong>财务金额格式</strong>：带单位的财务格式</li>
            </ul>
            
            <h4>支持范围</h4>
            <p>-999,999,999,999,999 ~ 999,999,999,999,999</p>
            
            <h4>使用示例</h4>
            <ul>
                <li>12345 → 一万二千三百四十五</li>
                <li>12345 → 壹万贰仟叁佰肆拾伍</li>
                <li>一万二千三百四十五 → 12345</li>
            </ul>
            
            <h4>特殊功能</h4>
            <ul>
                <li>支持批量转换</li>
                <li>支持双向转换</li>
                <li>自动识别输入类型</li>
            </ul>
        `
    },
    
    relationship: {
        title: '称呼计算器帮助',
        content: `
            <h4>功能说明</h4>
            <p>根据亲属关系路径计算正确的称呼</p>
            
            <h4>使用方法</h4>
            <ol>
                <li>输入关系路径，如：父亲 → 哥哥 → 儿子</li>
                <li>选择询问者性别</li>
                <li>选择地区方言(可选)</li>
                <li>点击计算称呼</li>
            </ol>
            
            <h4>支持的关系</h4>
            <ul>
                <li><strong>直系</strong>：父亲、母亲、儿子、女儿、爷爷、奶奶</li>
                <li><strong>旁系</strong>：兄弟、姐妹、叔叔、阿姨、堂兄弟、表兄弟</li>
                <li><strong>姻亲</strong>：岳父、岳母、女婿、儿媳</li>
            </ul>
            
            <h4>输入格式</h4>
            <ul>
                <li>用 → 、-> 、, 或空格分隔关系</li>
                <li>例如：父亲的哥哥的儿子</li>
                <li>例如：父亲 → 哥哥 → 儿子</li>
            </ul>
            
            <h4>反向查询</h4>
            <p>输入称呼可以查询可能的关系路径</p>
        `
    },
    
    formula: {
        title: '公式编辑器帮助',
        content: `
            <h4>功能说明</h4>
            <p>图形化创建和编辑数学公式，生成自定义计算器</p>
            
            <h4>使用方法</h4>
            <ol>
                <li>从工具栏拖拽数学符号到构建区</li>
                <li>添加函数和变量</li>
                <li>验证公式语法</li>
                <li>保存公式或创建计算器</li>
            </ol>
            
            <h4>支持的元素</h4>
            <ul>
                <li><strong>基本运算</strong>：+、-、×、÷、^</li>
                <li><strong>函数</strong>：sin、cos、tan、log、ln、sqrt</li>
                <li><strong>常数</strong>：π、e</li>
                <li><strong>变量</strong>：自定义变量名</li>
            </ul>
            
            <h4>自定义计算器</h4>
            <ul>
                <li>定义输入字段和类型</li>
                <li>设置验证规则</li>
                <li>自定义界面样式</li>
                <li>导出和分享功能</li>
            </ul>
        `
    }
};

// 显示帮助对话框
function showCalculatorHelp(calculatorType) {
    const help = CalculatorHelp[calculatorType];
    if (!help) {
        showError('暂无该计算器的帮助信息');
        return;
    }
    
    showModal(help.title, help.content);
}

// 模态框系统
function showModal(title, content, options = {}) {
    // 移除现有模态框
    const existingModal = document.getElementById('help-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeModal()">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.remove();
    }
}

// 角度模式切换（科学计算器）
let angleMode = 'deg'; // 'deg' 或 'rad'

function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    const btn = document.getElementById('angle-mode-btn');
    if (btn) {
        btn.textContent = angleMode.toUpperCase();
        btn.title = angleMode === 'deg' ? '度数模式' : '弧度模式';
    }
    showInfo(`已切换到${angleMode === 'deg' ? '度数' : '弧度'}模式`);
}

// 各种辅助功能
function showTaxRates() {
    const content = `
        <h4>个人所得税税率表(月度)</h4>
        <table class="tax-rate-table">
            <thead>
                <tr>
                    <th>应纳税所得额</th>
                    <th>税率</th>
                    <th>速算扣除数</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>不超过3,000元</td><td>3%</td><td>0</td></tr>
                <tr><td>超过3,000元至12,000元</td><td>10%</td><td>210</td></tr>
                <tr><td>超过12,000元至25,000元</td><td>20%</td><td>1,410</td></tr>
                <tr><td>超过25,000元至35,000元</td><td>25%</td><td>2,660</td></tr>
                <tr><td>超过35,000元至55,000元</td><td>30%</td><td>4,410</td></tr>
                <tr><td>超过55,000元至80,000元</td><td>35%</td><td>7,160</td></tr>
                <tr><td>超过80,000元</td><td>45%</td><td>15,160</td></tr>
            </tbody>
        </table>
    `;
    showModal('个人所得税税率表', content);
}

function showLoanRates() {
    const content = `
        <h4>贷款利率参考(年利率)</h4>
        <table class="loan-rate-table">
            <thead>
                <tr>
                    <th>贷款类型</th>
                    <th>期限</th>
                    <th>基准利率</th>
                </tr>
            </thead>
            <tbody>
                <tr><td rowspan="2">商业贷款</td><td>1-5年</td><td>4.75%</td></tr>
                <tr><td>5年以上</td><td>4.90%</td></tr>
                <tr><td rowspan="2">公积金贷款</td><td>5年以下</td><td>2.75%</td></tr>
                <tr><td>5年以上</td><td>3.25%</td></tr>
            </tbody>
        </table>
        <p><small>注：实际利率以银行公布为准，此表仅供参考</small></p>
    `;
    showModal('贷款利率参考', content);
}

function showBMIChart() {
    const content = `
        <h4>BMI分类标准</h4>
        <table class="bmi-chart">
            <thead>
                <tr>
                    <th>BMI范围</th>
                    <th>分类</th>
                    <th>健康风险</th>
                </tr>
            </thead>
            <tbody>
                <tr class="underweight"><td>&lt; 18.5</td><td>偏瘦</td><td>营养不良风险</td></tr>
                <tr class="normal"><td>18.5 - 23.9</td><td>正常</td><td>健康体重</td></tr>
                <tr class="overweight"><td>24.0 - 27.9</td><td>偏胖</td><td>超重风险</td></tr>
                <tr class="obese"><td>≥ 28.0</td><td>肥胖</td><td>肥胖相关疾病风险</td></tr>
            </tbody>
        </table>
        <h4>健康建议</h4>
        <ul>
            <li><strong>偏瘦</strong>：适当增加营养摄入，进行力量训练</li>
            <li><strong>正常</strong>：保持现有生活方式，定期运动</li>
            <li><strong>偏胖</strong>：控制饮食，增加有氧运动</li>
            <li><strong>肥胖</strong>：建议咨询医生，制定减重计划</li>
        </ul>
    `;
    showModal('BMI分类标准', content);
}

function showConversionTable() {
    showInfo('换算表功能开发中...');
}

function showNumberExamples() {
    const content = `
        <h4>数字转换示例</h4>
        <table class="number-examples">
            <thead>
                <tr>
                    <th>阿拉伯数字</th>
                    <th>中文数字</th>
                    <th>财务大写</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>123</td><td>一百二十三</td><td>壹佰贰拾叁</td></tr>
                <tr><td>1,234</td><td>一千二百三十四</td><td>壹仟贰佰叁拾肆</td></tr>
                <tr><td>12,345</td><td>一万二千三百四十五</td><td>壹万贰仟叁佰肆拾伍</td></tr>
                <tr><td>123,456</td><td>十二万三千四百五十六</td><td>拾贰万叁仟肆佰伍拾陆</td></tr>
            </tbody>
        </table>
        <h4>特殊规则</h4>
        <ul>
            <li>零的处理：10,005 → 一万零五</li>
            <li>十的处理：10 → 十，110 → 一百一十</li>
            <li>负数处理：-123 → 负一百二十三</li>
        </ul>
    `;
    showModal('数字转换示例', content);
}

function showRelationshipTree() {
    showInfo('关系图谱功能开发中...');
}

function showFormulaTemplates() {
    showInfo('公式模板功能开发中...');
}

// 导出函数供全局使用
window.showCalculatorHelp = showCalculatorHelp;
window.showModal = showModal;
window.closeModal = closeModal;
window.toggleAngleMode = toggleAngleMode;
window.showTaxRates = showTaxRates;
window.showLoanRates = showLoanRates;
window.showBMIChart = showBMIChart;
window.showConversionTable = showConversionTable;
window.showNumberExamples = showNumberExamples;
window.showRelationshipTree = showRelationshipTree;
window.showFormulaTemplates = showFormulaTemplates;