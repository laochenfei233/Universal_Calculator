const puppeteer = require('puppeteer');

describe('前端E2E测试', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      slowMo: 50,
    });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('基础计算器', () => {
    test('应该正确计算简单表达式', async () => {
      // 点击数字和运算符按钮
      await page.click('button[data-value="2"]');
      await page.click('button[data-value="+"]');
      await page.click('button[data-value="3"]');
      await page.click('button[data-value="="]');
      
      // 验证结果显示
      const result = await page.$eval('.display', el => el.textContent);
      expect(result).toContain('5');
    });

    test('应该显示错误信息', async () => {
      // 清除当前输入
      await page.click('button[data-value="C"]');
      
      // 输入无效表达式
      await page.click('button[data-value="2"]');
      await page.click('button[data-value="+"]');
      await page.click('button[data-value="="]);
      
      // 验证错误信息
      const error = await page.$eval('.error', el => el.textContent);
      expect(error).toContain('无效的表达式');
    });
  });

  describe('科学计算器', () => {
    test('应该切换到科学计算模式', async () => {
      // 切换到科学计算器
      await page.click('button[data-mode="scientific"]');
      
      // 验证界面变化
      const buttons = await page.$$eval('button', btns => 
        btns.map(b => b.textContent)
      );
      expect(buttons).toContain('sin');
      expect(buttons).toContain('cos');
    });

    test('应该正确计算三角函数', async () => {
      // 确保在科学计算模式
      await page.click('button[data-mode="scientific"]');
      
      // 计算sin(π/2)
      await page.click('button[data-value="sin"]');
      await page.click('button[data-value="("]');
      await page.click('button[data-value="π"]');
      await page.click('button[data-value="/"]');
      await page.click('button[data-value="2"]');
      await page.click('button[data-value=")"]');
      await page.click('button[data-value="="]');
      
      // 验证结果
      const result = await page.$eval('.display', el => el.textContent);
      expect(result).toContain('1');
    });
  });

  describe('历史记录', () => {
    test('应该保存和显示历史记录', async () => {
      // 进行一些计算
      await page.click('button[data-value="1"]');
      await page.click('button[data-value="+"]');
      await page.click('button[data-value="1"]');
      await page.click('button[data-value="="]');
      
      // 打开历史记录面板
      await page.click('button[data-action="history"]');
      
      // 验证历史记录
      const historyItems = await page.$$eval('.history-item', items => 
        items.map(i => i.textContent)
      );
      expect(historyItems.length).toBeGreaterThan(0);
      expect(historyItems[0]).toContain('1 + 1 = 2');
    });
  });

  describe('主题切换', () => {
    test('应该切换主题', async () => {
      // 获取当前主题
      const initialTheme = await page.$eval('body', el => 
        el.classList.contains('dark-theme')
      );
      
      // 切换主题
      await page.click('button[data-action="toggle-theme"]');
      
      // 验证主题已更改
      const newTheme = await page.$eval('body', el => 
        el.classList.contains('dark-theme')
      );
      expect(newTheme).toBe(!initialTheme);
    });
  });
});