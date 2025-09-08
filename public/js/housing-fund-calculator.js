// 切换标签页
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// 根据提取类型显示/隐藏租金字段
function toggleRentField() {
    const withdrawalTypeElement = document.getElementById('withdrawalType');
    const rentField = document.getElementById('rentField');
    
    if (!withdrawalTypeElement || !rentField) return;
    
    const withdrawalType = withdrawalTypeElement.value;
    rentField.style.display = withdrawalType === 'rent' ? 'block' : 'none';
}

// 公积金缴费计算
async function calculatePayment() {
    const salaryElement = document.getElementById('salary');
    const baseElement = document.getElementById('base');
    const rateElement = document.getElementById('rate');
    const cityElement = document.getElementById('city');
    
    if (!salaryElement || !baseElement || !rateElement || !cityElement) return;
    
    const salary = parseFloat(salaryElement.value);
    const base = parseFloat(baseElement.value) || 0;
    const rate = parseFloat(rateElement.value) / 100 || 0.12;
    const city = cityElement.value;
    
    if (!salary || salary <= 0) {
        alert('请输入有效的月工资');
        return;
    }
    
    try {
        const response = await fetch('/api/housing-fund/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salary,
                base,
                rate,
                city
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('paymentResult');
            resultDiv.innerHTML = `
                <h3>计算结果</h3>
                <p><strong>缴费基数:</strong> ${result.base.toFixed(2)} 元</p>
                <p><strong>个人缴费比例:</strong> ${result.personalRate.toFixed(2)}%</p>
                <p><strong>单位缴费比例:</strong> ${result.employerRate.toFixed(2)}%</p>
                <p><strong>个人月缴存额:</strong> ${result.personalAmount.toFixed(2)} 元</p>
                <p><strong>单位月缴存额:</strong> ${result.employerAmount.toFixed(2)} 元</p>
                <p><strong>月缴存总额:</strong> ${result.totalAmount.toFixed(2)} 元</p>
                <p><strong>基数范围:</strong> ${result.limits.minBase.toFixed(2)} - ${result.limits.maxBase.toFixed(2)} 元</p>
            `;
            resultDiv.style.display = 'block';
        } else {
            throw new Error(result.message || '计算失败');
        }
    } catch (error) {
        alert('计算失败: ' + error.message);
        console.error('Error:', error);
    }
}

// 公积金基数调整计算
async function calculateAdjustment() {
    const averageSalary = parseFloat(document.getElementById('averageSalary').value);
    const personalSalary = parseFloat(document.getElementById('personalSalary').value);
    const currentBase = parseFloat(document.getElementById('currentBase').value) || 0;
    const rate = parseFloat(document.getElementById('adjustmentRate').value) / 100 || 0.12;
    
    if (!averageSalary || averageSalary <= 0 || !personalSalary || personalSalary <= 0) {
        alert('请输入有效的工资数据');
        return;
    }
    
    try {
        const response = await fetch('/api/housing-fund/base-adjustment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                averageSalary,
                personalSalary,
                currentBase,
                rate
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('adjustmentResult');
            resultDiv.innerHTML = `
                <h3>计算结果</h3>
                <p><strong>当前基数:</strong> ${result.currentBase.toFixed(2)} 元</p>
                <p><strong>推荐基数:</strong> ${result.recommendedBase.toFixed(2)} 元</p>
                <p><strong>当前月缴存额:</strong> ${result.currentMonthlyPayment.toFixed(2)} 元</p>
                <p><strong>调整后月缴存额:</strong> ${result.newMonthlyPayment.toFixed(2)} 元</p>
                <p><strong>月缴存额变化:</strong> ${result.monthlyDifference.toFixed(2)} 元</p>
                <p><strong>年缴存额变化:</strong> ${result.annualDifference.toFixed(2)} 元</p>
                <p><strong>缴费比例:</strong> ${result.rate.toFixed(2)}%</p>
                <p><strong>基数范围:</strong> ${result.limits.minBase.toFixed(2)} - ${result.limits.maxBase.toFixed(2)} 元</p>
                <p><strong>社会平均工资基数范围:</strong> ${result.averageSalaryLimits.minBase.toFixed(2)} - ${result.averageSalaryLimits.maxBase.toFixed(2)} 元</p>
            `;
            resultDiv.style.display = 'block';
        } else {
            throw new Error(result.message || '计算失败');
        }
    } catch (error) {
        alert('计算失败: ' + error.message);
        console.error('Error:', error);
    }
}

// 公积金贷款额度计算
async function calculateLoan() {
    const base = parseFloat(document.getElementById('loanBase').value) || 0;
    const balance = parseFloat(document.getElementById('balance').value) || 0;
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 30;
    const rate = parseFloat(document.getElementById('loanRate').value) / 100 || 0.031;
    
    if (!base || base <= 0 || !balance || balance <= 0 || !monthlyIncome || monthlyIncome <= 0) {
        alert('请输入有效的输入数据');
        return;
    }
    
    try {
        const response = await fetch('/api/housing-fund/loan-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base,
                balance,
                monthlyIncome,
                years,
                rate
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('loanResult');
            resultDiv.innerHTML = `
                <h3>计算结果</h3>
                <p><strong>可贷款额度:</strong> ${result.loanLimit.toFixed(2)} 元</p>
                <p><strong>基于账户余额计算的额度:</strong> ${result.balanceBasedLimit.toFixed(2)} 元</p>
                <p><strong>基于缴费基数计算的额度:</strong> ${result.baseBasedLimit.toFixed(2)} 元</p>
                <p><strong>基于还款能力计算的额度:</strong> ${result.incomeBasedLimit.toFixed(2)} 元</p>
                <p><strong>最大月供:</strong> ${result.maxMonthlyPayment.toFixed(2)} 元</p>
                <p><strong>贷款年限:</strong> ${result.years} 年</p>
                <p><strong>贷款利率:</strong> ${result.rate.toFixed(2)}%</p>
            `;
            resultDiv.style.display = 'block';
        } else {
            throw new Error(result.message || '计算失败');
        }
    } catch (error) {
        alert('计算失败: ' + error.message);
        console.error('Error:', error);
    }
}

// 公积金提取额度计算
async function calculateWithdrawal() {
    const balanceElement = document.getElementById('withdrawalBalance');
    const withdrawalTypeElement = document.getElementById('withdrawalType');
    const monthlyRentElement = document.getElementById('monthlyRent');
    
    if (!balanceElement || !withdrawalTypeElement || !monthlyRentElement) return;
    
    const balance = parseFloat(balanceElement.value) || 0;
    const withdrawalType = withdrawalTypeElement.value;
    const monthlyRent = parseFloat(monthlyRentElement.value) || 0;
    
    if (!balance || balance <= 0) {
        alert('请输入有效的公积金账户余额');
        return;
    }
    
    if (withdrawalType === 'rent' && (!monthlyRent || monthlyRent <= 0)) {
        alert('请输入有效的月租金');
        return;
    }
    
    try {
        const response = await fetch('/api/housing-fund/withdrawal-limit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                balance,
                withdrawalType,
                monthlyRent: withdrawalType === 'rent' ? monthlyRent : 0
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            const resultDiv = document.getElementById('withdrawalResult');
            resultDiv.innerHTML = `
                <h3>计算结果</h3>
                <p><strong>可提取额度:</strong> ${result.withdrawalLimit.toFixed(2)} 元</p>
                <p><strong>账户余额:</strong> ${result.balance.toFixed(2)} 元</p>
                <p><strong>提取类型:</strong> ${result.withdrawalType === 'rent' ? '租房提取' : 
                                              result.withdrawalType === 'medical' ? '医疗提取' : 
                                              result.withdrawalType === 'education' ? '教育提取' : '其他提取'}</p>
                <p><strong>说明:</strong> ${result.reason}</p>
            `;
            resultDiv.style.display = 'block';
        } else {
            throw new Error(result.message || '计算失败');
        }
    } catch (error) {
        alert('计算失败: ' + error.message);
        console.error('Error:', error);
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 确保只在公积金计算器页面执行
    if (document.getElementById('withdrawalType')) {
        toggleRentField();
        
        // 默认激活第一个标签页
        const defaultTab = document.querySelector('.tablinks.active');
        if (defaultTab && defaultTab.getAttribute('onclick')) {
            const tabName = defaultTab.getAttribute('onclick').match(/'([^']+)'/)[1];
            const tabContent = document.getElementById(tabName);
            if (tabContent) {
                tabContent.style.display = 'block';
            }
        }
    }
});