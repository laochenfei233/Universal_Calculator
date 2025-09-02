/**
 * BMI计算器工具类
 * 提供增强的BMI计算、分析和建议功能
 */

class BMICalculator {
  /**
   * BMI分类标准（WHO标准）
   */
  static BMI_CATEGORIES = {
    UNDERWEIGHT: { min: 0, max: 18.5, name: '偏瘦', color: '#3498db' },
    NORMAL: { min: 18.5, max: 24.9, name: '正常', color: '#2ecc71' },
    OVERWEIGHT: { min: 25, max: 29.9, name: '偏胖', color: '#f39c12' },
    OBESE_CLASS_1: { min: 30, max: 34.9, name: '轻度肥胖', color: '#e67e22' },
    OBESE_CLASS_2: { min: 35, max: 39.9, name: '中度肥胖', color: '#d35400' },
    OBESE_CLASS_3: { min: 40, max: Infinity, name: '重度肥胖', color: '#c0392b' }
  };

  /**
   * 单位转换系数
   */
  static CONVERSION_FACTORS = {
    // 重量转换（转换为千克）
    weight: {
      kg: 1,
      lb: 0.453592,
      stone: 6.35029,
      g: 0.001
    },
    // 身高转换（转换为米）
    height: {
      m: 1,
      cm: 0.01,
      ft: 0.3048,
      in: 0.0254,
      mm: 0.001
    }
  };

  /**
   * 计算BMI值
   * @param {number} weight - 体重
   * @param {number} height - 身高
   * @param {string} weightUnit - 体重单位
   * @param {string} heightUnit - 身高单位
   * @returns {object} BMI计算结果
   */
  static calculateBMI(weight, height, weightUnit = 'kg', heightUnit = 'cm') {
    // 转换为标准单位
    const weightKg = this.convertWeight(weight, weightUnit);
    const heightM = this.convertHeight(height, heightUnit);

    // 计算BMI
    const bmi = weightKg / (heightM * heightM);
    
    // 获取分类信息
    const category = this.getBMICategory(bmi);
    
    // 获取详细分析
    const analysis = this.getDetailedAnalysis(bmi, weightKg, heightM);
    
    // 获取建议
    const recommendations = this.getRecommendations(bmi, category);
    
    // 计算理想体重范围
    const idealWeightRange = this.getIdealWeightRange(heightM, weightUnit);

    return {
      bmi: Math.round(bmi * 100) / 100,
      category: category.name,
      categoryColor: category.color,
      analysis,
      recommendations,
      idealWeightRange,
      input: {
        weight,
        height,
        weightUnit,
        heightUnit
      },
      converted: {
        weightKg: Math.round(weightKg * 100) / 100,
        heightM: Math.round(heightM * 100) / 100
      },
      healthRisk: this.getHealthRisk(bmi),
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * 转换体重到千克
   */
  static convertWeight(weight, unit) {
    const factor = this.CONVERSION_FACTORS.weight[unit];
    if (!factor) {
      throw new Error(`不支持的体重单位: ${unit}`);
    }
    return weight * factor;
  }

  /**
   * 转换身高到米
   */
  static convertHeight(height, unit) {
    const factor = this.CONVERSION_FACTORS.height[unit];
    if (!factor) {
      throw new Error(`不支持的身高单位: ${unit}`);
    }
    return height * factor;
  }

  /**
   * 获取BMI分类
   */
  static getBMICategory(bmi) {
    for (const [key, category] of Object.entries(this.BMI_CATEGORIES)) {
      if (bmi >= category.min && bmi < category.max) {
        return category;
      }
    }
    return this.BMI_CATEGORIES.OBESE_CLASS_3; // 默认返回重度肥胖
  }

  /**
   * 获取详细分析
   */
  static getDetailedAnalysis(bmi, weightKg, heightM) {
    const category = this.getBMICategory(bmi);
    
    let analysis = {
      status: category.name,
      description: '',
      percentile: this.getBMIPercentile(bmi),
      bodyFatEstimate: this.estimateBodyFat(bmi),
      metabolicAge: this.estimateMetabolicAge(bmi, weightKg, heightM)
    };

    switch (category.name) {
      case '偏瘦':
        analysis.description = '您的体重偏轻，可能存在营养不良的风险。建议增加营养摄入，进行适当的力量训练来增加肌肉量。';
        break;
      case '正常':
        analysis.description = '恭喜！您的BMI处于健康范围内。继续保持良好的饮食习惯和规律运动。';
        break;
      case '偏胖':
        analysis.description = '您的体重略微超标，建议通过合理饮食控制和增加运动来改善体重状况。';
        break;
      case '轻度肥胖':
        analysis.description = '您处于轻度肥胖状态，需要采取积极措施控制体重，降低慢性疾病风险。';
        break;
      case '中度肥胖':
        analysis.description = '您处于中度肥胖状态，强烈建议咨询医生制定专业的减重计划。';
        break;
      case '重度肥胖':
        analysis.description = '您处于重度肥胖状态，存在严重健康风险，请立即咨询医疗专业人士。';
        break;
    }

    return analysis;
  }

  /**
   * 获取健康建议
   */
  static getRecommendations(bmi, category) {
    const recommendations = {
      diet: [],
      exercise: [],
      lifestyle: [],
      medical: []
    };

    switch (category.name) {
      case '偏瘦':
        recommendations.diet = [
          '增加健康脂肪摄入（坚果、牛油果、橄榄油）',
          '多吃蛋白质丰富的食物（鸡蛋、瘦肉、豆类）',
          '适当增加碳水化合物摄入',
          '少食多餐，增加营养密度'
        ];
        recommendations.exercise = [
          '进行力量训练增加肌肉量',
          '避免过度有氧运动',
          '重点训练大肌群',
          '确保充足的休息恢复'
        ];
        recommendations.lifestyle = [
          '保证充足睡眠（7-9小时）',
          '减少压力和焦虑',
          '戒烟限酒',
          '定期体检监测健康状况'
        ];
        break;

      case '正常':
        recommendations.diet = [
          '保持均衡饮食',
          '多吃蔬菜水果',
          '控制加工食品摄入',
          '适量摄入优质蛋白质'
        ];
        recommendations.exercise = [
          '每周至少150分钟中等强度有氧运动',
          '每周2-3次力量训练',
          '保持运动多样性',
          '逐步增加运动强度'
        ];
        recommendations.lifestyle = [
          '保持规律作息',
          '管理工作压力',
          '保持社交活动',
          '定期健康检查'
        ];
        break;

      case '偏胖':
      case '轻度肥胖':
        recommendations.diet = [
          '控制总热量摄入',
          '减少高糖高脂食物',
          '增加膳食纤维摄入',
          '控制餐具大小，细嚼慢咽'
        ];
        recommendations.exercise = [
          '每周至少300分钟中等强度有氧运动',
          '结合力量训练维持肌肉量',
          '增加日常活动量',
          '选择喜欢的运动方式坚持'
        ];
        recommendations.lifestyle = [
          '建立健康的生活习惯',
          '寻求家人朋友支持',
          '设定合理的减重目标',
          '记录饮食和运动日志'
        ];
        recommendations.medical = [
          '定期监测血压、血糖',
          '考虑咨询营养师',
          '必要时寻求医生指导'
        ];
        break;

      case '中度肥胖':
      case '重度肥胖':
        recommendations.diet = [
          '严格控制热量摄入',
          '考虑专业营养师指导',
          '可能需要特殊饮食计划',
          '避免极端节食'
        ];
        recommendations.exercise = [
          '从低强度运动开始',
          '逐步增加运动量',
          '选择关节友好的运动',
          '在专业指导下进行'
        ];
        recommendations.lifestyle = [
          '寻求专业医疗支持',
          '考虑心理咨询',
          '建立强大的支持系统',
          '设定阶段性目标'
        ];
        recommendations.medical = [
          '立即咨询医生',
          '全面健康检查',
          '监测相关疾病风险',
          '考虑医疗干预选项'
        ];
        break;
    }

    return recommendations;
  }

  /**
   * 计算理想体重范围
   */
  static getIdealWeightRange(heightM, targetUnit = 'kg') {
    const minIdealWeight = 18.5 * heightM * heightM;
    const maxIdealWeight = 24.9 * heightM * heightM;
    
    // 转换到目标单位
    const conversionFactor = 1 / this.CONVERSION_FACTORS.weight[targetUnit];
    
    return {
      min: Math.round(minIdealWeight * conversionFactor * 100) / 100,
      max: Math.round(maxIdealWeight * conversionFactor * 100) / 100,
      unit: targetUnit
    };
  }

  /**
   * 获取BMI百分位数（基于人群分布的估算）
   */
  static getBMIPercentile(bmi) {
    if (bmi < 18.5) return Math.max(5, Math.round((bmi / 18.5) * 15));
    if (bmi < 25) return Math.round(15 + ((bmi - 18.5) / 6.5) * 70);
    if (bmi < 30) return Math.round(85 + ((bmi - 25) / 5) * 10);
    return Math.min(99, Math.round(95 + ((bmi - 30) / 10) * 4));
  }

  /**
   * 估算体脂率（基于BMI的粗略估算）
   */
  static estimateBodyFat(bmi) {
    // 这是一个简化的估算公式，实际体脂率需要专业设备测量
    let bodyFat;
    if (bmi < 18.5) {
      bodyFat = Math.max(5, (bmi - 15) * 2);
    } else if (bmi < 25) {
      bodyFat = 10 + (bmi - 18.5) * 2;
    } else {
      bodyFat = 23 + (bmi - 25) * 1.5;
    }
    
    return {
      estimated: Math.round(bodyFat * 10) / 10,
      note: '此为基于BMI的粗略估算，实际体脂率可能有较大差异'
    };
  }

  /**
   * 估算代谢年龄
   */
  static estimateMetabolicAge(bmi, weightKg, heightM) {
    // 基于BMI和基础代谢率的简化估算
    const bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightM * 100) - (5.677 * 30); // 假设30岁
    const idealBMR = 88.362 + (13.397 * 22 * heightM * heightM) + (4.799 * heightM * 100) - (5.677 * 30);
    
    const metabolicAge = 30 + (bmr - idealBMR) / 10;
    
    return {
      estimated: Math.round(Math.max(18, Math.min(80, metabolicAge))),
      note: '代谢年龄是基于基础代谢率的估算值'
    };
  }

  /**
   * 获取健康风险评估
   */
  static getHealthRisk(bmi) {
    const risks = {
      level: 'low',
      description: '',
      conditions: []
    };

    if (bmi < 18.5) {
      risks.level = 'moderate';
      risks.description = '体重过轻可能增加某些健康风险';
      risks.conditions = ['营养不良', '免疫力下降', '骨质疏松', '生育问题'];
    } else if (bmi >= 18.5 && bmi < 25) {
      risks.level = 'low';
      risks.description = '健康风险较低';
      risks.conditions = [];
    } else if (bmi >= 25 && bmi < 30) {
      risks.level = 'moderate';
      risks.description = '超重增加慢性疾病风险';
      risks.conditions = ['高血压', '2型糖尿病', '心血管疾病', '睡眠呼吸暂停'];
    } else if (bmi >= 30 && bmi < 35) {
      risks.level = 'high';
      risks.description = '肥胖显著增加健康风险';
      risks.conditions = ['心脏病', '中风', '糖尿病', '某些癌症', '关节疾病'];
    } else {
      risks.level = 'very_high';
      risks.description = '严重肥胖存在重大健康风险';
      risks.conditions = ['心血管疾病', '糖尿病并发症', '呼吸系统疾病', '多种癌症', '严重关节问题'];
    }

    return risks;
  }

  /**
   * 验证输入参数
   */
  static validateInput(weight, height, weightUnit, heightUnit) {
    const errors = [];

    // 验证数值
    if (!weight || isNaN(weight) || weight <= 0) {
      errors.push('体重必须是大于0的数字');
    }
    if (!height || isNaN(height) || height <= 0) {
      errors.push('身高必须是大于0的数字');
    }

    // 验证单位
    if (!this.CONVERSION_FACTORS.weight[weightUnit]) {
      errors.push(`不支持的体重单位: ${weightUnit}`);
    }
    if (!this.CONVERSION_FACTORS.height[heightUnit]) {
      errors.push(`不支持的身高单位: ${heightUnit}`);
    }

    // 验证合理范围（转换后）
    if (errors.length === 0) {
      try {
        const weightKg = this.convertWeight(weight, weightUnit);
        const heightM = this.convertHeight(height, heightUnit);

        if (weightKg < 1 || weightKg > 1000) {
          errors.push('体重超出合理范围（1-1000千克）');
        }
        if (heightM < 0.3 || heightM > 3) {
          errors.push('身高超出合理范围（0.3-3米）');
        }
      } catch (error) {
        errors.push(error.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取支持的单位列表
   */
  static getSupportedUnits() {
    return {
      weight: Object.keys(this.CONVERSION_FACTORS.weight),
      height: Object.keys(this.CONVERSION_FACTORS.height)
    };
  }
}

module.exports = BMICalculator;