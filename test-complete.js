const { chromium } = require('playwright');

async function testComplete() {
  console.log('🎉 COMPLETE NUKK.NL TEST\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait a bit for deployment
    console.log('⏳ Waiting 30s for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Test 1: Homepage loads
    console.log('\n📄 Test 1: Homepage...');
    await page.goto('https://www.nukk.nl', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`✅ Title: "${title}"`);
    
    // Test 2: URL redirect (nu.nl → nukk.nl)
    console.log('\n🔀 Test 2: URL redirect...');
    await page.goto('https://www.nukk.nl/politiek/6361052/asielwetten-lijken-te-stranden-in-eerste-kamer-cda-stemt-tegen.html');
    await page.waitForTimeout(2000);
    const redirectUrl = page.url();
    console.log(`✅ Redirected to: ${redirectUrl}`);
    console.log(`✅ Redirect working: ${redirectUrl.includes('/analyse?url=') ? 'YES' : 'NO'}`);
    
    // Test 3: Manual analysis
    console.log('\n🤖 Test 3: Manual analysis...');
    await page.goto('https://www.nukk.nl');
    await page.fill('input[type="url"]', 'https://www.nu.nl/politiek/6361052/asielwetten-lijken-te-stranden-in-eerste-kamer-cda-stemt-tegen.html');
    await page.click('button:has-text("Analyseer")');
    
    // Wait for analysis
    console.log('⏳ Waiting for analysis...');
    await page.waitForTimeout(5000);
    
    // Check if analysis page loaded
    const analysisUrl = page.url();
    const hasError = await page.locator('text=error').count() > 0;
    const hasAnalysis = await page.locator('text=Objectiviteit').count() > 0;
    
    console.log(`📍 Analysis URL: ${analysisUrl}`);
    console.log(`❌ Has error: ${hasError}`);
    console.log(`✅ Has analysis: ${hasAnalysis}`);
    
    // Take screenshot
    await page.screenshot({ path: 'nukk-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as nukk-test-result.png');
    
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Homepage: Working`);
    console.log(`✅ URL Redirect: ${redirectUrl.includes('/analyse?url=') ? 'Working' : 'Not working'}`);
    console.log(`${hasAnalysis && !hasError ? '✅' : '❌'} Analysis: ${hasAnalysis && !hasError ? 'Working' : 'Not working'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testComplete();