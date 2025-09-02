const NumberConverter = require('../src/utils/numberConverter');

describe('NumberConverter', () => {
  let converter;

  beforeEach(() => {
    converter = new NumberConverter();
  });

  describe('validateNumber', () => {
    test('应该验证有效数字', () => {
      expect(converter.validateNumber(123)).toEqual({ isValid: true });
      expect(converter.validateNumber(0)).toEqual({ isValid: true });
      expect(converter.validateNumber(-456)).toEqual({ isValid: true });
      expect(converter.validateNumber(123.45)).toEqual({ isValid: true });
    });

    test('应该拒绝无效输入', () => {
      expect(converter.validateNumber(NaN).isValid).toBe(false);
      expect(converter.validateNumber(Infinity).isValid).toBe(false);
      expect(converter.validateNumber(-Infinity).isValid).toBe(false);
      expect(converter.validateNumber('123').isValid).toBe(false);
      expect(converter.validateNumber(null).isValid).toBe(false);
    });

    test('应该检查数字范围', () => {
      const tooLarge = 1000000000000000; // 16位数
      const tooSmall = -1000000000000000;
      
      expect(converter.validateNumber(tooLarge).isValid).toBe(false);
      expect(converter.validateNumber(tooSmall).isValid).toBe(false);
      expect(converter.validateNumber(tooLarge).error).toContain('超出支持范围');
    });
  });

  describe('arabicToChinese', () => {
    test('应该转换基本数字', () => {
      expect(converter.arabicToChinese(0)).toBe('零');
      expect(converter.arabicToChinese(1)).toBe('一');
      expect(converter.arabicToChinese(9)).toBe('九');
    });

    test('应该转换两位数', () => {
      expect(converter.arabicToChinese(10)).toBe('十');
      expect(converter.arabicToChinese(11)).toBe('十一');
      expect(converter.arabicToChinese(19)).toBe('十九');
      expect(converter.arabicToChinese(20)).toBe('二十');
      expect(converter.arabicToChinese(99)).toBe('九十九');
    });

    test('应该转换三位数', () => {
      expect(converter.arabicToChinese(100)).toBe('一百');
      expect(converter.arabicToChinese(101)).toBe('一百零一');
      expect(converter.arabicToChinese(110)).toBe('一百一十');
      expect(converter.arabicToChinese(111)).toBe('一百一十一');
      expect(converter.arabicToChinese(999)).toBe('九百九十九');
    });

    test('应该转换四位数', () => {
      expect(converter.arabicToChinese(1000)).toBe('一千');
      expect(converter.arabicToChinese(1001)).toBe('一千零一');
      expect(converter.arabicToChinese(1010)).toBe('一千零一十');
      expect(converter.arabicToChinese(1100)).toBe('一千一百');
      expect(converter.arabicToChinese(9999)).toBe('九千九百九十九');
    });

    test('应该转换万位数', () => {
      expect(converter.arabicToChinese(10000)).toBe('一万');
      expect(converter.arabicToChinese(10001)).toBe('一万零一');
      expect(converter.arabicToChinese(10010)).toBe('一万零一十');
      expect(converter.arabicToChinese(10100)).toBe('一万零一百');
      expect(converter.arabicToChinese(11000)).toBe('一万一千');
      expect(converter.arabicToChinese(99999)).toBe('九万九千九百九十九');
    });

    test('应该转换负数', () => {
      expect(converter.arabicToChinese(-1)).toBe('负一');
      expect(converter.arabicToChinese(-123)).toBe('负一百二十三');
      expect(converter.arabicToChinese(-10000)).toBe('负一万');
    });

    test('应该转换财务格式', () => {
      expect(converter.arabicToChinese(1, true)).toBe('壹');
      expect(converter.arabicToChinese(123, true)).toBe('壹佰贰拾叁');
      expect(converter.arabicToChinese(10000, true)).toBe('壹万');
    });
  });

  describe('chineseToArabic', () => {
    test('应该转换基本中文数字', () => {
      expect(converter.chineseToArabic('零')).toBe(0);
      expect(converter.chineseToArabic('一')).toBe(1);
      expect(converter.chineseToArabic('九')).toBe(9);
    });

    test('应该转换两位中文数字', () => {
      expect(converter.chineseToArabic('十')).toBe(10);
      expect(converter.chineseToArabic('十一')).toBe(11);
      expect(converter.chineseToArabic('二十')).toBe(20);
      expect(converter.chineseToArabic('九十九')).toBe(99);
    });

    test('应该转换三位中文数字', () => {
      expect(converter.chineseToArabic('一百')).toBe(100);
      expect(converter.chineseToArabic('一百零一')).toBe(101);
      expect(converter.chineseToArabic('一百一十')).toBe(110);
      expect(converter.chineseToArabic('九百九十九')).toBe(999);
    });

    test('应该转换万位中文数字', () => {
      expect(converter.chineseToArabic('一万')).toBe(10000);
      expect(converter.chineseToArabic('一万零一')).toBe(10001);
      expect(converter.chineseToArabic('九万九千九百九十九')).toBe(99999);
    });

    test('应该转换财务格式', () => {
      expect(converter.chineseToArabic('壹')).toBe(1);
      expect(converter.chineseToArabic('壹佰贰拾叁')).toBe(123);
      expect(converter.chineseToArabic('壹万')).toBe(10000);
    });

    test('应该转换负数', () => {
      expect(converter.chineseToArabic('负一')).toBe(-1);
      expect(converter.chineseToArabic('负一百二十三')).toBe(-123);
    });

    test('应该处理无效输入', () => {
      expect(() => converter.chineseToArabic('')).toThrow('输入不能为空');
      expect(() => converter.chineseToArabic('abc')).toThrow('无法识别的字符');
      expect(() => converter.chineseToArabic(123)).toThrow('输入必须是字符串');
    });
  });

  describe('toFinancialFormat', () => {
    test('应该转换基本金额', () => {
      expect(converter.toFinancialFormat(0)).toBe('零元整');
      expect(converter.toFinancialFormat(1)).toBe('壹元整');
      expect(converter.toFinancialFormat(123)).toBe('壹佰贰拾叁元整');
    });

    test('应该转换带小数的金额', () => {
      expect(converter.toFinancialFormat(1.23)).toBe('壹元贰角叁分');
      expect(converter.toFinancialFormat(1.20)).toBe('壹元贰角');
      expect(converter.toFinancialFormat(1.03)).toBe('壹元零叁分');
      expect(converter.toFinancialFormat(0.50)).toBe('伍角');
      expect(converter.toFinancialFormat(0.05)).toBe('伍分');
    });

    test('应该转换大额金额', () => {
      expect(converter.toFinancialFormat(10000)).toBe('壹万元整');
      expect(converter.toFinancialFormat(12345.67)).toBe('壹万贰仟叁佰肆拾伍元陆角柒分');
    });

    test('应该转换负数金额', () => {
      expect(converter.toFinancialFormat(-123.45)).toBe('负壹佰贰拾叁元肆角伍分');
    });

    test('应该支持自定义货币单位', () => {
      expect(converter.toFinancialFormat(123, '美元')).toBe('壹佰贰拾叁美元整');
    });
  });

  describe('convert', () => {
    test('应该智能转换阿拉伯数字到中文', () => {
      const result = converter.convert(123, 'chinese');
      expect(result.success).toBe(true);
      expect(result.result).toBe('一百二十三');
      expect(result.inputType).toBe('arabic');
      expect(result.targetType).toBe('chinese');
    });

    test('应该智能转换中文数字到阿拉伯数字', () => {
      const result = converter.convert('一百二十三', 'arabic');
      expect(result.success).toBe(true);
      expect(result.result).toBe(123);
      expect(result.inputType).toBe('chinese');
      expect(result.targetType).toBe('arabic');
    });

    test('应该转换为财务格式', () => {
      const result = converter.convert(123, 'financial');
      expect(result.success).toBe(true);
      expect(result.result).toBe('壹佰贰拾叁');
    });

    test('应该转换为财务金额格式', () => {
      const result = converter.convert(123.45, 'financial-amount');
      expect(result.success).toBe(true);
      expect(result.result).toBe('壹佰贰拾叁元肆角伍分');
    });

    test('应该处理字符串形式的阿拉伯数字', () => {
      const result = converter.convert('123', 'chinese');
      expect(result.success).toBe(true);
      expect(result.result).toBe('一百二十三');
    });

    test('应该处理转换错误', () => {
      const result = converter.convert('invalid', 'chinese');
      expect(result.success).toBe(false);
      expect(result.error).toContain('无法识别的输入格式');
    });

    test('应该包含时间戳', () => {
      const result = converter.convert(123, 'chinese');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('batchConvert', () => {
    test('应该批量转换数字', () => {
      const inputs = [1, 2, 3];
      const results = converter.batchConvert(inputs, 'chinese');
      
      expect(results).toHaveLength(3);
      expect(results[0].result).toBe('一');
      expect(results[1].result).toBe('二');
      expect(results[2].result).toBe('三');
      expect(results.every(r => r.success)).toBe(true);
    });

    test('应该处理混合输入', () => {
      const inputs = [123, '四百五十六', 'invalid'];
      const results = converter.batchConvert(inputs, 'arabic');
      
      expect(results).toHaveLength(3);
      expect(results[0].result).toBe(123);
      expect(results[1].result).toBe(456);
      expect(results[2].success).toBe(false);
    });

    test('应该验证输入类型', () => {
      expect(() => converter.batchConvert('not array', 'chinese')).toThrow('输入必须是数组');
    });
  });

  describe('getSupportedTypes', () => {
    test('应该返回支持的类型信息', () => {
      const types = converter.getSupportedTypes();
      
      expect(types.inputTypes).toContain('arabic');
      expect(types.inputTypes).toContain('chinese');
      expect(types.outputTypes).toContain('chinese');
      expect(types.outputTypes).toContain('financial');
      expect(types.outputTypes).toContain('arabic');
      expect(types.outputTypes).toContain('financial-amount');
      expect(types.maxNumber).toBeDefined();
      expect(types.minNumber).toBeDefined();
      expect(types.description).toBeDefined();
    });
  });

  describe('双向转换一致性测试', () => {
    const testNumbers = [0, 1, 10, 11, 20, 100, 101, 110, 111, 1000, 1001, 1010, 1100, 10000, 12345];

    testNumbers.forEach(num => {
      test(`数字 ${num} 的双向转换应该一致`, () => {
        const chinese = converter.arabicToChinese(num);
        const backToArabic = converter.chineseToArabic(chinese);
        expect(backToArabic).toBe(num);
      });
    });
  });

  describe('边界值测试', () => {
    test('应该处理最大支持数字', () => {
      const maxNum = converter.MAX_NUMBER;
      expect(() => converter.arabicToChinese(maxNum)).not.toThrow();
    });

    test('应该处理最小支持数字', () => {
      const minNum = converter.MIN_NUMBER;
      expect(() => converter.arabicToChinese(minNum)).not.toThrow();
    });

    test('应该拒绝超出范围的数字', () => {
      const tooLarge = converter.MAX_NUMBER + 1;
      expect(() => converter.arabicToChinese(tooLarge)).toThrow('超出支持范围');
    });
  });
});