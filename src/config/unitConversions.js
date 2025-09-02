// 单位换算数据模型
// 定义各类单位的换算关系和系数

/**
 * 长度单位换算配置
 * 基准单位：米 (m)
 * factor: 转换为基准单位的系数
 */
const LENGTH_UNITS = {
  // 公制单位
  mm: { name: '毫米', factor: 0.001, symbol: 'mm' },
  cm: { name: '厘米', factor: 0.01, symbol: 'cm' },
  m: { name: '米', factor: 1, symbol: 'm' },
  km: { name: '千米', factor: 1000, symbol: 'km' },
  
  // 英制单位
  inch: { name: '英寸', factor: 0.0254, symbol: 'in' },
  ft: { name: '英尺', factor: 0.3048, symbol: 'ft' },
  yard: { name: '码', factor: 0.9144, symbol: 'yd' },
  mile: { name: '英里', factor: 1609.344, symbol: 'mi' },
  
  // 其他常用单位
  nautical_mile: { name: '海里', factor: 1852, symbol: 'nmi' }
};

/**
 * 重量单位换算配置
 * 基准单位：千克 (kg)
 */
const WEIGHT_UNITS = {
  // 公制单位
  mg: { name: '毫克', factor: 0.000001, symbol: 'mg' },
  g: { name: '克', factor: 0.001, symbol: 'g' },
  kg: { name: '千克', factor: 1, symbol: 'kg' },
  ton: { name: '吨', factor: 1000, symbol: 't' },
  
  // 英制单位
  oz: { name: '盎司', factor: 0.0283495, symbol: 'oz' },
  lb: { name: '磅', factor: 0.453592, symbol: 'lb' },
  stone: { name: '英石', factor: 6.35029, symbol: 'st' },
  
  // 中式单位
  liang: { name: '两', factor: 0.05, symbol: '两' },
  jin: { name: '斤', factor: 0.5, symbol: '斤' }
};

/**
 * 温度单位换算配置
 * 温度转换需要特殊处理，不能简单使用系数
 */
const TEMPERATURE_UNITS = {
  celsius: { 
    name: '摄氏度', 
    symbol: '°C',
    toCelsius: (value) => value,
    fromCelsius: (value) => value
  },
  fahrenheit: { 
    name: '华氏度', 
    symbol: '°F',
    toCelsius: (value) => (value - 32) * 5 / 9,
    fromCelsius: (value) => value * 9 / 5 + 32
  },
  kelvin: { 
    name: '开尔文', 
    symbol: 'K',
    toCelsius: (value) => value - 273.15,
    fromCelsius: (value) => value + 273.15
  },
  rankine: { 
    name: '兰氏度', 
    symbol: '°R',
    toCelsius: (value) => (value - 491.67) * 5 / 9,
    fromCelsius: (value) => value * 9 / 5 + 491.67
  }
};

/**
 * 面积单位换算配置
 * 基准单位：平方米 (m²)
 */
const AREA_UNITS = {
  // 公制单位
  mm2: { name: '平方毫米', factor: 0.000001, symbol: 'mm²' },
  cm2: { name: '平方厘米', factor: 0.0001, symbol: 'cm²' },
  m2: { name: '平方米', factor: 1, symbol: 'm²' },
  km2: { name: '平方千米', factor: 1000000, symbol: 'km²' },
  hectare: { name: '公顷', factor: 10000, symbol: 'ha' },
  
  // 英制单位
  inch2: { name: '平方英寸', factor: 0.00064516, symbol: 'in²' },
  ft2: { name: '平方英尺', factor: 0.092903, symbol: 'ft²' },
  yard2: { name: '平方码', factor: 0.836127, symbol: 'yd²' },
  acre: { name: '英亩', factor: 4046.86, symbol: 'ac' },
  
  // 中式单位
  mu: { name: '亩', factor: 666.667, symbol: '亩' }
};

/**
 * 体积单位换算配置
 * 基准单位：立方米 (m³)
 */
const VOLUME_UNITS = {
  // 公制单位
  ml: { name: '毫升', factor: 0.000001, symbol: 'ml' },
  l: { name: '升', factor: 0.001, symbol: 'L' },
  m3: { name: '立方米', factor: 1, symbol: 'm³' },
  
  // 英制单位
  fl_oz: { name: '液体盎司', factor: 0.0000295735, symbol: 'fl oz' },
  cup: { name: '杯', factor: 0.000236588, symbol: 'cup' },
  pint: { name: '品脱', factor: 0.000473176, symbol: 'pt' },
  quart: { name: '夸脱', factor: 0.000946353, symbol: 'qt' },
  gallon: { name: '加仑', factor: 0.00378541, symbol: 'gal' },
  
  // 立方单位
  inch3: { name: '立方英寸', factor: 0.0000163871, symbol: 'in³' },
  ft3: { name: '立方英尺', factor: 0.0283168, symbol: 'ft³' }
};

/**
 * 时间单位换算配置
 * 基准单位：秒 (s)
 */
const TIME_UNITS = {
  ms: { name: '毫秒', factor: 0.001, symbol: 'ms' },
  s: { name: '秒', factor: 1, symbol: 's' },
  min: { name: '分钟', factor: 60, symbol: 'min' },
  hour: { name: '小时', factor: 3600, symbol: 'h' },
  day: { name: '天', factor: 86400, symbol: 'd' },
  week: { name: '周', factor: 604800, symbol: 'w' },
  month: { name: '月', factor: 2629746, symbol: 'mo' }, // 平均月长度
  year: { name: '年', factor: 31556952, symbol: 'y' } // 平均年长度
};

/**
 * 速度单位换算配置
 * 基准单位：米每秒 (m/s)
 */
const SPEED_UNITS = {
  mps: { name: '米每秒', factor: 1, symbol: 'm/s' },
  kmh: { name: '千米每小时', factor: 0.277778, symbol: 'km/h' },
  mph: { name: '英里每小时', factor: 0.44704, symbol: 'mph' },
  fps: { name: '英尺每秒', factor: 0.3048, symbol: 'ft/s' },
  knot: { name: '节', factor: 0.514444, symbol: 'kn' }
};

/**
 * 单位类别配置
 */
const UNIT_CATEGORIES = {
  length: {
    name: '长度',
    units: LENGTH_UNITS,
    baseUnit: 'm'
  },
  weight: {
    name: '重量',
    units: WEIGHT_UNITS,
    baseUnit: 'kg'
  },
  temperature: {
    name: '温度',
    units: TEMPERATURE_UNITS,
    baseUnit: 'celsius',
    specialConversion: true
  },
  area: {
    name: '面积',
    units: AREA_UNITS,
    baseUnit: 'm2'
  },
  volume: {
    name: '体积',
    units: VOLUME_UNITS,
    baseUnit: 'm3'
  },
  time: {
    name: '时间',
    units: TIME_UNITS,
    baseUnit: 's'
  },
  speed: {
    name: '速度',
    units: SPEED_UNITS,
    baseUnit: 'mps'
  }
};

/**
 * 获取所有支持的单位类别
 */
function getSupportedCategories() {
  return Object.keys(UNIT_CATEGORIES).map(key => ({
    key,
    name: UNIT_CATEGORIES[key].name,
    baseUnit: UNIT_CATEGORIES[key].baseUnit
  }));
}

/**
 * 获取指定类别的所有单位
 */
function getUnitsForCategory(category) {
  if (!UNIT_CATEGORIES[category]) {
    throw new Error(`不支持的单位类别: ${category}`);
  }
  
  const categoryConfig = UNIT_CATEGORIES[category];
  return Object.keys(categoryConfig.units).map(key => ({
    key,
    ...categoryConfig.units[key]
  }));
}

/**
 * 验证单位是否存在于指定类别中
 */
function isValidUnit(category, unit) {
  return !!(UNIT_CATEGORIES[category] && UNIT_CATEGORIES[category].units[unit]);
}

/**
 * 获取单位的详细信息
 */
function getUnitInfo(category, unit) {
  if (!isValidUnit(category, unit)) {
    throw new Error(`无效的单位: ${category}.${unit}`);
  }
  
  return {
    key: unit,
    category,
    ...UNIT_CATEGORIES[category].units[unit]
  };
}

module.exports = {
  LENGTH_UNITS,
  WEIGHT_UNITS,
  TEMPERATURE_UNITS,
  AREA_UNITS,
  VOLUME_UNITS,
  TIME_UNITS,
  SPEED_UNITS,
  UNIT_CATEGORIES,
  getSupportedCategories,
  getUnitsForCategory,
  isValidUnit,
  getUnitInfo
};