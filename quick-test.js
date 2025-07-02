const { chromium } = require('playwright');

async function quickTest() {
  console.log('🚀 Quick test of nukk.nl...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Test the main domain
    console.log('📄 Testing https://nukk.nl...');
    await page.goto('https://nukk.nl', { timeout: 15000 });
    
    const title = await page.title();
    const url = page.url();
    console.log(`✅ Page loaded - Title: "${title}"`);
    console.log(`📍 Final URL: ${url}`);
    
    // Check if it's the actual site or an error page
    const bodyText = await page.textContent('body');
    if (bodyText.includes('nukk.nl') && bodyText.includes('Analyseer')) {
      console.log('🎉 SUCCESS: nukk.nl is working!');
    } else {
      console.log('⚠️ Site loaded but content seems wrong');
      console.log('First 200 chars:', bodyText.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Fallback: test last working deployment
    try {
      console.log('\n🔄 Testing fallback deployment...');
      await page.goto('https://nukk-djlh621kf-vanmooseprojects.vercel.app', { timeout: 15000 });
      const fallbackTitle = await page.title();
      console.log(`📍 Fallback result: "${fallbackTitle}"`);
    } catch (fallbackError) {
      console.log('❌ Fallback also failed');
    }
  } finally {
    await browser.close();
  }
}

quickTest();