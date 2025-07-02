const { chromium } = require('playwright');

async function finalTest() {
  console.log('🎉 FINAL TEST: Latest deployment...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test the LATEST deployment
    console.log('📄 Testing LATEST READY deployment...');
    await page.goto('https://nukk-ekvaeqaul-vanmooseprojects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log(`✅ SUCCESS! Title: "${title}"`);
    
    // Check if it's the real site
    const bodyText = await page.textContent('body');
    console.log('📝 First 200 chars of body:', bodyText.substring(0, 200));
    
    if (bodyText.includes('nukk.nl') || bodyText.includes('Analyseer') || bodyText.includes('fact')) {
      console.log('🎉 THIS IS THE REAL NUKK.NL SITE!');
      
      // Check elements
      const urlInput = await page.locator('input[type="url"]').count();
      const analyzeButton = await page.locator('button:has-text("Analyseer")').count();
      
      console.log(`✅ URL input: ${urlInput > 0 ? 'FOUND ✓' : 'MISSING ✗'}`);
      console.log(`✅ Analyze button: ${analyzeButton > 0 ? 'FOUND ✓' : 'MISSING ✗'}`);
      
      // Take screenshot
      await page.screenshot({ path: 'nukk-live.png', fullPage: true });
      console.log('📸 Screenshot saved as nukk-live.png');
      
    } else if (bodyText.includes('Login') || bodyText.includes('Vercel')) {
      console.log('⚠️ Still showing Vercel login - deployment may be propagating');
    } else {
      console.log('❓ Unknown content - investigating...');
    }

    console.log('\n🔗 DEPLOYMENT URLS:');
    console.log('Latest: https://nukk-ekvaeqaul-vanmooseprojects.vercel.app');
    console.log('Main domain: https://nukk.nl (may take time to propagate)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalTest();