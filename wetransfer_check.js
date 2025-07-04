const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('Visiting wetransfer.com...');
  await page.goto('https://wetransfer.com', { waitUntil: 'networkidle' });
  
  await page.screenshot({ path: 'wetransfer_desktop.png' });
  console.log('Desktop screenshot saved');
  
  await browser.close();
})();
