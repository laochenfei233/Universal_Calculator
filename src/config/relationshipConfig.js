/**
 * 中文亲属关系配置
 * 支持性别差异和地区差异的亲属称呼计算
 */

// 基础关系定义
const BASIC_RELATIONS = {
  // 父系关系
  父亲: { gender: 'male', generation: 1, side: 'paternal' },
  母亲: { gender: 'female', generation: 1, side: 'maternal' },
  爸爸: { gender: 'male', generation: 1, side: 'paternal', alias: '父亲' },
  妈妈: { gender: 'female', generation: 1, side: 'maternal', alias: '母亲' },
  
  // 祖父母辈
  爷爷: { gender: 'male', generation: 2, side: 'paternal' },
  奶奶: { gender: 'female', generation: 2, side: 'paternal' },
  外公: { gender: 'male', generation: 2, side: 'maternal' },
  外婆: { gender: 'female', generation: 2, side: 'maternal' },
  
  // 兄弟姐妹
  哥哥: { gender: 'male', generation: 0, side: 'sibling', age: 'older' },
  弟弟: { gender: 'male', generation: 0, side: 'sibling', age: 'younger' },
  姐姐: { gender: 'female', generation: 0, side: 'sibling', age: 'older' },
  妹妹: { gender: 'female', generation: 0, side: 'sibling', age: 'younger' },
  
  // 子女
  儿子: { gender: 'male', generation: -1, side: 'child' },
  女儿: { gender: 'female', generation: -1, side: 'child' },
  
  // 配偶
  丈夫: { gender: 'male', generation: 0, side: 'spouse' },
  妻子: { gender: 'female', generation: 0, side: 'spouse' },
  老公: { gender: 'male', generation: 0, side: 'spouse', alias: '丈夫' },
  老婆: { gender: 'female', generation: 0, side: 'spouse', alias: '妻子' }
};

// 复合关系映射表
const RELATIONSHIP_MAP = {
  // 父亲的关系
  父亲: {
    父亲: { male: '爷爷', female: '爷爷' },
    母亲: { male: '奶奶', female: '奶奶' },
    哥哥: { male: '伯父', female: '伯父' },
    弟弟: { male: '叔叔', female: '叔叔' },
    姐姐: { male: '姑妈', female: '姑妈' },
    妹妹: { male: '姑妈', female: '姑妈' },
    儿子: { male: '哥哥', female: '哥哥' },
    女儿: { male: '姐姐', female: '姐姐' }
  },
  
  // 母亲的关系
  母亲: {
    父亲: { male: '外公', female: '外公' },
    母亲: { male: '外婆', female: '外婆' },
    哥哥: { male: '舅舅', female: '舅舅' },
    弟弟: { male: '舅舅', female: '舅舅' },
    姐姐: { male: '姨妈', female: '姨妈' },
    妹妹: { male: '姨妈', female: '姨妈' },
    儿子: { male: '哥哥', female: '哥哥' },
    女儿: { male: '姐姐', female: '姐姐' }
  },
  
  // 哥哥的关系
  哥哥: {
    儿子: { male: '侄子', female: '侄子' },
    女儿: { male: '侄女', female: '侄女' },
    妻子: { male: '嫂子', female: '嫂子' }
  },
  
  // 弟弟的关系
  弟弟: {
    儿子: { male: '侄子', female: '侄子' },
    女儿: { male: '侄女', female: '侄女' },
    妻子: { male: '弟媳', female: '弟媳' }
  },
  
  // 姐姐的关系
  姐姐: {
    儿子: { male: '外甥', female: '外甥' },
    女儿: { male: '外甥女', female: '外甥女' },
    丈夫: { male: '姐夫', female: '姐夫' }
  },
  
  // 妹妹的关系
  妹妹: {
    儿子: { male: '外甥', female: '外甥' },
    女儿: { male: '外甥女', female: '外甥女' },
    丈夫: { male: '妹夫', female: '妹夫' }
  },
  
  // 儿子的关系
  儿子: {
    儿子: { male: '孙子', female: '孙子' },
    女儿: { male: '孙女', female: '孙女' },
    妻子: { male: '儿媳', female: '儿媳' }
  },
  
  // 女儿的关系
  女儿: {
    儿子: { male: '外孙', female: '外孙' },
    女儿: { male: '外孙女', female: '外孙女' },
    丈夫: { male: '女婿', female: '女婿' }
  },
  
  // 伯父的关系
  伯父: {
    儿子: { male: '堂哥', female: '堂哥' },
    女儿: { male: '堂姐', female: '堂姐' },
    妻子: { male: '伯母', female: '伯母' }
  },
  
  // 叔叔的关系
  叔叔: {
    儿子: { male: '堂弟', female: '堂弟' },
    女儿: { male: '堂妹', female: '堂妹' },
    妻子: { male: '婶婶', female: '婶婶' }
  },
  
  // 舅舅的关系
  舅舅: {
    儿子: { male: '表哥', female: '表哥' },
    女儿: { male: '表姐', female: '表姐' },
    妻子: { male: '舅妈', female: '舅妈' }
  },
  
  // 姑妈的关系
  姑妈: {
    儿子: { male: '表哥', female: '表哥' },
    女儿: { male: '表姐', female: '表姐' },
    丈夫: { male: '姑父', female: '姑父' }
  },
  
  // 姨妈的关系
  姨妈: {
    儿子: { male: '表哥', female: '表哥' },
    女儿: { male: '表姐', female: '表姐' },
    丈夫: { male: '姨父', female: '姨父' }
  },
  
  // 爷爷的关系
  爷爷: {
    父亲: { male: '太爷爷', female: '太爷爷' },
    母亲: { male: '太奶奶', female: '太奶奶' },
    儿子: { male: '伯父', female: '伯父' },
    女儿: { male: '姑妈', female: '姑妈' }
  },
  
  // 奶奶的关系
  奶奶: {
    父亲: { male: '太爷爷', female: '太爷爷' },
    母亲: { male: '太奶奶', female: '太奶奶' },
    儿子: { male: '伯父', female: '伯父' },
    女儿: { male: '姑妈', female: '姑妈' }
  },
  
  // 外公的关系
  外公: {
    父亲: { male: '太外公', female: '太外公' },
    母亲: { male: '太外婆', female: '太外婆' },
    儿子: { male: '舅舅', female: '舅舅' },
    女儿: { male: '姨妈', female: '姨妈' }
  },
  
  // 外婆的关系
  外婆: {
    父亲: { male: '太外公', female: '太外公' },
    母亲: { male: '太外婆', female: '太外婆' },
    儿子: { male: '舅舅', female: '舅舅' },
    女儿: { male: '姨妈', female: '姨妈' }
  }
};

// 反向关系映射（用于反向查询）
const REVERSE_RELATIONSHIP_MAP = {
  爷爷: [['父亲', '父亲']],
  奶奶: [['父亲', '母亲']],
  外公: [['母亲', '父亲']],
  外婆: [['母亲', '母亲']],
  伯父: [['父亲', '哥哥']],
  叔叔: [['父亲', '弟弟']],
  姑妈: [['父亲', '姐姐'], ['父亲', '妹妹']],
  舅舅: [['母亲', '哥哥'], ['母亲', '弟弟']],
  姨妈: [['母亲', '姐姐'], ['母亲', '妹妹']],
  侄子: [['哥哥', '儿子'], ['弟弟', '儿子']],
  侄女: [['哥哥', '女儿'], ['弟弟', '女儿']],
  外甥: [['姐姐', '儿子'], ['妹妹', '儿子']],
  外甥女: [['姐姐', '女儿'], ['妹妹', '女儿']],
  孙子: [['儿子', '儿子']],
  孙女: [['儿子', '女儿']],
  外孙: [['女儿', '儿子']],
  外孙女: [['女儿', '女儿']],
  嫂子: [['哥哥', '妻子']],
  弟媳: [['弟弟', '妻子']],
  姐夫: [['姐姐', '丈夫']],
  妹夫: [['妹妹', '丈夫']],
  儿媳: [['儿子', '妻子']],
  女婿: [['女儿', '丈夫']],
  堂哥: [['伯父', '儿子'], ['叔叔', '儿子']],
  堂弟: [['伯父', '儿子'], ['叔叔', '儿子']],
  堂姐: [['伯父', '女儿'], ['叔叔', '女儿']],
  堂妹: [['伯父', '女儿'], ['叔叔', '女儿']],
  表哥: [['姑妈', '儿子'], ['姨妈', '儿子'], ['舅舅', '儿子']],
  表姐: [['姑妈', '女儿'], ['姨妈', '女儿'], ['舅舅', '女儿']],
  表弟: [['姑妈', '儿子'], ['姨妈', '儿子'], ['舅舅', '儿子']],
  表妹: [['姑妈', '女儿'], ['姨妈', '女儿'], ['舅舅', '女儿']],
  伯母: [['伯父', '妻子']],
  婶婶: [['叔叔', '妻子']],
  姑父: [['姑妈', '丈夫']],
  舅妈: [['舅舅', '妻子']],
  姨父: [['姨妈', '丈夫']],
  太爷爷: [['爷爷', '父亲'], ['奶奶', '父亲']],
  太奶奶: [['爷爷', '母亲'], ['奶奶', '母亲']],
  太外公: [['外公', '父亲'], ['外婆', '父亲']],
  太外婆: [['外公', '母亲'], ['外婆', '母亲']]
};

// 地区差异配置
const REGIONAL_VARIATIONS = {
  standard: {
    name: '标准称呼',
    variations: {}
  },
  northern: {
    name: '北方称呼',
    variations: {
      外公: '姥爷',
      外婆: '姥姥',
      舅妈: '舅母'
    }
  },
  southern: {
    name: '南方称呼',
    variations: {
      奶奶: '阿嫲',
      爷爷: '阿公'
    }
  }
};

module.exports = {
  BASIC_RELATIONS,
  RELATIONSHIP_MAP,
  REVERSE_RELATIONSHIP_MAP,
  REGIONAL_VARIATIONS
};