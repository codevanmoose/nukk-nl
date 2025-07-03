const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type().toUpperCase(), ':', msg.text());
  });
  
  console.log('🔍 nukk.nl Diagnostic Test');
  console.log('==========================\n');
  
  // Test with unique URL
  const testUrl = `https://www.nu.nl/test-${Date.now()}/demo-article.html`;
  const analyseUrl = `https://www.nukk.nl/analyse?url=${encodeURIComponent(testUrl)}`;
  
  console.log('Testing URL:', analyseUrl);
  console.log('\nNavigating to analysis page...');
  
  await page.goto(analyseUrl);
  
  // Wait and check periodically
  let finalStatus = null;
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    
    const hasError = await page.locator('.text-red-600').count() > 0;
    const errorText = hasError ? await page.locator('.text-red-600').textContent() : null;
    const hasScore = await page.locator('.text-4xl').count() > 0;
    const scoreText = hasScore ? await page.locator('.text-4xl').textContent() : null;
    const isLoading = await page.locator('text=/wordt geanalyseerd/i').count() > 0;
    
    console.log(`\n[${i+1}s] Status:`);
    console.log('- Loading:', isLoading ? 'YES' : 'NO');
    console.log('- Error:', errorText || 'None');
    console.log('- Score:', scoreText || 'None');
    
    if (hasError) {
      finalStatus = 'ERROR: ' + errorText;
      break;
    }
    
    if (hasScore && scoreText && scoreText !== '0/100') {
      finalStatus = 'SUCCESS: Score = ' + scoreText;
      break;
    }
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'nukk-diagnostic.png', fullPage: true });
  console.log('\n📸 Screenshot saved: nukk-diagnostic.png');
  
  console.log('\n📊 FINAL RESULT:', finalStatus || 'TIMEOUT');
  
  // Test API directly
  console.log('\n🔌 Testing API directly...');
  const apiUrl = 'https://www.nukk.nl/api/analyze';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: testUrl })
  });
  
  const data = await response.json();
  console.log('API Response status:', response.status);
  console.log('API Response:', JSON.stringify(data, null, 2).substring(0, 300) + '...');
  
  await browser.close();
})();