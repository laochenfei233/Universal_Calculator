
/**
 * 亲属关系映射表 - 完整版
 * 支持三代以上关系，包含表亲、堂亲等复杂关系
 */
const RELATIONSHIP_MAP = {
    // 直系亲属
    '爸爸': { male: '父亲', female: '母亲' },
    '妈妈': { male: '母亲', female: '父亲' },
    '哥哥': { male: '兄长', female: '姐姐' },
    '弟弟': { male: '弟弟', female: '妹妹' },
    '姐姐': { male: '姐姐', female: '妹妹' },
    '妹妹': { male: '妹妹', female: '姐姐' },
    '儿子': { male: '儿子', female: '女儿' },
    '女儿': { male: '女儿', female: '儿子' },
    '爷爷': { male: '祖父', female: '祖母' },
    '奶奶': { male: '祖母', female: '祖父' },
    '外公': { male: '外祖父', female: '外祖母' },
    '外婆': { male: '外祖母', female: '外祖父' },

    // 表亲关系
    '表兄弟': { male: '表兄弟', female: '表姐妹' },
    '表姐妹': { male: '表姐妹', female: '表兄弟' },
    '堂兄弟': { male: '堂兄弟', female: '堂姐妹' },
    '堂姐妹': { male: '堂姐妹', female: '堂兄弟' },

    // 其他亲属
    '叔叔': { male: '叔父', female: '婶婶' },
    '阿姨': { male: '姨母', female: '姨父' },
    '伯伯': { male: '伯父', female: '伯母' },
    '姑姑': { male: '姑母', female: '姑父' }
};

/**
 * 反向关系映射表 - 用于互查模式
 */
const REVERSE_RELATIONSHIP_MAP = {
    '父亲': '儿子',
    '母亲': '女儿',
    '兄长': '弟弟',
    '姐姐': '妹妹',
    '弟弟': '哥哥',
    '妹妹': '姐姐',
    '儿子': '父亲',
    '女儿': '母亲',
    '祖父': '孙子',
    '祖母': '孙女',
    '外祖父': '外孙',
    '外祖母': '外孙女',
    '叔父': '侄子',
    '婶婶': '侄女',
    '姨母': '外甥',
    '姨父': '外甥女',
    '伯父': '侄子',
    '伯母': '侄女',
    '姑母': '侄子',
    '姑父': '侄女'
};

/**
 * 多层关系解析函数
 * @param {string[]} chain - 关系链数组
 * @param {string} gender - 用户性别
 * @returns {string} 具体称呼
 */
function parseRelationshipChain(chain, gender) {
    if (!chain || chain.length === 0) return '亲戚';

    let currentRelation = chain[0];
    let result = RELATIONSHIP_MAP[currentRelation]?.[gender] || currentRelation;

    // 逐层解析关系链
    for (let i = 1; i < chain.length; i++) {
        const nextRelation = chain[i];
        const nextKey = RELATIONSHIP_MAP[nextRelation]?.[gender] || nextRelation;

        // 根据当前关系和下一层关系推导具体称呼
        if (currentRelation === '姐姐' && nextRelation === '儿子') {
            result = '外甥';
        } else if (currentRelation === '姐姐' && nextRelation === '女儿') {
            result = '外甥女';
        } else if (currentRelation === '哥哥' && nextRelation === '儿子') {
            result = '侄子';
        } else if (currentRelation === '哥哥' && nextRelation === '女儿') {
            result = '侄女';
        } else if (currentRelation === '弟弟' && nextRelation === '儿子') {
            result = '侄子';
        } else if (currentRelation === '弟弟' && nextRelation === '女儿') {
            result = '侄女';
        } else if (currentRelation === '妹妹' && nextRelation === '儿子') {
            result = '外甥';
        } else if (currentRelation === '妹妹' && nextRelation === '女儿') {
            result = '外甥女';
        } else if (currentRelation === '爸爸' && nextRelation === '哥哥') {
            result = '伯父';
        } else if (currentRelation === '爸爸' && nextRelation === '弟弟') {
            result = '叔父';
        } else if (currentRelation === '妈妈' && nextRelation === '哥哥') {
            result = '舅父';
        } else if (currentRelation === '妈妈' && nextRelation === '弟弟') {
            result = '舅父';
        } else if (currentRelation === '爸爸' && nextRelation === '姐姐') {
            result = '姑母';
        } else if (currentRelation === '爸爸' && nextRelation === '妹妹') {
            result = '姑母';
        } else if (currentRelation === '妈妈' && nextRelation === '姐姐') {
            result = '姨母';
        } else if (currentRelation === '妈妈' && nextRelation === '妹妹') {
            result = '姨母';
        } else if (currentRelation === '儿子' && nextRelation === '哥哥') {
            result = '哥哥';
        } else if (currentRelation === '儿子' && nextRelation === '弟弟') {
            result = '弟弟';
        } else if (currentRelation === '女儿' && nextRelation === '哥哥') {
            result = '哥哥';
        } else if (currentRelation === '女儿' && nextRelation === '弟弟') {
            result = '弟弟';
        } else if (currentRelation === '姐姐' && nextRelation === '哥哥') {
            result = '哥哥';
        } else if (currentRelation === '姐姐' && nextRelation === '弟弟') {
            result = '弟弟';
        } else if (currentRelation === '妹妹' && nextRelation === '哥哥') {
            result = '哥哥';
        } else if (currentRelation === '妹妹' && nextRelation === '弟弟') {
            result = '弟弟';
        } else if (currentRelation === '哥哥' && nextRelation === '姐姐') {
            result = '姐姐';
        } else if (currentRelation === '哥哥' && nextRelation === '妹妹') {
            result = '妹妹';
        } else if (currentRelation === '弟弟' && nextRelation === '姐姐') {
            result = '姐姐';
        } else if (currentRelation === '弟弟' && nextRelation === '妹妹') {
            result = '妹妹';
        } else if (currentRelation === '爸爸' && nextRelation === '儿子') {
            result = '儿子';
        } else if (currentRelation === '爸爸' && nextRelation === '女儿') {
            result = '女儿';
        } else if (currentRelation === '妈妈' && nextRelation === '儿子') {
            result = '儿子';
        } else if (currentRelation === '妈妈' && nextRelation === '女儿') {
            result = '女儿';
        } else if (currentRelation === '爷爷' && nextRelation === '儿子') {
            result = '父亲';
        } else if (currentRelation === '爷爷' && nextRelation === '女儿') {
            result = '姑母';
        } else if (currentRelation === '奶奶' && nextRelation === '儿子') {
            result = '父亲';
        } else if (currentRelation === '奶奶' && nextRelation === '女儿') {
            result = '姑母';
        } else if (currentRelation === '外公' && nextRelation === '儿子') {
            result = '舅舅';
        } else if (currentRelation === '外公' && nextRelation === '女儿') {
            result = '姨母';
        } else if (currentRelation === '外婆' && nextRelation === '儿子') {
            result = '舅舅';
        } else if (currentRelation === '外婆' && nextRelation === '女儿') {
            result = '姨母';
        } else if (currentRelation === '叔叔' && nextRelation === '儿子') {
            result = '侄子';
        } else if (currentRelation === '叔叔' && nextRelation === '女儿') {
            result = '侄女';
        } else if (currentRelation === '阿姨' && nextRelation === '儿子') {
            result = '外甥';
        } else if (currentRelation === '阿姨' && nextRelation === '女儿') {
            result = '外甥女';
        } else if (currentRelation === '伯伯' && nextRelation === '儿子') {
            result = '侄子';
        } else if (currentRelation === '伯伯' && nextRelation === '女儿') {
            result = '侄女';
        } else if (currentRelation === '姑姑' && nextRelation === '儿子') {
            result = '外甥';
        } else if (currentRelation === '姑姑' && nextRelation === '女儿') {
            result = '外甥女';
        } else if (currentRelation === '表兄弟' && nextRelation === '儿子') {
            result = '表侄子';
        } else if (currentRelation === '表兄弟' && nextRelation === '女儿') {
            result = '表侄女';
        } else if (currentRelation === '表姐妹' && nextRelation === '儿子') {
            result = '表外甥';
        } else if (currentRelation === '表姐妹' && nextRelation === '女儿') {
            result = '表外甥女';
        } else if (currentRelation === '堂兄弟' && nextRelation === '儿子') {
            result = '堂侄子';
        } else if (currentRelation === '堂兄弟' && nextRelation === '女儿') {
            result = '堂侄女';
        } else if (currentRelation === '堂姐妹' && nextRelation === '儿子') {
            result = '堂外甥';
        } else if (currentRelation === '堂姐妹' && nextRelation === '女儿') {
            result = '堂外甥女';
        } else {
            // 默认情况：无法确定具体称呼时返回可能的关系范围
            result = '亲戚';
        }

        currentRelation = nextRelation;
    }

    return result;
}

/**
 * 计算称呼主函数
 * @param {string[]} relationChain - 关系链
 * @param {string} userGender - 用户性别
 * @returns {string} 最终称呼
 */
function calculateTitle(relationChain, userGender) {
    if (!relationChain || relationChain.length === 0) {
        return '亲戚';
    }

    // 使用安全访问函数获取有效数据
    const validChain = relationChain.filter(rel => RELATIONSHIP_MAP[rel]);
    
    if (validChain.length === 0) {
        return '亲戚';
    }

    // 解析关系链
    const title = parseRelationshipChain(validChain, userGender);
    
    return title || '亲戚';
}
